var db_sql = require('./db_wrapper');
var squel = require('squel');

function create_user(username, password, permission_level, callback){
	//Creates user given all parameters
	var query = squel.insert().into("user")
		.set("username", username)
		.set("password", password)
		.set("permission_level", permission_level)
		.toString();

	db_sql.connection.query(query)
		.on('result', function (row) {
      callback(JSON.stringify(row));
     })
    .on('error', function (err) {
      console.log(err);
      callback({error: true, err: err});
     });
	
}

function validate_user(username, password, callback){
	//Check if user is valid 
	var query = squel.select().from("user")
	
	if (username != null){
		query = query.where("username = '" + username + "'");
	}

	if (password != null){
		query = query.where("password = '" + password + "'");
	}

	query = query.toString();

	db_sql.connection.query(query)
		.on('result', function (row) {
      callback(JSON.stringify(row));
     })
    .on('error', function (err) {
      callback({error: true, err: err});
     });
}

module.exports = {
	create_user: create_user,
	validate_user: validate_user
}
