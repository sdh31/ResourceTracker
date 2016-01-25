'use strict';

angular.module('resourceTracker')
    .controller('LoginCtrl', function ($scope, $http) {
        $scope.user =  {
  		    username: '',
  		    password: ''
  	     };

         $scope.login = function() {
            console.log('calling login...');
            var loginQueryString = '/user?username=' +  $scope.user.username
                + '&password=' + $scope.user.password;
            $http.get(loginQueryString).then(function(response) {
                console.log(response);
            }, function(error) {
                console.log(error);
        });
  	};
});
