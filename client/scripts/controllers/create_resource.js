'use strict';

angular.module('resourceTracker')
    .controller('CreateResourceCtrl', function ($scope, $http, $location, resourceService) {

		var initializeNewResource = function() {
			$scope.newResource = {
				name: '',
				description: '',
                resource_state: '',
				tags: [],
				sharing_level: '',
				parent_id: 1,
				is_folder: 0
			};
			$scope.clearError();
	        $scope.clearSuccess();
	        $scope.unlimitedResource = false;
	        $scope.showAddParentModal = {value: false};
	        $scope.allResources = [];
	        $scope.resourceMap = new Map();
	        getAllResources();
		};

		var getAllResources = function() {
	   		return $http.get('/resource/all').then(function(response) {
		   		populateResourcesToDisplay(response.data, $scope.allResources);
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
			if($scope.newResource.is_folder){
				$scope.newResource.resource_state = "restricted";
				$scope.newResource.sharing_level = 0;
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
