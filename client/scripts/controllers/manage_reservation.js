'use strict';

angular.module('resourceTracker')
    .controller('ManageReservationCtrl', function ($scope, $http, $filter) {

        $scope.clearError();
        $scope.clearSuccess();

        $scope.onReservationCreateSuccess = "Reservation Created!";
        $scope.onReservationCreateFailure = "Unable to create the reservation. The selected resource has already been reserved " +
                                            "during this time.";
        $scope.onReservationUpdateSuccess = "Reservation Updated!";
        $scope.onReservationUpdateFailure = "Unable to update the reservation. The selected resource has already been reserved " +
                                            "during this time.";
        $scope.onReservationDeleteSuccess = "Reservation Deleted!";
        $scope.onReservationDeleteFailure = "Unable to delete the reservation. There was an error doing so.";

        $scope.onReservationCreateInPast = "Unable to create the reservation. Please select a time in the present or future."
        $scope.onReservationStartAfterEnd = "Unable to create the reservation. Please select a start time before the end time."
        $scope.onReservationNoResource = "Unable to create the reservation. Please select a resource to reserve."
        // this function initializes all global data on this page. 
        var initializeResourceReservations = function() {

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

            // reservation_id to obj with startTime & endTime attributes
            $scope.reservationMap = {};


            // all resources found in database, so admin can use them to modify/delete
            $scope.allResources = [];

            // create resource dropdown model
            $scope.resourceToCreate = {}; 

            // all resources for a given user found in database
            $scope.allUserResources = [];

            // modify a reservation dropdown model for RESOURCE
            $scope.resourceReservationToModify = {};

            // all reservations found for selected resource
            $scope.allReservationsForSelectedResource = [];

            // final reservation that needs modification
            $scope.reservationToModify = {};

            getAllResources().then(function() {
               // if we are admin, then resource/reservations that we can modify are the list of all resources.
                // if we are user, we must get all resource/reservations for that particular user
                if ($scope.isAdmin()) {
                    $scope.allUserResources = $scope.allResources;
                } else {
                    $scope.resourceReservationMap = {};
                    getAllUserResources();
                }
            });


        };

        var getAllResources = function() {
            return $http.get('/resource/all').then(function(response) {   
                populateResourceArray(response.data, $scope.allResources);
            }, function(error) {
                console.log(error);
            });
        };


        var getAllUserResources = function() {
            $http.get('/user').then(function(response) {
                console.log(response);   
                populateResourceArray(response.data.resources, $scope.allUserResources);
            }, function(error) {
                console.log(error);
            });
        };

        $scope.createReservation = function() {
            var reservationData = {start_time: $scope.startReservationTime.valueOf(),
                end_time: $scope.endReservationTime.valueOf(), resource_id: $scope.resourceToCreate.id};
            if(!validateCreateReservation(reservationData)){ 
                return;
            }
            $http.put('/reservation', reservationData).then(function(response) {
                $scope.addSuccess($scope.onReservationCreateSuccess);
                initializeResourceReservations();
            }, function(error) {
                $scope.addError($scope.onReservationCreateFailure);
                initializeResourceReservations();
            });
        };

        var validateCreateReservation = function(reservationData) {
            var curr = new Date();
            var startDiff = curr.valueOf() - reservationData.start_time;
            var endDiff = curr.valueOf() - reservationData.end_time;
            if(startDiff >= 60000 || endDiff >= 60000){
                $scope.addError($scope.onReservationCreateInPast);
                return false;
            } if(reservationData.start_time >= reservationData.end_time){
                $scope.addError($scope.onReservationStartAfterEnd);
                return false;
            } if(!reservationData.resource_id){
                $scope.addError($scope.onReservationNoResource);
                return false;
            }
            return true;
        }

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
                $scope.reservationMap[res_id] = {start_time: startTime, end_time: endTime};
            });
        };

        $scope.onReservationSelect = function(item) {
            var id = item.id;
            $scope.newStartReservationTime = $scope.reservationMap[id].start_time;
            $scope.newEndReservationTime = $scope.reservationMap[id].end_time;
        };

        $scope.updateReservation = function() {
            var reservationData = {start_time: $scope.newStartReservationTime.valueOf(), end_time: $scope.newEndReservationTime.valueOf(),
                reservation_id: $scope.reservationToModify.id, resource_id: $scope.resourceReservationToModify.id};
            $http.post('/reservation', reservationData).then(function(response) {
                $scope.addSuccess($scope.onReservationUpdateSuccess);
                initializeResourceReservations(); 
            }, function(error) {
                $scope.addError($scope.onReservationUpdateFailure);
                initializeResourceReservations(); 
            });    
        };

        $scope.deleteReservation = function() {
            var deleteReservationQuery = '/reservation?reservation_id=' + $scope.reservationToModify.id;
            $http.delete(deleteReservationQuery).then(function(response) {
                $scope.addSuccess($scope.onReservationDeleteSuccess);
                initializeResourceReservations();
            }, function(error) {
                $scope.addError($scope.onReservationDeleteError);
                initializeResourceReservations();
            });
        };

        initializeResourceReservations();

     });
