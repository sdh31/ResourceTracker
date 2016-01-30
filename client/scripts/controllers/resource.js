'use strict';

angular.module('resourceTracker')
    .controller('ResourceCtrl', function ($scope, $http) {
        $scope.newResource = {
            name: '',
            description: '',
            tags: []
        };

        $scope.currentTag = '';

        $scope.addTag = function() {
        	$scope.newResource.tags.push(currentTag);
        	$scope.currentTag = '';
        	console.log($scope.tags);
  	     };

        $scope.createResource = function() {


  	     };
     });
