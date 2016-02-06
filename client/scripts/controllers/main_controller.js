'use strict';

angular.module('resourceTracker')
    .controller('MainCtrl', function ($scope, $http, $location, $window, $rootScope) {

        $scope.initializeUser = function() {
            $scope.user = {
                username: '',
                password: '',
                permission_level: '',
                loggedIn: false
            };
        };


        $rootScope.googleChartLoaded = { value: false };

        $scope.initializeUser();

        $scope.invalidLoginAlert = "Incorrect username or password";

        $scope.hasSuccess = { value: false };
        $scope.hasError = { value: false };
        $scope.successMessage = { value: '' };
        $scope.alertMessage = { value: '' };

        $scope.login = function() {
            var signInUrl = '/user/signin';
            $http.post(signInUrl, $scope.user).then(function(response) {
                $scope.clearError();
				$scope.user.loggedIn = true;
                $scope.user.permission_level = response.data.permission_level;
                if ($scope.user.permission_level == 'admin') {
                    $scope.goToRegisterPage();
                } else {
                    $scope.goToReservationPage();
                }
            }, function(error) {
				$scope.addError($scope.invalidLoginAlert);
				clearFields();
            });
        };

		var clearFields = function() {
			$scope.user.username = '';
			$scope.user.password = '';
		};


        $scope.clearError = function() {
            $scope.hasError.value = false;
            $scope.alertMessage.value = '';
        };

        $scope.clearSuccess = function() {
            $scope.hasSuccess.value = false;
            $scope.successMessage.value = '';
        };

        $scope.addError = function(errorMsg) {
            $scope.hasError.value = true;
            $scope.alertMessage.value = errorMsg;
            $scope.clearSuccess();
        }

        $scope.addSuccess = function(successMsg) {
            $scope.hasSuccess.value = true;
            $scope.successMessage.value = successMsg;
            $scope.clearError();
        };

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

        $scope.goToFilterReservationPage = function() {
            $location.url('/filter_reservation');
        };

        $scope.goToCreateReservationPage = function() {
            $location.url('/create_reservation');
        };

});
