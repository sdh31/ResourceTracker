'use strict';

angular.module('resourceTracker')
    .controller('MainResourceCtrl', function ($scope, $http) {

        $scope.resourcePanels = { resourceViewPanel: 'resourceViewPanel',
                               resourceCreatePanel: 'resourceCreatePanel'};

        $scope.activeResourcePanel = 'resourceCreatePanel';

        $scope.enableResourceCreatePanel = function() {
            this.clearSuccess();
            this.clearError();
            $scope.activeResourcePanel = $scope.resourcePanels.resourceCreatePanel;
        };

        $scope.enableResourceViewPanel = function() {
            this.clearSuccess();
            this.clearError();
            $scope.activeResourcePanel = $scope.resourcePanels.resourceViewPanel;
        };
     
     });
