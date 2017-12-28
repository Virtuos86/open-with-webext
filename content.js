function checkDocumentReadyState() {
  if (document.readyState === "complete") { 
    clearTimeout(timerId);
    chrome.runtime.sendMessage({ url: document.URL, source: document.documentElement.innerHTML });
  } else {
    timerId = setTimeout(checkDocumentReadyState, 1000);
  }
}

var timerId = setTimeout(checkDocumentReadyState, 1000);
