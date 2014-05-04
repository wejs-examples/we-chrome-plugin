/**
 * User Module
 */


(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous AMD module:
    define('user/user',[
      'angular',
      'angular-resource'
    ], factory);
  } else {
    factory();
  }
}(function () {
  'use strict';

  // --- MODULE ---
  var module = angular.module('application.user', [
    'ngResource','ngRoute', 'ui.router', 'ui.bootstrap'
  ]);

  module.config([ '$locationProvider','$httpProvider','$stateProvider', '$urlRouterProvider',
    function( $locationProvider, $httpProvider, $stateProvider, $urlRouterProvider) {

      $stateProvider
      // ---- USERS
      .state('forgot_password', {
        url: "/user/forgot_password",
        templateUrl: wejs.getTemplateUrl('user/views/forgotPasswordForm.html')
      })
      .state('logout', {
        url: "/users/logout",
        controller: function($scope,$window){
          return $window.location.href = "/users/logout";
        }
      })
      .state('signup', {
        url: "/signup",
        templateUrl:  wejs.getTemplateUrl('user/views/signup.html'),
        controller: 'LoginCtrl',
      })

      .state('users', {
        url: "/users",
        views: {
          "": {
            templateUrl:  wejs.getTemplateUrl("user/views/index.html"),
            controller: 'UserController'
          }
        },
        resolve: {
          usersData: function(userResolver){
            console.log('resolvendo');
            return userResolver();
          }
        }
      })
      .state('user', {
        url: "/users/:id",
        views: {
          "": {
            templateUrl:  wejs.getTemplateUrl("user/views/user.html"),
            controller: 'UserItemController'
          }
        },
        resolve: {
          user: function(userShowResolver, $stateParams){
            return userShowResolver($stateParams);
          }
        }
      });
    }
  ]);

  if (typeof define === 'function' && define.amd) {
    return module;
  }

}));

// load module components like directives or controllers
requirejs([
  'user/directives/userMenuDirective',
  'user/directives/weUserNameDirective',
  //'user/factories/UserService',
  'user/factories/userResolver',
  'user/factories/userShowResolver',
  'user/factories/UserResource',
  'user/controllers/UserController',
  'user/controllers/UserItemController'
]);



