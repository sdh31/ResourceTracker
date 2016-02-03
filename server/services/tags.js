var db_sql = require('./db_wrapper');
var squel = require('squel').useFlavour('mysql');
var resources_utility = require('./resources_utility');

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

function filter_by_tag(includedTags, excludedTags, callback){
    var included_filter = squel.expr()
	for (var i = 0; i < includedTags.length; i++){
        included_filter.or("tag_name = '" + includedTags[i] + "'");
    }

	var includedQuery = squel.select()
		.from("resource_tag")

		//can add more joins (i.e. reservations, resources if more info is needed in return)
		.join("tag", null, "resource_tag.tag_id = tag.tag_id")
		.join("resource", null, "resource_tag.resource_id = resource.resource_id")
		.where(included_filter).toString();
	
	var excluded_filter = squel.expr();

	for (var j = 0; j < excludedTags.length; j++) {
		excluded_filter.or("tag_name = '" + excludedTags[j] + "'");
	}

	var excludedQuery = squel.select()
		.from("resource_tag")

		//can add more joins (i.e. reservations, resources if more info is needed in return)
		.join("tag", null, "resource_tag.tag_id = tag.tag_id")
		.where(excluded_filter).toString();

	console.log(excludedQuery);
	console.log(includedQuery);
	var resourcesFound = [];
	var idsSeen = [];

	var includeCallback = function() {
		db_sql.connection.query(includedQuery)
                .on('result', function (row) {
					if (excludedResourceIds.indexOf(row.resource_id) == -1) {
                    	resourcesFound.push(row);
					}
                })
                .on('error', function (err) {
                    console.log(err)
                    callback({error: true, err: err});
                })
                .on('end', function () {
                    callback({resources: resources_utility.organizeResources(resourcesFound)})
                });
	}
	
	var excludedResourceIds = [];

    db_sql.connection.query(excludedQuery)
                .on('result', function (row) {
                    excludedResourceIds.push(row.resource_id);
                })
                .on('error', function (err) {
                    console.log(err)
                    callback({error: true, err: err});
                })
                .on('end', function () {
                    includeCallback({excludedResourceIds: excludedResourceIds})
                });
}

function get_all_tags(callback) {

	var query = squel.select().from("tag").join("resource_tag", null, "tag.tag_id = resource_tag.tag_id").toString();
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

function delete_resource_tag_pairs_by_resource(id, callback, success_callback){
    /*
    deletes resource tag pair given a resource id
    useful when resource is being deleted
    id: id of resource to delete
    */
    var query = squel.delete()
        .from("resource_tag")
        .where("resource_id = '" + id + "'")
        .toString();
        console.log(query)
        var row_count = 0;
    db_sql.connection.query(query)
        .on('result', function (row) {
            console.log('sdf')
            row_count ++;
            //success_callback(id, callback)
        })
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function (err){
            console.log('sadf')
            //if (row_count == 0){
                success_callback(id, callback)
           // }
        });
}

function remove_tag_from_object(tag_info, callback){
    var tags = tag_info.deletedTags;
    console.log(tags)
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


module.exports = {
    create_tag:create_tag,
    create_resource_tag_link:create_resource_tag_link,
    filter_by_tag:filter_by_tag,
	get_all_tags: get_all_tags,
    remove_tag_from_object:remove_tag_from_object,
    delete_resource_tag_pairs_by_resource:delete_resource_tag_pairs_by_resource
}
