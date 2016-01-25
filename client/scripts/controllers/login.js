'use strict';

angular.module('resourceTracker')
  .controller('LoginCtrl', function ($scope, $http) {
  	$scope.user =  {
  		username: '',
  		password: ''
  	};

  	$scope.login = function() {
  		console.log($scope.user.username);
  		console.log($scope.user.password);
  	};

  });
