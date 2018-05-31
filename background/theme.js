"use strict";

const textProperties = ["toolbar_text", "textcolor", "toolbar_field_text"];
const opacityProperties = ["toolbar", "toolbar_field"];

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

    patchedColors.toolbar_top_separator = "rgba(128, 128, 128, 0.2)";
    patchedColors.toolbar_bottom_separator = patchedColors.toolbar;

    let theme = {
      colors: patchedColors,
    };

    let ffVersion = parseInt(navigator.userAgent.split("Firefox/")[1], 10);
    if (ffVersion < 60) {
      theme.images = properties.images;
    }

    return theme;
  }
}
