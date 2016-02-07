'use strict';

angular.module('resourceTracker')
    .controller('CreateResourceCtrl', function ($scope, $http, $location, resourceService) {

    	$scope.clearError();
        $scope.clearSuccess();

		var initializeNewResource = function() {
			$scope.newResource = {
				name: '',
				description: '',
				tags: []
			};
		};

		initializeNewResource();
		$scope.activeTag = '';
		$scope.onCreateResourceSuccessMessage = "Created Resource!";

		$scope.addCreateTag = function() {
			var initialTagLength = $scope.newResource.tags.length;
			resourceService.addTagToResource($scope.newResource, $scope.activeTag, function(alertMessage) {
				$scope.addError(alertMessage);
			});

			// if length of tag array increases by 1, then successful add
			if ($scope.newResource.tags.length == initialTagLength + 1) {
				$scope.clearError();
				$scope.activeTag = '';
			}
		};

		$scope.removeCreateTag = function(tag_index) {
			resourceService.removeTagFromResource($scope.newResource, tag_index);
		};

		$scope.createResource = function() {
			var self = this;
			resourceService.createResource($scope.newResource).then(function(response) {
				$scope.addSuccess($scope.onCreateResourceSuccessMessage);
				initializeNewResource();
			}, function(alertMessage) {
				$scope.addError(alertMessage);
			})
		};

    });