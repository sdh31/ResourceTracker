'use strict';

angular.module('resourceTracker')
    .controller('ManageReservationCtrl', function ($scope, $http, $filter, modifyReservationsService) {

        $scope.clearError();
        $scope.clearSuccess();
        $scope.onReservationInvalidStartDate = "Please select a valid start date.";
        $scope.onReservationInvalidEndDate = "Please select a valid end date.";

        // this function initializes all global data on this page. 
        var initializeResourceReservations = function() {

            var currentTime = new Date();

            $scope.newStartReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());
            $scope.newEndReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());
            // resource_id to array of reservations
            $scope.resourceReservationMap = {};

            // reservation_id to obj with startTime & endTime attributes
            $scope.reservationMap = {};

            // all resources found in database, so admin can use them to modify/delete
            $scope.allResources = [];

            // modify a reservation dropdown model for RESOURCE
            $scope.resourceReservationToModify = {};

            // all reservations found for selected resource
            $scope.allReservationsForSelectedResource = [];

            // final reservation that needs modification
            $scope.reservationToModify = {};

            $scope.reservationSelected = false;
            $scope.userInfo = '';

            getAllResources();
        };

        var getAllResources = function() {
            return $http.get('/resource/all').then(function(response) {   
                populateResourceArray(response.data, $scope.allResources);
            }, function(error) {
                console.log(error);
            });
        };

        var populateResourceArray = function(resourceData, resourceArray) {
            resourceData.forEach(function(resource) {
                var resourceData = {id: resource.resource_id, label: resource.name};
                resourceArray.push(resourceData);
                $scope.resourceReservationMap[resourceData.id] = resource.reservations;
            });
        };

        $scope.onResourceReservationToggle = function() {
            $scope.allReservationsForSelectedResource = [];
            // go through map.....
            var id = $scope.resourceReservationToModify.id;
            $scope.resourceReservationMap[id].forEach(function(reservation) {
                var startTime = new Date(reservation.start_time);
                var endTime = new Date(reservation.end_time);
                var res_id = reservation.reservation_id;
                var startTimeLabel = $filter('date')(startTime, "medium");
                var endTimeLabel = $filter('date')(endTime, "medium");

                var res_label = 'Start Time: ' + startTimeLabel + ' End Time: '   + endTimeLabel;
                var resObj = {id: res_id, label: res_label};
                $scope.allReservationsForSelectedResource.push(resObj);
                $scope.reservationMap[res_id] = {start_time: startTime, end_time: endTime, userInfo: reservation.username};
            });
        };

        $scope.onReservationSelect = function(item) {
            var id = item.id;
            $scope.reservationSelected = true;
            $scope.userInfo = $scope.reservationMap[id].userInfo;
            $scope.newStartReservationTime = $scope.reservationMap[id].start_time;
            $scope.newEndReservationTime = $scope.reservationMap[id].end_time;
        };

        $scope.updateReservation = function() {
            if (!$scope.newStartReservationTime) {
                $scope.addError($scope.onReservationInvalidStartDate);
                return;
            }

            if (!$scope.newEndReservationTime) {
                $scope.addError($scope.onReservationInvalidEndDate);
                return;
            }
            
			modifyReservationsService.updateReservation($scope.newStartReservationTime.valueOf(), $scope.newEndReservationTime.valueOf(),
                $scope.reservationToModify.id, $scope.resourceReservationToModify.id).then(function(successMessage) {
                $scope.addSuccess(successMessage);
                initializeResourceReservations();
			}, function(alertMessage) {
				$scope.addError(alertMessage);
                initializeResourceReservations();
			})
		};

        $scope.deleteReservation = function() {
			modifyReservationsService.deleteReservation($scope.reservationToModify.id).then(function(successMessage) {
                $scope.addSuccess(successMessage);
                initializeResourceReservations();
			}, function(alertMessage) {
				$scope.addError(alertMessage);
                initializeResourceReservations();
			})
        };

        initializeResourceReservations();

     });
