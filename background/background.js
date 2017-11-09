"use strict";

let currentTheme;

let tabIconsChanged = new Set();
let whiteFaviconCache = new Map();

async function setColor({id, windowId}, tabColorMap) {
  let color = tabColorMap.get(id);
  let win = await browser.windows.get(windowId);
  let pageColorsOnInactive = await Settings.getPageColorsOnInactive();
  if (!color || (!pageColorsOnInactive && !win.focused)) {
    currentTheme.reset(windowId);
  } else {
    currentTheme.patch(color.toString(), color.textColor.toString(), windowId);
  }
}

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
  onTabColorChange(tab) {
    return setColor(tab, this.state.tabColorMap);
  },
  async onNightMode() {
    let defaultTheme = await Settings.getDefaultTheme();
    let nightTheme = await Settings.getNightTheme();
    if (defaultTheme !== nightTheme) {
      await this.refreshAddon();
    }
  },
  async onWindowFocusChange(focusedWindowId) {
    if (await Settings.getPageColorsOnInactive()) {
      return;
    }

    let tabs = await browser.tabs.query({ active: true });
    if (tabs.length == 0) {
      return;
    }
    for (let tab of tabs) {
      setColor(tab, this.state.tabColorMap);
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
