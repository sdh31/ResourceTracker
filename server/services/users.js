var db_sql = require('./db_wrapper');
var squel = require('squel');
var bcrypt = require('bcrypt');
var tag_service = require('./tags');
var group_service = require('./groups');
var user_query_builder = require('./query_builders/user_query_builder');

function create_user(user, callback){
    //Creates user given all parameters

    var user_id = 0;
    
    var createUserCallback = function() {
        user.is_private = 1;
        user.group_name = user_id + "_group";
        user.group_description = user_id + "_group";
        group_service.create_group(user, createGroupCallback);
    };

    var createGroupCallback = function(result) {
        var info = {
            group_id: result.results.insertId,
            username: user.username
        };
        group_service.add_user_to_group(info, callback);
    };

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            // Store hash in your password DB.
            var createUserQuery = user_query_builder.buildQueryForCreateUser(user, hash);

            db_sql.connection.query(createUserQuery)
                .on('result', function (row) {
                    user_id = row.insertId;
                    createUserCallback();
                })
                .on('error', function (err) {
                    callback({error: true, err: err});
                 }
            );
        });
    });
}

function get_user_permissions(user, callback) {
    
    var username = user.username;

    if (username == null) {
        callback(callback({error: true, err: err, empty: false}));
        return;
    }

    var getUserPermissionsQuery = user_query_builder.buildQueryForGetUserPermissions(user);
    console.log(getUserPermissionsQuery);

    var rowCount = 0;
    var userInfo = {};
    var error = false;
    db_sql.connection.query(getUserPermissionsQuery)
        .on('result', function (row) {
            
            var thisGroup = {
                group_id: row.group_id,
                group_name: row.group_name,
                group_description: row.group_description,
                resource_management_permission: row.resource_management_permission,
                reservation_management_permission: row.reservation_management_permission,
                user_management_permission: row.user_management_permission,
                is_private: row.is_private
            };

            var resource_management_permission = row.resource_management_permission;
            var reservation_management_permission = row.reservation_management_permission;
            var user_management_permission = row.user_management_permission;

            if (rowCount == 0) {
                userInfo = {    
                    user_id: row.user_id,
                    username: row.username,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    email_address: row.email_address,
                    is_shibboleth: row.is_shibboleth,
                    password: row.password,
                    groups: [thisGroup],
                    resource_management_permission: row.resource_management_permission,
                    reservation_management_permission: row.reservation_management_permission,
                    user_management_permission: row.user_management_permission
                };
            } else {
                userInfo.groups.push(thisGroup);
                userInfo.resource_management_permission = userInfo.resource_management_permission == 1 ? 1 : resource_management_permission;
                userInfo.user_management_permission = userInfo.user_management_permission == 1 ? 1 : user_management_permission;
                userInfo.reservation_management_permission = userInfo.reservation_management_permission == 1 ? 1 : reservation_management_permission;
            }
            
            rowCount++;
        })
        .on('error', function (err) {
            error = true;
         })
        .on('end', function () {
            if (rowCount == 0) {
                callback({error: error, empty: true});
            } else {
                callback({error: error, userInfo: userInfo});
            }
         }
    );
};

// THIS METHOD IS NEVER USED 
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
};

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
    get_user_permissions: get_user_permissions,
    delete_user: delete_user,
    update_user: update_user,
    compare_passwords: compare_passwords
}
