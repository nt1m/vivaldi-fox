"use strict";
module.exports = {
  doToAllWindows(callback) {
    let allWindows = require("sdk/window/utils").windows("navigator:browser", {includePrivate: true});
    return function() {
      for (let win of allWindows) {
        callback(win);
      }
    };
  },
  getComputedCSSProperty(target, property) {
    let win = target.ownerDocument.defaultView;
    return win.getComputedStyle(target).getPropertyValue(property).trim().toLowerCase();
  }
};
