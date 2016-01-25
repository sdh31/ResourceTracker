var db_sql = require('../database_modules.js');
var squel = require('squel');

function create_user(username, password, permission_level, callback){
	//Creates user given all parameters
	var query = squel.insert()
		.into("user")
		.set("username", username)
		.set("password", password)
		.set("permission_level", permission_level)
		.toString();

		var result = db_sql.pool.query(query, function(err, rows, fields){
			if(err) throw err;
		}
	);
}

function validate_user(username, password, callback){
	//Check if user is valid 
	create_user(username, password, "admin", callback);
	var query = squel.select()
		.from("user")
		.where("username = '" + username + "'")
		.where("password = '" + password + "'")
		.toString();


		 var result = db_sql.pool.query(query, function(err, rows, fields){
			if(err) throw err;
			
			callback(err, JSON.stringify(rows));
		}
	);
}

module.exports = {
	create_user: create_user,
	validate_user: validate_user
}
