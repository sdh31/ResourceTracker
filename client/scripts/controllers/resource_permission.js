'use strict';

angular.module('resourceTracker')
	.controller('ResourcePermissionCtrl', function ($scope, $http, $location, resourceService) {

		$scope.initializePage = function() {
			$scope.publicGroupList = [];
            $scope.absoluteUserList = [];

            $scope.showEditGroupModal = { value: false };
            $scope.showEditUserModal  = { value: false };

            $scope.selectedGroup = {};
            $scope.selectedUser = {};

            $scope.getAllGroups();
            $scope.usernameToPrivateGroupMap = {};
            getAllUsers();

		}
		$scope.selectGroup = function(index) {
            $scope.selectedGroup = $scope.publicGroupList[index];
            $scope.userPrivateGroup = $scope.selectedGroup;
            $scope.displayName = $scope.selectedGroup.group_name;
            $scope.showEditUserModal.value = true;
        };
        $scope.selectUser = function(index) {
            $scope.selectedUser = $scope.absoluteUserList[index];
            $scope.userPrivateGroup = $scope.usernameToPrivateGroupMap[$scope.selectedUser.username];
            $scope.displayName = $scope.selectedUser.first_name + " " + $scope.selectedUser.last_name + " (" + $scope.selectedUser.username + ")";
            $scope.showEditUserModal.value = true;
        };

        // gets all groups from db
        $scope.getAllGroups = function() {
            var promise = $http.get('/group').then(function(response) {
                // clear out current groups
                $scope.publicGroupList = [];
                $scope.usernameToPrivateGroupMap = {};

                response.data.results.forEach(function(group) {
                    if (group.is_private == 1) {
                        var underscorePos = group.group_name.indexOf('_');
                        var username = group.group_name.substring(0, underscorePos); 

                        // we do not want any admin related groups in the UI
                        if (username == 'admin') {
                            return;
                        }
                        $scope.usernameToPrivateGroupMap[username] = group;
                    } else {
                        $scope.publicGroupList.push(group);
                    }
                });

            }, function(error) {
                console.log(error);
            });
            return promise;
        };

        // gets all users from db
        var getAllUsers = function() {
            $http.get('/user/all').then(function(response) {
                $scope.absoluteUserList = [];
                response.data.results.forEach(function(user) {
                    // we do not want any admin related groups in the UI
                    if (user.username == 'admin') {
                        return;
                    }
                    $scope.absoluteUserList.push(user);
                });
            }, function(error) {
                console.log(error);
            });
        };	

        $scope.getUserDisplayName = function(user) {
            return user.first_name + " " + user.last_name + " (" + user.username + ")";
        };

        $scope.initializePage();



	});