'use strict';

angular.module('resourceTracker')
    .controller('ReservationCtrl', function ($scope, $http) {
    	$scope.startDate = new Date();
    	$scope.endDate = new Date();
     });
