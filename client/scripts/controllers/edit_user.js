'use strict';


// at this point, there is a $scope.selectedGroup set through user_management.js
angular.module('resourceTracker')
    .controller('EditUserCtrl', function ($scope, $http, $timeout, $location, $q) {

    	var initEditUserController = function() {
            $scope.user_ReservationPerm = getPermissionForUser($scope.selectedUser, 'reservation_management_permission');
            $scope.user_ResourcePerm = getPermissionForUser($scope.selectedUser, 'resource_management_permission');
            $scope.user_UserPerm = getPermissionForUser($scope.selectedUser, 'user_management_permission');
    	};

        $scope.updatePermissions = function() {
            var username = $scope.selectedUser.username;
            var privateGroupOfUser = $scope.usernameToPrivateGroupMap[username];
            
            var reqBody = {
                group_id:  privateGroupOfUser.group_id,
                reservation_management_permission: $scope.user_ReservationPerm,
                resource_management_permission: $scope.user_ResourcePerm,
                user_management_permission: $scope.user_UserPerm,
            };

            $http.post('/group', reqBody).then(function(response) {
                // must reload all groups from parent controller..
                $scope.getAllGroups().then(function() {
                    $scope.openEditUserSuccess();
                    $scope.selectUserByUserId($scope.selectedUser.user_id);

                    // could have updated reserve/resource system permission, meaning
                    // we can call this function and it will update their access control 
                    // on the scope
                    updateUserPermissionsFromEditUserPage().then(function() {
                        initEditUserController();
                    });
                }, function(error) {
                    // an error can occur when if user removed their own user_management_permission
                    updateUserPermissionsFromEditUserPage();
                });
            }, function(error) {
                console.log('error');
            });
        };

        var updateUserPermissionsFromEditUserPage = function() {
            var deferred = $q.defer();
            return $scope.getMaximumPermissionsForActiveUser().then(function(permissions) {
                $scope.user.resource_management_permission = permissions.resource_management_permission;
                $scope.user.reservation_management_permission = permissions.reservation_management_permission;
                $scope.user.user_management_permission = permissions.user_management_permission;

                if (!$scope.user.user_management_permission) {
                    $scope.showEditUserModal.value = false;
                    $scope.goToContactPage();
                    return;
                }
                deferred.resolve();
            });
            return deferred.promise;
        };

        // given a user object... get the system properties from its private user group
        var getPermissionForUser = function(user, systemPermission) {
            var username = user.username;
            var privateGroupOfUser = $scope.usernameToPrivateGroupMap[username];
            return privateGroupOfUser[systemPermission] == 1;
        };

        $scope.openEditUserSuccess = function() {
            $scope.showEditUserSuccess = true;
            $timeout(function(){
                $scope.showEditUserSuccess = false;
            }, 1500);
        };

    	initEditUserController();

    });