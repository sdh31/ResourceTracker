'use strict';

angular.module('resourceTracker')
  .controller('RegisterCtrl', function ($scope, $http) {
  	$scope.newUser =  {
      firstName: '',
      lastName: '',
  		username: '',
      email: '',
      role: '',
  		password: '',
      confirmPassword: '',
  	};

    $scope.roles = ['admin', 'user'];

  	$scope.register = function() {
  		console.log($scope.newUser.firstName);
  		console.log($scope.newUser.lastName);
      console.log($scope.newUser.username);
      console.log($scope.newUser.email);
      console.log($scope.newUser.role);
      console.log($scope.newUser.password);
      console.log($scope.newUser.confirmPassword);
  	};

  });
