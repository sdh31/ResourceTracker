'use strict';

angular.module('resourceTracker')
    .controller('ViewResourceCtrl', function ($scope, $http, $location, resourceService) {
        
        $scope.clearError();
        $scope.clearSuccess();

		$scope.allResources = [];
		$scope.selectedResource = {};
		$scope.editingResource = {};
		$scope.currentTag = '';
		var addedTags = [];
		var deletedTags = [];
		var oldTags = [];
		var oldName = "";
		var oldDescription = "";
        var oldResourceState = "";

		$scope.isResourceSelected = function() {
			return $scope.selectedResource.name && $scope.selectedResource.name.length > 0;
		};

		$scope.saveOldResourceState = function () {
			if (!$scope.isResourceSelected()) {
				return;
			}

			$scope.currentTag = '';
			oldName = $scope.selectedResource.name;
			oldDescription = $scope.selectedResource.description;
            oldResourceState = $scope.selectedResource.resource_state;
			oldTags = [];
			$scope.editingResource.tags = []; 

			var length = ($scope.selectedResource.tags == null) ? 0 : $scope.selectedResource.tags.length;
			for (var i = 0; i<length; i++) {
				oldTags.push($scope.selectedResource.tags[i]);
				$scope.editingResource.tags.push($scope.selectedResource.tags[i]);
			}

			$scope.editingResource.resource_id = $scope.selectedResource.resource_id;
			$scope.editingResource.resource_state = oldResourceState;
			$scope.editingResource.name = oldName;
			$scope.editingResource.description = oldDescription;
		};

		$scope.revertEditing = function() {
            $scope.editingResource.resource_state = oldResourceState;
			$scope.editingResource.name = oldName;
			$scope.editingResource.description = oldDescription;
			$scope.editingResource.tags = oldTags;
            addedTags = [];
            deletedTags = [];
			$scope.saveOldResourceState();
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
	
		$scope.deleteResource = function() {
			if (!validateDeleteResource()) {
				return;
			}
			var deleteQueryString = '/resource?resource_id=' + $scope.editingResource.resource_id;
			$http.delete(deleteQueryString).then(function(response) {
				showMessageAndReload("Successfully deleted resource!");
            }, function(error) {
				$scope.addError(resourceService.alertMessages.resourceUpdatingFailed);
            });
		};

		var validateDeleteResource = function() {
			var nowDate = new Date();
			var conflictingReservation = false;
			$scope.selectedResource.reservations.forEach(function(reservation) {
				var endDate = new Date(reservation.end_time);
				if (endDate >= nowDate) {
					conflictingReservation = true;
				}
			});
			var conflictingReservationMessage = "There is a current or future reservation for this resource. " +
				"Do you want to delete the resource?";
		    return !conflictingReservation ||
		    	(conflictingReservation && confirm(conflictingReservationMessage));
		};

		$scope.updateResource = function() {
			$http.post('/resource', $scope.editingResource).then(function(response) {
				addTagsToResource();
            }, function(error) {
                if (error.data.err == "This resource is oversubscribed. Please resolve all conflicts before removing restriction.") {
                    $scope.addError(error.data.err);
                } else {
                    $scope.addError(resourceService.alertMessages.resourceUpdatingFailed);
                }
            });
		};

		var addTagsToResource = function() {
			if (addedTags.length > 0) {
				var body = {
					resource_id: $scope.editingResource.resource_id,
					addedTags: addedTags
				};
				$http.put('/tag', body).then(function(response) {
					deleteTagsFromResource();
		        }, function(error) {
					$scope.addError(resourceService.alertMessages.resourceUpdatingFailed);
		        });
			} else {
				deleteTagsFromResource();
			}
		}

		var deleteTagsFromResource = function() {
			if (deletedTags.length > 0) {
				var body = {
					resource_id: $scope.editingResource.resource_id,
					deletedTags: deletedTags
				};
				$http.post('/tag', body).then(function(response) {
					showSuccessEditingMessageAndReload();
		        }, function(error) {
					$scope.addError(resourceService.alertMessages.resourceUpdatingFailed);
		        });
			} else {
				showSuccessEditingMessageAndReload();
			}		

		};

		var showSuccessEditingMessageAndReload = function() {
			showMessageAndReload("Successfully updated resource!");
		};

		var showMessageAndReload = function(message) {
			alert(message);
			getAllResources();
		};

		var getAllResources = function() {
			oldName = '';
			oldDescription = '';
			oldTags = [];
			addedTags = [];
			deletedTags = [];
			$scope.editingResource = {};
			$scope.selectedResource = {};
			$scope.clearError();
			$http.get('/resource/all').then(function(response) {
				$scope.allResources = response.data;
				console.log($scope.allResources);
            }, function(error) {
				console.log(error);
            });		
		};

		getAllResources();

     });

