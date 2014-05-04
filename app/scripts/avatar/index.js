// Load module files
(function() {

  var moduleFiles = [
    'modules',
    './directives/avatar',
    './directives/gravatar',
    './controllers/avatarModal',
    './controllers/avatar'
  ];

  define('avatar/index', moduleFiles, function() {} );

}());