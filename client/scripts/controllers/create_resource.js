'use strict';

angular.module('resourceTracker')
    .controller('CreateResourceCtrl', function ($scope, $http, $location, resourceService) {

    	$scope.clearError();
        $scope.clearSuccess();
        $scope.unlimitedResource = false;
        $scope.showAddParentModal = {value: false};

		var initializeNewResource = function() {
			$scope.newResource = {
				name: '',
				description: '',
                resource_state: '',
				tags: [],
				sharing_level: '',
				parent_id: 0,
				is_folder: 0
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
			if($scope.unlimitedResource){
				$scope.newResource.sharing_level = Number.MAX_SAFE_INTEGER;
			}
			console.log($scope.newResource);
			var self = this;
			resourceService.createResource($scope.newResource).then(function(response) {
                if ($scope.newResource.tags.length > 0) {
                    $scope.addTags(response.data.insertId);
                } else {
                    $scope.addSuccess($scope.onCreateResourceSuccessMessage);
				    initializeNewResource();
                }
			}, function(alertMessage) {
				$scope.addError(alertMessage);
			})
		};

		$scope.addParent = function() {
			$scope.showAddParentModal.value = true;
		}

        $scope.addTags = function(resource_id) {
			var self = this;
			resourceService.addTags(resource_id, $scope.newResource.tags).then(function(response) {
				$scope.addSuccess($scope.onCreateResourceSuccessMessage);
				initializeNewResource();
			}, function(alertMessage) {
				$scope.addError(alertMessage);
			})
		};

    });
