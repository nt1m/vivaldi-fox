const self = require("sdk/self");
const tabs = require("sdk/tabs");
const windowUtils = require("sdk/window/utils");
const { on, off, once } = require("sdk/event/core");
const DOMEvents = require("sdk/dom/events");
const { loadSheet } = require("sdk/stylesheet/utils");
const { getLuminance, getContrastRatio, extractRGBFromCSSColour } = require("lib/colour-utils");
const Preferences = require("sdk/simple-prefs");
const THEME_STYLE_ID = "vivaldi-fox-theme-style";
const DefaultThemes = {
  light: {
    "accent-background": "#fff",
    "accent-colour": "#000",
    "secondary-background": "#e5e5e5",
    "secondary-colour": "#000"
  },
  dark: {
    "accent-background": "#343434",
    "accent-colour": "#f1f1f1",
    "secondary-background": "#0a0a0a",
    "secondary-colour": "#f1f1f1"
  }
}
const ColourManager = {
  tabColourMap: new Map(),
  injectStyleSheetToWindow: doToAllWindows((win) => {
    let os;
    let platform = win.navigator.platform;
    if (platform.startsWith("Win")) {
      os = "win";
    } else if (platform.startsWith("Mac")) {
      os = "mac";
    } else {
      os = "linux";
    }
    ColourManager.os = os;
    win.document.documentElement.classList.add("vivaldi-fox-os-"+os);
    loadSheet(win, self.data.url("browser.css"), "author");
  }),
  putColourInMap(tab, colour, applyIfSelected = true) {
    this.tabColourMap.set(tab.id, colour);
    if (tab == tabs.activeTab && applyIfSelected) {
      this.onTabChange(tab);
    }
  },
  onTabChange(tab) {
    if (!this.tabColourMap.has(tab.id)) {
      this.onNewURL(tab);
    } else if (this.tabColourMap.get(tab.id) == "default") {
      ColourManager.resetColours();
    } else {
      ColourManager.setColour(this.tabColourMap.get(tab.id));
    }
  },
  onTabRemove(tab) {
    this.tabColourMap.delete(tab.id);
  },
  onNewURL(tab) {
    let worker = tab.attach({
      contentScriptFile: self.data.url("contentscript.js")
    });
    worker.port.once("theme-colour-change", (data) => {
      if (data == "default") {
        this.putColourInMap(tab, "default", false);
        return ColourManager.getColourFromFavicon().then((colour) => {
          this.putColourInMap(tab, "rgb(" + colour.join(",") + ")");
        });
      }
      this.putColourInMap(tab, data);
    });
  },
  onNewTab(tab) {
    // Those 2 URLs don't trigger a `ready` event on the tab, which means this hack is needed
    if (tab.url == "about:newtab" || tab.url == "about:blank") {
      this.resetColours();
    }
  },
  resetColours() {
    let win = windowUtils.getMostRecentBrowserWindow();
    let doc = win.document;
    doc.documentElement.style.removeProperty("--theme-accent-background");
    doc.documentElement.style.removeProperty("--theme-accent-colour");
    let navbar = doc.querySelector("#nav-bar");
    let onTransitionEnd = (e) => {
      if (e.target !== navbar) return;
      win.ToolbarIconColor.inferFromText();
      DOMEvents.removeListener(navbar, "transitionend", onTransitionEnd);
    }
    DOMEvents.on(navbar, "transitionend", onTransitionEnd);
  },
  analyseFavicon(imgEl) {
    let doc = imgEl.ownerDocument;
    let canvas = doc.createElementNS("http://www.w3.org/1999/xhtml","canvas");
    let ctx = canvas.getContext("2d");
    let colours = [];
    // This will:
    // - Take the median of a sorted list of colours (excluding shades of gray)
    // - If image only contains shades of gray, it takes the average instead
    let width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
    let height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    ctx.drawImage(imgEl, 0, 0);
    // ctx.fillStyle = "white";
    // ctx.fillRect(0,0, width, height);
    let data = ctx.getImageData(0, 0, width, height).data;
    let count = 0;
    let rValues = [], gValues = [], bValues = [];
    let rAvg = 0, gAvg = 0, bAvg = 0;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a !== 255) {
        r = (a / 255) * r;
        g = (a / 255) * g;
        b = (a / 255) * b;
      }
      // Transparent pixel, move on
      if (r == 0 && g == 0 && b == 0 && a == 0) continue;
      rAvg += r;
      gAvg += g;
      bAvg += b;
      count++;
      // Shade of gray, move on
      if (r == g && g == b) continue;
      if (rValues.indexOf(r) == -1) {
        rValues.push(r);
      }
      if (gValues.indexOf(g) == -1) {
        gValues.push(g);
      }
      if (bValues.indexOf(b) == -1) {
        bValues.push(b);
      }
      colours.push([r, g, b]);
    }

    let result;
    if (colours.length > 0) {
      let maxChannel;
      let max = Math.max(rValues.length, gValues.length, bValues.length);
      switch (max) {
        case rValues.length:
          maxChannel = 0;
        case gValues.length:
          maxChannel = 1;
        default:
          maxChannel = 2;
      }
      colours = colours.sort((a, b) => {
        return b[maxChannel] - a[maxChannel];
      });
      result = colours[Math.floor(colours.length / 2)];
    } else {
      rAvg = Math.floor(rAvg/count);
      gAvg = Math.floor(gAvg/count);
      bAvg = Math.floor(bAvg/count);
      result = [rAvg, gAvg, bAvg];
    }
    canvas.remove();
    imgEl.remove();
    return result;
  },
  getColourFromFavicon() {
    return new Promise((resolve, reject) => {
      let { getFavicon } = require("sdk/places/favicon");

      getFavicon(tabs.activeTab.url).then((url) => {
        if (!url) {reject()}
        let win = windowUtils.getMostRecentBrowserWindow();
        let doc = win.document;
        let imgEl = doc.createElementNS("http://www.w3.org/1999/xhtml","img");
        imgEl.src = url;
        imgEl.onerror = reject;
        imgEl.onload = () => {
          resolve(this.analyseFavicon(imgEl));
        };
      });
    });
  },
  setColour(colour) {
    let win = windowUtils.getMostRecentBrowserWindow();
    let doc = win.document;
    doc.documentElement.style.setProperty("--theme-accent-background", colour);
    let navbar = doc.querySelector("#nav-bar");
    let onTransitionEnd = function(e) {
      if (e.target !== navbar) return;
      let colour = win.getComputedStyle(navbar).getPropertyValue("background-color");
      let [r, g, b] = extractRGBFromCSSColour(colour);
      let lum = getLuminance([r, g, b]);
      let ratio = getContrastRatio(lum, 0);
      if (ratio > 7) {
        doc.documentElement.style.setProperty("--theme-accent-colour", "#000");
      } else {
        doc.documentElement.style.setProperty("--theme-accent-colour", "#fff");
      }
      win.ToolbarIconColor.inferFromText();
      DOMEvents.removeListener(navbar, "transitionend", onTransitionEnd)
    };
    DOMEvents.on(navbar, "transitionend", onTransitionEnd);
  },
  getCustomThemes() {
    let themes = JSON.parse(Preferences.prefs["themes"]);
    let obj = {};
    for (let theme of themes) {
      obj[theme.name] = theme.data;
    }
    return obj;
  },
  refreshThemeCSS(theme) {
    let styleText = `
:root {
  --theme-accent-colour: ${theme["accent-colour"]};
  --theme-accent-background: ${theme["accent-background"]};
  --theme-secondary-colour: ${theme["secondary-colour"]};
  --theme-secondary-background: ${theme["secondary-background"]};
}`;
    if (Preferences.prefs["grayed-out-inactive-windows"]) {
      styleText += `
:root:-moz-window-inactive {
  --theme-accent-colour: ${theme["accent-colour"]} !important;
  --theme-accent-background: ${theme["accent-background"]} !important;
}`;
    }
    doToAllWindows((win) => {
      let doc = win.document;
      let $ = (s) => doc.querySelector(s);
      if ($("#" + THEME_STYLE_ID)) {
        $("#" + THEME_STYLE_ID).textContent = styleText;
      }
      if (this.os == "win") {
        let colour = win.getComputedStyle(doc.querySelector("#main-window")).getPropertyValue("background-color");
        let RGB = extractRGBFromCSSColour(colour);
        let ratio = getContrastRatio(getLuminance(RGB), 0);
        doc.querySelector("#titlebar-buttonbox").classList.toggle("vivaldi-fox-invert-controls", ratio < 3);
      }
      win.ToolbarIconColor.inferFromText();
    })();
  },
  setAustralisTabs(enabled) {
    return doToAllWindows((win) => {
      let doc = win.document;
      doc.documentElement.classList.toggle("vivaldi-fox-australis-tabs", enabled);
    })();
  },
  onUpdatePrefs() {
    let selectedTheme;
    if (DefaultThemes.hasOwnProperty(Preferences.prefs["selected-theme"])) {
      selectedTheme = DefaultThemes[Preferences.prefs["selected-theme"]];
    } else {
      selectedTheme = this.getCustomThemes()[Preferences.prefs["selected-theme"]];
    }
    this.refreshThemeCSS(selectedTheme);
    this.setAustralisTabs(Preferences.prefs["use-australis-tabs"]);
    if (Preferences.prefs["use-page-colours"]) {
      tabs.on("close", this.onTabRemove);
      tabs.on("activate", this.onTabChange);
      tabs.on("open", this.onNewTab);
      tabs.on("ready", this.onNewURL);
      this.onNewURL(tabs.activeTab);
    } else {
      tabs.off("close", this.onTabRemove);
      tabs.off("activate", this.onTabChange);
      tabs.off("open", this.onNewTab);
      tabs.off("ready", this.onNewURL);
      this.resetColours();
    }
  },
  initThemes: doToAllWindows((win) => {
    let doc = win.document;
    let style = doc.createElementNS("http://www.w3.org/1999/xhtml","style");
    style.id = THEME_STYLE_ID;
    style.hidden = true;
    doc.documentElement.appendChild(style);
  }),
  init() {
    this.onTabRemove = this.onTabRemove.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
    this.onNewTab = this.onNewTab.bind(this);
    this.onNewURL = this.onNewURL.bind(this);
    this.onUpdatePrefs = this.onUpdatePrefs.bind(this);
    this.injectStyleSheetToWindow();

    this.initThemes();
    this.onUpdatePrefs();
    Preferences.on("", this.onUpdatePrefs);
  }
}

function doToAllWindows(callback) {
  let allWindows = windowUtils.windows("navigator:browser", {includePrivate: true});
  return function() {
    for (let win of allWindows) {
      callback(win);
    }
  };
}
ColourManager.init();



// New toolbar button
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
        return tab.activate();
      }
    }
    let tab = tabs.open({
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