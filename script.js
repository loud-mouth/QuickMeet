document.getElementById("joinMeetForm").addEventListener("submit", joinMeetingFromInput);
document.getElementById("addMeetForm").addEventListener("submit", saveInputAsMeet);
var samePageMeetingLaunch = ["chrome://newtab", "edge://newtab", "about:blank"];
var urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
var aliasRegex = /^[a-z0-9-]+$/i;

function NewMeetingURL() {
    return "http://meet.google.com/new";
}
function AliasToURL(alias) {
    return "http://meet.google.com/lookup/" + alias;
}
function resolveInputToURL(userInput) {
    if (userInput.length == 0) {
        return NewMeetingURL();
    }
    if (isMeetAlias(userInput)) {
        return AliasToURL(userInput);
    }
    if (isMeetURL(userInput)) {
        return userInput;
    }
    throw new Error("Invalid Input");
}
function isMeetAlias(str) {
    return str.match(aliasRegex) != null;
}
function isMeetURL(str) {
    return str.match(urlRegex) != null && str.includes("meet.google.com");
}
// this function checks if active tab is in samePageMeetingLaunch, if yes, url is opened in activeTab
// if not, new tab is created with url
function openURLInAFreeTab(url, tabPromise) {
    tabPromise.then(function (tabs) {
        var tabUrl = tabs[0].url;
        if (samePageMeetingLaunch.some((page) => tabUrl.startsWith(page))) {
            chrome.tabs.update(tabs[0].id, { url: url });
        }
        else {
            chrome.tabs.create({ url: url });
        }
    }, function (error) {
        console.log("Fetching active tab failed: " + error);
        chrome.tabs.create({ url: url });
    });
}
function loadPreJoinPageFromUserInput(meetDetails) {
    var tabPromise = chrome.tabs.query({ active: true, lastFocusedWindow: true });
    try {
        openURLInAFreeTab(resolveInputToURL(meetDetails), tabPromise);
    }
    catch (err) {
        console.log(err);
    }
}

function deleteSavedMeet(meetDetails, meetDescription) {
    chrome.storage.local.get({ savedMeets: [] }, function (result) {
        var savedMeets = result.savedMeets;
        savedMeets = savedMeets.filter((meet) => meet.meetDetails != meetDetails || meet.meetDescription != meetDescription);
        chrome.storage.local.set({ savedMeets: savedMeets }, function () {
            chrome.storage.local.get('savedMeets', function (res) {
                console.log(res.savedMeets)
            });
        });
    });
}

function storeMeetDetails(meetDetails, meetDescription = "") {
    if (meetDescription.length == 0) {
        meetDescription = meetDetails;
    }
    chrome.storage.local.get({ savedMeets: [] }, function (result) {
        var savedMeets = result.savedMeets;
        savedMeets.push({ meetDetails:meetDetails, meetDescription: meetDescription });
        chrome.storage.local.set({ savedMeets: savedMeets }, function () {
            chrome.storage.local.get('savedMeets', function (res) {
                console.log(res.savedMeets)
            });
        });
    });
}

function joinMeetingFromInput() {
    var meetDetails = document.getElementById("meetDetails").value;
    loadPreJoinPageFromUserInput(meetDetails);
}

function loadSavedMeets() {
    chrome.storage.local.get({ savedMeets: [] }, function (res) {
        var savedMeets = res.savedMeets;
        var meetList = document.getElementById("meetList");
        meetList.innerHTML = "";
        savedMeets.forEach(function (meet) {
            var li = document.createElement("li");
            li.classList.add("bookmark-list-item");

            var a = document.createElement("a");
            a.href = "";
            a.innerText = meet.meetDescription;
            li.appendChild(a);

            var a1 = document.createElement("a");
            a1.href = "";
            a1.innerText = "Delete";
            a1.addEventListener("click", function () {
                deleteSavedMeet(meet.meetDetails, meet.meetDescription);
            });
            li.appendChild(a1);

            var a2 = document.createElement("a");
            a2.href = "";
            a2.innerText = "Join";
            a2.addEventListener("click", function () {
                loadPreJoinPageFromUserInput(meet.meetDetails);
            });
            li.appendChild(a2);

            meetList.appendChild(li);
        });
    });
}

function saveInputAsMeet() {
    var meetDetails = document.getElementById("saveMeetInp").value;
    var meetDesc = document.getElementById("meetDesc").value;
    if (meetDetails.length == 0) return;
    try {
        if (isMeetURL(meetDetails) || isMeetAlias(meetDetails)) {
            storeMeetDetails(meetDetails, meetDesc);
        }
    }
    catch (err) {
        console.log(err);
    }
}
window.onload = loadSavedMeets;