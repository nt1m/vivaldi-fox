const permissionsToRequest = {
    origins: ["<all_urls>"]
  }
  
function requestPermissions() {

  function onResponse(response) {
    if (response) {
      Settings.setUsePageDefinedColors(true);
    } else {
      Settings.setUsePageDefinedColors(false);
    }
    return browser.permissions.getAll();
  }

  browser.permissions.request(permissionsToRequest)
    .then(onResponse);
}

document.querySelector("#request").addEventListener("click", requestPermissions);