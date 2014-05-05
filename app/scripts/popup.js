'use strict';

// script for popup.js file

var backgroundWindow = chrome.extension.getBackgroundPage();
var we = backgroundWindow.we;

we.messenger.unReadMessagesCount = 0;

chrome.browserAction.setBadgeText({
  text: ''
});