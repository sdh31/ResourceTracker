'use strict';

angular.module('resourceTracker')
  .controller('LoginCtrl', function ($scope, $http) {
  	$scope.user =  {
  		username: '',
  		password: '',
      permission_level: ''
  	};

  	$scope.login = function() {
      console.log('calling login...');
      $http.get('/user?username=' + $scope.user.username+'&password=' + $scope.user.password+'&permission_level='+
        $scope.user.permission_level).then(function(data) {
        console.log(data);
      }, function(err) {
        console.log(err);
      });
  	};
  });
