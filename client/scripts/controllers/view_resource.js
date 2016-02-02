'use strict';

angular.module('resourceTracker')
    .controller('ViewResourceCtrl', function ($scope, $http, $location, resourceService) {
        
		$scope.allResources = [];
		$scope.selectedResource = {};
		$scope.editingResource = {};
		$scope.currentTag = '';
		var addedTags = [];
		var deletedTags = [];
		var oldTags = [];
		var oldName = "";
		var oldDescription = "";

		$scope.isResourceSelected = function() {
			return $scope.selectedResource.name && $scope.selectedResource.name.length > 0;
		};

		$scope.saveOldResourceState = function () {
			if (!$scope.isResourceSelected()) {
				return;
			}

			oldName = $scope.selectedResource.name;
			oldDescription = $scope.selectedResource.description;
			oldTags = [];
			$scope.editingResource.tags = []; 

			var length = ($scope.selectedResource.tags == null) ? 0 : $scope.selectedResource.tags.length;
			for (var i = 0; i<length; i++) {
				oldTags.push($scope.selectedResource.tags[i]);
				$scope.editingResource.tags.push($scope.selectedResource.tags[i]);
			}

			$scope.editingResource.resource_id = $scope.selectedResource.resource_id;
			$scope.editingResource.max_users = $scope.selectedResource.max_users;
			$scope.editingResource.name = oldName;
			$scope.editingResource.description = oldDescription;
		};

		$scope.revertEditing = function() {
			$scope.editingResource.name = oldName;
			$scope.editingResource.description = oldDescription;
			$scope.editingResource.tags = oldTags;
		};

		$scope.addTag = function() {
			if ($scope.currentTag == '') {
				$scope.addError(resourceService.alertMessages.emptyTag);
				return;
			}

			if ($.inArray($scope.currentTag, $scope.editingResource.tags) != -1) {
				$scope.addError(resourceService.alertMessages.duplicateTag);
				return;
			}

			if ($.inArray($scope.currentTag, deletedTags) != -1) {
				deletedTags.splice($.inArray($scope.currentTag, deletedTags), 1);
			} else {
				addedTags.push($scope.currentTag);
			}

        	$scope.editingResource.tags.push($scope.currentTag);
        	$scope.currentTag = '';
		};

		$scope.removeTag = function(tag_index) {
			if ($.inArray($scope.editingResource.tags[tag_index], oldTags) != -1) {
				deletedTags.push($scope.editingResource.tags[tag_index]);
			} else {
				addedTags.splice($.inArray($scope.editingResource.tags[tag_index], addedTags), 1);
			}
			$scope.editingResource.tags.splice(tag_index, 1);			
		};

		$scope.updateResource = function() {
			var toSend = {
				resource: $scope.editingResource,
				addedTags: addedTags,
				deletedTags: deletedTags
			};
			$http.post('/resource', toSend).then(function(response) {
				console.log('here');
				alert('resource successfully updated');
				getAllResources();
            }, function(error) {
				$scope.addError(resourceService.alertMessages.resourceUpdatingFailed);
            });
		};

		var getAllResources = function() {
			oldName = '';
			oldDescription = '';
			oldTags = [];
			addedTags = [];
			deletedTags = [];
			$scope.editingResource = {};
			$scope.selectedResource = {};
			$http.get('/resource/all').then(function(response) {	
				$scope.allResources = response.data;
				console.log($scope.allResources);
            }, function(error) {
				console.log(error);
            });
		};

		getAllResources();

     });

