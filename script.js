document.getElementById("newMeet").addEventListener("click", createNewMeeting);

function createNewMeeting() {
    chrome.tabs.create({url : "http://meet.google.com/new"});
}