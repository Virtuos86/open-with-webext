var APPLICATIONS = ["firefox"];
var CURRENT_APP = "firefox";
var tabs = {};
var defaultSettings = { apps: APPLICATIONS, currentApp: CURRENT_APP };

function onCreated() {
  if (chrome.runtime.lastError) {
    console.log(`Error: ${chrome.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function main(settings) {
  APPLICATIONS = settings.apps;
  CURRENT_APP = settings.currentApp || APPLICATIONS[0];
  chrome.contextMenus.create({
    id: "open-selection",
    title: chrome.i18n.getMessage("openSelection"),
    contexts: ["selection"],
    checked: false
  }, onCreated);

  chrome.contextMenus.create({
    id: "separator-1",
    type: "separator",
    contexts: ["selection"]
  }, onCreated);

  for (var i=0; i<APPLICATIONS.length; i++) {
    chrome.contextMenus.create({
      id: "application" + i.toString(),
      type: "checkbox",
      title: APPLICATIONS[i],
      contexts: ["all"],
      checked: false
    }, onCreated);
  }
}

function onResponse(response) {
  if (typeof response === "undefined")
    return;
  var normalRetMsg = "Child returned ";
  if (response.startsWith(normalRetMsg))
    response = response.slice(normalRetMsg.length - 1);
  console.log(`Runned \`${CURRENT_APP}\` returns the response: ` + response);
}

function createCmd(title, data) {
  var appNameLength = CURRENT_APP.length.toString();
  while (appNameLength.length < 4) {
    appNameLength = ' ' + appNameLength;
  }
  if (title.length >= 64)
    title = title.slice(0, 58) + ".html";
  var titleLength = title.length.toString();
  while (titleLength.length < 2) {
    titleLength = ' ' + titleLength;
  }
  return appNameLength + CURRENT_APP + titleLength + title + data;
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId.startsWith("application")) {
    for (var i=0; i<APPLICATIONS.length; i++) {
      var id = "application" + i.toString();
      if (id == info.menuItemId) {
        chrome.contextMenus.update(id, {
          checked: true
        });
        CURRENT_APP = APPLICATIONS[i];
        chrome.storage.local.set(defaultSettings, () => {});
      } else {
        chrome.contextMenus.update(id, {
          checked: false
        });
      }
    }
    chrome.runtime.sendNativeMessage(
      "dispatcher",
      createCmd(tab.title, tabs[tab.url]),
      onResponse
    );
  } else if (info.menuItemId == "open-selection") {
    chrome.contextMenus.update(info.menuItemId, {
      checked: false
    });
    chrome.runtime.sendNativeMessage(
      "dispatcher",
      createCmd(Math.random().toString().split('.')[1], info.selectionText),
      onResponse
    );
  }
});

function msgHandler(message, msgSender, sendResponce) {
  if (typeof message.url !== "undefined")
    tabs[message.url] = message.source;
}

chrome.runtime.onMessage.addListener(msgHandler);

function logStorageChange(changes, area) {
  if (area === "local") {
    var changedItems = Object.keys(changes);
 
    for (var item of changedItems) {
      if (item === "apps") {console.log(changes[item].newValue);
        chrome.contextMenus.removeAll();
        main({ apps: changes[item].newValue, currentApp: CURRENT_APP });
      }
    }
  }
}

chrome.storage.onChanged.addListener(logStorageChange);
chrome.storage.local.get(
  defaultSettings, main);