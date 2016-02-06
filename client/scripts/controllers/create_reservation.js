'use strict';

angular.module('resourceTracker')
    .controller('CreateReservationCtrl', function ($scope, $http) {

        var currentTime = new Date();
        $scope.startReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                currentTime.getDay(), currentTime.getHours(), currentTime.getMinutes());
        $scope.endReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                currentTime.getDay(), currentTime.getHours(), currentTime.getMinutes());
        $scope.allResources = [];
        $scope.resourceToCreate = {}; 

        $scope.onReservationCreateSuccess = "Reservation Created!";
        $scope.onReservationCreateFailure = "Unable to create the reservation. The selected resource has already been reserved " +
                                            "during this time.";

        var getAllResources = function() {
            $http.get('/resource/all').then(function(response) {   
                populateResourceArray(response);
            }, function(error) {
                console.log(error);
            });
        };

        getAllResources();

        $scope.createReservation = function() {
            var reservationData = {start_time: $scope.startReservationTime.valueOf(),
                                   end_time: $scope.endReservationTime.valueOf(), 
                                   resource_id: $scope.resourceToCreate.id};

            $http.put('/reservation', reservationData).then(function(response) {
                $scope.addSuccess($scope.onReservationCreateSuccess);
            }, function(error) {
                $scope.addError($scope.onReservationCreateFailure);
            });
        };


        var populateResourceArray = function(resourceResponse) {
            resourceResponse.data.forEach(function(resource) {
                var resource = {id: resource.resource_id, label: resource.name};
                $scope.allResources.push(resource);
            });

        };

     });
