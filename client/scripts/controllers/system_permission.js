'use strict';

angular.module('resourceTracker')
    .controller('SystemPermissionCtrl', function ($scope, $http, $q) {

        $scope.initializePage = function() {
            $scope.groupNameToCreate = '';

            $scope.publicGroupList = [];
            $scope.absoluteUserList = [];

            $scope.showEditGroupModal = { value: false };
            $scope.showEditUserModal  = { value: false };

            $scope.selectedGroup = {};
            $scope.selectedUser = {};

            // give me username, I give you user's private group
            $scope.usernameToPrivateGroupMap = {};

            $scope.getAllGroups();
            getAllUsers();
        };

        // gets all groups from db
        $scope.getAllGroups = function() {
            var deferred = $q.defer();
            $http.get('/group').then(function(response) {
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
                deferred.resolve();
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
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

        $scope.selectGroup = function(index) {
            $scope.selectedGroup = $scope.publicGroupList[index];
            $scope.showEditGroupModal.value = true;
        };

        $scope.selectGroupByGroupId = function(group_id) {
            $scope.publicGroupList.forEach(function(group) {
                if (group.group_id == group_id) {
                    $scope.selectedGroup = group;
                }
            });
        };

        $scope.selectUser = function(index) {
            $scope.selectedUser = $scope.absoluteUserList[index];
            $scope.showEditUserModal.value = true;
        };

        $scope.selectUserByUserId = function(user_id) {
            $scope.absoluteUserList.forEach(function(user) {
                if (user.user_id == user_id) {
                    $scope.selectedUser = user;
                }
            });
        };

        $scope.createNewGroup = function() {
            var reqBody = { name: $scope.groupNameToCreate };
            $http.put('/group', reqBody).then(function(response) {
                // must load new data after adding a new group
                $scope.initializePage();
            }, function(error) {
                console.log(error);
            });
        };

        $scope.getUserDisplayName = function(user) {
            return user.first_name + " " + user.last_name + " (" + user.username + ")";
        };

        // does so based on current session, RETURNS A PROMISE
        $scope.getMaximumPermissionsForActiveUser = function() {
            var deferred = $q.defer();
            $http.get('/user').then(function(response) {
                if (response.data.noSession) {
                    deferred.reject();
                } else {
                    var permissions = {
                        reservation_management_permission: response.data.results.reservation_management_permission & 1,
                        resource_management_permission: response.data.results.resource_management_permission & 1,
                        user_management_permission: response.data.results.user_management_permission & 1
                    };
                    deferred.resolve(permissions);
                }
            }, function(error) {
                deferred.reject();
            });
            return deferred.promise;
        };

        $scope.initializePage();

     });
