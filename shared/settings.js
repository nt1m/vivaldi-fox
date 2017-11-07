const Settings = {
  nightModeEnabled() {
    return getSetting("nightModeEnabled", false);
  },
  getDefaultTheme() {
    return getSetting("defaultTheme", "light");
  },
  getNightTheme() {
    return getSetting("defaultTheme", "dark");
  },
  getThemes() {
    return getSetting("themes", {
      "light": {
        applyPageColors: ["toolbar_text", "toolbar"],
        properties: {
          images: {
            headerURL: ""
          },
          colors: {
            accentcolor: "#dedede",
            textcolor: "#444",
            toolbar_text: "#000",
            toolbar: "#f8f8f8",
          }
        }
      }
    });
  }
};

async function getSetting(setting, fallback) {
  try {
    const found = await browser.storage.local.get(setting);
    if (found.hasOwnProperty("settings." + setting)) {
      return found["settings." + setting];
    } else {
      return fallback;
    }
  } catch(e) {
    return fallback;
  }
}

async function setSetting(setting) {
  await browser.storage.local.set({["settings." + setting]: value});
}
