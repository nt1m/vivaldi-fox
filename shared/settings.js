"use strict";

/* exported Settings */

const DEFAULT_THEMES = {
  "light": {
    applyPageColors: ["toolbar_text", "toolbar"],
    name: "light",
    opacities: {
      toolbar: 1,
      toolbar_field: 1,
    },
    properties: {
      colors: {
        accentcolor: "#f0f0f4",
        textcolor: "#444444",
        toolbar: "#f9f9fb",
        tab_line: "transparent",
        toolbar_text: "#000000",
        toolbar_field: "#f0f0f4",
        toolbar_field_text: "rgb(21,20,26)",
      }
    }
  },
  "dark": {
    applyPageColors: ["toolbar_text", "toolbar"],
    name: "dark",
    opacities: {
      toolbar: 1,
      toolbar_field: 1,
    },
    properties: {
      colors: {
        textcolor: "#ffffff",
        accentcolor: "#1c1b22",
        tab_line: "transparent",
        toolbar: "rgb(66,65,77)",
        toolbar_text: "#eeeeee",
        toolbar_field: "rgb(28,27,34)",
        toolbar_field_text: "#F9F9FA",
      }
    }
  }
};

const Settings = {
  getDefaultTheme() {
    return getSetting("defaultTheme", "light");
  },
  getNightTheme() {
    return getSetting("nightTheme", "light");
  },
  getNightModeStart() {
    return getSetting("nightModeStart", 20);
  },
  getNightModeEnd() {
    return getSetting("nightModeEnd", 8);
  },
  getPageColorsOnInactive() {
    return getSetting("pageColorsOnInactive", true);
  },
  getWhiteBackgroundFavicons() {
    return getSetting("whiteBackgroundFavicons", false);
  },
  getUsePageDefinedColors() {
    return getSetting("useMetaTag", false);
  },
  getColorSource() {
    return getSetting("colorSource", "favicon");
  },
  getThemes() {
    return getSetting("themes", DEFAULT_THEMES);
  },
  getFirstRun() {
    return getSetting("firstRun", true);
  },
  setThemes(value) {
    setSetting("themes", value);
  },
  setDefaultTheme(theme) {
    setSetting("defaultTheme", theme);
  },
  setNightTheme(theme) {
    setSetting("nightTheme", theme);
  },
  setNightModeStart(time) {
    setSetting("nightModeStart", time);
  },
  setNightModeEnd(time) {
    setSetting("nightModeEnd", time);
  },
  setPageColorsOnInactive(value) {
    setSetting("pageColorsOnInactive", value);
  },
  setWhiteBackgroundFavicons(value) {
    setSetting("whiteBackgroundFavicons", value);
  },
  setColorSource(value) {
    setSetting("colorSource", value);
  },
  setUsePageDefinedColors(value) {
    setSetting("useMetaTag", value);
  },
  setFirstRun(value) {
    setSetting("firstRun", value);
  },
  onChanged(callback) {
    return browser.storage.onChanged.addListener(changes => {
      changes = Object.assign({}, changes);
      for (let change in changes) {
        if (!change.startsWith("settings.")) {
          delete changes[change];
        }
      }
      if (Object.keys(changes).length > 0) {
        callback(changes);
      }
    });
  },
  clear() {
    browser.storage.local.clear();
  }
};

async function getSetting(setting, fallback) {
  try {
    const found = await browser.storage.local.get("settings." + setting);
    if (found.hasOwnProperty("settings." + setting)) {
      return found["settings." + setting];
    }
    return fallback;
  } catch (e) {
    return fallback;
  }
}

async function setSetting(setting, value) {
  await browser.storage.local.set({ ["settings." + setting]: value });
}
