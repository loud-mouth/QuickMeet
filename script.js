// Start of drag and drop funcitonality

var dragSrcEl = null;

function handleDragStart(e) {
  // Target (this) element is the source node.
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
  this.classList.add('dragElem');
}
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }
  this.classList.add('over');
  e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
  return false;
}

function handleDragEnter(e) {
  // this / e.target is the current hover target.
}

function handleDragLeave(e) {
  this.classList.remove('over');  // this / e.target is previous target element.
}

function handleDrop(e) {
  // this/e.target is current target element.

  if (e.stopPropagation) {
    e.stopPropagation(); // Stops some browsers from redirecting.
  }

  // Don't do anything if dropping the same column we're dragging.
  if (dragSrcEl != this) {
    // Set the source column's HTML to the HTML of the column we dropped on.
    //alert(this.outerHTML);
    //dragSrcEl.innerHTML = this.innerHTML;
    //this.innerHTML = e.dataTransfer.getData('text/html');
    this.parentNode.removeChild(dragSrcEl);

    var id_pop = parseInt(dragSrcEl.id);
    var id_push = parseInt(this.id);
    

    chrome.storage.local.get({ savedMeets: [] }, function (result) {
        var savedMeets = result.savedMeets;
        console.log('before');
        console.log(id_pop);
        console.log(id_push);
        console.log(result.savedMeets);
        savedMeets.splice(id_push, 0, savedMeets.splice(id_pop, 1)[0]);
        
        chrome.storage.local.set({ savedMeets: savedMeets }, function () {
            chrome.storage.local.get('savedMeets', function (res) {
                console.log('after');
                console.log(res.savedMeets)
            });
        });
    });

    var dropHTML = e.dataTransfer.getData('text/html');
    this.insertAdjacentHTML('beforebegin',dropHTML);
    var dropElem = this.previousSibling;
    addDnDHandlers(dropElem);
    
  }
  this.classList.remove('over');
  return false;
}

function handleDragEnd(e) {
  // this/e.target is the source node.
  this.classList.remove('over');    
}

function addDnDHandlers(elem) {
  elem.addEventListener('dragstart', handleDragStart, false);
  elem.addEventListener('dragenter', handleDragEnter, false)
  elem.addEventListener('dragover', handleDragOver, false);
  elem.addEventListener('dragleave', handleDragLeave, false);
  elem.addEventListener('drop', handleDrop, false);
  elem.addEventListener('dragend', handleDragEnd, false);

}

// End of drag and drop functionality




document.getElementById("joinMeetForm").addEventListener("submit", joinMeetingFromInput);
document.getElementById("addMeetForm").addEventListener("submit", saveInputAsMeet);
var samePageMeetingLaunch = ["chrome://newtab", "edge://newtab", "about:blank"];
var urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
var aliasRegex = /^[a-z0-9-]+$/i;

//create URL : new meeting
function NewMeetingURL() {
    return "http://meet.google.com/new";
}

//create URL from alias ('ridam' or 'abc-defg-hij')
function AliasToURL(alias) {
    return "http://meet.google.com/lookup/" + alias;
}

//covert user input into a URL
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

//auxillary function : syntax check for alias
function isMeetAlias(str) {
    return str.match(aliasRegex) != null;
}

//auxillary function : syntax check for URL
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
        savedMeets.forEach(function (meet, index) {
            //create a new li element
            var li = document.createElement("li");
            li.setAttribute('draggable', true);
            li.classList.add("bookmark-list-item");
            li.classList.add("column");
            li.setAttribute('id', index.toString());

            //add name button
            var name = document.createElement("a");
            name.href = "";
            name.innerText = meet.meetDescription;
            name.addEventListener("click", function () {
                loadPreJoinPageFromUserInput(meet.meetDetails);
            });
            li.appendChild(name);

            //add delete button
            var del = document.createElement("a");
            del.href = "";
            del.innerHTML = '<i class="fas fa-trash"></i>';
            del.addEventListener("click", function () {
                deleteSavedMeet(meet.meetDetails, meet.meetDescription);
            });
            li.appendChild(del);
        
            //add join button
            // var joinBtn = document.createElement("a");
            // joinBtn.href = "";
            // joinBtn.innerText = "Join";
            // joinBtn.addEventListener("click", function () {
            //     loadPreJoinPageFromUserInput(meet.meetDetails);
            // });
            // li.appendChild(joinBtn);
           
            addDnDHandlers(li);
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