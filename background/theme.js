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
    this.applyPageColor = [0];
    this.currentProperties = new Map();
    this.defaultProperties = clone(properties);
  
    Object.freeze(this.defaultProperties);
    this.apply();
  }

  /**
   * Apply the theme with patches
   */
  apply(windowId) {
    if (!windowId) {
      windowId = browser.windows.WINDOW_ID_CURRENT;
    }
    if (!this.currentProperties.has(windowId)) {
      return browser.theme.update(windowId, this.defaultProperties);
    }
    return browser.theme.update(windowId, this.currentProperties.get(windowId));
  }

  /**
   * Patch specific properties of the theme
   * @param Object newProperties
   */
  patch(newProperties, windowId) {
    this.currentProperties.set(windowId, clone(Object.assign(clone(this.defaultProperties), newProperties)));

    this.apply(windowId);
  }

  /**
   * Resets the theme by removing all patches applied on top of it
   */
  reset(windowId) {
    this.currentProperties.delete(windowId);

    return this.apply(windowId);
  }
}