'use strict';


// at this point, there is a $scope.selectedGroup set through user_management.js
angular.module('resourceTracker')
    .controller('EditResourceGroupCtrl', function ($scope, $http, $timeout) {
    	var initEditResourceGroupController = function() {			
			$scope.allResources = [];
			$scope.selectedResource = {};
            $scope.showPermission = false;
            $scope.showEditGroupSuccess = false;
            $scope.tempGroupPermission = {};
            $scope.resourceGroup = {};
            $scope.permissionOptions = ['none', 'view', 'reserve'];
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
                    $scope.tempGroupPermission = res_group.resource_permission;
                } else {
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
            if(confirm($scope.selectedGroup.group_name + " may be reservations on " + $scope.selectedResource.name + ", are you sure?")){
                updatePermission();
                console.log('confirmed');
            } else {
                console.log('not about it');
            }
        };

        var updatePermission = function() {
            var resourceID = $scope.selectedResource.resource_id;
            var groupID = [$scope.selectedGroup.group_id];
            var permissionReq = {resource_id: resourceID, group_ids: groupID};
            var promise = $http.post('/resource/removePermission', permissionReq).then(function(response) {
                console.log('removed permission');
                if($scope.tempGroupPermission != 'none'){
                    addPermission().then(function(){
                        openEditGroupSuccess();
                    });
                } else { openEditGroupSuccess();}
            }, function(error){
                console.log(error);
            });
        };


        var addPermission = function() {
            var resourceID = $scope.selectedResource.resource_id;
            var groupID = [$scope.selectedGroup.group_id];
            var permissionReq = {resource_id: resourceID, 
                                group_ids: groupID, 
                                resource_permissions: [$scope.tempGroupPermission]};
            console.log($scope.tempGroupPermission);
            var promise = $http.post('/resource/addPermission', permissionReq).then(function(response) {
                console.log('added permission');
            }, function(error){
                console.log(error);
            });
            return promise;
        };

        var openEditGroupSuccess = function() {
            $scope.showEditGroupSuccess = true;
            $timeout(function(){
                $scope.showEditGroupSuccess = false;
            }, 1500);
        };


    	initEditResourceGroupController();
    	
});