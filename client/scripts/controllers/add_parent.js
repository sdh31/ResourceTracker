'use strict';

angular.module('resourceTracker')
    .controller('AddParentCtrl', function ($scope, $http) {

    	var initAddParentController = function(){
    		$scope.allResources = [];
            $scope.resourceMap = new Map();
    		getAllResources().then(function(){
                var root = $scope.resourceMap.get(1);
                var promise = getChildren(root); 
                promise.then(function(result){
                    if($scope.tree.length == 0){
                        $scope.tree.push(result);
                    }

          /*          if ($scope.editingResource) {
                        console.log("EHRE");
                        for (var i = 0; i<$scope.tree.length; i++) {
                            if ($scope.tree[i].id == $scope.editingResource.parent_id) {
                                $scope.tree[i].selected = 'selected';
                                $scope.myTree.currentNode = $scope.tree[i];
                            }
                        }
                    }*/
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
                var val = {id: rsrc.resource_id, title: rsrc.name, children: children, is_folder: 1};
                return val;
            }, function(error){
                console.log(error);
            });
        }

 /*       $scope.$watch( 'myTree.currentNode', function( newObj, oldObj ) {
            if( $scope.myTree && angular.isObject($scope.myTree.currentNode) ) {
                console.log( $scope.myTree.currentNode );
            }
        }, false);*/

        $scope.submit = function(){

            if ($scope.editingResource) {
                $scope.editingResource.parent_id = $scope.myTree.currentNode.id;
            }

            if ($scope.newResource) {
                $scope.newResource.parent_id = $scope.myTree.currentNode.id;
            }
        };

    	initAddParentController();



});
