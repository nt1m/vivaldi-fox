let PrefDefinitions =  {
  "selected-theme": {
    "title": "Selected Theme",
    "description": "Currently selected theme",
    "type": "string",
    "values": ["light", "dark"]
  },
  "use-page-colours": {
    "title": "Use Page Colours for UI",
    "description": "Extract page colours for main UI",
    "type": "bool"
  },
  "use-australis-tabs": {
    "title": "Use Australis Tabs",
    "description": "Use Australis Tabs instead of squared tabs",
    "type": "bool",
  },
  "tab-icon-background": {
    "title": "Add white background around tab icon",
    "description": "",
    "type": "bool"
  },
  "grayed-out-inactive-windows": {
    "title": "Gray out inactive windows",
    "description": "Gray out inactive windows",
    "type": "bool",
  }
};

function init() {
  getPrefs(buildPrefsUI);
  let headerHeight = document.querySelector(".header").clientHeight / 2;
  window.addEventListener("scroll", () => {
    document.body.classList.toggle("small-header", window.scrollY > headerHeight);
  });
}

function buildPrefsUI(prefs) {
  let mainContent = document.querySelector("#settings");
  for (let pref in prefs) {
    if (pref == "themes") {
      initThemesUI(JSON.parse(prefs[pref]));
      continue;
    }
    let settingDiv = document.createElement("div");
    settingDiv.className = "setting";
    let prefDef = PrefDefinitions[pref];

    let el;
    let label = document.createElement("span");
    label.textContent = prefDef["title"];
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
    settingDiv.title = prefDef["description"];
    wireElementWithExtension(el, pref);
    settingDiv.appendChild(el);
    mainContent.appendChild(settingDiv);
  }
}

function wireElementWithExtension(el, pref) {
  el.addEventListener("change", function(e) {
    let prefDef = PrefDefinitions[pref];
    if (prefDef.type == "string") {
      savePref(pref, this.value);
    } else if (prefDef.type == "bool") {
      savePref(pref, this.checked);
    } else {
      savePref(pref, JSON.parse(this.value));
    }
  });
}

let customThemes;
function initThemesUI(themes) {
  customThemes = themes;
  for (let theme of themes) {
    createThemeElement(theme);
  }
}

function themeExists(theme) {
  let themes = customThemes.map((i) => i.name);
  themes.push("light");
  themes.push("dark");
  console.log(themes);
  return themes.indexOf(theme) > -1;
}
function addTheme() {
  let name;
  do {
    name = prompt("Name of theme");
  } while (themeExists(name));
  if (!name) return;
  let data = {
    name,
    data: {
      "accent-background": "#ffffff",
      "accent-colour": "#000000",
      "secondary-background": "#ebebeb",
      "secondary-colour": "#000000"
    },
  }
  customThemes.push(data);
  savePref("themes", JSON.stringify(customThemes));

  let themeSelect = document.querySelector("select[data-pref='selected-theme']");
  let opt = document.createElement("option");
  opt.value = name;
  opt.textContent = name;
  themeSelect.appendChild(opt);
  createThemeElement(data);
}

function showThemeEditor(theme) {
  let editor = document.querySelector("#theme-editor");
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
  let themeSelect = document.querySelector("select[data-pref='selected-theme']");
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
  let editor = document.querySelector("#theme-editor");
  editor.textContent = "";
  document.querySelector("select[data-pref='selected-theme'] option[value='" + name + "']").remove();
  document.querySelector("#themes-list li[data-theme='" + name + "']").remove();
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
  let item = document.createElement("li");
  let name = document.createElement("span");
  item.dataset.theme = theme.name;
  name.textContent = theme.name;
  item.appendChild(name);
  let list = document.querySelector("#themes-list");
  list.appendChild(item);
  item.onclick = () => {
    for (let i of item.parentNode.childNodes) {
      i.classList.remove("selected");
    }
    setSelectedTheme(theme.name);
    item.classList.add("selected");
    showThemeEditor(theme);
  };
  item.click();
}

window.addEventListener("contentscript-load", init);
