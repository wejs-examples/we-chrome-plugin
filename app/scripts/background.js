'use strict';

var serverUrl = we.serverUrl;

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: ''});
chrome.browserAction.setIcon({path: 'images/icon-19.offline.png'});

we.events.on("connect", function () {
  chrome.browserAction.setIcon({path: 'images/icon-19.png'});
});

we.events.on("disconnect", function () {
  chrome.browserAction.setIcon({path: 'images/icon-19.offline.png'});
});

we.events.on("reconnect", function () {
  chrome.browserAction.setIcon({path: 'images/icon-19.png'});
});


we.getAuthenticatedUser(function(err, user){
  we.messenger.connect();
    //we.notify('Connected!', 'Connected to wejs.org server');
})



