'use strict';

angular.module('resourceTracker')
    .controller('ResourceCtrl', function ($scope, $http) {
        $scope.newResource = {
            name: '',
            description: '',
            tags: []
        };

        $scope.activeTag = '';
        $scope.isResourceCreatePanel = false;

        $scope.addTag = function() {
        	$scope.newResource.tags.push($scope.activeTag);
        	$scope.activeTag = '';
        	console.log($scope.newResource.tags);
  	    };

        $scope.removeTag = function(tag_index ) {
           $scope.newResource.tags.splice(tag_index, 1);
        };

        $scope.createResource = function() {

  	    };

     });

