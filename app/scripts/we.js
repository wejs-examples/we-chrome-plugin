
var we = {}

//we.serverUrl = "http://wejs.org";
we.serverUrl = "http://localhost:1337";

we.authenticatedUser = {};

we.audios = {};
we.audios.connect = new Audio("../audios/lightsaber.mp3");
we.audios.newMessage = new Audio("../audios/tick.mp3");

we.events = {};

we.events.on = function weAddEventListener(event, callback){
  window.addEventListener(event, callback, false);
};

we.events.trigger = function weTriggerEvent(eventName, data){
  // create a curtom event and pass the data in detail atribute
  var event = new CustomEvent(eventName, { 'detail': data });
  // Dispatch the event.
  window.dispatchEvent(event);
};

we.users = {};

we.getUser = function getUser(id, callback){
  if(we.users[id] && we.users[id].id){
    callback(null, we.users[id]);
  }else{
    var req = new XMLHttpRequest();
    req.open("GET", serverUrl + '/users/' + id, true);
    req.onload =  function(){
      JSONresponse = JSON.parse(this.response);

      if(JSONresponse.item && JSONresponse.item.id){
        // logged in
        we.users[JSONresponse.item.id] =  JSONresponse.item;
        callback(null, we.users[JSONresponse.item.id]);
      }else{
        // offline
        callback(null, null);
      }
    };
    req.send(null);
  }
};

we.storeUser = function storeUser(user){
  we.users[user.id] = user;
};

/**
 * Get current authenticated user from wejs server
 * @param  {Function} callback
 * @return null
 */
we.getAuthenticatedUser = function getAuthenticatedUser(callback){
  var req = new XMLHttpRequest();
  req.open("GET", serverUrl + '/users/current', true);
  req.onload =  function(){
    JSONresponse = JSON.parse(this.response);
    if(JSONresponse.user && JSONresponse.user.id){
      // logged in
      we.authenticatedUser = JSONresponse.user;
      callback(null, we.authenticatedUser);
    }else{
      // offline
      callback(null, null);
    }
  };
  req.send(null);
};

we.isAuthenticated = function isAuthenticated(){
  if(we.authenticatedUser && we.authenticatedUser.id){
    return true;
  }else{
    return false;
  }
};

we.getContactList = function getContactList(callback){
  var req = new XMLHttpRequest();
  req.open("GET", serverUrl + '/messenger/contact-list', true);
  req.onload =  function(){
    var JSONresponse = JSON.parse(this.response);

    if(JSONresponse.friendList){
      // logged in
      callback(null, JSONresponse.friendList);
    }else{
      // offline
      callback(null, null);
    }
  };
  req.send(null);
};


we.notify = function notify(title, msg, onClickFunction, image) {
  var havePermission = window.webkitNotifications.checkPermission();
  if (havePermission == 0) {

    // set default icone
    if(!image){
     image = 'images/icon-38.png';
    }

    // 0 is PERMISSION_ALLOWED
    var notification = window.webkitNotifications.createNotification(
      image,
      title,
      msg
    );

    if(onClickFunction){
      notification.onclick = onClickFunction;
    }

    notification.show();
  } else {
    console.log('sem permissão');
      window.webkitNotifications.requestPermission();
  }
}

window.we = we;