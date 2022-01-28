document.getElementById("joinMeetForm").addEventListener("submit", joinMeeting);

function createNewMeeting() {
    chrome.tabs.create({url : "http://meet.google.com/new"});
}
function joinMeetingWithAlias(alias) {
    chrome.tabs.create({url : "http://meet.google.com/lookup/" + alias});
}
function joinMeetingWithURL(url) {
    chrome.tabs.create({url : url});
}

function joinMeeting() {
    var meetDetails = document.getElementById("meetDetails");
    if(meetDetails.value.length == 0) {
        createNewMeeting();
        return;
    }
    if(meetDetails.value.match(/^[a-z0-9]+$/i) != null) {
        joinMeetingWithAlias(meetDetails.value);
        return;
    }
    if(meetDetails.value.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/) != null) {
        if(meetDetails.value.includes("meet.google.com"))
        {
            joinMeetingWithURL(meetDetails.value);
        }
    }
}