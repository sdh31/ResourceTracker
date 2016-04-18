'use strict';

// at this point, there is a $scope.selectedGroup set through user_management.js
angular.module('resourceTracker')
    .controller('EditResourceGroupCtrl', function ($scope, $http, $timeout) {

        $scope.showEditGroupSuccess = false;

        var nameToPermissionLevelMap = {
            none: -1,
            view: 0,
            reserve: 1,
            manage: 2,
            admin: 10
        };

        var permissionLevelToNameMap = {
            0: 'view',
            1: 'reserve',
            2: 'manage',
            10: 'admin'
        };

    	var initEditResourceGroupController = function() {			
			$scope.allResources = [];
			$scope.selectedResource = {};
            $scope.showPermission = false;
            $scope.tempGroupPermission = {};
            $scope.resourceGroup = {};
            $scope.permissionOptions = ['none', 'view', 'reserve', 'manage'];
			getAllResources();
	   	};

	   	var getAllResources = function() {
		   	$scope.allResources = [];
	   		$http.get('/resource/all').then(function(response) {
		   		$scope.allResources = response.data;
		   		}, function(error){
		   			console.log(error);
		   		});
	   	};

    	$scope.getPermission = function() {
    		var resourceID = $scope.selectedResource.resource_id;
    		var permissionReq = '/resource/getPermission' + '?resource_id=' + resourceID;
            var groupID = $scope.selectedGroup.group_id;
    		var promise = $http.get(permissionReq).then(function(response) {
    			var allGroupsPermissions = response.data.results;
                $scope.showPermission = true;
                var res_group = matchGroupByGroupID(allGroupsPermissions, groupID);
                if(Object.keys(res_group).length){
                    $scope.resourceGroup = res_group;
                    $scope.resourceGroup.resource_permission = permissionLevelToNameMap[$scope.resourceGroup.resource_permission];
                    $scope.tempGroupPermission = $scope.resourceGroup.resource_permission;
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

        $scope.confirmation = function() {
            if(nameToPermissionLevelMap[$scope.tempGroupPermission] >= 1 || nameToPermissionLevelMap[$scope.resourceGroup.resource_permission] < 1 || (nameToPermissionLevelMap[$scope.resourceGroup.resource_permission] >= 1 && confirm('users in ' + $scope.selectedGroup.group_name + " may have reservations on " + $scope.selectedResource.name + ", are you sure you want to take away reserve permission?"))){
                doUpdate();
            }
        };

        var doUpdate = function() {
            var resourceID = $scope.selectedResource.resource_id;
            var groupID = [$scope.selectedGroup.group_id];
            var permissionReq = {resource_id: resourceID, group_ids: groupID};

            console.log($scope.tempGroupPermission);
            if ($scope.tempGroupPermission == 'none') {
                var promise = $http.post('/resource/removePermission', permissionReq).then(function(response) {
                    openEditGroupSuccess();
                }, function(error){
                    console.log(error);
                });
            } else if ($scope.resourceGroup.resource_permission == 'none') {
                addPermission().then(function(){
                    openEditGroupSuccess();
                });
            } else {
                updatePermission().then(function(){
                    openEditGroupSuccess();
                });
            }
        };

        var updatePermission = function() {
            var resourceID = $scope.selectedResource.resource_id;
            var groupID = $scope.selectedGroup.group_id;
            var permissionReq = {resource_id: resourceID,
                                group_id: groupID,
                                resource_permission: $scope.tempGroupPermission};
            var promise = $http.post('/resource/updatePermission', permissionReq).then(function(response) {

            }, function(error){
                console.log(error);
            });
            return promise;
        };

        var addPermission = function() {
            var resourceID = $scope.selectedResource.resource_id;
            var groupID = [$scope.selectedGroup.group_id];
            var permissionReq = {resource_id: resourceID, 
                                group_ids: groupID, 
                                resource_permissions: [$scope.tempGroupPermission]};
            var promise = $http.post('/resource/addPermission', permissionReq).then(function(response) {

            }, function(error){
                console.log(error);
            });
            return promise;
        };

        var openEditGroupSuccess = function() {
            $scope.showEditGroupSuccess = true;
            initEditResourceGroupController();
            $timeout(function(){
                $scope.showEditGroupSuccess = false;
            }, 1500);
        };

        $scope.hasChanged = function() {
            return $scope.tempGroupPermission != $scope.resourceGroup.resource_permission;
        };


    	initEditResourceGroupController();
    	
});
