"use strict";

const Preferences = require("sdk/simple-prefs");
const tabs = require("sdk/tabs");
const self = require("sdk/self");

function initToolbarButton() {
  let { ActionButton } = require("sdk/ui/button/action");

  let button = ActionButton({
    id: "vivaldi-fox-options",
    label: "VivaldiFox Options",
    icon: {
      "16": "./img/icon.svg",
      "32": "./img/icon.svg"
    },
    onClick: function(state) {
      for (let tab of tabs) {
        if (tab.url == self.data.url("options.html")) {
          tab.activate();
          return;
        }
      }
      tabs.open({
        url: "options.html",
        onReady: (tab) => {
          let worker = tab.attach({
            contentScriptFile: self.data.url("options-contentscript.js")
          });
          worker.port.on("request-prefs", () => {
            worker.port.emit("receive-prefs", Preferences.prefs);
          });
          worker.port.on("save-pref", ([pref, value]) => {
            Preferences.prefs[pref] = value;
          });
        }
      });
    }
  });
  return button;
}

module.exports = {
  init: initToolbarButton
};
