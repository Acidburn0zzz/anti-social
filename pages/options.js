// Default block list
// FIXME - this should live in an external defaults.json file
//         as background.js needs it too
var defaultList = ["https://facebook.com/", "https://www.facebook.com/",
                   "https://twitter.com/", "https://www.twitter.com/"];

var blockList;
var listDisplay;

// saveList
// Saves the blocklist to storage
function saveList() {
  browser.storage.local.set({
    blockList
  });
  console.log("saveList");
  for (var i of blockList) {
    console.log(i);
  }
}

// updateList
// Updates the multi-select box with current block list
function updateList(list) {
  var selector = document.getElementById("blockitems");
  while(selector.hasChildNodes()) {
    selector.removeChild(selector.childNodes[0]);
  }
  for (var el of list) {
    var line = document.createElement("option");
    line.textContent = el;
    line.value = el;
    selector.appendChild(line);
  }
}

// isUrlOk
// Validates candidate additions to blockList
function isUrlOk(url) {

  function isUrlInList(url) {
    return blockList.includes(url);
  }

  function isUrlValid(url) {
    // Found on stackoverflow
    //https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
    try {
      new URL(url);
      return true;
    } catch (_) {
      console.log(`isUrlValid: ` + url);
      return false;
    }
  }

  var ret = false;
  if((isUrlValid(url) === true) && (isUrlInList(url) === false)) {
    ret = true;
  }
  return ret;
}

// addSlashIfNeeded
// Checks if given url is domain only,
// If so, ensures trailing slash is present
function addSlashIfNeeded(url) {
  var testURL = new URL (url);
  // This will Do The Right Thing:
  // ie add trailing '/' if needed, but
  // leave it alone if pathname is more than just '/'
  url = testURL.href;
  return url;
}

// addWwwIfNeeded
// Takes candidate URL and checks it is of form foo.bar
// If so, returns new URL of form www.foo.bar -
// Otherwise returns undefined
function addWwwIfNeeded(url) {
  var testURL = new URL (url);

  // We only add www. to domains of form foo.bar,
  // We leave domains of form foo.bar.baz alone.
  if((testURL.hostname.slice(0,4) !== "www.") &&
     (testURL.hostname.indexOf(".") === testURL.hostname.lastIndexOf("."))) {
    testURL.hostname = "www." + testURL.hostname;
    return testURL.href;
  }

  return;
}

// addToBlockList
// Adds a URL to block list
function addToBlockList(e) {
  e.preventDefault(); // prevent default form 'submit' action

  // Get new url/s to add from form.
  var newUrl = document.getElementById("newsite").value;
  var newUrlWithWWW;

  // Validate url
  if(isUrlOk(newUrl) === true) {
    // If ok, add to block list,
    // otherwise silently do nothing
    // Save list also so it persists
    // Add trailing slash if domain only given and slash missing
    newUrl = addSlashIfNeeded(newUrl);
    blockList.push(newUrl);
    // Check to see if we also need to block with prepended 'www.'
    newUrlWithWWW = addWwwIfNeeded(newUrl);
    if(newUrlWithWWW && (!blockList.includes(newUrlWithWWW))) {
      blockList.push(newUrlWithWWW);
    }
    updateList(blockList);
    saveList();
  }

}

// restoreDefaults
// Restores the default block list
function restoreDefaults(e) {
  e.preventDefault(); // prevent default form 'submit' action

  blockList = defaultList.slice();

  updateList(blockList);
  saveList();
}

// restoreOptions
// Called on option page load,
// Loads current blocklist and displays it
function restoreOptions() {

  function setCurrentBlockList(result) {

    // If no result was returned from storage.local.get,
    // set blockList to the defaultList
    blockList = result.blockList || defaultList.slice();

    // populate textarea
    updateList(blockList);

  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("blockList");
  getting.then(setCurrentBlockList, onError);

}

// On load, populate block list with current list
document.addEventListener("DOMContentLoaded", restoreOptions);

// Enable Restore Defaults button
document.getElementById("reset").addEventListener("submit", restoreDefaults);

// Enable Add URL button
document.getElementById("add").addEventListener("submit", addToBlockList);
