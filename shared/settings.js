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
  getPageColorsOnInactive() {
    return getSetting("pageColorInactiveWins", true);
  },
  getThemes() {
    return getSetting("themes", {
      "light": {
        applyPageColors: ["toolbar_text", "toolbar"],
        name: "light",
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
    });
  },
  setThemes(setting, value) {
    setSetting(setting, value);
  },
  async getThemeProperty(property, type, theme) {
    let themes = await getThemes();
    return themes[theme][type][property];
  },
  async setThemeProperty(newValue, property, type, theme) {
    let themes = await getThemes();
    themes[theme][type][property] = newValue;
    return setSetting("themes", themes);
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

async function setSetting(setting, value) {
  await browser.storage.local.set({["settings." + setting]: value});
}
