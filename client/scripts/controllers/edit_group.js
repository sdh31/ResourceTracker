'use strict';


// at this point, there is a $scope.selectedGroup set through user_management.js
angular.module('resourceTracker')
    .controller('EditGroupCtrl', function ($scope, $http, $timeout) {

    	var initEditGroupController = function() {
            // initialize group permissions
	    	$scope.reservationPerm = ($scope.selectedGroup.reservation_management_permission == 1);
	    	$scope.resourcePerm = ($scope.selectedGroup.resource_management_permission == 1);
	    	$scope.userPerm = ($scope.selectedGroup.user_management_permission == 1);

            $scope.usersInGroup = [];

            // users to show in dropdown menus (for add & remove user)
            $scope.usersToAddDropdownData = [];
            $scope.usersToRemoveDropdownData = [];

            // selected users from both dropdown menus
            $scope.usersToAddToGroup = [];
            $scope.usersToRemoveFromGroup = [];

            // grab all users in group and then populate multiselect
	    	getUsersInGroup();
	    	getUsersForMultiselect();
    	};

        // Gets all users from db, and determines which users
        // are not in this group (so you can add them),
        // and which users are in this group (so you can remove them)
        var getUsersForMultiselect = function() {
            $http.get('/user/all').then(function(response) {
                $scope.usersToAddDropdownData = [];
                $scope.usersToRemoveDropdownData = [];
                response.data.results.forEach(function(user) {
                	var label = $scope.getUserDisplayName(user);
                	var id = user.user_id;
                	var user = {label: label, id: id};
                    if (groupContainsUser(id)) {
                        $scope.usersToRemoveDropdownData.push(user);
                    } else {
                        $scope.usersToAddDropdownData.push(user);
                    }
                });
            }, function(error) {
                console.log(error);
            });
        };

        // does the selected group contain this user_id?
        var groupContainsUser = function(user_id) {
            var contains = false;
            $scope.usersInGroup.forEach(function(user) {
                if (user.user_id == user_id) {
                    contains = true;
                }
            });
            return contains;
        };

        // they click on an 'active' user group group page...
        // take me to that user
        // @param(index) the index of the user in usersInGroup
        $scope.goToUserFromGroup = function(index) {
        	$scope.showEditGroupModal.value =false;
        	var user_id = $scope.usersInGroup[index].user_id;

        	var indexToSelect = -1;
        	for (var i = 0; i < $scope.absoluteUserList.length; i++) {
        		if ($scope.absoluteUserList[i].user_id == user_id) {
        			indexToSelect = i;
        			break;
        		}
        	}
            // will happen in case of admin, but we will prevent them on UI as well
            if (indexToSelect == -1) {
                return;
            }
        	$scope.selectUser(indexToSelect);
        };

        $scope.deleteGroup = function() {
            var group_id = $scope.selectedGroup.group_id;
            var deleteGroupQuery = '/group?group_id=' + group_id;
            $http.delete(deleteGroupQuery).then(function(response) {
                // group is now deleted... so we shouldn't really keep the modal open
                // we will reload the groups on system_permission & close modal
                $scope.getAllGroups().then(function() {
                    $scope.showEditGroupModal.value = false;
                });
            }, function(error) {
                console.log('Error deleting group');
                console.log(error);
            });
        };

        $scope.addUsersToGroup = function() {
            if ($scope.usersToAddToGroup.length == 0) {
                return;
            }

            var user_ids = [];
            $scope.usersToAddToGroup.forEach(function(user) {
                // this is just 'id' due to multiselect
                user_ids.push(user.id);
            });

            if (user_ids.length == 0) {
                console.log('No ids found. This shouldnt happen!');
                return;
            }
            
        	// req.body should have user_ids and group_id
        	var group_id = $scope.selectedGroup.group_id;
        	var reqBody = {user_ids: user_ids, group_id: group_id};

        	$http.post('/group/addUsers', reqBody).then(function(response) {
                $scope.openEditGroupSuccess();
        		initEditGroupController();
        	}, function(error) {
        		console.log(error);
        	});
        };


        $scope.removeUsersFromGroup = function() {
            if ($scope.usersToRemoveFromGroup.length == 0) {
                return;
            }

            var user_ids = [];
            $scope.usersToRemoveFromGroup.forEach(function(user) {
                // this is just 'id' due to multiselect
                user_ids.push(user.id);
            });

            if (user_ids.length == 0) {
                console.log('No ids found. This shouldnt happen!');
                return;
            }
            
            // req.body should have user_ids and group_id
            var group_id = $scope.selectedGroup.group_id;
            var reqBody = {user_ids: user_ids, group_id: group_id};

            $http.post('/group/removeUsers', reqBody).then(function(response) {
                $scope.openEditGroupSuccess();
                initEditGroupController();
            }, function(error) {
                console.log(error);
            });
        };

        $scope.updatePermissions = function() {
            var reqBody = {
                group_id:  $scope.selectedGroup.group_id,
                reservation_management_permission: ($scope.reservationPerm) + 0,
                resource_management_permission: ($scope.resourcePerm) + 0,
                user_management_permission: ($scope.userPerm) + 0
            };

            $http.post('/group', reqBody).then(function(response) {
                // must reload all groups from parent controller..
                $scope.getAllGroups().then(function() {
                    $scope.openEditGroupSuccess();
                    // reselect group.. as permissions have changed
                    $scope.selectGroupByGroupId($scope.selectedGroup.group_id);
                    initEditGroupController();
                });
            }, function(error) {
                console.log(error);
            });

        };

    	var getUsersInGroup = function() {
    		var groupId = $scope.selectedGroup.group_id;
    		var reqQuery = '/group/user' + '?group_id=' + groupId;

    		$http.get(reqQuery).then(function(response) {
    			$scope.usersInGroup = [];
    			response.data.results.forEach(function(user) {
    				$scope.usersInGroup.push(user);
    			});
    		}, function(error) {
    			console.log(error);
    		});
    	};

        $scope.openEditGroupSuccess = function() {
            $scope.showEditGroupSuccess = true;
            $timeout(function(){
                $scope.showEditGroupSuccess = false;
            }, 1500);
        };

    	initEditGroupController();

    });