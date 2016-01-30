'use strict';

angular.module('resourceTracker')
    .controller('ResourceCtrl', function ($scope, $http) {
        $scope.newResource = {
            name: '',
            description: '',
            tags: []
        };

        $scope.activeTag = '';
        $scope.activeResourceCreatePanel = false;
        $scope.activeResourceUpdatePanel = false;
        $scope.activeResourceViewPanel = true;

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

        $scope.enableResourceCreatePanel = function() {
            $scope.disableAllResourcePanels();
            $scope.activeResourceCreatePanel = true;
        };

        $scope.enableResourceUpdatePanel = function() {
            $scope.disableAllResourcePanels();
            $scope.activeResourceUpdatePanel = true;
        };

        $scope.enableResourceViewPanel = function() {
            $scope.disableAllResourcePanels();
            $scope.activeResourceViewPanel = true;
        };

        $scope.disableAllResourcePanels = function() {
            $scope.activeResourceCreatePanel = false;
            $scope.activeResourceUpdatePanel = false;
            $scope.activeResourceViewPanel = false;
        };

     });

