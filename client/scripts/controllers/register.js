'use strict';

angular.module('resourceTracker')
    .controller('RegisterCtrl', function ($scope, $http) {

        $scope.clearError();
        $scope.clearSuccess();
        
        var initializeNewUser = function() {
            $scope.newUser =  {
                firstName: '',
                lastName: '',
                username: '',
                email: '',
                permission_level: '',
                password: '',
                confirmPassword: '',
            };
        };

        initializeNewUser();

        $scope.permission_levels = ['admin', 'user'];

        var registerAlerts = {  firstNameAlert: 'Please enter a first name.',
                                lastNameAlert: 'Please enter a last name.',
                                usernameAlert: 'Please enter a username.',
                                emailAlert: 'Please enter an email address.',
                                permissionLevelAlert: 'Please select a permission level',
                                passwordLengthAlert: 'Password length is too short.',
                                passwordMatchAlert: 'Passwords do not match.',
                                failedRegisterAlert: 'Error when registering user.'
                            };

        $scope.successfulRegisterMessage = 'User created successfully.';

        $scope.register = function() {
            if (!validate()) {
                return;
            }

            $http.put('/user', $scope.newUser).then(function(response) {
                $scope.addSuccess($scope.successfulRegisterMessage);
                initializeNewUser();
            }, function(error) {
                $scope.addError(registerAlerts.failedRegisterAlert);
            });

  	     };

         var validate = function() {
            var validFields = validateNonEmptyField($scope.newUser.firstName,         registerAlerts.firstNameAlert) &&
                              validateNonEmptyField($scope.newUser.lastName,          registerAlerts.lastNameAlert) &&
                              validateNonEmptyField($scope.newUser.username,          registerAlerts.usernameAlert) &&
                              validateNonEmptyField($scope.newUser.email,             registerAlerts.emailAlert) &&
                              validateNonEmptyField($scope.newUser.permission_level,  registerAlerts.permissionLevelAlert);

            validFields = validFields && validatePassword();
            return validFields;
         };

         var validateNonEmptyField = function(field, errorMessage) {
            if (field.length == 0) {
                $scope.addError(errorMessage);
                return false;
            }
            return true;
         };

         var validatePassword = function() {
            if ($scope.newUser.password.length < 5) {
                $scope.addError(registerAlerts.passwordLengthAlert);
                return false;
            }
            if ($scope.newUser.password != $scope.newUser.confirmPassword) {
                $scope.addError(registerAlerts.passwordMatchAlert);
                return false;
            }
            return true;
         };
     
     });
