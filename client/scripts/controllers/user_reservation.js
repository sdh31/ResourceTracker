'use strict';

angular.module('resourceTracker')
    .controller('UserReservationCtrl', function ($scope, $http, $filter, modifyReservationsService, $q) {

        $scope.clearError();
        $scope.clearSuccess();
        $scope.onReservationInvalidStartDate = "Please select a valid start date.";
        $scope.onReservationInvalidEndDate = "Please select a valid end date.";
        $scope.oldReservationTitle = "";
        $('[data-toggle="tooltip2"]').tooltip({title: "You cannot extend the time of your reservation. This button allows you to create a new reservation on the same resources as your original reservation. You have to give the reservation a new title. Keep in mind that you'll still need approval on any restricted resources.", placement: "right"});
        $('[data-toggle="tooltip"]').tooltip({title: "Select resources you wish to remove from this reservation.", placement: "right"});

        // this function initializes all global data on this page. 
        var initializeResourceReservations = function() {
            var currentTime = new Date();
            $scope.startReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());
            $scope.endReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());
            // reservation_id to reservation
            $scope.reservationMap = new Map();
            $scope.reservationsToDisplay = [];
            $scope.reservationIDToModify = {};
            $scope.allReservations = [];
            // final reservation that needs modification
            $scope.reservationToModify = {};
            $scope.reservationToModifyInfo = {title: "", description: ""};
            $scope.showResourceModal = {value: false};
            $scope.reservationSelected = false;
            $scope.updateValid = {value: false};
            $scope.selectedReservationResources = [];
            $scope.resourcesToDisplay = [];
            $scope.resourcesToRemove = {values: []};
            $scope.tree = [];
            $scope.myTree = {};
            getAllReservations();
        };

        var getAllReservations = function() {
            return $http.get('/reservation').then(function(response) {
                $scope.allReservations = response.data.results;
                populateReservationsToDisplay($scope.allReservations, $scope.reservationsToDisplay);
            }, function(error) {
                console.log(error);
            });
        };

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
            $scope.oldReservationTitle = $scope.reservationToModify.reservation_title;
            $scope.reservationSelected = true;
            var startTime = new Date($scope.reservationToModify.start_time);
            var endTime = new Date($scope.reservationToModify.end_time);
            $scope.startReservationTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), startTime.getHours(), startTime.getMinutes());
            $scope.endReservationTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(), endTime.getHours(), endTime.getMinutes());   
            $scope.selectedReservationResources = $scope.reservationToModify.resources;
            $scope.reservationToModifyInfo.title = $scope.reservationToModify.reservation_title;
            $scope.reservationToModifyInfo.description = $scope.reservationToModify.reservation_description;
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
            var promise = $http.post('reservation/remove_resources', reqBody).then(function(response){
                console.log(response);
            }, function(error){
                console.log(error);
            })
            return promise;
        };

        var populateResourceIds = function(resources) {
            var resourceIDs = [];
            resources.forEach(function(resource){
                resourceIDs.push(resource.id);
            });
            return resourceIDs;
        };

        $scope.createNewReservation = function() {

            if (!validateReservationInfo()) {
                return;
            }

            var reservationData = {
                resource_ids: populateResourceIds($scope.resourcesToDisplay),
                reservation_title: $scope.reservationToModify.reservation_title,
                reservation_description: $scope.reservationToModify.reservation_description,
                start_time: $scope.startReservationTime.valueOf(),
                end_time: $scope.endReservationTime.valueOf()
            };

            $http.put('/reservation', reservationData).then(function(response) {
                console.log(response);
                $scope.addSuccess("Successfully created new reservation!");
                initializeResourceReservations();
            }, function(error) {
                console.log(error);
                $scope.addError("Unable to create new reservation, probably a conflict!");
                initializeResourceReservations();
            });
        };

        var validateReservationInfo = function() {
            if (!$scope.startReservationTime.valueOf()) {
                $scope.addError($scope.onReservationInvalidStartDate);
                return false;
            }

            if (!$scope.endReservationTime.valueOf()) {
                $scope.addError($scope.onReservationInvalidEndDate);
                return false;
            }

            if ($scope.startReservationTime.valueOf() >= $scope.endReservationTime.valueOf()) {
                return false;
            }

            if ($scope.reservationToModify.reservation_title == '') {
                return false;
            }

            if ($scope.startReservationTime.valueOf() <= new Date().valueOf()) {
                return false;
            }

            return true;
        };

        $scope.updateReservation = function() {

            if (!validateReservationInfo()) {
                return;
            }
            if($scope.reservationToModify.resources.length == $scope.resourcesToRemove.values.length){
                $scope.deleteReservation();
            } else {
                var result = confirm("Are you sure you want to update reservation " + $scope.reservationToModify.reservation_title);
                if(!result) { return;}
                removeResources().then(function(){
                    modifyReservationsService.updateReservation($scope.reservationToModifyInfo.title,
                    $scope.reservationToModifyInfo.description,
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

        $scope.showResources = function() {
            $scope.showResourceModal.value = true;            
        }

        initializeResourceReservations();
     });
