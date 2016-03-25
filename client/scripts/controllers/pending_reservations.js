'use strict';

angular.module('resourceTracker')
    .controller('PendingReservationCtrl', function ($scope, $http, $location, resourceService, $filter) {

    	$scope.initializePage = function() {
    		$scope.selectedResourcesIDs = [];
    		$scope.resourcesToDisplay = [];
            // resource_id to its resource
            $scope.resourceMap = new Map();
            $scope.reservations = [];
            $scope.reservationsToDisplay = [];
            $scope.showReservations = false;
    		getAllResources();
            console.log($scope.showReservations);
    	};

    	var getAllResources = function() {
	   		$http.get('/resource/all').then(function(response) {
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
            var reservationsToDisplayMap = new Map();
            $scope.selectedResourcesIDs.forEach(function(resource){
                rIDArray.push(resource.id);
            });            
            var reqBody = {resource_ids: rIDArray};
        	$http.post('/reservation/getReservationsByResources', reqBody).then(function(response) {
                $scope.reservations = response.data.results;
                createReservationMap(reservationsToDisplayMap);
        	}, function(error){
        		console.log(error);
        	});
        };

        var createReservationMap = function(reservationsToDisplayMap){
            $scope.reservations.forEach(function(reserv){
                if(!reserv.is_confirmed){
                    var reserv_id = reserv.reservation_id;
                    if(reservationsToDisplayMap.has(reserv_id)){  
                        var reserv_info = reservationsToDisplayMap.get(reserv_id);          
                        var resourceArray = reserv_info.resources;
                        resourceArray.push($scope.resourceMap.get(reserv.resource_id));
                        reserv_info.resources = resourceArray;
                        reservationsToDisplayMap.set(reserv_id, reserv_info);
                    } else{
                        var startTime = new Date(reserv.start_time);
                        var endTime = new Date(reserv.end_time);
                        var startTimeLabel = $filter('date')(startTime, "short");
                        var endTimeLabel = $filter('date')(endTime, "short");
                        var resource = [$scope.resourceMap.get(reserv.resource_id)];
                        var reserv_info = {end_time: endTimeLabel,
                               reservation_id: reserv_id,
                               description: reserv.reservation_description,
                               title: reserv.reservation_title,
                               start_time: startTimeLabel,
                               resources: resource}
                        reservationsToDisplayMap.set(reserv_id, reserv_info);      
                    }
                }
            });
            $scope.reservationsToDisplay = mapIteratorToArray(reservationsToDisplayMap);               
            $scope.showReservations = true;          
            console.log($scope.reservationsToDisplay);
        };

        var mapIteratorToArray = function(rMap){
            console.log(rMap);
            var rList = [];
            for(let [key, value] of rMap){
                rList.push(value);
            }
            return rList;
        }

    	$scope.initializePage();

	});