var db_sql = require('./db_wrapper');
var squel = require('squel');

function get_resource_by_name(name, callback){
//Gets resource by name
	//Generate query String
	var query = squel.select()
		.from("resource")
		.where("name = '" + name + "'")
		.toString();
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

function find_resources_by_tag(tag){
//Incomplete -- will need to look more into joins to do this.
	var query = squel.select()
		.from('resource')
		.from('');
}

function create_resource(username, resource, callback){
//Create a resource, given all parameters
	var query = squel.insert()
		.into('resource')
		.set("name", resource.name)
		.set("description", resource.description)
		.set("max_users", resource.max_users)
        .set("created_by", username)
		.toString();

	db_sql.connection.query(query)
		.on('result', function (row) {
            callback(JSON.stringify(row));
        })
        .on('error', function (err) {
            callback({error: true, err: err});
        });
}

function update_resource_by_id(resource,callback){
//Update a resource given its id and all params
	var query = squel.update()
		.table('resource')
		.where("id=" + resource.id);
        if (resource.name == null || resource.name == ""){
		  query.set("name", resource.name);
        }
		if (resource.description == null || resource.name == ""){
            query.set("description", resource.description);
        }
        if (resource.max_users == null || resource.name == ""){
            query.set("max_users", resource.max_users);
        }
        query.toString();

	db_sql.connection.query(query)
		.on('result', function (row) {
            callback(JSON.stringify(row));
        })
        .on('error', function (err) {
            callback({error: true, err: err});
        });
}

function delete_resource_by_id(id, callback){
    squel.delete()
        .from("resource")
        .where("id = '" + id + "'")
        .toString();
        var row_count = 0;
    db_sql.connection.query(query)
        .on('result', function (row) {
            rowCount ++;
            callback(JSON.stringify(row));
        })
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function (err){
            if (row_count == 0){
                callback({error: true, err: err});
            }
        });
}

module.exports = {
	get_resource_by_name: get_resource_by_name,
	create_resource: create_resource
};
