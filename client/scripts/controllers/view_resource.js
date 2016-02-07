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
			var deleteQueryString = '/resource?resource_id=' + $scope.editingResource.resource_id;
			console.log($scope.selectedResource);
			$http.delete(deleteQueryString).then(function(response) {
				showMessageAndReload("Successfully deleted resource!");
            }, function(error) {
				$scope.addError(resourceService.alertMessages.resourceUpdatingFailed);
            });
		};

		$scope.updateResource = function() {
			$http.post('/resource', $scope.editingResource).then(function(response) {
				addTagsToResource();
            }, function(error) {
				$scope.addError(resourceService.alertMessages.resourceUpdatingFailed);
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
		//	$http.get('/tag').then(function(response) {
			//	console.log(response.data);
            //}, function(error) {
				//console.log(error);
        //    });

			var includedTags = ['tag1'];
			var excludedTags = [];

			var toSend = {includedTags: includedTags, excludedTags: excludedTags, start_time: 0, end_time: Number.MAX_VALUE};

			$http.post('/tag/filter', toSend).then(function(response) {	
				console.log(response.data);
            }, function(error) {
				console.log(error);
			});

            var testDate = new Date();
            console.log(testDate.valueOf());

            var startDate = new Date(2016, 1, 7, 18, 53);
            var endDate = new Date(2016, 1, 7, 18, 54);
            var reservation = {
                resource_id: 2,
                start_time: startDate.valueOf(),
                end_time: endDate.valueOf()
            };
            $http.put('/reservation', reservation).then(function(response) {
				console.log(response);
            }, function(error) {
				console.log(error);
            });
		};

		getAllResources();

     });

