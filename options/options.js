var app = new StateManager({
  async renderer() {
    let root = document.getElementById("app");
    ReactDOM.render(Options({ themes: await Settings.get("themes") }), root)
  },
  initialState: {
    themes: []
  }
});
app.render();