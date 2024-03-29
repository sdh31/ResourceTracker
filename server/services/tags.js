var db_sql = require('./db_wrapper');
var tag_query_builder = require('./query_builders/tag_query_builder');
var basic_db_utility = require('./basic_db_utility');

function create_resource_tag_link(resource_id, tag_ids, callback){
    /*
    Creates entries in Resource-Tag table: SQL query inserts appropriate tag_id to resource_id
    res_id: id of resource being added to
    tag_ids: list of ids' of tags being added
    */
    var createResourceTagLinkQuery = tag_query_builder.buildQueryForCreateResourceTagLink(resource_id, tag_ids);
    basic_db_utility.performSingleRowDBOperation(createResourceTagLinkQuery, callback);
}


function create_tag (tags, callback){
    /*
    Create tag object from tag name
    tag: list of tag names to be used
    callback
    */
    
    var createTagsQuery = tag_query_builder.buildQueryForCreateTag(tags);
    basic_db_utility.performMultipleRowDBOperationIgnoreDuplicates(createTagsQuery, callback);
}

function select_tag_ids(tags, callback){
    /*
    Given series of tag names, find tag ids to match the names
    (necessary since we don't want duplicate tag names)
    
    tags: list of tag names
    callback
    */
    
    var selectTagIdsQuery = tag_query_builder.buildQueryForSelectTagIds(tags);
    basic_db_utility.performMultipleRowDBOperation(selectTagIdsQuery, callback);
}

// this returns a list of resources that have the includedTags and do not have the excludedTags
// each resource comes with a list of reservations that are between the start_time and end_time
function filter_by_tag (includedTags, excludedTags, start_time, end_time, group_ids, callback){
    
	var includedQuery = tag_query_builder.buildQueryForIncludedTags(includedTags, start_time, end_time, group_ids);
	var excludedQuery = tag_query_builder.buildQueryForExcludedTags(excludedTags);

    var excludedResources = [];
    var includeCallback = function(result) {
        if (result.error) {
            callback(result);
        } else {
            result.resources = organizeResources(removeExcludedResources(excludedResources, result.results));
            callback(result);
        }
    }

	var excludeCallback = function(result) {
        if (result.error) {
            callback(result);
        } else {
            excludedResources = result.results;
            basic_db_utility.performMultipleRowDBOperation(includedQuery, includeCallback);
        }
	}

    if (excludedQuery == "") {
        excludeCallback({error: false, results: []});
    } else {
        basic_db_utility.performMultipleRowDBOperation(excludedQuery, excludeCallback);
    }
}

function get_all_tags(callback) {

	var getAllTagsQuery = tag_query_builder.buildQueryForGetAllTags();
	basic_db_utility.performMultipleRowDBOperationOnlyUniqueValues(getAllTagsQuery, 'tag_id', callback)
};

function remove_tag_from_object(tag_info, callback){
    
    var removetagFromObjectQuery = tag_query_builder.buildQueryForRemoveTagFromObject(tag_info);
    basic_db_utility.performSingleRowDBOperation(removetagFromObjectQuery, callback);
};

function organizeResources(resources) {
	var resourcesToSend = [];
    var seenResourceTagPairs = [];
    var seenReservationResourcePairs = [];
    
	for (var i = 0; i<resources.length; i++) {
		var thisResource = resources[i];
        var thisReservation = {
            reservation_id: thisResource.reservation_id,
            start_time: thisResource.start_time,
            end_time: thisResource.end_time,
            username: thisResource.username,
            first_name: thisResource.first_name,
            last_name: thisResource.last_name,
            user_id: thisResource.user_id,
            is_confirmed: thisResource.is_confirmed,
            reservation_title: thisResource.reservation_title,
            reservation_description: thisResource.reservation_description
        };
		var index = resourceExists(thisResource, resourcesToSend);
		if (index != -1) {
            if (thisResource.tag_name != null && !containsResourceTagPair(thisResource, seenResourceTagPairs)) {
			    resourcesToSend[index].tags.push(thisResource.tag_name);
                seenResourceTagPairs.push({tag_name: thisResource.tag_name, resource_id: thisResource.resource_id});
            }
            if (thisResource.reservation_id != null && !containsReservationResourcePair(thisResource, seenReservationResourcePairs) && thisReservation.is_confirmed != null) {
                resourcesToSend[index].reservations.push(thisReservation);
                seenReservationResourcePairs.push({reservation_id: thisResource.reservation_id, resource_id: thisResource.resource_id});
            }
            if (thisResource.resource_permission > resourcesToSend[index].resource_permission) {
                resourcesToSend[index].resource_permission = thisResource.resource_permission;
            }
		} else {
			var tag = (thisResource.tag_name == null) ? [] : [thisResource.tag_name];
            var reservation = (thisResource.reservation_id == null || thisReservation.is_confirmed == null) ? [] : [thisReservation];
            seenResourceTagPairs.push({tag_name: thisResource.tag_name, resource_id: thisResource.resource_id});
            seenReservationResourcePairs.push({reservation_id: thisResource.reservation_id, resource_id: thisResource.resource_id});
			var resource = {
				name: thisResource.name,
				description: thisResource.description,
                resource_state: thisResource.resource_state,
				tags: tag,
				resource_id: thisResource.resource_id,
                reservations: reservation,
                resource_permission: thisResource.resource_permission,
                is_folder: thisResource.is_folder,
                parent_id: thisResource.parent_id,
                sharing_level: thisResource.sharing_level
			};
			resourcesToSend.push(resource);
		}
	}
	return resourcesToSend;
};

var resourceExists = function(thisResource, resources) {
	for (var i = 0; i<resources.length; i++) {
		if (thisResource.resource_id == resources[i].resource_id) {
			return i;
		}
	}
	return -1;
};

var containsResourceTagPair = function(thisResource, seenResourceTagPairs) {
    for (var i = 0; i<seenResourceTagPairs.length; i++) {
		if ((thisResource.resource_id == seenResourceTagPairs[i].resource_id) && (thisResource.tag_name == seenResourceTagPairs[i].tag_name)) {
			return true;
		}
	}
	return false;
};

var containsReservationResourcePair = function (thisResource, seenReservationResourcePairs) {
    for (var i = 0; i<seenReservationResourcePairs.length; i++) {
		if ((thisResource.resource_id == seenReservationResourcePairs[i].resource_id) && (thisResource.reservation_id == seenReservationResourcePairs[i].reservation_id)) {
			return true;
		}
	}
	return false;
};

var removeExcludedResources = function(excludedResources, includedResources) {
    
    var resourcesToReturn = [];
    for (var i = 0; i<includedResources.length; i++) {
        if (resourceExists(includedResources[i], excludedResources) == -1) {
            resourcesToReturn.push(includedResources[i]);
        }
    }
    return resourcesToReturn;
};

module.exports = {
    create_tag:create_tag,
    create_resource_tag_link:create_resource_tag_link,
    filter_by_tag:filter_by_tag,
	get_all_tags: get_all_tags,
    select_tag_ids: select_tag_ids,
    remove_tag_from_object:remove_tag_from_object,
	organizeResources : organizeResources
}
