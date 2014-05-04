/**
 * Session service
 */

(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define('auth/factories/SessionService',[
      'angular',
      'angular-resource',
      'auth/auth',
      'user/user'
    ], factory);
  } else {
    factory();
  }
}(function () {
  'use strict';

  angular.module('app').factory('SessionService',[
    '$resource',
    '$rootScope',
    function($resource, $rootScope){
    var serverUrl = we.serverUrl;

    var service = $resource(serverUrl + '/users/:param',{},{
      'login': {
        method: 'POST',
        url: serverUrl + '/users/login'
      },
      'logout': {
        method: 'DELETE',
        url: serverUrl + '/users/logout'
      },
      'getCurrent': {
        method: 'GET',
        url: serverUrl + '/users/current'
      }

    });

    var factory = {}

    factory.user = {}


    factory.getUser = function () {
      return $rootScope.user;
    }

    factory.getCurrentUser = function(callback) {
      service.getCurrent(
        function(res, status){
          if(res.user.id){
            $rootScope.user = res.user;
            $rootScope.user.authorized = true;
            $rootScope.$broadcast('auth-login-success');
            /*
            // if are in / redirect to dashboard page
            if($location.path() == '/' || $state.current.name == 'index'){
              $state.transitionTo('dashboard');
            }
            */
            if(callback){
              callback(user);
            }
          }
        },
        function(err){
          console.error('sessionService.getCurrent error: ', err);
          //if(angular.isFunction(errorHandler)){
          //  errorHandler(err);
          //}
        }
      );

    }

    factory.authorized = function (){
      return $rootScope.user.authorized === true;
    }

    factory.unauthorized = function (){
      return $rootScope.user.authorized === false;
    }

    factory.login = function (newUser,resultHandler,errorHandler) {
      service.login(
        newUser,
        function(res, status){
          $rootScope.user = (res.user || {});
          //_user.authorized = res.authorized;
          $rootScope.user.authorized = true;
          if(angular.isFunction(resultHandler)) {
            resultHandler(res);
          }
        },
        function(err){
          if(angular.isFunction(errorHandler)){
            errorHandler(err);
          }
        }
      );
    }

    factory.logout = function (user,resultHandler,errorHandler){
      service.logout(
        user,
        function(res){
          user = (res.user || {});
          user.authorized = res.authorized;
          if(angular.isFunction(resultHandler)) {
            resultHandler(res);
          }
        },
        function(err){
          if(angular.isFunction(errorHandler)){
            errorHandler(err);
          }
        }
      );
    }

    factory.getCurrentUser();

    return factory;
  }]);
}));