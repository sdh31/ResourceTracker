'use strict';

angular.module('resourceTracker')
    .controller('RegisterCtrl', function ($scope, $http) {
        $scope.newUser =  {
            firstName: '',
            lastName: '',
  		    username: '',
            email: '',
            permission_level: '',
  		    password: '',
            confirmPassword: '',
  	     };

        $scope.roles = ['admin', 'user'];

        $scope.register = function() {
            $http.put('/user', $scope.newUser).then(function(response) {
                console.log(response);
            }, function(error) {
                console.log(error);
            });

  	     };
     });
