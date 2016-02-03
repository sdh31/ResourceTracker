'use strict';

angular.module('resourceTracker')
    .controller('RegisterCtrl', function ($scope, $http) {

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

        $scope.alertMessage = '';
        $scope.successfulRegisterMessage = 'User created successfully.';
        $scope.successfulRegister = false;

        $scope.register = function() {
            if (!validate()) {
                return;
            }

            $http.put('/user', $scope.newUser).then(function(response) {
                $scope.alertMessage = '';
                $scope.successfulRegister = true;
                initializeNewUser();
            }, function(error) {
                $scope.alertMessage = registerAlerts.failedRegisterAlert;
                $scope.successfulRegister = false;
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
                $scope.alertMessage = errorMessage;
                return false;
            }
            return true;
         };

         var validatePassword = function() {
            if ($scope.newUser.password.length < 5) {
                $scope.alertMessage = registerAlerts.passwordLengthAlert
                return false;
            }
            if ($scope.newUser.password != $scope.newUser.confirmPassword) {
                $scope.alertMessage = registerAlerts.passwordMatchAlert;
                return false;
            }
            return true;
         };

         $scope.activeRegisterAlert = function() {
            return $scope.alertMessage.length > 0;
         };

		 $scope.clearAlert = function() {
			$scope.alertMessage = '';
		 };

         $scope.clearSuccess = function() {
            $scope.successfulRegister = false;
         };
     
     });
