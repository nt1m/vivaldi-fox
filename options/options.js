var app;
async function init() {
  let settings = await Settings.getBatch(["themes", "rules", "defaultTheme"]);

  app = new StateManager({
    async onStateUpdate(state) {
      await Settings.setBatch(state.settings);
      
    },
    async renderer() {
      let root = document.getElementById("app");
      ReactDOM.render(Options(app.state), root)
    },
    initialState: {
      settings: settings,
      selectedTab: Object.keys(settings.themes)[0],
    }
  });

  app.render();
}

init();

