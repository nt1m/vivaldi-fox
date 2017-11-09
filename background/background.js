"use strict";

let currentTheme;

let tabIconsChanged = new Set();
let whiteFaviconCache = new Map();

new AddonState({
  async onInit() {
    let themes = await Settings.getThemes();
    let date = new Date(Date.now());

    let selectedTheme;
    if (date.getHours() >= NIGHTMODE_MORNING && date.getHours() < NIGHTMODE_EVENING) {
      selectedTheme = await Settings.getDefaultTheme();
    } else {
      selectedTheme = await Settings.getNightTheme();
    }

    currentTheme = new Theme(themes[selectedTheme]);
  },
  async onTabColorChange({ id, windowId }) {
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
  },
  async onFaviconChange(tab) {
    let whiteFaviconsEnabled = await Settings.getWhiteBackgroundFavicons();
    if (!whiteFaviconsEnabled) {
      return;
    }
    if (tabIconsChanged.has(tab.id) && whiteFaviconCache.has(tab.favIconUrl)) {
      return;
    }

    let whiteFavicon;
    if (whiteFaviconCache.has(tab.favIconUrl)) {
      whiteFavicon = whiteFaviconCache.get(tab.favIconUrl);
    } else {
      whiteFavicon = await getReadableFavicon(tab.favIconUrl);
    }

    if (whiteFavicon) {
      whiteFaviconCache.set(tab.favIconUrl, whiteFavicon);
      tabIconsChanged.add(tab.id);
    }

    if (!whiteFavicon) {
      return;
    }
    await browser.tabs.executeScript(tab.id, {
      code: `
          // Ensure a 'link[rel~=icon]' exists in the head
          if (!document.querySelector("link[rel~=icon]")) {
            document.head.insertAdjacentHTML(\'beforeend\', \'<link rel="icon">\');
          }
          for (let icon of document.querySelectorAll("link[rel~=icon]")) {
            icon.href = "${whiteFavicon}";
          }
          `
    });
  }
});

browser.browserAction.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});
