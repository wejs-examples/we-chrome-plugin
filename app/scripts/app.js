var angular = window.angular;

var backgroundWindow = chrome.extension.getBackgroundPage();
var we = backgroundWindow.we;

var app = angular.module('app', [
  'ngResource'
]);


app.controller("popupController", [
    "$scope",
  function popupController($scope) {
    $scope.tab = 'contacts';

    $scope.tabGoTo = function tabGoTo(tabName){

      $scope.tab = tabName;
    }
  }
]);

app.controller("contactsController", [
  "$scope",
  function contactsController($scope){

    $scope.user = we.authenticatedUser;
    $scope.contacts = we.messenger.contacts;
    $scope.openContact = we.messenger.openContact;

    var $socket = we.messenger.socket;

    we.getContactList(function(err, contacts){

      _.forEach(contacts, function(contact){

        we.messenger.getMessagesWithUser(contact.id, function(err, messages){

          contact.messages = messages;

          we.messenger.storeContact(contact);

          $scope.$apply();
        });
      });

      /*
      $scope.contacts.forEach(function(contact, i){
        console.log(contact);
        we.messenger.getMessagesWithUser(contact.id, function(err, messages){

          $scope.contacts[i].messages = messages;
          $scope.$apply();
        });
      });
      */
    });

    we.events.on('messenger-message-received', function(){
      $scope.$apply();
    });

    $scope.openContact = function (contact){


    };

    /**
     * Alert new message received
     * @param  {string} contactId
     */
    $scope.messengerAlertNewMessageReceived = function (contactId){
      console.log('messengerAlertNewMessageReceived',$scope);

      if(contactId != 'public'){
        $scope.startTalk(contactId);
      }

      $scope.$apply();
    };

    $scope.emitIsWriting = function (contactId){
      if(!$scope.contacts[contactId].iAmWritingTImeout){
        $socket.post(
          '/messenger/user/writing',
          { toUserId: contactId},
          function (response) {
        });

        $scope.contacts[contactId].iAmWritingTImeout = setTimeout(function(){
          $scope.contacts[contactId].iAmWritingTImeout = false;
        }, 3000);

      }

    };

    $scope.send = function (newMessage, toId, event){
      event.preventDefault();
      event.stopPropagation();

      var newMessageObj = {};

      newMessageObj.content = newMessage;
      newMessageObj.fromId = $scope.user.id;
      newMessageObj.status = 'sending';

      if(toId){
        newMessageObj.toId = [ toId ];
        $scope.contacts[toId].messages.push(newMessageObj);
        $scope.contacts[toId].newMessage = '';
      } else {
        // if dont has toId send it as public message
        //
        //$scope.publicRoom.messages.push(newMessageObj);
        $scope.publicRoom.newMessage = '';
      }

      $socket.post(
        '/messenger',
        newMessageObj,
        function (response) {
          console.log('messenger response create: ',response);
      });
    };

    /**
     * Receive a user is writing notification
     * @param  Object data
     */
    $socket.on("user:writing", function(data) {
      if(data.user && data.user.id){
        if(!$scope.contacts[data.user.id].isWriting){

          $scope.contacts[data.user.id].isWriting = true;

          $scope.contacts[data.user.id].isWritingTimeout = setTimeout(function(){
            $scope.contacts[data.user.id].isWriting = false;
            $scope.$apply();
          },4000);

          $scope.$apply();
        }
      }
    });
  }

]);

app.service("$socket", function(){
  return we.messenger.socket;
});


/**
 * Messenger box contact directive
 * run for every contact in mesenger box
 */
app.directive('scrollbottom', [ '$timeout',
  function() {
    return {
      restrict:"A",
      link: function(scope, element, attrs){
        if (scope.$last) {
          // TODO search for a better form to scroll to bottom
          setTimeout(function () {
            var box = jQuery(element).parent();
            var scrollToThis = box.innerHeight() * 10;
            box.scrollTop( scrollToThis );
          }, 20);
        }
      }
    };
  }
]);

angular.element(document).ready(function () {
  angular.bootstrap(document, ['app']);
});


