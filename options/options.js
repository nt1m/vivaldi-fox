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
        pageColorsOnInactive: await Settings.getPageColorsOnInactive(),
        whiteBackgroundFavicons: await Settings.getWhiteBackgroundFavicons(),
        colorSource: await Settings.getColorSource(),
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
      setThemeApplyPageColors(theme, prop1, prop2, value) {
        let {themes} = this.state.settings;
        let set = new Set(themes[theme].applyPageColors);
        if (value) {
          set.add(prop1);
          set.add(prop2);
        } else {
          set.delete(prop1);
          set.delete(prop2);
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
      setColorSource(value) {
        this.state.settings.colorSource = value;
        Settings.setColorSource(value);
      }
    },
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
