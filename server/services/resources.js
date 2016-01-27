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

function create_resource(resource, callback){
//Create a resource, given all parameters
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

function update_resource_by_id(resource,callback){
//Update a resource given its id and all params
//can be easily changed to name, depending on what front end wants
	var query = squel.update()
		.table('resource')
		.where("resource_id=" + resource.id);
        if (resource.name != null || resource.name != ""){
		  query.set("name", resource.name);
        }
		if (resource.description != null || resource.name != ""){
            query.set("description", resource.description);
        }
        if (resource.max_users != null || resource.name != ""){
            query.set("max_users", resource.max_users);
        }
        query = query.toString();

	db_sql.connection.query(query)
		.on('result', function (row) {
            callback(JSON.stringify(row));
        })
        .on('error', function (err) {
            console.log(err)
            callback({error: true, err: err});
        });
}
function delete_resource_tag_pair_by_resource(id, callback){
    var query = squel.delete()
        .from("resource_tag")
        .where("resource_id = '" + id + "'")
        .toString();
        console.log(query)
        var row_count = 0;
    db_sql.connection.query(query)
        .on('result', function (row) {
            row_count ++;
            delete_resource_by_id(id, callback)
        })
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function (err){
            if (row_count == 0){
                delete_resource_by_id(id, callback)
            }
        });
}

function delete_resource_by_id(id, callback){
    //can be easily changed to name depending on wht front-end wants
    var query = squel.delete()
        .from("resource")
        .where("resource_id = '" + id + "'")
        .toString();
        var row_count = 0;
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
    delete_resource_tag_pair_by_resource:delete_resource_tag_pair_by_resource
};
