var db_sql = require('./db_wrapper');
var squel = require('squel');
var bcrypt = require('bcrypt');

function create_user(user, callback){
	//Creates user given all parameters
    bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(user.password, salt, function(err, hash) {
            // Store hash in your password DB.
			var query = squel.insert().into("user")
	        .set("username", user.username)
	        .set("password", hash)
	        .set("permission_level", user.permission_level)
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

function delete_user(username, callback) {

    var query = squel.delete()
                    .from("user").
                     where("username = '" + username + "'").toString();

    db_sql.connection.query(query)
        .on('error', function (err) {
            callback({error: true, err: err});
         })
        .on('end', function () {
            // not sure of best practice for callback here..
            callback({error: false});
         }
    );
}

function update_user(body, callback) {

	var username = body.username;
    var newUsername = body.newUsername;
    var password = body.password;
    var permission_level = body.permission_level;

    var query = squel.update().table("user").where("username = '" + username + "'");

    if (newUsername != null && newUsername != "") {
        query.set("username", newUsername);
    }
    
    if (permission_level != null && permission_level != "") {
        query.set("permission_level", permission_level);
    }

    if (password != null && password != "") {
        bcrypt.genSalt(10, function(err, salt) {
		    bcrypt.hash(password, salt, function(err, hash) {
                // Store hash in your password DB.
			    query = query.set("password", hash).toString();

                db_sql.connection.query(query)
	                .on('end', function () {
                        callback({error: false});
                    })
                    .on('error', function (err) {
                        callback({error: true, err: err});
                     }
                );
		    });
	    });
    } else {
        query = query.toString();
        db_sql.connection.query(query)
            .on('end', function (row) {
                row.password = "";
                callback(row);
            })
            .on('error', function (err) {
                callback({error: true, err: err});
             }
        );
        
    }
}

function compare_passwords(password, hash, callback) {
    bcrypt.compare(password, hash, function(err, res) {
        callback(res);
    });
}

module.exports = {
	create_user: create_user,
	get_user: get_user,
    delete_user: delete_user,
    update_user: update_user,
    compare_passwords: compare_passwords
}
