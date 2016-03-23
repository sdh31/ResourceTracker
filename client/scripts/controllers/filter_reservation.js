'use strict';

angular.module('resourceTracker')
    .controller('FilterReservationCtrl', function ($scope, $http, timelineService) {

        $scope.clearError();
        $scope.clearSuccess();

        $scope.onReservationCreateSuccess = "Reservation Created!";
        $scope.onReservationCreateFailure = "Unable to create the reservation. The selected resource has already been reserved " +
                                            "during this time.";
        $scope.onReservationCreateInPast = "Please select a time in the present or future.";
        $scope.onReservationStartAfterEnd = "Please select a start time before the end time.";
        $scope.onReservationNoResource = "Please select at least one resource to reserve.";
        $scope.onReservationInvalidStartDate = "Please select a valid start date.";
        $scope.onReservationInvalidEndDate = "Please select a valid end date.";

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
            if (!$scope.startTime) {
                $scope.addError($scope.onReservationInvalidStartDate);
                return;
            }

            if (!$scope.endTime) {
                $scope.addError($scope.onReservationInvalidEndDate);
                return;
            }

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

        var initializeResourceReservations = function() {

            var currentTime = new Date();

            $scope.startReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());
            $scope.endReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());

            $scope.reservationName = '';
            $scope.reservationDescription = '';



            $scope.newStartReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());
            $scope.newEndReservationTime = new Date(currentTime.getFullYear(), currentTime.getMonth(),
                                                    currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes());

            // resource_id to array of reservations
            $scope.resourceReservationMap = {};

            // reservation_id to obj with startTime & endTime attributes
            $scope.reservationMap = {};

            // all resources found in database, so admin can use them to modify/delete
            $scope.allResources = [];

            // create resource dropdown model
            $scope.resourcesToCreate = []; 

            // modify a reservation dropdown model for RESOURCE
            $scope.resourceReservationToModify = {};

            // all reservations found for selected resource
            $scope.allReservationsForSelectedResource = [];

            // final reservation that needs modification
            $scope.reservationToModify = {};

            getAllResources();
        };

        var getAllResources = function() {
            return $http.get('/resource/all').then(function(response) {   
                populateResourceArray(response.data, $scope.allResources);
            }, function(error) {
                console.log(error);
            });
        };

        $scope.createReservation = function() {
            if (!$scope.startReservationTime) {
                $scope.addError($scope.onReservationInvalidStartDate);
                return;
            }

            if (!$scope.endReservationTime) {
                $scope.addError($scope.onReservationInvalidEndDate);
                return;
            }

            var reservationData = {
                start_time: $scope.startReservationTime.valueOf(),
                end_time: $scope.endReservationTime.valueOf(),
                resource_ids: [],
                reservation_title: $scope.reservationName,
                reservation_description: $scope.reservationDescription
            };

            $scope.resourcesToCreate.forEach(function(resourceToCreate) {
                reservationData.resource_ids.push(resourceToCreate.id);
            });

            if(!validateCreateReservation(reservationData)){ 
                return;
            }
            $http.put('/reservation', reservationData).then(function(response) {
                $scope.addSuccess($scope.onReservationCreateSuccess);
                initializeResourceReservations();
            }, function(error) {
                $scope.addError($scope.onReservationCreateFailure);
                initializeResourceReservations();
            });
        };

        var validateCreateReservation = function(reservationData) {
            var curr = new Date();
            var startDiff = curr.valueOf() - reservationData.start_time;
            var endDiff = curr.valueOf() - reservationData.end_time;
            if(startDiff >= 60000 || endDiff >= 60000){
                $scope.addError($scope.onReservationCreateInPast);
                return false;
            } if(reservationData.start_time >= reservationData.end_time){
                $scope.addError($scope.onReservationStartAfterEnd);
                return false;
            } if(reservationData.resource_ids.length == 0){
                $scope.addError($scope.onReservationNoResource);
                return false;
            }
            return true;
        }

        var populateResourceArray = function(resourceData, resourceArray) {
            resourceData.forEach(function(resource) {
                if (resource.resource_permission == 'reserve') {
                    var resourceData = {id: resource.resource_id, label: resource.name};
                    resourceArray.push(resourceData);
                    $scope.resourceReservationMap[resourceData.id] = resource.reservations;
                    console.log(resource.reservations);
                }
            });
        };

        initializeResourceReservations();
     });
