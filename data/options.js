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
    "title": "Use Australis Tabs (coming soon)",
    "description": "Use Australis Tabs instead of squared tabs",
    "type": "bool",
  },
  "grayed-out-inactive-windows": {
    "title": "Gray out inactive windows",
    "description": "Gray out inactive windows",
    "type": "bool",
  }
};

function init() {
  getPrefs(buildPrefsUI);
}

function buildPrefsUI(prefs) {
  let mainContent = document.querySelector("#settings");
  for (let pref in prefs) {
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

window.addEventListener("contentscript-load", init);
