'use strict';

angular.module('resourceTracker')
    .controller('ResourceCtrl', function ($scope, $http) {
        $scope.newResource = {
            name: '',
            description: '',
            tags: []
        };

        $scope.activeTag = '';

        $scope.addTag = function() {
        	$scope.newResource.tags.push($scope.activeTag);
        	$scope.activeTag = '';
        	console.log($scope.newResource.tags);
  	     };

        $scope.createResource = function() {


  	    };
     });
