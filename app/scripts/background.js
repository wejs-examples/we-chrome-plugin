'use strict';

var serverUrl = we.serverUrl;

function popUpIsOpen(){
  if(chrome.extension.getViews({ type: "popup" }).length){
    return true;
  }else{
    return false;
  }

}

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

we.events.on("messenger-message-received", function (event) {
  if(!popUpIsOpen()){
    console.log(event.detail.message);

    we.getUser(event.detail.message.fromId, function(err, user){

      if(user){
        if(user.avatarId){
          we.notify('Nova mensagem do '+ user.name +':', event.detail.message.content, null, we.serverUrl + '/images/' + user.avatarId);
        }else{
          we.notify('Nova mensagem do '+ user.name +':', event.detail.message.content, null, '/images/avatars/user-avatar.png');
        }
      }

    });

    we.messenger.unReadMessagesCount = we.messenger.unReadMessagesCount+1;

    chrome.browserAction.setBadgeText({
      text: we.messenger.unReadMessagesCount.toString()
    });
  }
});

we.getAuthenticatedUser(function(err, user){
  we.messenger.connect();
    //we.notify('Connected!', 'Connected to wejs.org server');
});
