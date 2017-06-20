class Theme {
  /**
   * Build a theme with properties from the manifest
   * @param Object properties
   */
  constructor(properties) {
    this.currentProperties = this.properties = properties;
    this.apply();
  }

  /**
   * Apply the theme with patches
   */
  apply() {
    return browser.theme.update(this.currentProperties);
  }

  /**
   * Patch specific properties of the theme
   * @param Object newProperties
   */
  patch(newProperties) {
    this.currentProperties = Object.assign(this.properties, newProperties);
    this.apply();
    return this.currentProperties;
  }

  /**
   * Resets the theme by removing all patches applied on top of it
   */
  reset() {
    this.currentProperties = this.properties;
    browser.theme.update(this.properties);
  }
}