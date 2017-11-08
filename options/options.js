var { createElement } = React;


var app;
async function init() {
  let themes = await Settings.getThemes();
  app = new StateManager({
    async renderer() {
      let root = document.getElementById("app");
      ReactDOM.render(Options(app.state), root)
    },
    initialState: {
      settings: {
        themes,
        defaultTheme: await Settings.getDefaultTheme(),
      },
      selectedTab: Object.keys(themes)[0],
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
        themes[name] = defaultThemeData;

        Settings.setThemes(themes);
      }
    }
  });

  app.render();
}

try {
  init();
} catch(e) {
  Settings.clear();
  alert("Corrupted add-on profile, please reload settings")
}