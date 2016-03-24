'use strict';

angular.module('resourceTracker')
    .controller('PendingReservationCtrl', function ($scope, $http, $location, resourceService) {

    	$scope.initializePage = function() {
    		$scope.allResources = [];
    		$scope.selectedResourcesIDs = [];
    		$scope.resourcesToDisplay = [];
            // resource_id to its resource
            $scope.resourceMap = new Map();
            $scope.reservations = [];
            $scope.reservationsToDisplay = new Map();
    		getAllResources();
    	};

    	var getAllResources = function() {
		   	$scope.allResources = [];
	   		$http.get('/resource/all').then(function(response) {
		   		$scope.allResources = response.data;
		   		populateResourcesToDisplay(response.data, $scope.resourcesToDisplay);
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
            var rIDArray = [];
            $scope.selectedResourcesIDs.forEach(function(resource){
                rIDArray.push(resource.id);
            });            
            var reqBody = {resource_ids: rIDArray};
        	$http.post('/reservation/getReservationsByResources', reqBody).then(function(response) {
                $scope.reservations = response.data.results;
                createReservationMap();
        	}, function(error){
        		console.log(error);
        	});
        };

        var createReservationMap = function(){
            $scope.reservations.forEach(function(reserv){
                if(!reserv.is_confirmed){
                    var reserv_id = reserv.reservation_id;
                    if($scope.reservationsToDisplay.has(reserv_id)){  
                        var reserv_info = $scope.reservationsToDisplay.get(reserv_id);          
                        var resourceArray = reserv_info.resources;
                        resourceArray.push($scope.resourceMap.get(reserv.resource_id));
                        reserv_info.resources = resourceArray;
                        $scope.reservationsToDisplay.set(reserv_id, reserv_info);
                    } else{
                        var resource = [$scope.resourceMap.get(reserv.resource_id)];
                        var reserv_info = {end_time: reserv.end_time,
                               description: reserv.reservation_description,
                               title: reserv.reservation_title,
                               start_time: reserv.start_time,
                               resources: resource}
                        $scope.reservationsToDisplay.set(reserv_id, reserv_info);                        
                    }
                }
            });
        console.log($scope.reservationsToDisplay);
        };

    	$scope.initializePage();

	});