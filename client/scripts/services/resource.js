'use strict';

angular.module('resourceTracker')
    .service('resourceService', function ($http, $q) {

		this.alertMessages = {
			emptyTag: "Tag name cannot be empty!",
			duplicateTag: "Cannot have duplicate tags!",
			emptyResourceName: "You must give the resource a name!",
			resourceCreationFailed: "Resource could not be created at this time, try again!",
			resourceUpdatingFailed: "Resource could not be updated at this time, try again!"
		};

		this.addTagToResource = function(resource, tag, onError) {
			if (tag == '') {
				onError(this.alertMessages.emptyTag);
				return;
			}

			if ($.inArray(tag, resource.tags) != -1) {
				onError(this.alertMessages.duplicateTag);
				return;
			}
			resource.tags.push(tag);
	    };

	    this.createResource = function(resource) {
	    	var deferred = $q.defer();
			if (resource.name == '') {
				deferred.reject(alertMessages.emptyResourceName);
			}

			$http.put('/resource', resource).then(function(response) {
				deferred.resolve();
	        }, function(error) {
				deferred.reject(alertMessages.resourceCreationFailed);
	        });
	        return deferred.promise;
  	    };

		this.removeTagFromResource = function(resource, tag_index) {
        	resource.tags.splice(tag_index, 1);
        };

     });

