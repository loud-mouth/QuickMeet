document.getElementById("newMeet").addEventListener("click", createNewMeeting);
document.getElementById("joinMeet").addEventListener("submit", joinMeeting);


function createNewMeeting() {
    console.log("creating NewMeeting");
    chrome.tabs.create({url : "http://meet.google.com/new"});
}

// document.getElementById("linkForm").addEventListener("submit", function(e) {
//     e.preventDefault();
//     var link = document.getElementById("meetLink").value;
//     console.log(link);
//     chrome.tabs.create({url : link});
// });

function joinMeeting() {
    var myInput = document.getElementById("meetDetails").value;
    chrome.tabs.create({url : myInput});
}