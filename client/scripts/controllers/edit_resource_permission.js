'use strict';

angular.module('resourceTracker')
    .controller('EditResourceCtrl', function ($scope, $http, $timeout) {

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

        $scope.tree = [];

    	var initEditRsrcController = function() {

    		$scope.allResources = [];
    		$scope.selectedResource = {};
    		$scope.resourceGroup = {};
    		$scope.showPermission = false;
    		$scope.tempGroupPermission = {};
            $scope.resourceMap = new Map();
            getAllResources().then(function(){
                var root = $scope.resourceMap.get(1);
                var promise = getChildren(root); 
                promise.then(function(result){
                    if($scope.tree.length == 0){
                        $scope.tree.push(result);
                    }
                })
            })

		};

        $scope.$watchCollection('myTree.currentNode', function (newObj, oldObj ) {
            if($scope.myTree.currentNode){
                $scope.getPermission();
            }
        });

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

        $scope.confirmation = function() {
             if(nameToPermissionLevelMap[$scope.tempGroupPermission] >= 1 || nameToPermissionLevelMap[$scope.resourceGroup.resource_permission] < 1 || (nameToPermissionLevelMap[$scope.resourceGroup.resource_permission] >= 1 && confirm($scope.displayName + " may have reservations on " + $scope.selectedResource.name + ", are you sure you want to take away reserve permission?"))){
                doUpdate();
            }
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

        var doUpdate = function() {
            var resourceID = $scope.selectedResource.resource_id;
            var groupID = [$scope.userPrivateGroup.group_id];
            var permissionReq = {resource_id: resourceID, group_ids: groupID};
            if ($scope.tempGroupPermission == 'none') {
                var promise = $http.post('/resource/removePermission', permissionReq).then(function(response) {
                    openEditSuccess();
                }, function(error){
                    openEditError(error);
                });
            } else if ($scope.resourceGroup.resource_permission == 'none') {
                addPermission();
            } else {
                updatePermission();
            }
        };

        var updatePermission = function() {
            var resourceID = $scope.selectedResource.resource_id;
            var groupID = $scope.userPrivateGroup.group_id;
            var permissionReq = {resource_id: resourceID,
                                group_id: groupID,
                                resource_permission: $scope.tempGroupPermission};
            var promise = $http.post('/resource/updatePermission', permissionReq).then(function(response) {
                openEditSuccess();
            }, function(error){
                openEditError(error);
            });
            return promise;
        };

        var addPermission = function() {
            var resourceID = $scope.selectedResource.resource_id;
            var groupID = [$scope.userPrivateGroup.group_id];
            var permissionReq = {resource_id: resourceID,
                                group_ids: groupID,
                                resource_permissions: [$scope.tempGroupPermission]};
            var promise = $http.post('/resource/addPermission', permissionReq).then(function(response) {
                openEditSuccess();
            }, function(error){
                openEditError(error);
            });
            return promise;
        };

    	$scope.getPermission = function() {
    		var resourceID = $scope.myTree.currentNode.id;
            $scope.selectedResource = $scope.resourceMap.get(resourceID);
            if($scope.selectedResource.is_folder){
                $scope.permissionOptions = ['none', 'view'];

            } else {
                $scope.permissionOptions = ['none', 'view', 'reserve', 'manage'];
            }
    		var permissionReq = '/resource/getPermission' + '?resource_id=' + resourceID;
    		var promise = $http.get(permissionReq).then(function(response) {
    			var allGroupsPermissions = response.data.results;
                $scope.showPermission = true;
                var res_group = matchGroupByGroupID(allGroupsPermissions, $scope.userPrivateGroup.group_id);
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

        var openEditSuccess = function() {
            $scope.showEditSuccess = true;
            initEditRsrcController();
            $timeout(function(){
                $scope.showEditSuccess = false;
            }, 1500);
        };

        var openEditError = function(msg) {
            $scope.showEditError = true;
            $scope.rsrcError = msg.data.err;
            // initEditUserController();
            $timeout(function(){
                $scope.showEditError = false;
            }, 1500);
        }

	   	initEditRsrcController();

	});
