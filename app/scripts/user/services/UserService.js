/**
 * User Service
 */

(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define('user/factories/UserService',[
      'angular',
      'angular-resource',
      'user/user',
      'user/factories/UserResource'
    ], factory);
  } else {
    factory();
  }
}(function () {
  'use strict';

  angular.module('app').service("UserService", [
    "$resource",
    function($resource){
      // users object to store users data
      var users = {}
      this.users = users;

      this.resource = $resource(
         "http://localhost:1337/users/:id", {
            id: "@id"
          }, {
            update: {
              method: 'PUT'
            }
          }
      );

      /**
       * Get on user from server or from this service users
       * @param  {string}   id       User id to find
       * @param  {Function} callback function callback for return result
       * @return {[type]}            null
       */
      this.getUser = function(id, callback){
        if(users[id] && users[id].id){
          console.log('from cache', users[id]);
          callback(null, users[id]);
        }else{
          users[id] = {};
          // TODO add a error handler in get user
          this.resource.get({
            id: id
          }, function(data){

            if(data.item && data.item.id){
              // cache this user
              users[id] = data.item;
              console.log('from new', users[id]);
              callback(null, users[id]);
            } else {
              callback(null, null);
            }

          });
        }
      };

    }
  ]);

}));