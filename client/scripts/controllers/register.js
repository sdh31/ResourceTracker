'use strict';

angular.module('resourceTracker')
    .controller('RegisterCtrl', function ($scope, $http) {
        $scope.newUser =  {
            firstName: '',
            lastName: '',
  		    username: '',
            email: '',
            permission_level: '',
  		    password: '',
            confirmPassword: '',
  	     };

        $scope.permission_levels = ['admin', 'user'];

        var registerAlerts = ['Please enter a first name.',
                                 'Please enter a last name.',
                                 'Please enter a username.',
                                 'Please enter an email address.',
                                 'Please select a permission level',
                                 'Password length is too short.',
                                 'Passwords do not match.'
        ];

        $scope.alertMessage = '';

        $scope.register = function() {
            if (!validate()) {
                return;
            }

            $http.put('/user', $scope.newUser).then(function(response) {
                $scope.alertMessage = '';
            }, function(error) {
                console.log(error);
            });

  	     };

         var validate = function() {
            var validFields = validateNonEmptyField($scope.newUser.firstName,         registerAlerts[0]) &&
                              validateNonEmptyField($scope.newUser.lastName,          registerAlerts[1]) &&
                              validateNonEmptyField($scope.newUser.username,          registerAlerts[2]) &&
                              validateNonEmptyField($scope.newUser.email,             registerAlerts[3]) &&
                              validateNonEmptyField($scope.newUser.permission_level,  registerAlerts[4]);

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
                $scope.alertMessage = registerAlerts[5];
                return false;
            }
            if ($scope.newUser.password != $scope.newUser.confirmPassword) {
                $scope.alertMessage = registerAlerts[6];
                return false;
            }
            return true;
         };

         $scope.activeRegisterAlert = function() {
            return $scope.alertMessage.length > 0;
         };

		 $scope.turnOffError = function() {
			$scope.alertMessage = '';
		 };
     
     });
