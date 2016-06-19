"use strict";

const THEME_STYLE_ID = "vivaldi-fox-theme-style";
const Preferences = require("sdk/simple-prefs");
const { doToAllWindows } = require("utils/misc");
const { getLuminance, getContrastRatio, extractRGBFromCSSColour, toRgb } = require("utils/colour");
module.exports = {
  initThemes(win) {
    let doc = win.document;
    let style = doc.createElementNS("http://www.w3.org/1999/xhtml", "style");
    style.id = THEME_STYLE_ID;
    style.hidden = true;
    doc.documentElement.appendChild(style);
  },
  get selectedTheme() {
    let name = Preferences.prefs["selected-theme"];
    let selectedTheme;
    if (this.defaultThemes.hasOwnProperty(name)) {
      selectedTheme = this.defaultThemes[name];
    } else if (this.customThemes.hasOwnProperty(name)) {
      selectedTheme = this.customThemes[name];
    } else {
      Preferences.prefs["selected-theme"] = "light";
      selectedTheme = this.defaultThemes.light;
    }
    return selectedTheme;
  },

  get customThemes() {
    let themes;
    try {
      themes = JSON.parse(Preferences.prefs.themes);
    } catch (e) {
      Preferences.prefs.themes = [];
      themes = [];
    }
    let obj = {};
    for (let theme of themes) {
      obj[theme.name] = theme.data;
    }

    return obj;
  },
  get os() {
    let win = require("sdk/window/utils").getMostRecentBrowserWindow();
    let os;
    let platform = win.navigator.platform;
    if (platform.startsWith("Win")) {
      os = "win";
    } else if (platform.startsWith("Mac")) {
      os = "mac";
    } else {
      os = "linux";
    }
    return os;
  },
  setTheme(theme) {
    let accentBg = toRgb(theme["accent-background"]);
    let bg = `rgba(${accentBg.join(",")},${Preferences.prefs["toolbar-opacity"] / 100})`;
    let styleText = `
:root {
  --theme-accent-colour: ${theme["accent-colour"]};
  --theme-accent-background: ${bg};
  --theme-secondary-colour: ${theme["secondary-colour"]};
  --theme-secondary-background: ${theme["secondary-background"]};
  --theme-textbox-opacity: ${Preferences.prefs["textbox-opacity"] / 100};
}`;
    if (Preferences.prefs["grayed-out-inactive-windows"]) {
      styleText += `
:root:-moz-window-inactive {
  --theme-accent-colour: ${theme["accent-colour"]} !important;
  --theme-accent-background: ${bg} !important;
}`;
    }
    doToAllWindows((win) => {
      let doc = win.document;
      let $ = (s) => doc.querySelector(s);
      if ($("#" + THEME_STYLE_ID)) {
        $("#" + THEME_STYLE_ID).textContent = styleText;
      }
      if (this.os == "win") {
        let root = doc.documentElement;
        let colour = win.getComputedStyle(root).getPropertyValue("background-color");
        let RGB = extractRGBFromCSSColour(colour);
        let ratio = getContrastRatio(getLuminance(RGB), 0);
        let buttonBox = doc.querySelector("#titlebar-buttonbox");
        buttonBox.classList.toggle("vivaldi-fox-invert-controls", ratio < 3);
      }
      win.ToolbarIconColor.inferFromText();
    })();
  },
  destroy() {
    doToAllWindows((win) => win.document.getElementById(THEME_STYLE_ID).remove());
  },
  defaultThemes: {
    light: {
      "accent-background": "#fff",
      "accent-colour": "#000",
      "secondary-background": "#dfdfdf",
      "secondary-colour": "#000",
      "toolbar-opacity": "1",
      "textbox-opacity": "1"
    },
    dark: {
      "accent-background": "#404040",
      "accent-colour": "#f1f1f1",
      "secondary-background": "#000",
      "secondary-colour": "#f1f1f1",
      "toolbar-opacity": "1",
      "textbox-opacity": "1"
    }
  }
};
