"use strict";

const textProperties = ["toolbar_text", "textcolor", "toolbar_field_text"];

/* exported Theme */

class Theme {
  /**
   * Build a theme with properties from the manifest
   * @param Object properties
   */
  constructor(theme) {
    this.theme = theme;
    this.apply();
  }

  /**
   * Apply the theme with patches
   */
  apply() {
    return browser.theme.update(this.theme.properties);
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

    let { properties } = this.theme;

    let theme = {
      images: properties.images,
      colors: Object.assign({}, properties.colors, newColors),
    };
    return browser.theme.update(windowId, theme);
  }

  /**
   * Resets the theme by removing all patches applied on top of it
   */
  reset(windowId) {
    return browser.theme.update(windowId, this.theme.properties);
  }
}
