"use strict";
const { setTimeout } = require("sdk/timers");
const ColourUtils = require("../lib/colour-utils");
const tabs = require("sdk/tabs");
const { viewFor } = require("sdk/view/core");
const { after, waitUntil } = require("sdk/test/utils");
const $ = (s, t) => t.querySelector(s);

exports["test colour-utils"] = function(assert) {
  assert.pass("Running colour-utils tests");
  assert.ok(ColourUtils.getContrastRatio(0, 1) == 21,
    "Max contrast ratio is 21");
  assert.ok(ColourUtils.getContrastRatio(0, 1) == 21,
    "Test contrast between black and white");
};

exports["test meta-tags"] = function(assert, done) {
  openURLAndTest("../test/test-meta-theme-color.html", function(tab) {
    let win = viewFor(tab.window);
    let root = $("#main-window", win.document);
    assert.ok(root.style.getPropertyValue("--theme-accent-color") == "#EF3939",
      "<meta name='theme-color'> is correctly extracted");
    done();
  });
};

function wait(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
function openURLAndTest(url, test) {
  tabs.open({
    url,
    onOpen: (tab) => {
      tab.activate();
    },
    onLoad: (tab) => {
      test(tab);
      tab.close();
    }
  });
}

require("../index.js");
require("sdk/test").run(exports);
