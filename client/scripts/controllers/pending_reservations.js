'use strict';

angular.module('resourceTracker')
    .controller('PendingReservationCtrl', function ($scope, $http, $filter) {

    	$scope.initializePage = function() {
    		$scope.selectedResourcesIDs = [];
    		$scope.allResources = [];
            // resource_id to its resource
            $scope.resourceMap = new Map();
            $scope.resourcesToDisplayMap = new Map();            
            $scope.resourcesToDisplay = [];
            $scope.showReservations = false;
    		getAllResources();
    	};

    	var getAllResources = function() {
	   		$http.get('/resource/all').then(function(response) {
		   		populateResourcesToDisplay(response.data, $scope.allResources);
		   		}, function(error){
		   			console.log(error);
		   		});
	   	};

        var populateResourcesToDisplay = function(resourceData, resourceArray) {
            resourceData.forEach(function(resource) {
	            var resourceData = {id: resource.resource_id, label: resource.name};
	            resourceArray.push(resourceData);
	            $scope.resourceMap.set(resourceData.id, resource);
            });
        };

        $scope.getReservationsForSelectedResources = function(){
            $scope.showReservations = false;
            var rIDArray = [];
            $scope.selectedResourcesIDs.forEach(function(resource){
                rIDArray.push(resource.id);
            });            
            var reqBody = {resource_ids: rIDArray};
        	$http.post('/reservation/getReservationsByResources', reqBody).then(function(response) {
                var reservations = response.data.results;
                createResourceToReservationMap(reservations);
        	}, function(error){
        		console.log(error);
        	});
        };

        var createResourceToReservationMap = function(reservs){
            $scope.resourcesToDisplayMap.clear();
            reservs.forEach(function(reserv){
                if(!reserv.is_confirmed){
                    var resource_id = reserv.resource_id;
                    var resource = $scope.resourceMap.get(resource_id);
                    reserv = processReservationTimes(reserv);
                    if($scope.resourcesToDisplayMap.has(resource_id)){  
                        var resource_info = $scope.resourcesToDisplayMap.get(resource_id);
                        var reservationList = resource_info.reservations;
                        reservationList.push(reserv);
                        resource_info.reservations = reservationList;
                        $scope.resourcesToDisplayMap.set(resource_id, resource_info);
                    } else{
                        var resource_info = {expanded: false, name: resource.name, description: resource.description,
                                            resource_id: resource.resource_id, permission: resource.resource_permission,
                                            state: resource.resource_state, tags: resource.tags, reservations: [reserv]};
                        $scope.resourcesToDisplayMap.set(resource_id, resource_info);
                    }
                }
            });
            $scope.resourcesToDisplay = mapIteratorToArray();
            $scope.showReservations = true;          
        };

        var mapIteratorToArray = function(){
            var rList = [];
            for(let [key, value] of $scope.resourcesToDisplayMap){
                rList.push(value);
            }
            return rList;
        }

        var processReservationTimes = function(reserv){
            var start_time = $filter('date')(reserv.start_time, "short");
            var end_time = $filter('date')(reserv.end_time, "short");
            reserv.start_time=start_time;
            reserv.end_time=end_time;
            return reserv;
        }

        $scope.approveReservation = function(reserv){
            console.log(reserv);
            console.log($scope.resourcesToDisplay);
            var result = confirm("Are you sure you want to approve resource " + $scope.resourceMap.get(reserv.resource_id).name + " and delete reservation " + reserv.reservation_title + "?");
            var reqBody = {resource_id: reserv.resource_id, reservation_id: reserv.reservation_id};
            if(result){
                $http.post('/reservation/confirm_request', reqBody).then(function(response) {
                    clearReservationAfterApproval(reserv);
                }, function(error){
                    console.log(error);
                });
            }
        };

        $scope.denyReservation = function(reserv){
            var reqBody = {resource_id: reserv.resource_id, reservation_id: reserv.reservation_id};
            var result = confirm("Are you sure you want to deny resource " + $scope.resourceMap.get(reserv.resource_id).name + " and delete reservation " + reserv.reservation_title + "?");
            if(result){       
                $http.post('/reservation/deny_request', reqBody).then(function(response) {
                    clearReservationAfterDeny(reserv);
                }, function(error){
                    console.log(error);
                });     
            };  
        };

        var clearReservationAfterApproval = function(reserv){
            var findResource = function(resource){
                return reserv.resource_id == resource.resource_id;
            };
            var resourceToUpdate = $scope.resourcesToDisplay.find(findResource);
            var findReservation = function(reservation){
                return reserv.reservation_id == reservation.reservation_id;
            };
            var reservations = resourceToUpdate.reservations;
            var reservationToRemove = reservations.find(findReservation);
            var index = reservations.indexOf(reservationToRemove)
            $scope.resourcesToDisplay.find(findResource).reservations.splice(index, 1);
            if(reservations.length == 0){
                removeResourceFromDisplay(resourceToUpdate);
            }
        };

        var clearReservationAfterDeny = function(reserv){
            var resourcesToRemove = [];
            $scope.resourcesToDisplay.forEach(function(resource){
                var reservations = resource.reservations;
                var findReservation = function(reservation){
                    return reserv.reservation_id == reservation.reservation_id;
                };
                var reservationToRemove = reservations.find(findReservation);
                var index = reservations.indexOf(reservationToRemove);
                if(index != -1){
                    resource.reservations.splice(index, 1);
                    if(reservations.length == 0){
                        resourcesToRemove.push(resource);
                    }
                }
            });
            resourcesToRemove.forEach(function(resource){
                removeResourceFromDisplay(resource);
            });
        };

        var removeResourceFromDisplay = function(resource){
            var index = $scope.resourcesToDisplay.indexOf(resource);
            $scope.resourcesToDisplay.splice(index, 1);
        };




        $scope.initializePage();

	});