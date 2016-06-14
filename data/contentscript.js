/* eslint-env browser */
"use strict";
let extractPageColour = function() {
  let $ = (s) => document.querySelector(s);
  let el = $("meta[name='theme-color']") ? $("meta[name='theme-color']") :
                                           $("meta[name='msapplication-TileColor']");
  if (el) {
    self.port.emit("theme-colour-change", el.getAttribute("content"));
  } else {
    self.port.emit("theme-colour-change", "default");
  }
};
extractPageColour();
