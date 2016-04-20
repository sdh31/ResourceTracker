'use strict';

angular.module('resourceTracker')
    .controller('ModifyResourcesCtrl', function ($scope, $http, $location, resourceService) {
        
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
        var oldSharingLevel = 0;
        var oldParentId = 0;
        $scope.unlimitedResource = false;
        $scope.resourceMap = new Map();
        $scope.showAddParentModal = {value: false};
        $scope.sharingPlaceHolder = "";

		$scope.isResourceSelected = function() {
			return $scope.selectedResource.name && $scope.selectedResource.name.length > 0;
		};

		$scope.$watch( 'unlimitedResource', function( newObj, oldObj ) {
            if(!newObj && $scope.selectedResource.sharing_level == 2147483647) {
				$scope.editingResource.sharing_level = 1;
            }
        }, false);

		$scope.saveOldResourceState = function () {
			if (!$scope.isResourceSelected()) {
				return;
			}

			$scope.currentTag = '';
			oldName = $scope.selectedResource.name;
			oldDescription = $scope.selectedResource.description;
            oldResourceState = $scope.selectedResource.resource_state;
			oldTags = [];
            oldParentId = $scope.selectedResource.parent_id;
            oldSharingLevel = $scope.selectedResource.sharing_level;

            $scope.unlimitedResource = ($scope.selectedResource.sharing_level == 2147483647)

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
            $scope.editingResource.sharing_level = oldSharingLevel;
            $scope.editingResource.parent_id = oldParentId;
            $scope.editingResource.is_folder = $scope.selectedResource.is_folder;
		};

		$scope.revertEditing = function() {
            $scope.editingResource.resource_state = oldResourceState;
			$scope.editingResource.name = oldName;
			$scope.editingResource.description = oldDescription;
			$scope.editingResource.tags = oldTags;
            $scope.editingResource.sharing_level = oldSharingLevel;
            $scope.editingResource.parent_id = oldParentId;
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
				$scope.addSuccess("Successfully deleted!");
				getAllResources();
				initModifyResourcesController();
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

		var validateUpdateResource = function(){
			if($scope.editingResource.resource_id == 1){
				$scope.addError("You may not edit the root folder!");
				return false;
			} if(!$scope.editingResource.name){
				$scope.addError("You must provide a name!");
				return false;
			}
			if(!$scope.editingResource.sharing_level && !$scope.editingResource.is_folder){
				$scope.addError('You cannot have a resource sharing level of less than 1');
				return false;
			}
			return true;

		}
		$scope.updateResource = function() {
            if ($scope.unlimitedResource) {
                $scope.editingResource.sharing_level = Number.MAX_SAFE_INTEGER;
            }
            if(!validateUpdateResource()){
            	return;
            }
			$http.post('/resource', $scope.editingResource).then(function(response) {
				updateParent();
            }, function(error) {
                if (error.data.err == "Unable to change restriction or sharing level of resource due to too many conflicts on reservations in response body.") {
                    $scope.addError(error.data.err);
                } else {
                    $scope.addError(resourceService.alertMessages.resourceUpdatingFailed);
                }
            });
		};

        var updateParent = function() {
            $http.post('/resource/updateParent', $scope.editingResource).then(function(response) {
				addTagsToResource();
            }, function(error) {
                if (error.data.parentResourcePermissionMismatchError) {
                    alert("Can't update parent because not all groups/users that have permission on the selected resource/folder have permission on the new parent you've selected. Still gonna make the rest of your changes thoo");
                    $scope.editingResource.parent_id = oldParentId;
                    $scope.updateResource();
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
			$scope.addSuccess("Successfully updated!");
			getAllResources();
			initModifyResourcesController();
		};

        $scope.modifyResourcesTree = [];
        $scope.tree = [];
        var initModifyResourcesController = function(){
            $scope.modifyResourcesTree = [];
            var promise = getChildren({resource_id: 1, name: "root"}); 
            promise.then(function(result){
                if($scope.modifyResourcesTree.length == 0){
                    $scope.modifyResourcesTree.push(result);
                }
            });
    	};

        var getChildren = function(rsrc){
            return $http.get('resource/children?resource_id=' + rsrc.resource_id).then(function(response) {
                var kids = response.data.results;
                var youngbloods = [];
                kids.forEach(function(kid){
                    if(kid.is_folder){
                        var tempPromise = getChildren(kid);
                        tempPromise.then(function(result){
                            youngbloods.push(result);
                        });
                    } else{
                        var res = {id: kid.resource_id, title: kid.name, children: [], is_folder: 0};
                        youngbloods.push(res);
                    }
                });
                var val = {id: rsrc.resource_id, title: rsrc.name, children: youngbloods, is_folder: 1};
                return val;
            }, function(error){
                console.log(error);
            });
        }

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
				populateResourcesMap($scope.allResources);
            }, function(error) {
				console.log(error);
            });		
		};

	   	var populateResourcesMap = function(resources) {
            resources.forEach(function(resource) {
	            $scope.resourceMap.set(resource.resource_id, resource);
            });
        };

        $scope.$watch( 'myTree2.currentNode', function( newObj, oldObj ) {
            if( $scope.myTree2 && angular.isObject($scope.myTree2.currentNode) && !$scope.showAddParentModal.value) {
                for (var i = 0; i<$scope.allResources.length; i++) {
                    if ($scope.myTree2.currentNode.id == $scope.allResources[i].resource_id) {
                        $scope.selectedResource = $scope.allResources[i];
                        $scope.saveOldResourceState();
                        break;
                    }
                }
            }
            $scope.myTree = {};
            $scope.tree = [];
        }, false);

        $scope.addParent = function() {
            $scope.showAddParentModal.value = true;
        };

		getAllResources();
        initModifyResourcesController();

     });

