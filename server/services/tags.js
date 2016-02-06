var db_sql = require('./db_wrapper');
var squel = require('squel').useFlavour('mysql');
var resource_service = require('../services/resources');

function create_resource_tag_link(res_id, tag_id, callback){
    /*
    Creates entries in Resource-Tag table: SQL query inserts appropriate tag_id to resource_id
    res_id: id of resource being added to
    tag_id: lis of ids' of tags being added
    */
    console.log(tag_id)
    var rows_to_add = [];
     for(var i = 0; i < tag_id.length; i++){
        var row = {"tag_id": tag_id[i], "resource_id": res_id};
        rows_to_add.push(row);
        console.log(rows_to_add);
    }
        var query = squel.insert()
                    .into('resource_tag')
                    .setFieldsRows(rows_to_add)
                    .toString()
        db_sql.connection.query(query)
            .on('error', function (err) {
                console.log("error")
                callback({error: true, err: err});
            })
            .on('end', function () {
                console.log("finished")
                callback({error: false});
            });
}


function create_tag (res_id, tag_info, response_callback, tag_callback){
    /*
    Create tag object from tag name
    res_id: resource id when creating a link b/w tag and resource
    tag: list of tag names to be used
    response_callback: callback that sends final responses (status codes)
    tag_callback: calback that continues the process of adding a tag (getting ids)
    */
   // var resource_id = tag_info.resource_id;
    var tags = tag_info;
    var rows_to_add = [];
	console.log("tags " + tags);
	console.log("tags length " + tags.length);
    for(var i = 0; i < tags.length; i++){
        var row = {"tag_name": tags[i]};
        rows_to_add.push(row);
    }

    var query = squel.insert()
        .into('tag')
        .setFieldsRows(rows_to_add)
        .toString()
        console.log(query);

        db_sql.connection.query(query)
        .on('error', function (err) {
			console.log('error in tag query');
            if (err.code != "ER_DUP_ENTRY"){
                response_callback({error: true, err: err});
            }
         })
        .on('end', function () {
            console.log('finished!')
            select_tag_id(res_id, tags, response_callback, tag_callback);
        });
}

function select_tag_id(resource_id, tags, response_callback, tag_callback){
    /*
    Given series of tag names, find tag ids to match the names
    (necessary since we don't want duplicate tag names)
    res_id: id of resource
    tags: list of tag names
    response_callback: callback to send responses (status codes)
    tag_callback: continues process of adding tags with newfound tag_ids
    */
    var select_expression = squel.expr();
    for (var i = 0; i < tags.length; i++){
        select_expression.or("tag_name = '" + tags[i] + "'")
    }
    var select_query = squel.select()
                .from('tag') 
                .field("tag_id")
                .where(select_expression)
                .toString()
    var tag_ids = [];

    db_sql.connection.query(select_query)
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
    
	var includedQuery = createIncludedQuery(includedTags, start_time, end_time);
	var excludedQuery = createExcludedQuery(excludedTags);
	console.log(excludedQuery);
	console.log(includedQuery);
	var resourcesFound = [];
	var idsSeen = [];

	var includeCallback = function() {
		db_sql.connection.query(includedQuery)
            .on('result', function (row) {
			    if (excludedResourceIds.indexOf(row.resource_id) == -1) {
                    //console.log(row);
                	resourcesFound.push(row);
			    }
            })
            .on('error', function (err) {
                console.log(err)
                callback({error: true, err: err});
            })
            .on('end', function () {
                callback({resources: organizeResources(resourcesFound)})
            });
	}
	
	var excludedResourceIds = [];

    db_sql.connection.query(excludedQuery)
        .on('result', function (row) {
            excludedResourceIds.push(row.resource_id);
        })
        .on('error', function (err) {
            // empty excluded query is totally ok
            if (err.code != 'ER_EMPTY_QUERY') {
                console.log(err);
                callback({error: true, err: err});
            }
        })
        .on('end', function () {
            includeCallback({excludedResourceIds: excludedResourceIds})
        });
}

function get_all_tags(callback) {

	var query = squel.select()
    .from("tag").
    join("resource_tag", null, "tag.tag_id = resource_tag.tag_id").toString();
	var tags = [];
	var seenTagIds = [];
	db_sql.connection.query(query)
		.on('result', function (row) {
			if (seenTagIds.indexOf(row.tag_id) == -1) {
				seenTagIds.push(row.tag_id);
				tags.push(row);
			}
		})
		.on('error', function (err) {
			console.log(err)
			callback({error: true, err: err});
		})
		.on('end', function () {
			callback({tags: tags})
		});
	
};

function delete_resource_tag_pairs_by_resource(resource, callback, success_callback){
    /*
    deletes resource tag pair given a resource id
    useful when resource is being deleted
    id: id of resource to delete
    */
    var id  = resource.resource_id;
    console.log(resource)
    var query = squel.delete()
        .from("resource_tag")
        .where("resource_id = '" + id + "'")
        .toString();
        console.log(query)
        var row_count = 0;
    db_sql.connection.query(query)
        .on('result', function (row) {
            row_count ++;
            //success_callback(id, callback)
        })
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function (err){
            console.log('sadf')
            //if (row_count == 0){
            success_callback(resource, callback, resource_service.delete_resource_by_id);
           // }
        });
}

function remove_tag_from_object(tag_info, callback){
    var tags = tag_info.deletedTags;
    var resource_id = tag_info.resource_id;
    var tag_filter = squel.expr();
    for (var i = 0; i < tags.length; i++){
        tag_filter.or("tag_name = '" + tags[i] + "'")
    }
    tag_filter.and("resource_id = '" + resource_id + "'");
 
    var query = squel.delete()
        .target("resource_tag")
        .from("resource_tag")
        .join("tag", null, "tag.tag_id = resource_tag.tag_id")
        .where(tag_filter)
        .toString()

    db_sql.connection.query(query)
        
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function (){
            callback({error: false});
        });
}

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

var organizeResources = function(resources) {
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

var createIncludedQuery = function(includedTags, start_time, end_time) {
    var included_filter = squel.expr()
	for (var i = 0; i < includedTags.length; i++){
        included_filter.or("tag_name = '" + includedTags[i] + "'");
    }

    return squel.select()
        .field("resource.name")
        .field("resource.resource_id")
        .field("resource.description")
        .field("resource.max_users")
        .field("resource.created_by")
        .field("tag.tag_name")
        .field("reservation.reservation_id")
        .field("reservation.start_time")
        .field("reservation.end_time")
        .field("user.username")
        .field("user.first_name")
        .field("user.last_name")
        .field("user.user_id")
		.from("resource")
        .left_join("resource_tag", null, "resource.resource_id = resource_tag.resource_id")		
        .left_join("tag", null, "resource_tag.tag_id = tag.tag_id")		
        .left_join("reservation", null, "reservation.resource_id = resource.resource_id AND reservation.start_time > " + start_time + " AND reservation.end_time < " + end_time)
        .left_join("user_reservation", null, "reservation.reservation_id = user_reservation.reservation_id")
        .left_join("user", null, "user_reservation.user_id = user.user_id")
		.where(included_filter).toString();
};

var createExcludedQuery = function(excludedTags) {
    var excluded_filter = squel.expr();
     
	for (var j = 0; j < excludedTags.length; j++) {
		excluded_filter.or("tag_name = '" + excludedTags[j] + "'");
	}

    // this is necessary because we dont want to make an excluded query if there are no tags to exclude!
    var excludedQuery;
    if (excludedTags.length == 0) {
        excludedQuery = "";
    } else{
        excludedQuery = squel.select()
		    .from("resource_tag")

		    //can add more joins (i.e. reservations, resources if more info is needed in return)
		    .join("tag", null, "resource_tag.tag_id = tag.tag_id")
		    .where(excluded_filter).toString();
    }

    return excludedQuery;

};

module.exports = {
    create_tag:create_tag,
    create_resource_tag_link:create_resource_tag_link,
    filter_by_tag:filter_by_tag,
	get_all_tags: get_all_tags,
    remove_tag_from_object:remove_tag_from_object,
    delete_resource_tag_pairs_by_resource:delete_resource_tag_pairs_by_resource
}
