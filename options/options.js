var { createElement } = React;


var app;
async function init() {
  app = new StateManager({
    async renderer() {
      let root = document.getElementById("app");
      ReactDOM.render(Options(app.state), root)
    },
    initialState: {
      settings: {
        themes: await Settings.getThemes(),
        defaultTheme: await Settings.getDefaultTheme(),
        nightTheme: await Settings.getNightTheme(),
      },
      selectedTab: await Settings.getDefaultTheme(),
    },
    actions: {
      addTheme() {
        let {themes} = this.state.settings;
        let name;
        do {
          name = prompt("Name of theme");
        } while (themes.hasOwnProperty(name) || !name);
        let defaultThemeData = {
          applyPageColors: ["toolbar_text", "toolbar"],
          name,
          properties: {
            images: {
              headerURL: ""
            },
            colors: {
              accentcolor: "#dedede",
              textcolor: "#444444",
              toolbar: "#f8f8f8",
              toolbar_text: "#000000",
              toolbar_field: "#ffffff",
              toolbar_field_text: "#000000",
            }
          }
        };
        this.state.selectedTab = name;
        this.state.settings.themes[name] = defaultThemeData;
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
      }
    },
  });

  app.render();
}

try {
  init();
} catch(e) {
  Settings.clear();
  alert("Corrupted add-on profile, please reload this page")
}
