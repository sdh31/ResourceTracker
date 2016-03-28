'use strict';

angular.module('resourceTracker')
    .controller('UserReservationCtrl', function ($scope, $http, $filter, modifyReservationsService) {

        $scope.clearError();
        $scope.clearSuccess();
        $scope.onReservationInvalidStartDate = "Please select a valid start date.";
        $scope.onReservationInvalidEndDate = "Please select a valid end date.";

        // this function initializes all global data on this page. 
        var initializeResourceReservations = function() {
            var currentTime = new Date();
            $scope.startReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());
            $scope.endReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());
            // reservation_id to reservation
            $scope.reservationMap = new Map();
            $scope.reservationIDToModify = {};
            $scope.reservationsToDisplay = [];
            $scope.allReservations = [];
            // final reservation that needs modification
            $scope.reservationToModify = {};
            $scope.reservationSelected = false;
            $scope.selectedReservationResources = [];
            $scope.resourcesToDisplay = [];
            $scope.resourcesToRemove = [];
            getAllResources();
        };

        var getAllResources = function() {
            return $http.get('/reservation').then(function(response) {
                $scope.allReservations = response.data.results;
                populateReservationsToDisplay($scope.allReservations, $scope.reservationsToDisplay);
            }, function(error) {
                console.log(error);
            });
        };

        var populateReservationsToDisplay = function(reservationData, reservationArray){
            reservationData.forEach(function(reservation) {
                var data = {id: reservation.reservation_id, label: reservation.reservation_title};
                reservationArray.push(data);
                $scope.reservationMap.set(reservation.reservation_id, reservation);
            });
        }

        $scope.onReservationSelect = function(item) {
            $scope.reservationToModify = $scope.reservationMap.get(item.id);
            $scope.reservationSelected = true;
            var startTime = new Date($scope.reservationToModify.start_time);
            var endTime = new Date($scope.reservationToModify.end_time);
            $scope.startReservationTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), startTime.getHours(), startTime.getMinutes());
            $scope.endReservationTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(), endTime.getHours(), endTime.getMinutes());   
            $scope.selectedReservationResources = $scope.reservationToModify.resources;

            $scope.resourcesToDisplay = [];
            $scope.resourcesToRemove = [];
            populateResourcesToDisplay($scope.selectedReservationResources, $scope.resourcesToDisplay);
        };

        var populateResourcesToDisplay = function(resourceData, resourceArray){
            resourceData.forEach(function(resource){
                var data = {id: resource.resource_id, label: resource.name};
                resourceArray.push(data);
            })
        };

        var removeResources = function(){
            console.log($scope.resourcesToRemove);
            $scope.resourcesToRemove.forEach(function(resource){
                var reqBody = {resource_id: resource.id, reservation_id: $scope.reservationToModify.reservation_id};
                $http.post('reservation/remove_resource', reqBody).then(function(response){
                    console.log(response);
                }, function(error){
                    console.log(error);
                })
            });
        }

        $scope.updateReservation = function() {
            if (!$scope.startReservationTime.valueOf()) {
                $scope.addError($scope.onReservationInvalidStartDate);
                return;
            }

            if (!$scope.endReservationTime) {
                $scope.addError($scope.onReservationInvalidEndDate);
                return;
            }

            removeResources();

			modifyReservationsService.updateReservation($scope.reservationToModify.reservation_title,
            $scope.reservationToModify.reservation_description,
            $scope.startReservationTime.valueOf(), 
            $scope.endReservationTime.valueOf(),
            $scope.reservationToModify.reservation_id).then(function(successMessage) {
                $scope.addSuccess(successMessage);
                initializeResourceReservations();
			}, function(alertMessage) {
				$scope.addError(alertMessage);
                initializeResourceReservations();
			})
		};

        $scope.deleteReservation = function() {
			modifyReservationsService.deleteReservation($scope.reservationToModify.reservation_id).then(function(successMessage) {
                $scope.addSuccess(successMessage);
                initializeResourceReservations();
			}, function(alertMessage) {
				$scope.addError(alertMessage);
                initializeResourceReservations();
			})
        };

        initializeResourceReservations();
     });
