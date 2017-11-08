
let currentTheme;

const manager = new AddonState({
  async onInit() {
    let themes = await Settings.getThemes();
    let defaultTheme = await Settings.getDefaultTheme();
    currentTheme = new Theme(themes[defaultTheme]);
  
    for (let win of (await browser.windows.getAll())) {
      let tab = browser.tabs.query({ windowId: win.id, active: true });
      this.onTabColorChange({ id: tab.id, windowId: win });
    }
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

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({ url: "options/options.html" });
});
