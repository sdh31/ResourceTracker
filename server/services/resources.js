var db_sql = require('./db_wrapper');
var squel = require('squel');
var resources_utility = require('./resources_utility');

function get_resource_by_name(resource, callback){
    /*
    return resource specified by name (might have to change to id if names aren't unique)
    name: resource name
    */
	var query = squel.select()
		.from("resource")
        if("name" in resource){
		  query = query.where("name = '" + resource.name + "'")
        }
		query = query.toString();
		//Query the database, return all resources with given name
    var rowCount = 0;

	db_sql.connection.query(query)
		.on('result', function (row) {
            rowCount ++;
            callback(JSON.stringify(row));
     })
    .on('error', function (err) {
            callback({error: true, err: err});
     })
    .on('end', function (err){
        if (rowCount == 0){
            callback({error: true, err: err});
        }
    });
}

function create_resource(resource, callback){
    /*
    Create a resource, given all parameters 
    resource: dictionary of all parameters, as stored in the json body of a request    
    */
	var query = squel.insert()
		.into('resource')
		.set("name", resource.name)
		.set("description", resource.description)
		.set("max_users", resource.max_users)
		.toString();

    var rowCount = 0;
	db_sql.connection.query(query)
		.on('result', function (row) {
            rowCount++;
            console.log('This got sent!')
            callback(row);
        })
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function (err) {
            if (rowCount == 0){
                callback({error: true, err: err});
            }
        });
}

function get_all_resources(callback) {
	//var query = squel.select().from('resource').left_join('resource_tag', null, 'resource.resource_id = resource_tag.resource_id').left_join('tag', null, 'resource_tag.tag_id = tag.tag_id').toString();
	var query = "SELECT r.resource_id, r.name, r.description, r.max_users, r.created_by, t.tag_id, t.tag_name FROM resource r LEFT JOIN resource_tag as rt ON (r.resource_id = rt.resource_id) LEFT JOIN tag as t ON (rt.tag_id = t.tag_id)"

	var resources = [];

	var rowCount = 0;
	db_sql.connection.query(query)
		.on('result', function (row) {
			rowCount++;
            resources.push(row);
        })
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function () {
            if (rowCount == 0){
                callback({empty: true, resources: resources});
            } else {
				
				callback({empty: false, resources: resources_utility.organizeResources(resources)});
			}
        });
}

function update_resource_by_id(resource,callback){
/*
Update specified fields of specified resource
resource: dictionary of fields TO UPDATE, and the id of specified resource
*/
	var query = squel.update()
		.table('resource')
		.where("resource_id=" + resource.resource_id);
        if (("name" in resource)){
		  query.set("name", resource.name);
        }
		if (("description" in resource)){
            query.set("description", resource.description);
        }
        if (("max_users" in resource)){
            query.set("max_users", resource.max_users);
        }
        query = query.toString();
		console.log(query);

	db_sql.connection.query(query)
		.on('result', function (row) {
            callback(JSON.stringify(row));
        })
        .on('error', function (err) {
            console.log(err)
            callback({error: true, err: err});
        });
}



function delete_resource_by_id(resource, callback){
/*
deletes resource row given id of the resource
id:id of resource to delete

*/
var id = resource.resource_id;
    var query = squel.delete()
        .from("resource")
        .where("resource_id = " + id )
        .toString();
        var row_count = 0;
        console.log(query)
    db_sql.connection.query(query)
        .on('result', function (row) {
            row_count ++;
        })
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function (){
                callback({error: false});
        });
}

module.exports = {
	get_resource_by_name: get_resource_by_name,
	create_resource: create_resource,
    update_resource_by_id: update_resource_by_id,
    delete_resource_by_id:delete_resource_by_id,
	get_all_resources: get_all_resources
};
