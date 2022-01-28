document.getElementById("joinMeetForm").addEventListener("submit", joinMeeting);
var samePageMeetingLaunch = ["chrome://newtab", "edge://newtab", "about:blank"];

function createNewMeeting(tabPromise) {
    launchMeeting("http://meet.google.com/new", tabPromise);
}
function joinMeetingWithAlias(alias, tabPromise) {
    launchMeeting("http://meet.google.com/lookup/" + alias, tabPromise);
}
function joinMeetingWithURL(url, tabPromise) {
    launchMeeting(url, tabPromise);
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
    var tabPromise = chrome.tabs.query({ active: true, lastFocusedWindow: true});
    var meetDetails = document.getElementById("meetDetails");
    if (meetDetails.value.length == 0) {
        createNewMeeting(tabPromise);
    }
    else if (meetDetails.value.match(/^[a-z0-9-]+$/i) != null) {
        joinMeetingWithAlias(meetDetails.value, tabPromise);
    }
    else if (meetDetails.value.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/) != null) {
        if (meetDetails.value.includes("meet.google.com")) {
            joinMeetingWithURL(meetDetails.value, tabPromise);
        }
    }
}