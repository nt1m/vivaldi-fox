function clone(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  let copy = obj.constructor();
  for (let attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
  }
  return copy;
}

class Theme {
  /**
   * Build a theme with properties from the manifest
   * @param Object properties
   */
  constructor(properties) {
    this.currentProperties = clone(properties);
    this.defaultProperties = clone(properties);
  
    Object.freeze(this.defaultProperties);
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
    this.currentProperties = clone(Object.assign(clone(this.defaultProperties), newProperties));

    this.apply();
  }

  /**
   * Resets the theme by removing all patches applied on top of it
   */
  reset() {
    this.currentProperties = clone(this.defaultProperties);

    return this.apply();
  }
}