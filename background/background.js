"use strict";

let currentTheme;

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

async function isDayMode() {
  let date = new Date(Date.now());
  let nightModeStart = await Settings.getNightModeStart();
  let nightModeEnd = await Settings.getNightModeEnd();

  if (nightModeStart > nightModeEnd) {
    return date.getHours() >= nightModeEnd &&
           date.getHours() < nightModeStart;
  } else {
    return date.getHours() < nightModeStart ||
           date.getHours() >= nightModeEnd;
  }
}

new AddonState({
  async onInit() {
    let themes = await Settings.getThemes();

    let selectedTheme;
    if (await isDayMode()) {
      selectedTheme = await Settings.getDefaultTheme();
    } else {
      selectedTheme = await Settings.getNightTheme();
    }

    currentTheme = new Theme(themes[selectedTheme]);

    let hasAllUrlsPermissions = await browser.permissions.contains({
      origins: ["<all_urls>"]
    });
    let isFirstRun = await Settings.getIsFirstRun();
    if (isFirstRun && !hasAllUrlsPermissions) {
      chrome.tabs.create({
        url: chrome.runtime.getURL("/welcome/welcome.html")
      });
    }
    if (isFirstRun)
      Settings.setIsFirstRun(false);

    let usePageDefinedColors = await Settings.getUsePageDefinedColors() ;
    if (usePageDefinedColors && this.state.contentScript === null) {
      let file = "data/contentscript.js";
      this.state.contentScript = await browser.contentScripts.register({
        matches: ["<all_urls>"],
        js: [{file}],
      });
    } else if (!usePageDefinedColors && this.state.contentScript !== null) {
      this.state.contentScript.unregister();
      this.state.contentScript = null;
    }
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

    let whiteFavicon;
    if (whiteFaviconCache.has(tab.favIconUrl)) {
      whiteFavicon = whiteFaviconCache.get(tab.favIconUrl);
    } else {
      whiteFavicon = await getReadableFavicon(tab.favIconUrl);
    }

    if (whiteFavicon) {
      whiteFaviconCache.set(tab.favIconUrl, whiteFavicon);
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

// Using the browser's theme color scheme with this extension interacts poorly with webpages
// See https://github.com/nt1m/vivaldi-fox/issues/120
async function setOverrideContentColorSchemeSetting() {
  let { value, levelOfControl } = await browser.browserSettings.overrideContentColorScheme.get({});

  if (levelOfControl != "not_controllable" && value == "browser") {
    browser.browserSettings.overrideContentColorScheme.set({ value: "system" });
  }
}

setOverrideContentColorSchemeSetting();
