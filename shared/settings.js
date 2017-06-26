const SettingList = {
  themes: {
    default: [{
      images: {
        headerURL: ""
      },
      colors: {
        accentcolor: "#ececec",
        textcolor: "#000000"
      }
    }]
  }
};

const Settings = {
  async get(setting) {
    try {
      const found = await browser.storage.sync.get(setting);
      return found["settings." + setting];
    } catch(e) {
      return SettingList[setting].default;
    }
  },

  async set(setting, value) {
    await browser.storage.sync.set({["settings." + setting]: value})
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
