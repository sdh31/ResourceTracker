'use strict';

angular.module('resourceTracker')
    .controller('PendingReservationCtrl', function ($scope, $http, $location, resourceService) {

    	$scope.initializePage = function() {
    		$scope.allResources = [];
    		$scope.selectedResources = [];
    		$scope.resourcesToDisplay = [];
            // resource_id to array of reservations
            $scope.resourceReservationMap = {};

    		getAllResources();
    	};

    	var getAllResources = function() {
		   	$scope.allResources = [];
	   		$http.get('/resource/all').then(function(response) {
		   		$scope.allResources = response.data;
		   		populateResourcesToDisplay(response.data, $scope.resourcesToDisplay);
		   		console.log($scope.allResources);
		   		}, function(error){
		   			console.log(error);
		   		});
	   	};

	   	$scope.printResources = function() {
	   		console.log($scope.selectedResources);
	   		console.log($scope.resourceReservationMap);
	   	};

        var populateResourcesToDisplay = function(resourceData, resourceArray) {
            resourceData.forEach(function(resource) {
	            var resourceData = {id: resource.resource_id, label: resource.name};
	            resourceArray.push(resourceData);
	            $scope.resourceReservationMap[resourceData.id] = resource.reservations;
            });
        };
    	
    	$scope.initializePage();

	});