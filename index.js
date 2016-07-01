"use strict";
const self = require("sdk/self");
const tabs = require("sdk/tabs");
const windows = require("sdk/windows").browserWindows;
const { viewFor } = require("sdk/view/core");
const DOMEvents = require("sdk/dom/events");
const { loadSheet, removeSheet } = require("sdk/stylesheet/utils");
const { getLuminance, getContrastRatio, toRgb, getColourFromImage } = require("utils/colour");
const Preferences = require("sdk/simple-prefs");
const { doToAllWindows } = require("utils/misc");

const ThemeManager = require("themes");
const ColourManager = {
  tabColourMap: new Map(),

  putColourInMap(tab, colour, applyIfSelected = true) {
    this.tabColourMap.set(tab.id, colour);
    if (tab == tabs.activeTab && applyIfSelected) {
      this.onTabChange(tab);
    }
  },
  onTabChange(tab) {
    let win = viewFor(tab.window);
    if (!this.tabColourMap.has(tab.id)) {
      this.onNewURL(tab);
    } else if (this.tabColourMap.get(tab.id) == "default") {
      if (win) {
        this.resetColours(win);
      }
    } else if (win) {
      this.setColour(win, this.tabColourMap.get(tab.id));
    }
  },
  onTabRemove(tab) {
    this.tabColourMap.delete(tab.id);
  },
  onNewURL(tab) {
    let worker = tab.attach({
      contentScriptFile: self.data.url("contentscript.js")
    });
    this.putColourInMap(tab, "default", false);
    worker.port.once("theme-colour-change", (data) => {
      if (data == "default" || !data) {
        return this.getColourFromFavicon(tab).then((colour) => {
          return this.putColourInMap(tab, "rgb(" + colour.join(",") + ")");
        }).catch((e) => {
          this.putColourInMap(tab, "default");
        });
      }
      return this.putColourInMap(tab, data);
    });
  },

  getColourFromFavicon(tab) {
    return new Promise((resolve, reject) => {
      let { getFavicon } = require("sdk/places/favicon");

      return getFavicon(tab.url).then((url) => {
        if (!url) {
          throw new Error("No favicon URL: " + url);
        }
        let win = require("sdk/window/utils").getMostRecentBrowserWindow();
        let doc = win.document;
        let imgEl = doc.createElementNS("http://www.w3.org/1999/xhtml", "img");
        imgEl.src = url;
        imgEl.onerror = reject;
        imgEl.onload = () => {
          resolve(getColourFromImage(imgEl));
        };
      }).catch((e) => {
        reject(e);
      });
    });
  },

  setColour(win, colour) {
    let [r, g, b] = toRgb(colour);
    let bg = `rgba(${r}, ${g}, ${b}, ${Preferences.prefs["toolbar-opacity"] / 100})`;

    let doc = win.document;
    doc.documentElement.style.setProperty("--theme-accent-background", bg);

    let lum = getLuminance([r, g, b]);
    let ratio = getContrastRatio(lum, 0);
    if (ratio > 7 && Preferences.prefs["toolbar-opacity"] > 50) {
      doc.documentElement.style.setProperty("--theme-accent-colour", "#000");
    } else if (Preferences.prefs["toolbar-opacity"] > 50) {
      doc.documentElement.style.setProperty("--theme-accent-colour", "#fff");
    } else {
      doc.documentElement.style.setProperty("--theme-accent-colour",
        "var(--theme-secondary-colour)");
    }

    let navbar = doc.querySelector("#nav-bar");
    let onTransitionEnd = function(e) {
      if (e.target !== navbar) {
        return;
      }
      win.ToolbarIconColor.inferFromText();
      DOMEvents.removeListener(navbar, "transitionend", onTransitionEnd);
    };
    DOMEvents.on(navbar, "transitionend", onTransitionEnd);
  },
  resetColours(win) {
    let doc = win.document;
    doc.documentElement.style.removeProperty("--theme-accent-background");
    doc.documentElement.style.removeProperty("--theme-accent-colour");
    let navbar = doc.querySelector("#nav-bar");
    let onTransitionEnd = (e) => {
      if (e.target !== navbar) {
        return;
      }
      win.ToolbarIconColor.inferFromText();
      DOMEvents.removeListener(navbar, "transitionend", onTransitionEnd);
    };
    DOMEvents.on(navbar, "transitionend", onTransitionEnd);
  },
  onUpdatePrefs() {
    if (Preferences.prefs["use-page-colours"]) {
      tabs.on("close", this.onTabRemove);
      tabs.on("activate", this.onTabChange);
      tabs.on("ready", this.onNewURL);
      this.onNewURL(tabs.activeTab);
    } else {
      tabs.off("close", this.onTabRemove);
      tabs.off("activate", this.onTabChange);
      tabs.off("ready", this.onNewURL);
      doToAllWindows(this.resetColours)();
    }
  },

  init() {
    this.onTabRemove = this.onTabRemove.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
    this.onNewURL = this.onNewURL.bind(this);
    this.resetColours = this.resetColours.bind(this);
  }
};

let Addon = {
  init() {
    this.onUpdatePrefs = this.onUpdatePrefs.bind(this);
    this.setupWindow = this.setupWindow.bind(this);
    ColourManager.init();
    doToAllWindows(this.setupWindow)();
    windows.on("open", (win) => {
      this.setupWindow(viewFor(win));
    });
    this.onUpdatePrefs();
    Preferences.on("", this.onUpdatePrefs);
    require("toolbarbutton").init();
    require("sdk/system/unload").when(this.destroy);
  },
  setupWindow(win) {
    if (this.styleSheetEnabled) {
      this.injectStyleSheetToWindow(win);
    }
    ThemeManager.initThemes(win);
    this.onUpdatePrefs();
  },
  onUpdatePrefs() {
    ThemeManager.setTheme(ThemeManager.selectedTheme);
    this.setClassNameSetting("australis-tabs",
      Preferences.prefs["use-australis-tabs"]);
    this.setClassNameSetting("tab-icon-background",
      Preferences.prefs["tab-icon-background"]);
    ColourManager.onUpdatePrefs();
    this.styleSheetEnabled = Preferences.prefs["use-addon-stylesheet"];
  },
  set styleSheetEnabled(enabled) {
    doToAllWindows((win) => {
      if (enabled) {
        loadSheet(win, self.data.url("browser.css"), "author");
      } else {
        removeSheet(win, self.data.url("browser.css"), "author");
      }
    })();
  },
  get styleSheetEnabled() {
    return Preferences.prefs["use-addon-stylesheet"];
  },
  setClassNameSetting(className, enabled) {
    return doToAllWindows((win) => {
      let doc = win.document;
      doc.documentElement.classList.toggle("vivaldi-fox-" + className, enabled);
    })();
  },
  injectStyleSheetToWindow(win) {
    let os;
    let platform = win.navigator.platform;
    if (platform.startsWith("Win")) {
      os = "win";
    } else if (platform.startsWith("Mac")) {
      os = "mac";
    } else {
      os = "linux";
    }
    win.document.documentElement.classList.add("vivaldi-fox-os-" + os);
    loadSheet(win, self.data.url("browser.css"), "author");
  },
  destroy() {
    doToAllWindows((win) => {
      removeSheet(win, self.data.url("browser.css"), "author");
    })();
    ThemeManager.destroy();
    require("toolbarbutton").destroy();
  }
};

Addon.init();
