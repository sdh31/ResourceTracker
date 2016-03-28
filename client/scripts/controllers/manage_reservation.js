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
            getAllReservations();
        };

        var getAllReservations = function() {
            return $http.get('/resource/all').then(function(response) {
                var resourceList = response.data;
                var reservationIDtoReservationMap = new Map();
                resourceList.forEach(function(resource){
                    var resourceReservations = resource.reservations;
                    resourceReservations.forEach(function(reservation){
                        var resourceToAdd = {description: resource.description, is_confirmed: reservation.is_confirmed,
                            name: resource.name, resource_id: resource.resource_id, resource_state: resource.resource_state};
                        if(reservationIDtoReservationMap.has(reservation.reservation_id)){
                            var reserv = reservationIDtoReservationMap.get(reservation.reservation_id);
                            var resources = reserv.resources;
                            resources.push(resourceToAdd);
                            reserv.resources = resources;
                            reservationIDtoReservationMap.set(reservation.reservation_id, reserv); 
                        } else {
                            var reserv = {end_time: reservation.end_time, reservation_description: reservation.reservation_description,
                                reservation_id: reservation.reservation_id, reservation_title: reservation.reservation_title, resources: [resourceToAdd],
                                start_time: reservation.start_time, user: {user_id: reservation.user_id, username: reservation.username}};
                            reservationIDtoReservationMap.set(reservation.reservation_id, reserv);
                        }
                    });
                });
                for(let [key, value] of reservationIDtoReservationMap){
                    $scope.allReservations.push(value);
                }
                populateReservationsToDisplay($scope.allReservations, $scope.reservationsToDisplay);
                console.log($scope.allReservations);
            }, function(error){
                console.log(error);
            });
        }

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
            var resourceIDs = [];
            $scope.resourcesToRemove.forEach(function(resource){
                resourceIDs.push(resource.id);
            });
            var reqBody = {resource_ids: resourceIDs, reservation_id: $scope.reservationToModify.reservation_id};
            var promise = $http.post('reservation/remove_resources', reqBody).then(function(response){
                console.log(response);
            }, function(error){
                console.log(error);
            })
            return promise;
        }

        $scope.updateReservation = function() {
            var result = confirm("Are you sure you want to update reservation " + $scope.reservationToModify.reservation_title);
            if(!result) { return;}
            if (!$scope.startReservationTime.valueOf()) {
                $scope.addError($scope.onReservationInvalidStartDate);
                return;
            }

            if (!$scope.endReservationTime.valueOf()) {
                $scope.addError($scope.onReservationInvalidEndDate);
                return;
            }
            removeResources().then(function(){
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
                })
            
        };

        $scope.deleteReservation = function() {
            var result = confirm("Are you sure you want to delete reservation " + $scope.reservationToModify.reservation_title);
            if(!result){ return;}
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
