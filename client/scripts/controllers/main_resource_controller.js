'use strict';

angular.module('resourceTracker')
    .controller('MainResourceCtrl', function ($scope, $http) {

        $scope.resourcePanels = { resourceViewPanel: 'resourceViewPanel',
                               resourceCreatePanel: 'resourceCreatePanel'};

        $scope.activeResourcePanel = 'resourceCreatePanel';

        $scope.enableResourceCreatePanel = function() {
            $scope.clearSuccess();
            $scope.clearError();
            $scope.activeResourcePanel = $scope.resourcePanels.resourceCreatePanel;
        };

        $scope.enableResourceViewPanel = function() {
            $scope.clearSuccess();
            $scope.clearError();
            $scope.activeResourcePanel = $scope.resourcePanels.resourceViewPanel;
        };
     
     });
