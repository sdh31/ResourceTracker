'use strict';

angular.module('resourceTracker')
    .controller('AddParentCtrl', function ($scope, $http) {

    	var initAddParentController = function(){
    		$scope.allResources = [];
            $scope.resourceMap = new Map();
            $scope.tree = [];
    		getAllResources().then(function(){
                var root = $scope.resourceMap.get(1);
                var promise = getChildren(root); 
                promise.then(function(result){
                    $scope.tree = result;
                    console.log($scope.tree);
                })
            });
    	};

		var getAllResources = function() {
	   		return $http.get('/resource/all').then(function(response) {
		   		populateResourcesToDisplay(response.data, $scope.allResources);
		   	}, function(error){
		   		console.log(error);
		   	});
	   	};

	   	var populateResourcesToDisplay = function(resourceData, resourceArray) {
            resourceData.forEach(function(resource) {
	            var resourceData = {id: resource.resource_id, label: resource.name};
	            resourceArray.push(resourceData);
	            $scope.resourceMap.set(resourceData.id, resource);
            });
        };

        var getChildren = function(rsrc){
            return $http.get('resource/children?resource_id=' + rsrc.resource_id).then(function(response) {
                var folders = response.data.results;
                var children = [];
                folders.forEach(function(folder){
                    if(folder.is_folder){
                        var tempPromise = getChildren(folder);
                        tempPromise.then(function(result){
                            children.push(result);
                        });
                    }
                });
                var val = {id: rsrc.resource_id, title: rsrc.name, children: children};
                // console.log(val);
                return val;
            }, function(error){
                console.log(error);
            });
        }

    	initAddParentController();



});