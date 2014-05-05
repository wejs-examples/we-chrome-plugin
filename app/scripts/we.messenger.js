
var messenger = {};

messenger.unReadMessagesCount = 0;

messenger.contacts = {};
messenger.openContact = {};

// public room
messenger.publicRoom = {};
messenger.publicRoom.messages = [];

messenger.connected = false;
// -- Socket IO

messenger.connect = function connectInSocketIO() {

  // if socket io exists reconnect
  if(messenger.socket){
    return messenger.reconnect();
  }

  messenger.socket = io.connect(we.serverUrl);

  messenger.socket.on('connect', function socketConnected() {
    messenger.connected = true;
    we.events.trigger("connect");

    we.audios.connect.play();

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

      if(data.message){

        if(!messenger.contacts[data.message.fromId]){
          we.getUser(data.message.fromId, function(err, user){
            messenger.contacts[data.message.fromId] = user;
            messenger.contacts[data.message.fromId].messages = [];

            messenger.contacts[data.message.fromId].messages.push(data.message);
            we.audios.newMessage.play();
            messenger.contacts[data.message.fromId].isWriting = false;

          });

        }else{
          messenger.contacts[data.message.fromId].messages.push(data.message);
            we.audios.newMessage.play();
          messenger.contacts[data.message.fromId].isWriting = false;
        }

        we.events.trigger("messenger-message-received", {
          'message': data.message
        });
      }


    });

  });

    /**
     * Receive a bublic message
     * @param  Object data
     */
    messenger.socket.on("receive:public:message", function(data) {

      if(!we.isAuthenticated) return false;

      if(data.message){

        messenger.publicRoom.messages.push(data.message);

        we.events.trigger("messenger-public-message-received", { 'message': data.message});
      }
    });

    /**
     * Message receved after a contact connect
     * @param  object data
     */
    messenger.socket.on("contact:connect", function(data) {
      if(!we.isAuthenticated) return false;

      var contact = data.item;

      we.getAuthenticatedUser(function(err, user){

        if(user.id != contact.id){
          // set default values for every contact
          if(!contact.messages){
            contact.messages = [];
          }
          if(!contact.messengerBox){
            contact.messengerBox = {};
          }

          if(we.messenger.contacts[contact.id]){
            // if contact exists in contacts
            we.messenger.contacts[contact.id].messengerStatus = contact.messengerStatus;
          }else{
            // else are a new contact
            we.messenger.storeContact(contact);
          }

          we.events.trigger("messenger-contact-connected", {'contact_id': contact.id});
        }

      });
    });

    /**
     * Message receveid after a contact disconect
     * @param  object data
     */
    messenger.socket.on("contact:disconnect", function(data) {
      if(!we.isAuthenticated) return false;

      if(data.contact && data.contact.id){

        if(we.messenger.contacts[data.contact.id]){
          we.messenger.contacts[data.contact.id].messengerStatus = 'offline';
        }

        we.events.trigger("messenger-contact-diconnected", {'contact_id': data.contact.id});

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
