
let currentTheme;

const manager = new StateManager({
  async onInit() {
    let themes = await Settings.getThemes();
    let defaultTheme = await Settings.getDefaultTheme();
    currentTheme = new Theme(themes[defaultTheme]);
  },
  async onTabColorChange ({ id, windowId }) {
    let { tabColorMap } = this.state;
    let color = tabColorMap.get(id);
    if (color === null) {
      currentTheme.reset(windowId);
    } else {
      currentTheme.patch(color.toString(), color.textColor.toString(), windowId);
    }
  }
});
