'use strict';

angular.module('resourceTracker')
    .controller('ManageReservationCtrl', function ($scope, $http, $filter, modifyReservationsService, $q) {

        $scope.clearError();
        $scope.clearSuccess();
        $scope.onReservationInvalidStartDate = "Please select a valid start date.";
        $scope.onReservationInvalidEndDate = "Please select a valid end date.";
        $('[data-toggle="tooltip2"]').tooltip({title: "Select resources you wish to remove from this reservation.", placement: "right"});


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
            $scope.updateValid = {value: false};
            $scope.showResourceModal = {value: false};            
            $scope.resourcesToDisplay = [];
            $scope.resourcesToRemove = {values: []};
            $scope.tree = [];
            $scope.myTree = {};
            getAllReservations();
        };

        var getAllReservations = function() {
            return $http.get('/resource/all').then(function(response) {
                var resourceList = response.data;
                var reservationIDtoReservationMap = new Map();
                var currentTime = new Date();
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
            }, function(error){
                console.log(error);
            });
        }

        var populateReservationsToDisplay = function(reservationData, reservationArray){
            var currentTime = new Date();
            reservationData.forEach(function(reservation) {
                if(reservation.end_time > currentTime.valueOf()){
                    var status = (determineIfReservationConfirmed(reservation)) ? " (confirmed)" : " (pending)"
                    var data = {id: reservation.reservation_id, label: reservation.reservation_title + status};
                    reservationArray.push(data);
                    $scope.reservationMap.set(reservation.reservation_id, reservation);
                }
            });
        }

        var determineIfReservationConfirmed = function(reserv){
            var sum = 0;
            reserv.resources.forEach(function(resource){
                sum += resource.is_confirmed;
            });
            return (sum == reserv.resources.length);
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
            $scope.resourcesToRemove.values = [];
            populateResourcesToDisplay($scope.selectedReservationResources, $scope.resourcesToDisplay);
        };

        var populateResourcesToDisplay = function(resourceData, resourceArray){
            resourceData.forEach(function(resource){
                var status = (resource.is_confirmed==0) ? " (pending)" : " (approved)";
                var data = {id: resource.resource_id, label: resource.name + status};
                resourceArray.push(data);
            })
        };

        var removeResources = function(){
            var deferred = $q.defer();
            var promise = deferred.promise;
            if($scope.resourcesToRemove.values.length == 0){
                deferred.resolve();
                return promise;
            }
            var reqBody = {resource_ids: $scope.resourcesToRemove.values, reservation_id: $scope.reservationToModify.reservation_id};
            promise = $http.post('reservation/remove_resources', reqBody).then(function(response){
                console.log(response);
            }, function(error){
                console.log(error);
            })
            return promise;
        }

        $scope.updateReservation = function() {
            
            if (!$scope.startReservationTime.valueOf()) {
                $scope.addError($scope.onReservationInvalidStartDate);
                return;
            }

            if (!$scope.endReservationTime.valueOf()) {
                $scope.addError($scope.onReservationInvalidEndDate);
                return;
            }
            if($scope.reservationToModify.resources.length == $scope.resourcesToRemove.values.length){
                $scope.deleteReservation();
            } else {
                var result = confirm("Are you sure you want to update reservation " + $scope.reservationToModify.reservation_title);
                if(!result) { return;}
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
                    });    
                });
            }
            
        };

        $scope.deleteReservation = function() {
            var result = ($scope.reservationToModify.resources.length == $scope.resourcesToRemove.values.length) ?
                confirm("By removing all resources, you will be deleting reservation " + $scope.reservationToModify.reservation_title + ". Are you sure this is what you want to do?")
                : confirm("Are you sure you want to delete reservation " + $scope.reservationToModify.reservation_title)
            if(!result){ return;}
            modifyReservationsService.deleteReservation($scope.reservationToModify.reservation_id).then(function(successMessage) {
                $scope.addSuccess(successMessage);
                initializeResourceReservations();
            }, function(alertMessage) {
                $scope.addError(alertMessage);
                initializeResourceReservations();
            })
        };

        $scope.showResources = function(){
            $scope.showResourceModal.value = true;
        };

        initializeResourceReservations();
     });
