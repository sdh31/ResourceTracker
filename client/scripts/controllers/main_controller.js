'use strict';

angular.module('resourceTracker')
    .controller('MainCtrl', function ($scope, $http, $location, $window) {

        $scope.initializeUser = function() {
            $scope.user = {
                username: '',
                password: '',
                permission_level: '',
                loggedIn: false
            };
        };

        $scope.initializeUser();
		$scope.loginError = false;
		$scope.alertMessage = "Incorrect username or password"

        $scope.login = function() {
            var signInUrl = '/user/signin';
            $http.post(signInUrl, $scope.user).then(function(response) {
				$scope.loginError = false;
				$scope.user.loggedIn = true;
                $scope.user.permission_level = response.data.permission_level;
                if ($scope.user.permission_level == 'admin') {
                    $scope.goToRegisterPage();
                } else {
                    $scope.goToReservationPage();
                }
            }, function(error) {
				$scope.loginError = true;
				clearFields();
            });
        };

		var clearFields = function() {
			$scope.user.username = '';
			$scope.user.password = '';
		};

		$scope.turnOffError = function() {
			$scope.loginError = false;
		}

        $scope.logout = function() {
            var signOutUrl = '/user/signout'; 
            $http.post(signOutUrl).then(function(response) {
                $scope.initializeUser();
                $location.url('/');
                // this is necessary - if you login as user, then logout, then log back in, the google timeline UI throws an error.
                // this fixes the error as is restarts the entire state of the application
                $window.location.reload();
            }, function(error) {
                console.log('there is an error when logging out....');
            });
        };

        $scope.isAdmin = function() {
            return $scope.user.permission_level == 'admin';
        };

        $scope.goToRegisterPage = function() {
            $location.url('/register')
        };

        $scope.goToContactPage = function() {
            $location.url('/contact')
        };

        $scope.goToResourcePage = function() {
            $location.url('/resource');
        };

        $scope.goToReservationPage = function() {
            $location.url('/reservation');
        };

});
