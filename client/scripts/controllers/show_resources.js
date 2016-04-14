'use strict';

angular.module('resourceTracker')
    .controller('ShowRsrcCtrl', function ($scope, $http) {

    	var initShowResourceController = function(){
            $scope.reservationResourceIDs = getReservationResourceIDs($scope.reservationToModify.resources);
            $scope.allResources = [];
            $scope.resourceMap = new Map();
            getAllResources().then(function(){
                var root = $scope.resourceMap.get(1);
                var promise = getChildren(root);
                promise.then(function(result){
                    if($scope.tree.length == 0){
                        $scope.tree.push(result);
                    }
                });
            });
    	}

        var getReservationResourceIDs = function(reservationResources){
            var IDList = [];
            reservationResources.forEach(function(rsrc){
                IDList.push(rsrc.resource_id);
            })
            return IDList;
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
                            if(result.children.length){
                                youngbloods.push(result);
                            }
                        });
                    } else{
                        if($scope.reservationResourceIDs.indexOf(kid.resource_id) == -1){
                            return;
                        } else{
                            var res = {id: kid.resource_id, title: kid.name, children: [], is_folder: 0};
                            youngbloods.push(res);
                        }
                    }
                });
                var val = {id: rsrc.resource_id, title: rsrc.name, children: youngbloods, is_folder: 1};
                return val;
            }, function(error){
                console.log(error);
            });
        };

        $scope.select = function(){
            $scope.resourcesToRemove.values = [];
            if($scope.myTree.currentNodes.length != 0){
                $scope.myTree.currentNodes.forEach(function(node){
                    $scope.resourcesToRemove.values.push(node.id);
                })
                $scope.updateValid.value = true;
            }
        };
		
    	initShowResourceController();

	});