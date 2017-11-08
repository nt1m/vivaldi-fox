
let currentTheme;

const manager = new AddonState({
  async onInit() {
    let themes = await Settings.getThemes();
    let date = new Date(Date.now());

    let selectedTheme;
    if (date.getHours() > NIGHTMODE_MORNING && date.getHours() < NIGHTMODE_EVENING) {
      selectedTheme = await Settings.getDefaultTheme();
    } else {
      selectedTheme = await Settings.getNightTheme();
    }
    
    currentTheme = new Theme(themes[selectedTheme]);
  },
  async onTabColorChange ({ id, windowId }) {
    let { tabColorMap } = this.state;
    let color = tabColorMap.get(id);
    if (!color) {
      currentTheme.reset(windowId);
    } else {
      currentTheme.patch(color.toString(), color.textColor.toString(), windowId);
    }
  },
  async onNightMode() {
    let defaultTheme = await Settings.getDefaultTheme();
    let nightTheme = await Settings.getNightTheme();
    if (defaultTheme !== nightTheme) {
      await this.refreshAddon();
    }
  }
});

browser.browserAction.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});
