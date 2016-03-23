'use strict';

angular.module('resourceTracker')
    .controller('IncompleteReservationCtrl', function ($scope, $http, $location, resourceService) {

    	$scope.initializePage = function() {
    		$scope.allResources = [];
    		$scope.selectedResourcesIDs = [];
    		$scope.selectedResources = [];
    		$scope.resourcesToDisplay = [];
            // resource_id to array of reservations
            $scope.resourceReservationMap = {};
            // resource_id to its resource
            $scope.resourceMap = {};

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

	   	$scope.printResources = function() {
	   		$scope.selectedResourcesIDs.forEach(function(resource) {
	   			var resource = $scope.resourceMap[resource.id];
	   			console.log(resource);
	   			$scope.selectedResources.push(resource);
	   		});
	   		console.log($scope.selectedResources);
	   	};

        var populateResourcesToDisplay = function(resourceData, resourceArray) {
            resourceData.forEach(function(resource) {
	            var resourceData = {id: resource.resource_id, label: resource.name};
	            resourceArray.push(resourceData);
	            $scope.resourceReservationMap[resourceData.id] = resource.reservations;
	            $scope.resourceMap[resourceData.id] = resource;
            });
        };
    	
    	$scope.initializePage();

	});