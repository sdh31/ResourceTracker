'use strict';

angular.module('resourceTracker')
    .controller('LoginCtrl', function ($scope, $http, $location) {
        $scope.user =  {
  		    username: '',
  		    password: ''
  	     };

         $scope.login = function() {
            console.log('calling login...');
            var loginQueryString = '/user/signin?username=' +  $scope.user.username + '&password=' + $scope.user.password;
            $http.get(loginQueryString).then(function(response) {
                console.log(response);
                var permission_level = response.data.permission_level;
                if(permission_level == "admin"){
                    $location.url('/register');
                } else {
                    $location.url('/register')
                }
            }, function(error) {
                console.log('there is an error');
                console.log(error);
        });
  	};
});
