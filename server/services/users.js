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
			.set("first_name", user.firstName)
			.set("last_name", user.lastName)
			.set("email_address", user.email)
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
	var query = squel.select()
                    .field("resource.name")
                    .field("resource.resource_id")
                    .field("resource.description")
                    .field("resource.max_users")
                    .field("resource.created_by")
                    .field("reservation.reservation_id")
                    .field("reservation.start_time")
                    .field("reservation.end_time")
                    .field("user.username")
                    .field("user.first_name")
                    .field("user.last_name")
                    .field("user.user_id")
                    .field("user.password")
                    .field("user.permission_level")
                    .from("user")
                    .left_join("user_reservation", null, "user.user_id = user_reservation.user_id")
                    .left_join("reservation", null, "user_reservation.reservation_id = reservation.reservation_id")
                    .left_join("resource", null, "reservation.resource_id = resource.resource_id");
	
	if (username != null){
		query = query.where("username = '" + username + "'");
	}

	query = query.toString();
    console.log(query);

    var rowCount = 0;
    var resultToSend = {};
	db_sql.connection.query(query)
		.on('result', function (row) {
            var thisReservation = {
                reservation_id: row.reservation_id,
                resource_id: row.resource_id,
                resource_name: row.name,
                description: row.description,
                max_users: row.max_users,
                created_by: row.created_by,
                start_time: row.start_time,
                end_time: row.end_time
            };
            
            if (rowCount == 0) {
                resultToSend = {    
                    user_id: row.user_id,
                    username: row.username,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    email_address: row.email_address,
                    password: row.password,
                    permission_level: row.permission_level,
                    reservations: thisReservation.reservation_id == null ? [] : [thisReservation]
                };
            } else {
                resultToSend.reservations.push(thisReservation);
            }
            rowCount++;
            //callback(row);
        })
        .on('error', function (err) {
            callback({error: true, err: err, empty: false});
         })
        .on('end', function () {
            if (rowCount == 0) {
                callback({error: true, empty: true});
            } else {
                callback(resultToSend);
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

function compare_passwords(password, user, callback) {
    bcrypt.compare(password, user.password, function(err, res) {
        callback(res, user);
    });
}

module.exports = {
	create_user: create_user,
	get_user: get_user,
    delete_user: delete_user,
    update_user: update_user,
    compare_passwords: compare_passwords
}
