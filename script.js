document.getElementById("joinMeetForm").addEventListener("submit", joinMeeting);
var samePageMeetingLaunch = ["chrome://newtab", "edge://newtab", "about:blank"];

function NewMeetingURL() {
    return "http://meet.google.com/new";
}
function AliasToURL(alias) {
    return "http://meet.google.com/lookup/" + alias;
}

function getURL(userInput) {
    if (userInput.length == 0) {
        return NewMeetingURL();
    }
    if (userInput.match(/^[a-z0-9-]+$/i) != null) {
        return AliasToURL(userInput);
    }
    if (userInput.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/) != null) {
        if (userInput.includes("meet.google.com")) {
            return userInput;
        }
    }
    throw new Error("Invalid Input");
}

// this function checks if active tab is in samePageMeetingLaunch, if yes, url is opened in activeTab
// if not, new tab is created with url
function launchMeeting(url, tabPromise) {
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
function joinMeeting() {
    var tabPromise = chrome.tabs.query({ active: true, lastFocusedWindow: true });
    var meetDetails = document.getElementById("meetDetails").value;
    try {
        launchMeeting(url = getURL(meetDetails), tabPromise);
    }
    catch (err) {
        console.log(err);
    }
}