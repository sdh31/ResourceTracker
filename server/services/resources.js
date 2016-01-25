var db_sql = require('../database_modules.js');
var squel = require('squel');

function get_resource_by_name(name){
//Gets resource by name
	//Generate query String
	var query = squel.select()
		.from("resource")
		.where("name = '" + name + "'")
		.toString();
	//Query the database, return all resources with given name
	db_sql.pool.query(query, function(err, rows, fields){
		if(err) throw err;
		//print results
		console.log('The solution is: ', rows);
	});
}

function find_resources_by_tag(tag){
	var query = squel.select()
		.from('resource')
		.from('')
}

function create_resource(name, description, max_users){
//Create a resource, given all parameters
	var query = squel.insert()
		.into('resource')
		.set("name", name)
		.set("description", description)
		.set("max_users", max_users)
		.toString();

	db_sql.pool.query(query, function(err, rows, fields){
		if(err) throw err;
	});
}

function update_resource_by_id(id, name, description, max_users){
//Update a resource given its id and all params
	var squel.update()
		.table('resource')
		.where("id = " + id)
		.set("name", name)
		.set("description", description)
		.set("max_users", max_users)

		db_sql.pool.query(query, function(err, rows, fields){
			if(err) throw err;
		});
}




module.exports = {
	get_resource_by_name: get_resource_by_name
	create_resource: create_resource
};