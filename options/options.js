var { createElement } = React;


var app;
async function init() {
  themes = await Settings.getThemes();
  app = new StateManager({
    async renderer() {
      let root = document.getElementById("app");
      ReactDOM.render(Options(app.state), root)
    },
    initialState: {
      themes,
      defaultTheme: await Settings.getDefaultTheme(),
      selectedTab: Object.keys(themes)[0],
    }
  });

  app.render();
}

init();