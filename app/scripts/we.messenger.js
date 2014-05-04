
var messenger = {};

messenger.contacts = {};
messenger.openContact = {};

messenger.connected = false;
// -- Socket IO

messenger.connect = function connectInSocketIO() {

  // if socket io exists reconnect
  if(messenger.socket){
    return messenger.reconnect();
  }

  messenger.socket = io.connect('http://localhost:1337');

  messenger.socket.on('connect', function socketConnected() {
    messenger.connected = true;
    we.events.trigger("connect");

    // Listen for Comet messages
    messenger.socket.on('message', function messageReceived(message) {

      ///////////////////////////////////////////////////////////
      // Replace the following with your own custom logic
      // to run when a new message arrivesc
      // server.
      ///////////////////////////////////////////////////////////
      console.log('New comet message received :: ', message);
      //////////////////////////////////////////////////////

    });
  });

  messenger.socket.on('disconnect', function () {
    we.events.trigger("disconnect");
  });

  messenger.socket.on('reconnect', function () {
    we.events.trigger("reconnect");
  });

  messenger.socket.on('reconnecting', function () {
    we.events.trigger("reconnecting");
  });


  /**
   * Receive a messenger message
   * @param  Object data
   */
  messenger.socket.on("receive:message", function(data) {

    if(!we.isAuthenticated) return false;

    var newMessageObj = {};
    we.getAuthenticatedUser(function(err, user){
      console.log('user',user);
      console.log('data',data);

      newMessageObj.content = data.message.content;
      newMessageObj.toId = user.id ;
      newMessageObj.fromId = data.message.fromId;
      newMessageObj.status = 'sending';

      console.log(we.messenger.contacts);
      console.log(we.messenger.contacts[data.message.fromId]);

      we.messenger.contacts[data.message.fromId].messages.push(data.message);

      we.messenger.contacts[data.message.fromId].isWriting = false;
      console.log('message received2 ...');

      //$scope.messengerAlertNewMessageReceived(newMessageObj.fromId);
      we.events.trigger("messenger-message-received");

    });

  });

    /**
     * Receive a bublic message
     * @param  Object data
     */
    messenger.socket.on("receive:public:message", function(data) {

      if(!$scope.user.authorized) return false;

      var newMessageObj = {};
      var user = we.getAuthenticatedUser();

      newMessageObj.content = data.message.content;
      newMessageObj.toId = '' ;
      newMessageObj.fromId = data.message.fromId;
      newMessageObj.status = 'sending';

      $scope.publicRoom.messages.push(data.message);


      $scope.messengerAlertNewMessageReceived('public');
    });

    /**
     * Message receveid after a contact connect
     * @param  object data
     */
    messenger.socket.on("contact:connect", function(data) {

      if(!$scope.user.authorized) return false;

      var user = SessionService.getUser();
      var contact = data.contact;

      if(user.id != contact.id){
        // set default values for every contact
        if(!contact.messages){
          contact.messages = [];
        }
        if(!contact.messengerBox){
          contact.messengerBox = {};
        }

        if($scope.contacts[contact.id]){
          // if contact exists in contacts
          $scope.contacts[contact.id].messengerStatus = contact.messengerStatus;
        }else{
          // esle are a new contact
          $scope.contacts[contact.id] = contact;
        }

        //$scope.contacts[data.contact.id] = ;
        //$scope.contacts[data.contact.id] = ;
        $scope.$apply();
      }
    });

    return messenger.socket;
}

messenger.reconnect = function disconnectFromSocketIO(){
  return messenger.socket.socket.reconnect();
};

messenger.disconnect = function disconnectFromSocketIO(){
  messenger.connected = false;
  return messenger.socket.disconnect();
};

// TODO verify if old contact already exists
messenger.storeContact = function storeContact(contact){
  we.messenger.contacts[contact.id] = contact;
  we.storeUser(contact);
};


messenger.getMessagesWithUser = function messagesWithUser(id ,callback){

  var req = new XMLHttpRequest();
  req.open("GET", serverUrl + '/messenger/messages/with-user/' + id, true);
  req.onload =  function(){
    JSONresponse = JSON.parse(this.response);

    if(JSONresponse.messages){
      // logged in
      callback(null, JSONresponse.messages.reverse());
    }else{
      // offline
      callback(null, null);
    }
  };
  req.send(null);
}

/*

        'start': {
          method: 'GET',
          url: serverUrl + '/messenger/start'
        },
        'contactList': {
          method: 'GET',
          url: serverUrl + '/messenger/contact-list'
        },
        'messagesWithUser': {
          method: 'GET',
          url: serverUrl + '/messenger/messages/with-user/:id'
        },
        'messagesPublic': {
          method: 'GET',
          url: serverUrl + '/messenger/messages/public'
        },
*/
window.we.messenger = messenger;
