var db_sql = require('./db_wrapper');
var squel = require('squel');
var bcrypt = require('bcrypt');

function create_user(username, password, permission_level, callback){
	//Creates user given all parameters
    bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(password, salt, function(err, hash) {
            // Store hash in your password DB.
			var query = squel.insert().into("user")
	        .set("username", username)
	        .set("password", hash)
	        .set("permission_level", permission_level)
	        .toString();

            db_sql.connection.query(query)
	            .on('result', function (row) {
                    row.password = "";
                    callback(row);
                })
                .on('error', function (err) {
                    callback({error: true, err: err});
                 }
            );
		});
	});
}

function get_user(username, callback){
	//Check if user is valid 
	var query = squel.select().from("user")
	
	if (username != null){
		query = query.where("username = '" + username + "'");
	}

	query = query.toString();
    var rowCount = 0;
	db_sql.connection.query(query)
		.on('result', function (row) {
            rowCount++;
            callback(row);
        })
        .on('error', function (err) {
            callback({error: true, err: err});
         })
        .on('end', function () {
            if (rowCount == 0) {
                callback({error: true});
            }
         }
    );
}

function compare_passwords(password, hash, callback) {
    bcrypt.compare(password, hash, function(err, res) {
        callback(res);
    });
}

module.exports = {
	create_user: create_user,
	get_user: get_user,
    compare_passwords: compare_passwords
}
