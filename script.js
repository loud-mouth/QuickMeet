document.getElementById("joinMeetForm").addEventListener("submit", joinMeeting);

function createNewMeeting() {
    chrome.tabs.create({url : "http://meet.google.com/new"});
}

function joinMeeting() {
    var meetDetails = document.getElementById("meetDetails");
    if(meetDetails.value.length == 0) {
        createNewMeeting();
        return;
    }
    chrome.tabs.create({url : "http://meet.google.com/lookup/" + meetDetails.value});
}