function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
    // if (null == obj || "object" != typeof obj) return obj;
    // var copy = obj.constructor();
    // for (var attr in obj) {
    //     if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    // }
    // return copy;
}

class Theme {
  /**
   * Build a theme with properties from the manifest
   * @param Object properties
   */
  constructor(properties) {
    this.currentProperties = clone(properties);
    this.defaultProperties = clone(Object.freeze(clone(properties)));
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
    for (let key in newProperties) {
      this.currentProperties[key] = clone(Object.assign(this.defaultProperties[key], newProperties[key]));
    }
        console.log("patch", this.currentProperties.colors !== this.defaultProperties.colors)

    this.apply();
  }

  /**
   * Resets the theme by removing all patches applied on top of it
   */
  reset() {
    console.log("default",this.defaultProperties);
    this.currentProperties = clone(this.defaultProperties);
    console.log(this.currentProperties.colors !== this.defaultProperties.colors)
    console.log(this.defaultProperties);
    return this.apply();
  }
}