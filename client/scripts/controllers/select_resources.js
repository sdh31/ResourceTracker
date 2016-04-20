'use strict';

angular.module('resourceTracker')
    .controller('SelectRsrcCtrl', function ($scope, $http) {

    	var initSelectResourceController = function(){
			$scope.allResources = [];
            $scope.resourceMap = new Map();
    		getAllResources().then(function(){
                var root = $scope.resourceMap.get(1);
                var promise = getChildren(root); 
                promise.then(function(result){
                    if($scope.tree.length == 0){
                        $scope.tree.push(result);
                    }
                })
            });
    	}
		

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
                var kids = response.data.results;
                var youngbloods = [];
                kids.forEach(function(kid){
                    if(kid.is_folder){
                        var tempPromise = getChildren(kid);
                        tempPromise.then(function(result){
                            youngbloods.push(result);
                        });
                    } else{
                        var res = {id: kid.resource_id, title: kid.name, children: [], is_folder: 0};
                        youngbloods.push(res);
                    }
                });
                var val = {id: rsrc.resource_id, title: rsrc.name, children: youngbloods, is_folder: 1};
                return val;
            }, function(error){
                console.log(error);
            });
        }

/*        $scope.$watchCollection('myTree.currentNodes', function (newObj, oldObj ) {
            console.log(newObj);
        }); */

        $scope.select = function(){
            $scope.resourcesToCreate.values = [];
            if($scope.myTree.currentNodes){
                $scope.myTree.currentNodes.forEach(function(node){
                    var rsrc = $scope.resourceMap.get(node.id);
                    $scope.resourcesToCreate.values.push(rsrc);
                })
            }
        };

    	initSelectResourceController();

	});