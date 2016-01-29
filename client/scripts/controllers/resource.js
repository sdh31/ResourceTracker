'use strict';

angular.module('resourceTracker')
    .controller('ResourceCtrl', function ($scope, $http) {
        $scope.newResource = {
            name: '',
            description: '',
            tags: []
        };

        $scope.createResource = function() {


  	     };
     });
