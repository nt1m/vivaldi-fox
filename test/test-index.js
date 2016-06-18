"use strict";
/* global console */
const { before, after } = require("sdk/test/utils");
const { setTimeout } = require("sdk/timers");
const ColourUtils = require("../utils/colour");
const { getComputedCSSProperty } = require("../utils/misc");
const tabs = require("sdk/tabs");
const { viewFor } = require("sdk/view/core");
const self = require("sdk/self");
const $ = (s, t) => t.querySelector(s);
const $$ = (s, t) => t.querySelectorAll(s);
const { Task } = require("resource://gre/modules/Task.jsm", {});

/* Helpers */
let openURL = function* (url) {
  let tab = tabs.activeTab;
  tab.url = url;
  let t = yield once(tab, "load");
  yield wait(400);
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
  yield wait(400);
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

exports["test settings all"] = function* (assert) {
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

  /* Test selected-theme */
  assert.equal($("[data-pref='selected-theme']", doc).value, "light",
    "Test use-page-colours default setting value");
  $("[data-pref='selected-theme']", doc).value = "dark";
  $("[data-pref='selected-theme']", doc).dispatchEvent(
    new doc.defaultView.Event("change"));
  yield waitForPrefChange("selected-theme");

  $("[data-pref='use-page-colours']", doc).click();
  yield waitForPrefChange("use-page-colours");
  assert.equal(getComputedCSSProperty(root, "--theme-accent-background"), "#393939",
    "Theme accent bg changed to black");
  assert.equal(getComputedCSSProperty(root, "--theme-accent-colour"), "#f1f1f1",
    "Text colour is set to white");
  assert.equal(getComputedCSSProperty(root, "--theme-secondary-background"), "#0a0a0a",
    "secondary background is now black");
  assert.equal(getComputedCSSProperty(root, "--theme-secondary-colour"), "#f1f1f1",
    "Text colour is set to white");
  tab.close();
};

exports["test settings custom-themes"] = function* (assert) {
  let tab = yield openSettings();
  let win = viewFor(tab).linkedBrowser.contentWindow;
  let doc = win.document;

  let chromeWin = getWindowForTab(tab);
  let root = chromeWin.document.documentElement;

  assert.equal($$("#themes-list li", doc).length, 0,
    "should be 0 custom theme initially");

  $("[data-pref='use-page-colours']", doc).click();
  yield waitForPrefChange("use-page-colours");

  tab.attach({
    contentScript: "unsafeWindow.addTheme('test-custom-theme')"
  });
  yield waitForPrefChange("themes");
  assert.equal($$("#themes-list li", doc).length, 1, "should now be 1 custom theme");

  let themeEl = $("#themes-list li[data-theme='test-custom-theme']", doc);
  themeEl.click();
  yield waitForPrefChange("selected-theme");

  assert.equal(require("sdk/simple-prefs").prefs["selected-theme"], "test-custom-theme",
    "Selected theme should now be test-custom-theme");
  assert.ok(themeEl.classList.contains("selected"),
    "Theme item is selected");
  assert.equal($("[data-pref='selected-theme']", doc).value, "test-custom-theme",
    "Custom theme should be selected in selected-theme select");
  assert.equal($("#theme-editor", doc).childNodes.length, 5,
    "should be 4 custom colour settings + 1 remove button");
  let children = $("#theme-editor", doc).childNodes;
  for (let i = 0; i < children.length - 1; i++) {
    let child = children[i];
    let input = $("input", child);
    let label = $("span", child).textContent;
    let colour = "#000000".split("");
    colour[i + 1] = "f";
    colour[i + 2] = "f";
    colour = colour.join("");
    input.value = colour;
    input.dispatchEvent(new win.Event("input"));
    yield waitForPrefChange("themes");
    assert.equal(getComputedCSSProperty(root, "--theme-" + label), colour,
      "--theme-" + label + " should be properly set");
  }

  $("#theme-editor .remove", doc).click();
  assert.ok(!$("[data-pref='selected-theme'] [value='test-custom-theme']", doc),
    "Custom theme should be removed from selected-theme select");
  assert.equal($("#themes-list", doc).childNodes.length, 0,
    "Theme list should have no child");
  assert.equal($("#theme-editor", doc).childNodes.length, 0,
    "Theme editor should be destroyed");
  assert.equal($("[data-pref='selected-theme']", doc).value, "light",
    "Light theme should now be selected");

  tab.close();
};

require("../index.js");

// Clean up prefs after each test.
let initialPrefs = JSON.parse(JSON.stringify(require("sdk/simple-prefs").prefs));
before(exports, function* (name) {
  console.log("\n********", "\nRunning " + name, "\n********");
});
after(exports, Task.async(function* () {
  for (let pref in initialPrefs) {
    if (pref.startsWith("sdk.")) {
      continue;
    }
    if (require("sdk/simple-prefs").prefs[pref] !== initialPrefs[pref]) {
      require("sdk/simple-prefs").prefs[pref] = initialPrefs[pref];
      yield waitForPrefChange(pref);
    }
  }
}));
require("sdk/test").run(exports);
