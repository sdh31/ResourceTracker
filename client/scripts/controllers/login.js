'use strict';

angular.module('resourceTracker')
    .controller('LoginCtrl', function ($scope, $http, $location) {
        $scope.user =  {
  		    username: '',
  		    password: ''
  	     };

         $scope.login = function() {
            console.log('calling login...');
            var loginQueryString = '/user?username=' +  $scope.user.username + '&password=' + $scope.user.password;
            $http.get(loginQueryString).then(function(response) {
                console.log(response);
                var permission_level = response.data.permission_level;
                if(permission_level == "admin"){
                    $location.url('/register');
                } else {
                    $location.url('/contact')
                }
            }, function(error) {
                console.log(error);
        });
  	};
});
