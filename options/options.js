"use strict";

/* global React, ReactDOM */
/* exported createElement, createFactory, Component */

var { createElement, createFactory, Component } = React;

var app;
async function init() {
  app = new StateManager({
    async renderer() {
      let root = document.getElementById("app");
      ReactDOM.render(Options(app.state), root);
    },
    initialState: {
      settings: {
        themes: processThemes(await Settings.getThemes()),
        defaultTheme: await Settings.getDefaultTheme(),
        nightTheme: await Settings.getNightTheme(),
        nightModeStart: await Settings.getNightModeStart(),
        nightModeEnd: await Settings.getNightModeEnd(),
        pageColorsOnInactive: await Settings.getPageColorsOnInactive(),
        whiteBackgroundFavicons: await Settings.getWhiteBackgroundFavicons(),
        colorSource: await Settings.getColorSource(),
        usePageDefinedColors: await Settings.getUsePageDefinedColors(),
      },
      selectedTab: await Settings.getDefaultTheme(),
    },
    actions: {
      addTheme() {
        let {themes} = this.state.settings;
        let name;
        do {
          name = prompt("Name of theme").trim();
        } while (themes.hasOwnProperty(name) && name);
        // User has canceled
        if (!name) {
          return;
        }

        this.state.selectedTab = name;
        this.state.settings.themes[name] = DEFAULT_THEMES.light;
        this.state.settings.themes[name].name = name;
        Settings.setThemes(themes);
      },
      deleteTheme(name) {
        let {themes, defaultTheme, nightTheme} = this.state.settings;
        if (Object.keys(themes).length === 1) {
          return;
        }
        delete themes[name];
        this.state.selectedTab = Object.keys(themes)[0];

        if (defaultTheme === name) {
          this.actions.setDefaultTheme(Object.keys(themes)[0]);
        }
        if (nightTheme === name) {
          this.actions.setNightTheme(Object.keys(themes)[0]);
        }
        Settings.setThemes(themes);
      },
      setDefaultTheme(name) {
        this.state.settings.defaultTheme = name;
        Settings.setDefaultTheme(name);
      },
      setNightTheme(name) {
        this.state.settings.nightTheme = name;
        Settings.setNightTheme(name);
      },
      setNightModeStart(time) {
        this.state.settings.nightModeStart = time;
        Settings.setNightModeStart(time);
      },
      setNightModeEnd(time) {
        this.state.settings.nightModeEnd = time;
        Settings.setNightModeEnd(time);
      },
      setThemeProperty(theme, type, property, value) {
        let {themes} = this.state.settings;
        themes[theme].properties[type][property] = value;
        Settings.setThemes(themes);
      },
      setThemeOpacityProperty(theme, prop, value) {
        let {themes} = this.state.settings;
        if (!themes[theme].opacities) {
          themes[theme].opacities = {};
        }
        themes[theme].opacities[prop] = value;
        Settings.setThemes(themes);
      },
      setNativeTheme(theme, prop1, prop2, enabled) {
        let {themes} = this.state.settings;
        if (enabled) {
          delete themes[theme].properties.colors[prop1];
          if (prop2) {
            delete themes[theme].properties.colors[prop2];
          }
        } else {
          themes[theme].properties.colors[prop1] = "#ffffff";
          if (prop2) {
            themes[theme].properties.colors[prop2] = "#000000";
          }
        }
        Settings.setThemes(themes);
      },
      setThemeApplyPageColors(theme, prop1, prop2, value) {
        let {themes} = this.state.settings;
        let set = new Set(themes[theme].applyPageColors);
        if (value) {
          set.add(prop1);
          if (prop2) {
            set.add(prop2);
          }
        } else {
          set.delete(prop1);
          if (prop2) {
            set.delete(prop2);
          }
        }
        themes[theme].applyPageColors = [...set];
        Settings.setThemes(themes);
      },
      setPageColorsOnInactive(value) {
        this.state.settings.pageColorsOnInactive = value;
        Settings.setPageColorsOnInactive(value);
      },
      setWhiteBackgroundFavicons(value) {
        this.state.settings.whiteBackgroundFavicons = value;
        Settings.setWhiteBackgroundFavicons(value);
      },
      setColorSource(target) {
        let value = target.value;
        const permissionsToRequest = {
          origins: ["<all_urls>"]
        };
        if (value == "page-top" || value == "page-top-accent") {
          browser.permissions.request(permissionsToRequest).then((granted) => {
            if (granted) {
              this.state.settings.colorSource = value;
              Settings.setColorSource(value);
              target.value = value;
            } else {
              // Couldn't get permission, need to revert value
              target.value = this.state.settings.colorSource;
            }
          });
        } else {
          this.state.settings.colorSource = value;
          Settings.setColorSource(value);
          target.value = value;
        }
      },
      setUsePageDefinedColors(target) {
        let value = target.checked;
        const permissionsToRequest = {
          origins: ["<all_urls>"]
        }
        browser.permissions.request(permissionsToRequest).then((granted) => {
          if (granted) {
            this.state.settings.usePageDefinedColors = value;
            Settings.setUsePageDefinedColors(value);
            target.checked = value;
            browser.runtime.sendMessage({
              command: "enableContentScript",
              value: value,
            });
          } else {
            // Couldn't get permission, need to revert checkbox
            target.checked = false;
          }
        });
      }
    }
  });

  app.render();
}

function processThemes(themes) {
  for (let theme in themes) {
    if (!themes[theme].opacities) {
      themes[theme].opacities = {
        toolbar_field: 1,
        toolbar: 1,
      };
    }
  }
  return themes;
}

try {
  init();
} catch (e) {
  Settings.clear();
  alert("Corrupted add-on profile, please reload this page");
}
