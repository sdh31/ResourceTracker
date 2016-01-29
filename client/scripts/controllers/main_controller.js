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

        $scope.login = function() {
            var loginQueryString = '/user/signin?username=' +  $scope.user.username + '&password=' + $scope.user.password;
            $http.get(loginQueryString).then(function(response) {
                $scope.user.loggedIn = true;
                $scope.goToRegisterPage();
            }, function(error) {
                console.log(error);
            });
        };

        $scope.logout = function() {
            var logoutQueryString = '/user/signout';
            $http.get(logoutQueryString).then(function(response) {
                $scope.initializeUser();
                $location.url('/');
            }, function(error) {
                console.log('there is an error when logging out....');
            });
        };

        $scope.showRegisterButton = function() {
            return $scope.user.permission_level == 'admin';
        };

        $scope.goToRegisterPage = function() {
            $location.url('/register')
        };

        $scope.goToContactPage = function() {
            $location.url('/contact')
        };



});
