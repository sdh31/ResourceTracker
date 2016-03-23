'use strict';

angular.module('resourceTracker')
    .controller('MainCtrl', function ($scope, $http, $location, $window, $rootScope) {

        var initializeUser = function() {
             $scope.user = {
                username: '',
                password: '',
                resource_management_permission: '',
                reservation_management_permission: '',
                user_management_permission: '',
                loggedIn: false
            };
        };

        $rootScope.googleChartLoaded = { value: false };

        $scope.invalidLoginAlert = "Incorrect username or password";

        $scope.hasSuccess = { value: false };
        $scope.hasError = { value: false };
        $scope.successMessage = { value: '' };
        $scope.alertMessage = { value: '' };

        initializeUser();

        // check if the user already has an active session, if so redirect them somewhere!
        $http.get('/user').then(function(response) {
            populateUserWithLoginResponse(response.data.results);
            $scope.user.loggedIn = true;
            redirectBasedOnPermissions();
        });

        $scope.login = function() {
            var signInUrl = '/user/signin';
            $http.post(signInUrl, $scope.user).then(function(response) {
                $scope.clearError();
                populateUserWithLoginResponse(response.data);
                $scope.user.loggedIn = true;
                redirectBasedOnPermissions();
            }, function(error) {
                $scope.addError($scope.invalidLoginAlert);
                clearFields();
            });
        };

        var populateUserWithLoginResponse = function(data) {
            $scope.user.first_name = data.first_name;
            $scope.user.last_name = data.last_name;
            $scope.user.username = data.username;
            $scope.user.user_management_permission = data.user_management_permission & 1;
            $scope.user.reservation_management_permission = data.reservation_management_permission & 1;
            $scope.user.resource_management_permission = data.resource_management_permission & 1;
            $scope.user.is_shibboleth = data.is_shibboleth & 1;
        };

        var redirectBasedOnPermissions = function() {
            if ($scope.user.user_management_permission) {
                $scope.goToSystemPermissionPage();
            } else {
                $scope.goToUserReservationPage();
            }
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
            if ($scope.user.is_shibboleth) {
                $window.location.href =
                    $window.location.protocol + "//" + $window.location.hostname + "/signout-shib";
                return;
            }

            var signOutUrl = '/user/signout'; 
            $http.post(signOutUrl).then(function(response) {
                initializeUser();
                $location.url('/');
                // this is necessary - if you login as user, then logout, then log back in, the google timeline UI throws an error.
                // this fixes the error as is restarts the entire state of the application
                $window.location.reload();
            }, function(error) {
                console.log('There is an error when logging out, so the session most likely timed out.');
                initializeUser();
                $location.url('/');
                // this is necessary - if you login as user, then logout, then log back in, the google timeline UI throws an error.
                // this fixes the error as is restarts the entire state of the application
                $window.location.reload();
            });
        };

        $scope.getToken = function() {
            $scope.showTokenModal.value = true;
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

        $scope.goToManageReservationPage = function() {
            $location.url('/manage_reservation');
        };

        $scope.goToUserReservationPage = function() {
            $location.url('/user_reservation');
        };

        $scope.goToSystemPermissionPage = function() {
            $location.url('/system_permission');
        };

        $scope.goToResourcePermissionPage = function() {
            $location.url('/resource_permission');
        };

        $scope.goToIncompleteReservationsPage = function() {
            $location.url('/incomplete_reservations')
        }

        $scope.isTabSelected = function(loadedPage) {
            if ($location.path() == loadedPage) {
                return 'active';
            }
            return '';
        };

});
