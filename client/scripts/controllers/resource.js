'use strict';

angular.module('resourceTracker')
    .controller('ResourceCtrl', function ($scope, $http) {
        $scope.newResource = {
            name: '',
            description: '',
            tags: []
        };

		var alertMessages = {
			emptyTag: "Tag name cannot be empty!",
			duplicateTag: "Cannot have duplicate tags!",
			emptyResourceName: "You must give the resource a name!"
		};
        $scope.activeTag = '';
        $scope.activeResourceCreatePanel = false;
        $scope.activeResourceUpdatePanel = false;
        $scope.activeResourceViewPanel = true;
		$scope.hasError = false;
		$scope.alertMessage = '';
		$scope.success = false;

        $scope.addTag = function() {
			if ($scope.activeTag == '') {
				$scope.hasError = true;
				$scope.alertMessage = alertMessages.emptyTag;
				return;
			}

			if ($.inArray($scope.activeTag, $scope.newResource.tags) != -1) {
				$scope.hasError = true;
				$scope.alertMessage = alertMessages.duplicateTag;
				return;
			}

			$scope.hasError = false;
        	$scope.newResource.tags.push($scope.activeTag);
        	$scope.activeTag = '';
        	console.log($scope.newResource.tags);
  	    };

        $scope.removeTag = function(tag_index) {
           $scope.newResource.tags.splice(tag_index, 1);
        };

        $scope.createResource = function() {

			// send info to backend to create resource
			if ($scope.newResource.name == '') {
				$scope.hasError = true;
				$scope.alertMessage = alertMessages.emptyResourceName;
				return;
			}

			// on successful creation clear fields and give a success message!
			$scope.success = true;
			clearFields();
  	    };

		$scope.clearSuccess = function() {
			$scope.success = false;
		}

		$scope.turnOffError = function() {
			$scope.hasError = false;
		}

		var clearFields = function() {
			$scope.newResource.name = '';
			$scope.newResource.description = '';
			$scope.newResource.tags = [];
			$scope.activeTag = '';
			$scope.hasError = false;
		}

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

