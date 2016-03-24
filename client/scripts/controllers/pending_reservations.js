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
            // reservation_id to that reservations resources
            $scope.reservationToResourceMap = new Map();
            // reservation_id to the rest of the reservation information
            $scope.reservationMap = new Map();
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
                console.log($scope.reservations);
                createReservationMaps();
        	}, function(error){
        		console.log(error);
        	});
        };

        var createReservationMaps = function(){
            $scope.reservationToResourceMap.clear();
            $scope.reservationMap.clear();
            $scope.reservations.forEach(function(res){
                if(!res.is_confirmed){
                    var res_id = res.reservation_id;
                    if($scope.reservationToResourceMap.has(res_id)){            
                        var resourceArray = $scope.reservationToResourceMap.get(res_id);
                        resourceArray.push(res.resource_id);
                        $scope.reservationToResourceMap.set(res_id, resourceArray);
                    } else{
                        $scope.reservationToResourceMap.set(res_id, [res.resource_id]);                        
                    }
                    if(!$scope.reservationMap.has(res_id)){
                    var res = {end_time: res.end_time,
                               description: res.reservation_description,
                               title: res.reservation_title,
                               start_time: res.start_time};
                    $scope.reservationMap.set(res_id, res);
                    }
                }
            });
            console.log($scope.reservationToResourceMap);      
            console.log($scope.reservationMap);                    
            console.log($scope.resourceMap);
        };

    	$scope.initializePage();

	});