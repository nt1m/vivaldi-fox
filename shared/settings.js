const SettingList = {
  themes: {
    defaultValue: {
      default: {
        images: {
          headerURL: ""
        },
        colors: {
          accentcolor: "#dedede",
          textcolor: "#000"
        }
      },
      dark: {
        images: {
          headerURL: ""
        },
        colors: {
          accentcolor: "#222",
          textcolor: "#fff",
        }
      },
    }
  },
  rules: {
    defaultValue: [
      ["dark", "!(hour > 20 || hour < 10)"],
    ]
  }
};

const Settings = {
  async get(setting) {
    try {
      const found = await browser.storage.local.get(setting);
      return found["settings." + setting];
    } catch(e) {
      return SettingList[setting].defaultValue;
    }
  },

  async set(setting, value) {
    await browser.storage.local.set({["settings." + setting]: value})
  },

  onChanged(listener) {
    return browser.storage.onChanged.addListener(changes => {
      changes = Object.assign({}, changes);
      for (let change in changes) {
        if (!change.startsWith("settings.")) {
          delete changes[change];
        }
      }

      if (Object.keys(changes).length > 0) {
        listener(changes);
      }
    })
  }
}
