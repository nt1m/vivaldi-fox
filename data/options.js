/* eslint-env browser */
/* global savePref, getPrefs */
"use strict";

let PrefDefinitions = {
  "selected-theme": {
    "title": "Selected Theme",
    "description": "Currently selected theme",
    "type": "string",
    "values": ["light", "dark"],
    "placement": "#selected-theme-setting"
  },
  "use-page-colours": {
    "title": "Use Page Colours for UI",
    "description": "Extract page colours for main UI",
    "type": "bool",
  },
  "use-australis-tabs": {
    "title": "Use Australis Tabs",
    "description": "Use Australis Tabs instead of squared tabs",
    "type": "bool",
  },
  "tab-icon-background": {
    "title": "Add white background around tab icon",
    "description": "",
    "type": "bool",
  },
  "grayed-out-inactive-windows": {
    "title": "Gray out inactive windows",
    "description": "Gray out inactive windows",
    "type": "bool",
  },
  "use-addon-stylesheet": {
    "title": "Use add-on stylesheet (browser.css)",
    "description": "Load browser.css into the browser window",
    "type": "bool",
    "placement": "#advanced-settings",
    "onChange": (value) => {
      $("#normal-settings").classList.toggle("disabled", !value);
    },
  }
};

let $ = (s) => document.querySelector(s);

function init() {
  getPrefs(buildPrefsUI);
  let headerHeight = $(".header").clientHeight / 2;
  window.addEventListener("scroll", () => {
    document.body.classList.toggle("small-header", window.scrollY > headerHeight);
  });
}

function buildPrefsUI(prefs) {
  for (let pref in prefs) {
    if (pref == "themes") {
      continue;
    }
    let settingDiv = document.createElement("div");
    settingDiv.className = "setting";
    let prefDef = PrefDefinitions[pref];

    let el;
    let label = document.createElement("span");
    label.textContent = prefDef.title;
    settingDiv.appendChild(label);
    switch (prefDef.type) {
      case "string": {
        el = document.createElement("select");
        for (let val of prefDef.values) {
          let opt = document.createElement("option");
          opt.textContent = val;
          opt.value = val;
          el.appendChild(opt);
          el.value = prefs[pref];
        }
        break;
      }
      case "bool": {
        el = document.createElement("input");
        el.type = "checkbox";
        el.value = prefs[pref];
        el.checked = prefs[pref];
        break;
      }
    }
    el.dataset.pref = pref;
    settingDiv.title = prefDef.description;
    wireElementWithExtension(el, pref);
    settingDiv.appendChild(el);
    let placement = prefDef.placement || "#normal-settings";
    $(placement).appendChild(settingDiv);
  }
  initThemesUI(JSON.parse(prefs.themes), prefs["selected-theme"]);
}

function wireElementWithExtension(el, pref) {
  el.addEventListener("change", function(e) {
    let prefDef = PrefDefinitions[pref];
    let value;
    if (prefDef.type == "string") {
      value = this.value;
    } else if (prefDef.type == "bool") {
      value = this.checked;
    } else {
      value = JSON.parse(this.value);
    }
    savePref(pref, value);
    if (prefDef.onChange) {
      prefDef.onChange(value);
    }
  });
}

let customThemes;
function initThemesUI(themes, selected) {
  customThemes = themes;
  for (let theme of themes) {
    createThemeElement(theme);
  }
  if ($("#themes-list li[data-theme='" + selected + "']")) {
    $("#themes-list li[data-theme='" + selected + "']").click();
  }
  $("#add").addEventListener("click", () => {
    let name;
    do {
      name = prompt("Name of theme");
    } while (themeExists(name));
    if (!name) {
      return;
    }
    addTheme(name);
  });
}

function themeExists(theme) {
  let themes = customThemes.map((i) => i.name);
  themes.push("light");
  themes.push("dark");
  return themes.indexOf(theme) > -1;
}

function addTheme(name) {
  if (themeExists(name)) {
    throw new Error("Theme " + name + " already exists.");
  }
  let data = {
    name,
    data: {
      "accent-background": "#ffffff",
      "accent-colour": "#000000",
      "secondary-background": "#ebebeb",
      "secondary-colour": "#000000"
    },
  };
  customThemes.push(data);
  savePref("themes", JSON.stringify(customThemes));

  createThemeElement(data);
}

function showThemeEditor(theme) {
  let editor = $("#theme-editor");
  editor.textContent = "";
  for (let prop in theme.data) {
    createInput(prop, theme.data[prop]);
  }
  let removeButton = document.createElement("button");
  removeButton.textContent = "Remove theme";
  removeButton.classList.add("remove");
  removeButton.onclick = () => removeTheme(theme.name);
  editor.appendChild(removeButton);

  function createInput(prop, value) {
    let setting = document.createElement("div");
    let label = document.createElement("span");
    label.textContent = prop;

    let input = document.createElement("input");
    input.type = "color";
    input.value = value;
    input.addEventListener("input", function() {
      updateTheme(theme.name, prop, this.value);
    });
    setting.appendChild(label);
    setting.appendChild(input);
    editor.appendChild(setting);
  }
}
function setSelectedTheme(theme) {
  let themeSelect = $("select[data-pref='selected-theme']");
  themeSelect.value = theme;
  themeSelect.dispatchEvent(new Event("change"));
}
function removeTheme(name) {
  for (let i = 0; i < customThemes.length; i++) {
    let theme = customThemes[i];
    if (theme.name == name) {
      customThemes.splice(i, 1);
      break;
    }
  }
  setSelectedTheme("light");
  savePref("themes", JSON.stringify(customThemes));
  let editor = $("#theme-editor");
  editor.textContent = "";
  $("select[data-pref='selected-theme'] option[value='" + name + "']").remove();
  $("#themes-list li[data-theme='" + name + "']").remove();
}
function updateTheme(name, prop, value) {
  for (let i = 0; i < customThemes.length; i++) {
    let theme = customThemes[i];
    if (theme.name == name) {
      customThemes[i].data[prop] = value;
      break;
    }
  }
  savePref("themes", JSON.stringify(customThemes));
}

function createThemeElement(theme) {
  let themeSelect = $("select[data-pref='selected-theme']");
  let opt = document.createElement("option");
  opt.value = theme.name;
  opt.textContent = theme.name;
  themeSelect.appendChild(opt);

  let item = document.createElement("li");
  let name = document.createElement("span");
  item.dataset.theme = theme.name;
  name.textContent = theme.name;
  item.appendChild(name);

  let list = $("#themes-list");
  list.appendChild(item);
  item.onclick = () => {
    for (let i of item.parentNode.childNodes) {
      i.classList.remove("selected");
    }
    setSelectedTheme(theme.name);
    item.classList.add("selected");
    showThemeEditor(theme);
  };
}

window.addEventListener("contentscript-load", init);
