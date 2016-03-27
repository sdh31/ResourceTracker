'use strict';

angular.module('resourceTracker')
    .controller('PendingReservationCtrl', function ($scope, $http, $location, resourceService, $filter) {

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
                        var resource_info = {name: resource.name, description: resource.description,
                                            resource_id: resource.resource_id, permission: resource.resource_permission,
                                            state: resource.resource_state, tags: resource.tags, reservations: [reserv]};
                        $scope.resourcesToDisplayMap.set(resource_id, resource_info);
                    }
                }
            });
            $scope.resourcesToDisplay = [];
            $scope.resourcesToDisplay = mapIteratorToArray();
            console.log($scope.resourcesToDisplay)
            $scope.showReservations = true;          
        };

        var mapIteratorToArray = function(){
            var rList = [];
            for(let [key, value] of $scope.resourcesToDisplayMap){
                rList.push(value);
            }
            return rList;
        }

    	$scope.initializePage();

        var processReservationTimes = function(reserv){
            var start_time = $filter('date')(reserv.start_time, "short");
            var end_time = $filter('date')(reserv.end_time, "short");
            reserv.start_time=start_time;
            reserv.end_time=end_time;
            return reserv;
        }

        $scope.approveReservation = function(reserv){
            console.log("approve");
            console.log(reserv);
        }

        $scope.denyReservation = function(reserv){
            console.log("deny");
            console.log(reserv);
        }

	});