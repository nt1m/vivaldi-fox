"use strict";

const textProperties = [
  "toolbar_text",
  "textcolor",
  "toolbar_field_text",
  "tab_text",
  "popup_text",
  "popup_highlight_text",
];
const opacityProperties = [
  "toolbar",
  "toolbar_field",
  "toolbar_field_border",
  "toolbar_top_separator",
  "toolbar_bottom_separator",
  "toolbar_field_separator",
  "toolbar_vertical_separator",
];
const aliases = {
  accentcolor: "frame",
  textcolor: "tab_background_text",
  toolbar_text: "bookmark_text",
};

function fixAliases(theme) {
  for (let oldAlias in aliases) {
    let newAlias = aliases[oldAlias];
    if (theme.colors[oldAlias]) {
      theme.colors[newAlias] = theme.colors[oldAlias];
      theme.colors[oldAlias] = null;
    }
  }
  return theme;
}

/* exported Theme */

class Theme {
  /**
   * Build a theme with properties from the manifest
   * @param Object properties
   */
  constructor(theme) {
    this.theme = theme;
    this.renderedProps =
      Theme.getRenderedTheme(this.theme.properties, this.theme.opacities);
    this.renderedPropsMap = new Map();
    this.apply();
  }

  /**
   * Apply the theme with patches
   */
  apply() {
    return browser.theme.update(this.renderedProps);
  }

  /**
   * Patch specific properties of the theme
   */
  patch(background, text, windowId) {
    if (this.theme.applyPageColors.length === 0) {
      return Promise.resolve();
    }
    let newColors = this.theme.applyPageColors.reduce((acc, x) => {
      return Object.assign({
        [x]: textProperties.includes(x) ? text : background,
      }, acc);
    }, {});

    let { properties, opacities } = this.theme;

    let theme;
    if (this.renderedPropsMap.has(background)) {
      theme = this.renderedPropsMap.get(background);
    } else {
      theme = Theme.getRenderedTheme({
        images: properties.images,
        colors: Object.assign({}, properties.colors, newColors),
      }, opacities);
    }
    return browser.theme.update(windowId, theme);
  }

  /**
   * Resets the theme by removing all patches applied on top of it
   */
  reset(windowId) {
    return browser.theme.update(windowId, this.renderedProps);
  }

  static getRenderedTheme(properties, opacities) {
    if (!opacities) {
      return properties;
    }

    let patchedColors = Object.assign({}, properties.colors);
    for (let property of opacityProperties) {
      if (opacities[property]) {
        let components = (new Color(properties.colors[property])).components.join(",");
        patchedColors[property] = `rgba(${components}, ${opacities[property]})`;
      }
    }

    let theme = {
      colors: patchedColors,
    };

    let ffVersion = parseInt(navigator.userAgent.split("Firefox/")[1], 10);
    if (ffVersion < 60) {
      theme.images = properties.images;
    }

    return fixAliases(theme);
  }
}
