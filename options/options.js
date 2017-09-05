var app;
async function init() {
  let { themes, rules, defaultTheme } = await Settings.getBatch(["themes", "rules", "defaultTheme"])

  app = new StateManager({
    async renderer() {
      let root = document.getElementById("app");
      ReactDOM.render(Options(app.state), root)
    },
    initialState: {
      themes,
      rules,
      defaultTheme,
      selectedTab: Object.keys(themes)[0],
    }
  });

  app.render();
}

init();