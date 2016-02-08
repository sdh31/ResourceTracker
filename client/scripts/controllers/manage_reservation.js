'use strict';

angular.module('resourceTracker')
    .controller('ManageReservationCtrl', function ($scope, $http) {

        $scope.onReservationCreateSuccess = "Reservation Created!";
        $scope.onReservationCreateFailure = "Unable to create the reservation. The selected resource has already been reserved " +
                                            "during this time.";
        $scope.onReservationUpdateSuccess = "Reservation Updated!";
        $scope.onReservationUpdateFailure = "Unable to update the reservation. The selected resource has already been reserved " +
                                            "during this time.";
        $scope.onReservationDeleteSuccess = "Reservation Deleted!";
        $scope.onReservationDeleteFailure = "Unable to delete the reservation. There was an error doing so.";

        // this function initializes all global data on this page. 
        var initializeResourceReservations = function() {
            $scope.clearError();
            $scope.clearSuccess();

            var currentTime = new Date();

            $scope.startReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());
            $scope.endReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());

            $scope.newStartReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());
            $scope.newEndReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());


            // resource_id to array of reservations
            $scope.resourceReservationMap = {};

            // all resources found in database
            $scope.allResources = [];

            // create resource dropdown model
            $scope.resourceToCreate = {}; 

            // modify a reservation dropdown model for RESOURCE
            $scope.resourceReservationToModify = {};

            // all reservations found for selected resource
            $scope.allReservationsForSelectedResource = [];

            // final reservation that needs modification
            $scope.reservationToModify = {};

            getAllResources();
        };

        var getAllResources = function() {
            $http.get('/resource/all').then(function(response) {   
                console.log(response);
                populateResourceArray(response);
            }, function(error) {
                console.log(error);
            });
        };

        $scope.createReservation = function() {
            var reservationData = {start_time: $scope.startReservationTime.valueOf(),
                end_time: $scope.endReservationTime.valueOf(), resource_id: $scope.resourceToCreate.id};

            $http.put('/reservation', reservationData).then(function(response) {
                $scope.addSuccess($scope.onReservationCreateSuccess);
            }, function(error) {
                $scope.addError($scope.onReservationCreateFailure);
            });
            // must reload all resources, because a new one was just created
            initializeResourceReservations();
        };

        var populateResourceArray = function(resourceResponse) {
            resourceResponse.data.forEach(function(resource) {
                var resourceData = {id: resource.resource_id, label: resource.name};
                $scope.allResources.push(resourceData);
                $scope.resourceReservationMap[resourceData.id] = resource.reservations;
            });
        };

        $scope.onResourceReservationToggle = function() {
            $scope.allReservationsForSelectedResource = [];
            // go through map.....
            var id = $scope.resourceReservationToModify.id;
            $scope.resourceReservationMap[id].forEach(function(reservation) {
                var res_id = reservation.reservation_id;
                var res_label = 'Start Time: ' + new Date(reservation.start_time) + ' ' +
                            'End Time: '   + new Date(reservation.end_time);
                var resObj = {id: res_id, label: res_label};
                $scope.allReservationsForSelectedResource.push(resObj);
            });
        };

        $scope.updateReservation = function() {
            var reservationData = {start_time: $scope.newStartReservationTime.valueOf(), end_time: $scope.newEndReservationTime.valueOf(),
                reservation_id: $scope.reservationToModify.id, resource_id: $scope.resourceReservationToModify.id};
            $http.post('/reservation', reservationData).then(function(response) {
                $scope.addSuccess($scope.onReservationUpdateSuccess);
            }, function(error) {
                $scope.addError($scope.onReservationUpdateFailure);
            });
            initializeResourceReservations();     
        };

        $scope.deleteReservation = function() {
            var deleteReservationQuery = '/reservation?reservation_id=' + $scope.reservationToModify.id;
            $http.delete(deleteReservationQuery).then(function(response) {
                $scope.addSuccess($scope.onReservationDeleteSuccess);
            }, function(error) {
                $scope.addError($scope.onReservationDeleteError);
            });
            initializeResourceReservations();
        };

        initializeResourceReservations();

     });
