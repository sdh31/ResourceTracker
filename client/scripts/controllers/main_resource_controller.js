'use strict';

angular.module('resourceTracker')
    .controller('MainResourceCtrl', function ($scope, $http) {

        $scope.success = { value: false };
        $scope.hasError = { value: false };
        $scope.alertMessage = { value: '' };

        $scope.resourcePanels = { resourceViewPanel: 'resourceViewPanel',
                               resourceCreatePanel: 'resourceCreatePanel'};

        $scope.activeResourcePanel = 'resourceCreatePanel';

        $scope.addError = function(errorMsg) {
            $scope.hasError.value = true;
            $scope.alertMessage.value = errorMsg;
        }

        $scope.turnOffError = function() {
            $scope.hasError.value = false;
            $scope.alertMessage.value = '';
        };

        $scope.clearSuccess = function() {
            $scope.success.value = false;
        };

        $scope.enableResourceCreatePanel = function() {
            this.clearSuccess();
            this.turnOffError();
            $scope.activeResourcePanel = $scope.resourcePanels.resourceCreatePanel;
        };

        $scope.enableResourceViewPanel = function() {
            this.clearSuccess();
            this.turnOffError();
            $scope.activeResourcePanel = $scope.resourcePanels.resourceViewPanel;
        };
     
     });
