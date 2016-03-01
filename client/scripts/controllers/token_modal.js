'use strict';


// at this point, there is a $scope.selectedGroup set through user_management.js
angular.module('resourceTracker')
    .controller('TokenCtrl', function ($scope, $http, $timeout, $location, $window) {

        $scope.apiUrl = 'http://docs.scccuuuuuuu.apiary.io/';

    	var initTokenController = function() {
            $http.post('/user/token').then(function(response) {
                $scope.token = response.data.results.token;
            }, function(error) {
                console.log(error);
            });
    	};

        $scope.openApiDocInNewTab = function() {
            $window.open($scope.apiUrl, '_blank'); // in new tab
        };

        initTokenController();

    });