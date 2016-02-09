'use strict';

angular.module('resourceTracker')
    .controller('FilterReservationCtrl', function ($scope, $http, timelineService) {

        $scope.clearError();
        $scope.clearSuccess();

    	var currentTime = new Date();
    	$scope.startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
    							    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());
    	$scope.endTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
    							    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());

    	$scope.selectedResource = {};


        $scope.allTags = [];
        $scope.tagsToInclude = [];
        $scope.tagsToExclude = [];

        // map from tag_id to tag_name
        $scope.tagMap = {};

        $scope.tagIncludeTranslationText = {buttonDefaultText: 'Tags to Include', dynamicButtonTextSuffix: 'Tag(s) to Include'};
        $scope.tagExcludeTranslationText = {buttonDefaultText: 'Tags to Exclude', dynamicButtonTextSuffix: 'Tag(s) to Exclude'};
        $scope.timeRangeError = "Ensure the end time is later than the start time."


        var getAllTags = function() {
            $http.get('/tag').then(function(response) {    
                populateTagArray(response);
            }, function(error) {
                console.log(error);
            });
        };

        getAllTags();


        $scope.filterReservations = function() {
            if ($scope.startTime >= $scope.endTime) {
                $scope.addError($scope.timeRangeError);
                return;
            } else {
                $scope.clearError();
            }

            var filter = {start_time: $scope.startTime.valueOf(), end_time: $scope.endTime.valueOf(),
                          includedTags: getTagsToInclude(), excludedTags: getTagsToExclude()};


            $http.post('/tag/filter', filter).then(function(response) {
                var timelineInfo = {};
                timelineInfo.startTime = $scope.startTime;
                timelineInfo.endTime = $scope.endTime;
                timelineInfo.resources = response.data.resources;

                timelineService.drawTimeline(timelineInfo);
            }, function(error) {
                console.log(error);
            });
        };

        var populateTagArray = function(tagResponse) {
            tagResponse.data.tags.forEach(function(tag) {
                var tag = {id: tag.tag_id, label: tag.tag_name};
                $scope.tagMap[tag.id] = tag.label;
                $scope.allTags.push(tag);
            });
        };

        var getTagsToInclude = function() {
            var toInclude = [];
            $scope.tagsToInclude.forEach(function(tag) {
                toInclude.push($scope.tagMap[tag.id]);
            });
            return toInclude;
        };

        var getTagsToExclude = function() {
            var toExclude = [];
            $scope.tagsToExclude.forEach(function(tag) {
                toExclude.push($scope.tagMap[tag.id]);
            });
            return toExclude;
        };

     });
