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
    this.propsWithOpacities =
      Theme.getThemeWithOpacities(this.theme.properties, this.theme.opacities);
    this.propsWithOpacitiesMap = new Map();
    this.apply();
  }

  /**
   * Apply the theme with patches
   */
  apply() {
    return browser.theme.update(this.propsWithOpacities);
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
    if (this.propsWithOpacitiesMap.has(background)) {
      theme = this.propsWithOpacitiesMap.get(background);
    } else {
      theme = Theme.getThemeWithOpacities({
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
    return browser.theme.update(windowId, this.propsWithOpacities);
  }

  static getThemeWithOpacities(properties, opacities) {
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
      images: properties.images,
      colors: patchedColors,
    };

    return theme;
  }
}
