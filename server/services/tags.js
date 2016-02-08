var db_sql = require('./db_wrapper');
var tag_query_builder = require('./query_builders/tag_query_builder');

function create_resource_tag_link(resource_id, tag_ids, callback){
    /*
    Creates entries in Resource-Tag table: SQL query inserts appropriate tag_id to resource_id
    res_id: id of resource being added to
    tag_ids: list of ids' of tags being added
    */
    var createResourceTagLinkQuery = tag_query_builder.buildQueryForCreateResourceTagLink(resource_id, tag_ids);
    
    db_sql.connection.query(createResourceTagLinkQuery)
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function () {
            callback({error: false, results: {insert_id: resource_id}});
        });
}


function create_tag (res_id, tags, response_callback, tag_callback){
    /*
    Create tag object from tag name
    res_id: resource id when creating a link b/w tag and resource
    tag: list of tag names to be used
    response_callback: callback that sends final responses (status codes)
    tag_callback: calback that continues the process of adding a tag (getting ids)
    */
    
    var createTagsQuery = tag_query_builder.buildQueryForCreateTag(tags);
    console.log(createTagsQuery);

    db_sql.connection.query(createTagsQuery)
        .on('error', function (err) {
            if (err.code != "ER_DUP_ENTRY"){
                response_callback({error: true, err: err});
            }
         })
        .on('end', function () {
            select_tag_ids(res_id, tags, response_callback, tag_callback);
        });
}

function select_tag_ids(resource_id, tags, response_callback, tag_callback){
    /*
    Given series of tag names, find tag ids to match the names
    (necessary since we don't want duplicate tag names)
    res_id: id of resource
    tags: list of tag names
    response_callback: callback to send responses (status codes)
    tag_callback: continues process of adding tags with newfound tag_ids
    */
    
    var selectTagIdsQuery = tag_query_builder.buildQueryForSelectTagIds(tags);
    var tag_ids = [];

    db_sql.connection.query(selectTagIdsQuery)
        .on('result', function (row) {
            tag_ids.push(row.tag_id);
                    
        })
        .on('error', function (err) {
            console.log(err)
            response_callback({error: true, err: err});
        })
        .on('end', function () {
            console.log(tag_ids)
            tag_callback(resource_id, tag_ids, response_callback);
        });
}

// this returns a list of resources that have the includedTags and do not have the excludedTags
// each resource comes with a list of reservations that are between the start_time and end_time
function filter_by_tag (includedTags, excludedTags, start_time, end_time, callback){
    
	var includedQuery = tag_query_builder.buildQueryForIncludedTags(includedTags, start_time, end_time);
	var excludedQuery = tag_query_builder.buildQueryForExcludedTags(excludedTags);
	console.log(excludedQuery);
	console.log(includedQuery);
	var resourcesFound = [];
	var idsSeen = [];
    var excludedResourceIds = [];

	var includeCallback = function() {
		db_sql.connection.query(includedQuery)
            .on('result', function (row) {
			    if (excludedResourceIds.indexOf(row.resource_id) == -1) {
                	resourcesFound.push(row);
			    }
            })
            .on('error', function (err) {
                callback({error: true, err: err});
            })
            .on('end', function () {
                callback({resources: organizeResources(resourcesFound)});
            });
	}

    db_sql.connection.query(excludedQuery)
        .on('result', function (row) {
            excludedResourceIds.push(row.resource_id);
        })
        .on('error', function (err) {
            // empty excluded query is totally ok
            if (err.code != 'ER_EMPTY_QUERY') {
                callback({error: true, err: err});
            }
        })
        .on('end', function () {
            includeCallback();
        });
}

function get_all_tags(callback) {

	var getAllTagsQuery = tag_query_builder.buildQueryForGetAllTags();
	var tags = [];
	var seenTagIds = [];
	db_sql.connection.query(getAllTagsQuery)
		.on('result', function (row) {
			if (seenTagIds.indexOf(row.tag_id) == -1) {
				seenTagIds.push(row.tag_id);
				tags.push(row);
			}
		})
		.on('error', function (err) {
			callback({error: true, err: err});
		})
		.on('end', function () {
			callback({tags: tags})
		});
};

function remove_tag_from_object(tag_info, callback){
    
    var removetagFromObjectQuery = tag_query_builder.buildQueryForRemoveTagFromObject(tag_info);

    db_sql.connection.query(removetagFromObjectQuery)
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function (){
            callback({error: false});
        });
};

function organizeResources(resources) {
	var resourcesToSend = [];
    var seenResourceTagPairs = [];
    var seenReservations = [];
    
	for (var i = 0; i<resources.length; i++) {
		var thisResource = resources[i];
        var thisReservation = {
            reservation_id: thisResource.reservation_id,
            start_time: thisResource.start_time,
            end_time: thisResource.end_time,
            username: thisResource.username,
            first_name: thisResource.first_name,
            last_name: thisResource.last_name,
            user_id: thisResource.user_id
        };
		var index = resourceExists(thisResource, resourcesToSend);
		if (index != -1) {
            if (thisResource.tag_name != null && !containsResourceTagPair(thisResource, seenResourceTagPairs)) {
			    resourcesToSend[index].tags.push(thisResource.tag_name);
                seenResourceTagPairs.push({tag_name: thisResource.tag_name, resource_id: thisResource.resource_id});
            }
            if (thisResource.reservation_id != null && seenReservations.indexOf(thisResource.reservation_id) == -1) {
                resourcesToSend[index].reservations.push(thisReservation);
                seenReservations.push(thisResource.reservation_id);
            }
		} else {
			var tag = (thisResource.tag_name == null) ? [] : [thisResource.tag_name];
            var reservation = (thisResource.reservation_id == null) ? [] : [thisReservation];
            seenResourceTagPairs.push({tag_name: thisResource.tag_name, resource_id: thisResource.resource_id});
            seenReservations.push(thisResource.reservation_id);
			var resource = {
				name: thisResource.name,
				description: thisResource.description,
				max_users: thisResource.max_users,
				tags: tag,
				resource_id: thisResource.resource_id,
                reservations: reservation
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

module.exports = {
    create_tag:create_tag,
    create_resource_tag_link:create_resource_tag_link,
    filter_by_tag:filter_by_tag,
	get_all_tags: get_all_tags,
    remove_tag_from_object:remove_tag_from_object,
	organizeResources : organizeResources
}
