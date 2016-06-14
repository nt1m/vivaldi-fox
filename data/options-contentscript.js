/* eslint-env browser */
/* global unsafeWindow, cloneInto, exportFunction */
"use strict";
let OptionsManager = {
  getPreferences(callback) {
    self.port.emit("request-prefs");
    self.port.once("receive-prefs", (prefs) => {
      let newPrefObj = {};
      for (let pref in prefs) {
        if (!pref.startsWith("sdk.")) {
          newPrefObj[pref] = prefs[pref];
        }
      }
      let name = "temp_" + Date.now();
      unsafeWindow[name] = cloneInto(newPrefObj, unsafeWindow);
      callback(unsafeWindow[name]);
      delete unsafeWindow[name];
    });
  },
  savePreference(pref, value) {
    self.port.emit("save-pref", [pref, value]);
  }
};

exportFunction(OptionsManager.getPreferences, unsafeWindow, {defineAs: "getPrefs"});
exportFunction(OptionsManager.savePreference, unsafeWindow, {defineAs: "savePref"});

let customEvent = new Event("contentscript-load");
window.dispatchEvent(customEvent);
