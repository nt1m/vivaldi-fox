var app;
async function init() {
  let { themes, rules } = await Settings.getBatch(["themes", "rules"])

  app = new StateManager({
    async renderer() {
      let root = document.getElementById("app");
      ReactDOM.render(Options(app.state), root)
    },
    initialState: {
      themes,
      rules,
      selectedTab: Object.keys(themes)[0],
    }
  });

  app.render();
}

init();