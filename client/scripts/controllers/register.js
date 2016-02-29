'use strict';

angular.module('resourceTracker')
    .controller('RegisterCtrl', function ($scope, $http) {

        $scope.clearError();
        $scope.clearSuccess();
        
        var initializeNewUser = function() {
            $scope.newUser =  {
                first_name: '',
                last_name: '',
                username: '',
                email_address: '',
                password: '',
                confirmPassword: '',
                isShibboleth: false
            };
        };

        initializeNewUser();

        var registerAlerts = {  firstNameAlert: 'Please enter a first name.',
                                lastNameAlert: 'Please enter a last name.',
                                usernameAlert: 'Please enter a username.',
                                usernameTooShortAlert: 'Please enter a username that is 7 or more alphanumeric characters long.',
                                emailAlert: 'Please enter an email address.',
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
            var validFields = validateNonEmptyField($scope.newUser.first_name,         registerAlerts.firstNameAlert) &&
                              validateNonEmptyField($scope.newUser.last_name,          registerAlerts.lastNameAlert) &&
                              validateNonEmptyField($scope.newUser.username,          registerAlerts.usernameAlert) &&
                              validateNonEmptyField($scope.newUser.email_address,             registerAlerts.emailAlert);
            validFields = validFields && validatePassword();
            validFields = validFields && validateUsernameLength();
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

         var validateUsernameLength = function() {
            if ($scope.newUser.username.length < 7) {
                $scope.addError(registerAlerts.usernameTooShortAlert);
                return false;
            }
            return true;
         };
     
     });
