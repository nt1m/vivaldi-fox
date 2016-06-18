"use strict";
const { setTimeout } = require("sdk/timers");
const ColourUtils = require("../utils/colour");
const { getComputedCSSProperty } = require("../utils/misc");
const tabs = require("sdk/tabs");
const { viewFor } = require("sdk/view/core");
const self = require("sdk/self");
const $ = (s, t) => t.querySelector(s);

/* Helpers */
let openURL = function* (url) {
  let tab = tabs.activeTab;
  tab.url = url;
  let t = yield once(tab, "load");
  yield wait(200);
  return t;
};

function wait(time) {
  return new Promise((r) => {
    setTimeout(r, time);
  });
}

function waitForTick(time) {
  return new Promise((r) => {
    r();
  });
}

function* waitForPrefChange(pref) {
  yield waitForTick();
  return once(require("sdk/simple-prefs"), pref);
}

function once(target, event) {
  return new Promise((resolve) => {
    target.once(event, resolve);
  });
}
function getWindowForTab(tab = tabs.activeTab) {
  return viewFor(tab.window);
}

let openSettings = function* (tab) {
  $("#action-button--vivaldi-fox-vivaldi-fox-options",
    getWindowForTab().document).click();
  let t = yield once(tabs[1], "load");
  yield wait(200);
  return t;
};

/* Actual tests */
exports["test colour-utils"] = function(assert) {
  assert.pass("Running colour-utils tests");
  assert.ok(ColourUtils.getContrastRatio(0, 1) == 21,
    "Max contrast ratio is 21");
  assert.ok(ColourUtils.getContrastRatio(0, 1) == 21,
    "Test contrast between black and white");
};

exports["test meta-tags"] = function* (assert) {
  let tab = yield openURL(self.data.url("../test/test-meta-theme-color.html"));
  let win = getWindowForTab(tab);
  let root = win.document.documentElement;
  assert.ok(getComputedCSSProperty(root, "--theme-accent-background") == "#ef3939",
    "<meta name='theme-color'> is correctly extracted");
  assert.ok(getComputedCSSProperty(root, "--theme-accent-colour") == "#fff",
    "Text colour is set to white");
};

exports["test settings"] = function* (assert) {
  let tab = yield openSettings();
  assert.ok(tab.url == "resource://vivaldi-fox/data/options.html",
    "Settings tab is opened");

  let doc = viewFor(tab).linkedBrowser.contentWindow.document;

  let chromeWin = getWindowForTab(tab);
  let root = chromeWin.document.documentElement;

  /* Test use-page-colours */
  assert.ok($("[data-pref='use-page-colours']", doc).checked,
    "Test use-page-colours default setting value");
  assert.equal(getComputedCSSProperty(root, "--theme-accent-background"), "#ef3939",
    "<meta name='theme-color'> is correctly extracted from settings");
  assert.equal(getComputedCSSProperty(root, "--theme-accent-colour"), "#fff",
    "Settings page should trigger white accent colour");

  $("[data-pref='use-page-colours']", doc).click();
  assert.ok(!$("[data-pref='use-page-colours']", doc).checked,
    "use-page-colours should no longer be checked");
  yield waitForPrefChange("use-page-colours");
  assert.equal(getComputedCSSProperty(root, "--theme-accent-background"), "#fff",
    "Theme colour doesn't depend on the page");
  assert.equal(getComputedCSSProperty(root, "--theme-accent-colour"), "#000",
    "Text colour is reset to black");

  $("[data-pref='use-page-colours']", doc).click();

  /* Test use-australis-tabs */
  assert.ok($("[data-pref='use-australis-tabs']", doc).checked,
    "Test use-australis-tabs default setting value");
  assert.ok(root.classList.contains("vivaldi-fox-australis-tabs"),
    "Root element contains australis tabs");

  $("[data-pref='use-australis-tabs']", doc).click();
  assert.ok(!$("[data-pref='use-australis-tabs']", doc).checked,
    "use-australis-tabs should be checked");
  yield waitForPrefChange("use-australis-tabs");
  assert.ok(!root.classList.contains("vivaldi-fox-australis-tabs"),
    "Root element stops containing australis tabs");

  $("[data-pref='use-australis-tabs']", doc).click();

  /* Test selected-theme */
  assert.equal($("[data-pref='selected-theme']", doc).value, "light",
    "Test use-page-colours default setting value");
  $("[data-pref='selected-theme']", doc).value = "dark";
  $("[data-pref='selected-theme']", doc).dispatchEvent(
    new doc.defaultView.Event("change"));
  yield waitForPrefChange("selected-theme");

  $("[data-pref='use-page-colours']", doc).click();
  yield waitForPrefChange("use-page-colours");
  assert.equal(getComputedCSSProperty(root, "--theme-accent-background"), "#343434",
    "Theme accent bg changed to black");
  assert.equal(getComputedCSSProperty(root, "--theme-accent-colour"), "#f1f1f1",
    "Text colour is set to white");
  assert.equal(getComputedCSSProperty(root, "--theme-secondary-background"), "#0a0a0a",
    "secondary background is now black");
  assert.equal(getComputedCSSProperty(root, "--theme-secondary-colour"), "#f1f1f1",
    "Text colour is set to white");
  tab.close();
};

require("../index.js");
require("sdk/test").run(exports);
