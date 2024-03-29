'use strict';

angular.module('resourceTracker')
    .service('resourceService', function ($http, $q) {

		this.alertMessages = {
			emptyTag: "Tag name cannot be empty!",
			duplicateTag: "Cannot have duplicate tags!",
			emptyResourceName: "You must give the resource a name!",
			resourceCreationFailed: "Resource could not be created at this time, try again!",
			resourceUpdatingFailed: "Resource could not be updated at this time, try again!",
            noResourceState: "You must provide a resource state when creating a resource!"
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
	    	console.log(resource);
	    	var deferred = $q.defer();
			if (resource.name == '') {
				deferred.reject(this.alertMessages.emptyResourceName);
				return deferred.promise;
			}

            if (resource.resource_state == '') {
                deferred.reject(this.alertMessages.noResourceState);
                return deferred.promise;
            }

			var resourceCreationFailedMessage = this.alertMessages.resourceCreationFailed;
			$http.put('/resource', resource).then(function(response) {
				deferred.resolve(response);
	        }, function(error) {
				deferred.reject(resourceCreationFailedMessage);
	        });
	        return deferred.promise;
  	    };

        this.addTags = function(resource_id, tags) {
            var deferred = $q.defer();
			var resourceCreationFailedMessage = this.alertMessages.resourceCreationFailed;
			$http.put('/tag', {resource_id: resource_id, addedTags: tags}).then(function(response) {
				deferred.resolve();
	        }, function(error) {
				deferred.reject(resourceCreationFailedMessage);
	        });
	        return deferred.promise;
        };

		this.removeTagFromResource = function(resource, tag_index) {
        	resource.tags.splice(tag_index, 1);
        };

     });

