'use strict';

angular.module('resourceTracker')
    .controller('MainCtrl', function ($scope, $http, $location) {

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
            var loginQueryString = '/user/signin?username=' +  $scope.user.username + '&password=' + $scope.user.password;
            $http.get(loginQueryString).then(function(response) {
				$scope.loginError = false;
				$scope.user.loggedIn = true;
                $scope.user.permission_level = response.data.permission_level;
                $scope.goToRegisterPage();
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
            var logoutQueryString = '/user/signout';
            $http.get(logoutQueryString).then(function(response) {
                $scope.initializeUser();
                $location.url('/');
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
