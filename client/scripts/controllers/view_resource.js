'use strict';

angular.module('resourceTracker')
    .controller('ViewResourceCtrl', function ($scope, $http, $location, resourceService) {
        
		$scope.allResources = [];
		$scope.selectedResource = {};

		var getAllResources = function() {
			$http.get('/resource/all').then(function(response) {	
				$scope.allResources = response.data;
				console.log($scope.allResources);
            }, function(error) {
				console.log(error);
            });
		}

		getAllResources();

     });

