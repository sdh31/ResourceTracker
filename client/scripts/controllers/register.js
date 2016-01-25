'use strict';

angular.module('resourceTracker')
  .controller('RegisterCtrl', function ($scope, $http) {
  	$scope.newUser =  {
      firstName: '',
      lastName: '',
  		username: '',
  		password: '',
      confirmPassword: '',
  	};

  	$scope.register = function() {
  		console.log($scope.newUser.firstName);
  		console.log($scope.newUser.lastName);
      console.log($scope.newUser.username);
      console.log($scope.newUser.password);
      console.log($scope.newUser.confirmPassword);
  	};

  });
