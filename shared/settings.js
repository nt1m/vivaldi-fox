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
      images: {
        headerURL: ""
      },
      colors: {
        accentcolor: "#dedede",
        textcolor: "#444444",
        toolbar: "#f8f8f8",
        toolbar_text: "#000000",
        toolbar_field: "#ffffff",
        toolbar_field_text: "#000000",
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
      images: {
        headerURL: ""
      },
      colors: {
        textcolor: "#ffffff",
        accentcolor: "#0c0c0d",
        toolbar: "#323234",
        toolbar_text: "#eeeeee",
        toolbar_field: "#474749",
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
  getPageColorsOnInactive() {
    return getSetting("pageColorsOnInactive", true);
  },
  getWhiteBackgroundFavicons() {
    return getSetting("whiteBackgroundFavicons", false);
  },
  getUseMetaTag() {
    return getSetting("useMetaTag", true);
  },
  getColorSource() {
    return getSetting("colorSource", "favicon");
  },
  getThemes() {
    return getSetting("themes", DEFAULT_THEMES);
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
  setPageColorsOnInactive(value) {
    setSetting("pageColorsOnInactive", value);
  },
  setWhiteBackgroundFavicons(value) {
    setSetting("whiteBackgroundFavicons", value);
  },
  setColorSource(value) {
    setSetting("colorSource", value);
  },
  setUseMetaTag(value) {
    setSetting("useMetaTag", value);
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
  await browser.storage.local.set({["settings." + setting]: value});
}
