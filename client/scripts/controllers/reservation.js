'use strict';

angular.module('resourceTracker')
    .controller('ReservationCtrl', function ($scope, $http, resourceService) {

    	var currentTime = new Date();
    	$scope.startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
    							    currentTime.getDay(), currentTime.getHours(), currentTime.getMinutes());
    	$scope.endTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
    							    currentTime.getDay(), currentTime.getHours(), currentTime.getMinutes());

    	$scope.allResources = [];
    	$scope.selectedResource = {};


        $scope.allTags = [];
        $scope.tagsToInclude = [];
        $scope.tagsToExclude = [];

        $scope.tagIncludeTranslationText = {buttonDefaultText: 'Tags to Include', dynamicButtonTextSuffix: 'Tag(s) to Include'};
        $scope.tagExcludeTranslationText = {buttonDefaultText: 'Tags to Exclude', dynamicButtonTextSuffix: 'Tag(s) to Exclude'};

    	var getAllResources = function() {
    		$http.get('/resource/all').then(function(response) {	
				$scope.allResources = response.data;
            }, function(error) {
				console.log(error);
            });
    	};

        var getAllTags = function() {
            $http.get('/tag').then(function(response) {    
                populateTagArray(response);
            }, function(error) {
                console.log(error);
            });
        };

    	getAllResources();
        getAllTags();


    	$scope.createReservation = function() {



    	};

        $scope.filterReservations = function() {


        };

        var populateTagArray = function(tagResponse) {
            tagResponse.data.tags.forEach(function(tag) {

                var tag = {id: tag.tag_id, label: tag.tag_name};
                $scope.allTags.push(tag);
                console.log('tag: ' + tag.tag_id + ' ' + tag.tag_name);
            });

        };

     });
