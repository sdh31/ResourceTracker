var db_sql = require('../database_modules.js');
var squel = require('squel');

function get_resource_by_name(name, callback){
//Gets resource by name
	//Generate query String
	var query = squel.select()
		.from("resource")
		.where("name = '" + name + "'")
		.toString();
		//Query the database, return all resources with given name
		var result = db_sql.pool.query(query, function(err, rows, fields){
			if(err) throw err;
			callback(err, JSON.stringify(rows));
		}
	);
}

function find_resources_by_tag(tag){
//Incomplete -- will need to look more into joins to do this.
	var query = squel.select()
		.from('resource')
		.from('');
}

function create_resource(name, description, max_users, callback){
//Create a resource, given all parameters
	var query = squel.insert()
		.into('resource')
		.set("name", name)
		.set("description", description)
		.set("max_users", max_users)
		.toString();

		db_sql.pool.query(query, function(err, rows, fields){
			if(err) throw err;
			callback(err, JSON.stringify(rows));
		}
	);
}

function update_resource_by_id(id, name, description, max_users, callback){
//Update a resource given its id and all params
	var query = squel.update()
		.table('resource')
		.where("id = " + id)
		.set("name", name)
		.set("description", description)
		.set("max_users", max_users)

			db_sql.pool.query(query, function(err, rows, fields){
				if(err) throw err;
				callback(err, JSON.stringify(rows));
			}
	);
}




module.exports = {
	get_resource_by_name: get_resource_by_name,
	create_resource: create_resource
};