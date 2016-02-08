var db_sql = require('./db_wrapper');
var squel = require('squel');
var bcrypt = require('bcrypt');
var tag_service = require('./tags');
var user_query_builder = require('./query_builders/user_query_builder');

function create_user(user, callback){
    //Creates user given all parameters
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            // Store hash in your password DB.
            var createUserQuery = user_query_builder.buildQueryForCreateUser(user, hash);

            db_sql.connection.query(createUserQuery)
                .on('result', function (row) {
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
    // gets the user information given a username
    if (username == null) {
        callback(callback({error: true, err: err, empty: false}));
        return;
    }

    var getUserQuery = user_query_builder.buildQueryForGetUser(username);
    console.log(getUserQuery);

    var rowCount = 0;
    var resources = [];
    var userInfo = {};
    
    db_sql.connection.query(getUserQuery)
        .on('result', function (row) {
            if (rowCount == 0) {
                userInfo = {    
                    user_id: row.user_id,
                    username: row.username,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    email_address: row.email_address,
                    password: row.password,
                    permission_level: row.permission_level,
                    resources: []
                };
            }
            resources.push(row);
            rowCount++;
        })
        .on('error', function (err) {
            callback({error: true, err: err, empty: false});
         })

        .on('end', function () {
            if (rowCount == 0) {
                callback({error: true, empty: true});
            } else {
                userInfo.resources = tag_service.organizeResources(resources);
                callback(userInfo);
            }
         }
    );
}

function delete_user(username, callback) {

    if (username == null) {
        callback({error: true});
        return;
    }

    var deleteUserQuery = user_query_builder.buildQueryForDeleteUser(username);

    db_sql.connection.query(deleteUserQuery)
        .on('error', function (err) {
            callback({error: true, err: err});
         })
        .on('end', function () {
            // not sure of best practice for callback here..
            callback({error: false});
         });
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
