const ALL_URLS = {
  origins: ["<all_urls>"]
};

function requestPermissions() {
  browser.permissions.request(ALL_URLS)
    .then(granted => Settings.setUsePageDefinedColors(granted));
}

document.querySelector("#request-permission").addEventListener("click", requestPermissions);

let colorSourceToggles = [...document.querySelectorAll("[name='color-source']")];
colorSourceToggles.forEach((radio) => radio.addEventListener("change", (e) => {
  if (e.target.value == "page-top" || e.target.value == "page-top-accent") {
    browser.permissions.request(ALL_URLS).then((granted) => {
      if (granted) {
        Settings.setColorSource(e.target.value);
      } else {
        // Couldn't get permission, need to revert value
        colorSourceToggles[0].checked = true;
      }
    });
  } else {
    Settings.setColorSource(e.target.value);
  }
}));

