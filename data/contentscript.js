/* eslint-env browser */
/* global chrome */
"use strict";
console.log("loadedd");
let extractPageColour = function() {
  let $ = (s) => document.querySelector(s);
  let el = $("meta[name='theme-color']") ? $("meta[name='theme-color']") :
                                           $("meta[name='msapplication-TileColor']");
  console.log(el);
  if (el) {
    chrome.runtime.sendMessage({
      type: "theme-colour-change",
      content: el.getAttribute("content")
    }, () => {});
    console.log("sentColor", el.getAttribute("content"));
  } else {
    chrome.runtime.sendMessage({
      type: "theme-colour-change",
      content: "default"
    }, () => {});
    console.log("sentColor", "default");
  }
};
window.addEventListener("mouseover", extractPageColour);
