"use strict";
function doToAllWindows(callback) {
  let allWindows = require("sdk/window/utils").windows("navigator:browser", {includePrivate: true});
  return function() {
    for (let win of allWindows) {
      callback(win);
    }
  };
}

module.exports = {
  doToAllWindows
};
