'use strict';

angular.module('resourceTracker')
    .controller('CreateResourceCtrl', function ($scope, $http, $location, resourceService) {

		var initializeNewResource = function() {
			$scope.newResource = {
				name: '',
				description: '',
				tags: []
			};
		};

		initializeNewResource();
		$scope.activeTag = '';

		$scope.addCreateTag = function() {
			resourceService.addTagToResource($scope.newResource, $scope.activeTag, function(alertMessage) {
				$scope.addError(alertMessage);
			});

			// if no alert message, adding the tag was a success. 
			if ($scope.alertMessage.length == 0) {
				$scope.activeTag = '';
			}
		};

		$scope.removeCreateTag = function(tag_index) {
			addTagToResource.removeTagFromResource($scope.newResource, tag_index);
		};

		$scope.createResource = function() {
			resourceService.createResource.then(function(response) {
				$scope.success.value = true;
			}, function(alertMessage) {
				$scope.addError(alertMessage);
			})
		};

    });