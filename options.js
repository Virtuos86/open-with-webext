var defaultApp = "firefox";
var defaultSettings = { apps: ["firefox"], currentApp: "firefox" };
var apps = defaultSettings.apps;
var currentApp = defaultSettings.currentApp;
var settings = null;

function saveOptions(event) {
  chrome.storage.local.set(
    { apps: apps, currentApp: currentApp }, () => {
    let status = document.getElementById("status");
    status.textContent = chrome.i18n.getMessage("optionsSaved");
    setTimeout(() => {
      status.textContent = "";
    }, 1000);
  });
}

function removeItemFromList(id) {
  var list = document.getElementsByClassName("list")[0];
  var index = 0;
  for (var li of list.children) {
    if (li.id === id) break;
    else index++;
  }
  list.removeChild(document.getElementById(id));
  apps.pop(index);
}

function addItemToList(title) {
  var list = document.getElementsByClassName("list")[0];
  var li = document.createElement("li");
  li.id = title + Math.random().toString();

  //var table = document.createElement("table");
  //li.appendChild(table);
  //var tr = document.createElement("tr");
  //table.appendChild(tr);
  //var td = document.createElement("td");
  //td.colspan = "2";
  //tr.appendChild(td);

  var div = document.createElement("div");
  var a = document.createElement("a");
  var item = document.createTextNode(title);
  a.appendChild(item);
  div.appendChild(a);
  var button = document.createElement("button");
  button.innerText = chrome.i18n.getMessage("removeApp");
  button.addEventListener("click", () => removeItemFromList(li.id));
  div.appendChild(button);
  list.appendChild(li);
}

function addApp(event) {
  var input = document.getElementById("addApp");
  var app = input.value;console.log(app);
  if (app.length == 0)
    return;
  input.value = "";
  addItemToList(app);
  apps.push(app);
}

function onGot(sets) {console.log(sets);
  if (!sets)
    settings = defaultSettings;
  else
    settings = sets;
  apps = settings.apps;
  for (var app of apps) {
    addItemToList(app);
  }
}

function restoreOptions() {
  var saveBtn = document.getElementById("saveBtn");
  saveBtn.innerText = chrome.i18n.getMessage("saveLabel");
  saveBtn.addEventListener("click", saveOptions);
  document.getElementById("addAppBtn").addEventListener("click", addApp);
  chrome.storage.local.get({}, onGot);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
