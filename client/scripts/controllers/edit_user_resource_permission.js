'use strict';

// at this point, there is a $scope.selectedGroup set through user_management.js
angular.module('resourceTracker')
    .controller('EditResourceUserCtrl', function ($scope, $http, $timeout) {
    	var initEditUserController = function() {
    		$scope.allResources = [];
    		$scope.selectedResource = {};
    		$scope.resourceGroup = {};

            $scope.openEditUserSuccess = false;
    		$scope.showPermission = false;
    		$scope.tempGroupPermission = {};
            $scope.permissionOptions = ['none', 'view', 'reserve'];

    		$scope.userPrivateGroup = $scope.usernameToPrivateGroupMap[$scope.selectedUser.username];
            getAllResources();
		};

	   	var getAllResources = function() {
		   	$scope.allResources = {};
	   		$http.get('/resource/all').then(function(response) {
		   		$scope.allResources = response.data;
		   	}, function(error){
		   		console.log(error);
		   	});
	   	};

        $scope.confirmation = function() {
            if($scope.tempGroupPermission == 'reserve' || $scope.resourceGroup.resource_permission != 'reserve' || ($scope.resourceGroup.resource_permission == 'reserve' && confirm($scope.selectedUser.username + " may have reservations on " + $scope.selectedResource.name + ", are you sure you want to take away reserve permission?"))){
                updatePermission();
            }
        };


    	$scope.getPermission = function() {
    		var resourceID = $scope.selectedResource.resource_id;
    		var permissionReq = '/resource/getPermission' + '?resource_id=' + resourceID;
    		var promise = $http.get(permissionReq).then(function(response) {
    			var allGroupsPermissions = response.data.results;
                $scope.showPermission = true;
                var res_group = matchGroupByGroupID(allGroupsPermissions, $scope.userPrivateGroup.group_id);
                if(Object.keys(res_group).length){
                    $scope.resourceGroup = res_group;
                    $scope.tempGroupPermission = res_group.resource_permission;
                } else {
                    $scope.resourceGroup = {resource_permission: 'none'};
                    $scope.tempGroupPermission = 'none';
                }
    		}, function(error){
    			console.log(error);	
    		}); 
	   	};

		var matchGroupByGroupID = function(allGroupsPermissions, groupID) {
            var res_group = {};
            allGroupsPermissions.forEach(function(resource_group){
                if(resource_group.group_id == groupID){
                    res_group = resource_group;
                    return;
                }
            });
            return res_group;
        };

        var updatePermission = function() {
            var resourceID = $scope.selectedResource.resource_id;
            var groupID = [$scope.userPrivateGroup.group_id];
            var permissionReq = {resource_id: resourceID, group_ids: groupID};
            var promise = $http.post('/resource/removePermission', permissionReq).then(function(response) {
                if($scope.tempGroupPermission != 'none'){
                    addPermission().then(function() {
                        openEditUserSuccess();
                    });
                } else{openEditUserSuccess();}
            }, function(error){
                console.log(error);
            });
        };


        var addPermission = function() {
            var resourceID = $scope.selectedResource.resource_id;
            var groupID = [$scope.userPrivateGroup.group_id];
            var permissionReq = {resource_id: resourceID, 
                                group_ids: groupID, 
                                resource_permissions: [$scope.tempGroupPermission]};
            var promise = $http.post('/resource/addPermission', permissionReq).then(function(response) {

            }, function(error){
                console.log(error);
            });
            return promise;
        };

        var openEditUserSuccess = function() {
            $scope.showEditUserSuccess = true;
            initEditUserController();
            $timeout(function(){
                $scope.showEditUserSuccess = false;
            }, 1500);
        };

	   	initEditUserController();

	});
