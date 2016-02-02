'use strict';

angular.module('resourceTracker')
    .controller('ViewResourceCtrl', function ($scope, $http, $location) {
        
		var alertMessages = {
			emptyTag: "Tag name cannot be empty!",
			duplicateTag: "Cannot have duplicate tags!",
			emptyResourceName: "You must give the resource a name!",
			resourceCreationFailed: "Resource could not be created at this time, try again!",
			resourceUpdatingFailed: "Resource could not be updated at this time, try again!"
		};
        $scope.activeResourceCreatePanel = false;
        $scope.activeResourceViewPanel = true;
		$scope.alertMessage = '';
		$scope.allResources = [];
		var editingResourceIndex = -1;
		var editing = false;
		var oldName = '';
		var oldDescription = '';
		var oldTags = [];
		var addedTags = [];
		var deletedTags = [];

		var resourceExists = function(thisResource) {
			for (var i = 0; i<$scope.allResources.length; i++) {
				if (thisResource.resource_id == $scope.allResources[i].resource_id) {
					return i;
				}
			}
			return -1;
		}

		var getAllResources = function() {
			$scope.allResources = [];
			editing = false;
			editingResourceIndex = -1;
			editing = false;
			oldName = '';
			oldDescription = '';
			oldTags = [];
			addedTags = [];
			deletedTags = [];
			$http.get('/resource/all').then(function(response) {	
				for (var i = 0; i<response.data.length; i++) {
					var thisResource = response.data[i];
					var index = resourceExists(thisResource);
					if (index != -1) {
						$scope.allResources[index].tags.push(thisResource.tag_name);
					} else {
						var resource = {
							name: thisResource.name,
							description: thisResource.description,
							max_users: thisResource.max_users,
							tags: [thisResource.tag_name],
							resource_id: thisResource.resource_id,
							disabled: true,
							editingEnabled: false,
							editingError: false
						};
						$scope.allResources.push(resource);
					}
				}
				console.log($scope.allResources);
				
            }, function(error) {
				console.log(error);
            });
		}

		getAllResources();

		$scope.addNewTag = function() {
		
			if ($scope.allResources[editingResourceIndex].currentTag == '') {
				$scope.allResources[editingResourceIndex].editingError = true;
				$scope.alertMessage = alertMessages.emptyTag;
				return;
			}

			if ($.inArray($scope.allResources[editingResourceIndex].currentTag, $scope.allResources[editingResourceIndex].tags) != -1) {
				$scope.allResources[editingResourceIndex].editingError = true;
				$scope.alertMessage = alertMessages.duplicateTag;
				return;
			}

			if ($.inArray($scope.allResources[editingResourceIndex].currentTag, deletedTags) != -1) {
				deletedTags.splice($.inArray($scope.allResources[editingResourceIndex].currentTag, deletedTags), 1);
			} else {
				addedTags.push($scope.allResources[editingResourceIndex].currentTag);
			}

			$scope.allResources[editingResourceIndex].editingError = false;
        	$scope.allResources[editingResourceIndex].tags.push($scope.allResources[editingResourceIndex].currentTag);
        	$scope.allResources[editingResourceIndex].currentTag = '';
		};

		$scope.turnOffEditingError = function() {
			$scope.allResources[editingResourceIndex].editingError = false;
		};

		$scope.removeTagWhileEditing = function(tag_index) {
			
			if ($.inArray($scope.allResources[editingResourceIndex].tags[tag_index], oldTags) != -1) {
				deletedTags.push($scope.allResources[editingResourceIndex].tags[tag_index]);
			} else {
				addedTags.splice($.inArray($scope.allResources[editingResourceIndex].tags[tag_index], addedTags), 1);
			}

			$scope.allResources[editingResourceIndex].tags.splice(tag_index, 1);			
		};

		$scope.updateResource = function() {
			
			$http.post('/resource', $scope.allResources[editingResourceIndex]).then(function(response) {
				addTags();
            }, function(error) {
				$scope.allResources[editingResourceIndex].editingError = true;
				$scope.alertMessage = alertMessages.resourceUpdatingFailed;
            });
		};

		var addTags = function() {
			if (addedTags.length > 0) {
				var body = {
					resource_id: $scope.allResources[editingResourceIndex].resource_id,
					addedTags: addedTags
				};
				$http.put('/tag', body).then(function(response) {
					deleteTags();
		        }, function(error) {
					$scope.allResources[editingResourceIndex].editingError = true;
					$scope.alertMessage = alertMessages.resourceUpdatingFailed;
		        });
			} else {
				deleteTags();
			}
		}

		var deleteTags = function() {
			if (deletedTags.length > 0) {
				var body = {
					resource_id: $scope.allResources[editingResourceIndex].resource_id,
					deletedTags: deletedTags
				};
				$http.post('/tag', body).then(function(response) {
					showSuccessEditingMessageAndReload();
		        }, function(error) {
					$scope.allResources[editingResourceIndex].editingError = true;
					$scope.alertMessage = alertMessages.resourceUpdatingFailed;
		        });
			} else {
				showSuccessEditingMessageAndReload();
			}		

		};

		var showSuccessEditingMessageAndReload = function() {
			alert("successfully updated resource!");
			getAllResources();
		};

		$scope.editResource = function(resource) {
			// only edit one resource at a time
			if (editing) {
				return;
			}
	
			oldName = resource.name;
			oldDescription = resource.description;
			oldTags = [];

			for (var i = 0; i<resource.tags.length; i++) {
				oldTags.push(resource.tags[i]);
			}
			
			addedTags = [];
			deletedTags = [];
			editingResourceIndex = resourceExists(resource);
			$scope.allResources[editingResourceIndex].disabled = false;
			$scope.allResources[editingResourceIndex].editingEnabled = true;
			editing = true;

		};

		$scope.stopEditing = function() {
			$scope.allResources[editingResourceIndex].name = oldName;
			$scope.allResources[editingResourceIndex].description = oldDescription;
			$scope.allResources[editingResourceIndex].tags = oldTags;
			$scope.allResources[editingResourceIndex].disabled = true;
			$scope.allResources[editingResourceIndex].editingEnabled = false;
			editing = false;
		};

        $scope.enableResourceCreatePanel = function() {
            $scope.disableAllResourcePanels();
            $scope.activeResourceCreatePanel = true;
			$location.url('/resource');
        };

        $scope.enableResourceViewPanel = function() {
            $scope.disableAllResourcePanels();
            $scope.activeResourceViewPanel = true;
        };

        $scope.disableAllResourcePanels = function() {
            $scope.activeResourceCreatePanel = false;
            $scope.activeResourceViewPanel = false;
        };

     });

