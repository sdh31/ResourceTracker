var db_sql = require('./db_wrapper');
var squel = require('squel');
var bcrypt = require('bcrypt');
var tag_service = require('./tags');
var group_service = require('./groups');
var user_query_builder = require('./query_builders/user_query_builder');
var basic_db_utility = require('./basic_db_utility');
var random_string = '110ec58a-a0f2-4ac4-8393-c866d813b8d1';

function create_user(user, callback){
    //Creates user given all parameters
    
	var user_id = 0; 
    var createUserCallback = function(result) {
        if (result.error) {
            callback({error: true, err: result.err});
            return;
        }
        user_id = result.results.insertId;
        user.is_private = 1;
        user.name = user.username + "_group_" + random_string;
        user.description = user.username + "_group_" + random_string;
        group_service.create_group(user, createGroupCallback);
    };

    var finalCallback = function(result) {
        if (result.error) {
            callback({error: true, err: result.err});
        } else {
            callback({error: false, err: '', insertId: user_id});
        }
    };

    var createGroupCallback = function(result) {
        var info = {
            group_id: result.results.insertId,
            user_ids: [user_id]
        };
        group_service.add_users_to_group(info, finalCallback);
    };

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            // Store hash in your password DB.
            var createUserQuery = user_query_builder.buildQueryForCreateUser(user, hash);
            basic_db_utility.performSingleRowDBOperation(createUserQuery, createUserCallback);
        });
    });
}

function get_user_permissions(user, callback) {
    
    var username = user.username;

    if (username == null) {
        callback({error: true, err: "", empty: false});
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
                    emails_enabled: row.emails_enabled,
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
                callback({error: error, user: userInfo});
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
    basic_db_utility.performSingleRowDBOperation(deleteUserQuery, callback);
};

function delete_private_group(username, callback) {
    var deletePrivateGroupQuery = user_query_builder.buildQueryForDeletePrivateGroup(username + "_group_" + random_string);
    basic_db_utility.performSingleRowDBOperation(deletePrivateGroupQuery, callback);
}

function update_user(body, callback) {
    var username = body.username;
    var newUsername = body.newUsername;
    var password = body.password;
    var email_address = body.email_address;
    var emails_enabled = body.emails_enabled;

    if ((username == null || username == "") || (newUsername == null && password == null && email_address == null && emails_enabled == null)) {
        callback({error: true, err: "no username provided OR no fields given to update"});
        return;
    }
    var query = squel.update().table("user").where("username = '" + username + "'");

    if (newUsername != null && newUsername != "") {
        query.set("username", newUsername);
    }

    if (email_address != null && email_address != "") {
        query.set("email_address", email_address);
    }

    if (emails_enabled != null && emails_enabled != "") {
        query.set("emails_enabled", emails_enabled);
    }

    if (password != null && password != "") {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                // Store hash in your password DB.
                query = query.set("password", hash).toString();
                basic_db_utility.performSingleRowDBOperation(query, callback);
            });
        });
    } else {
        query = query.toString();
        basic_db_utility.performSingleRowDBOperation(query, callback);
    }
};

function get_all_users(callback) {
    var getAllUsersQuery = user_query_builder.buildQueryForGetAllUsers();
    basic_db_utility.performMultipleRowDBOperation(getAllUsersQuery, callback);
};

function get_private_group(user_id, callback) {
    var getPrivateGroupQuery = user_query_builder.buildQueryForGetPrivateGroup(user_id);
    basic_db_utility.performSingleRowDBOperation(getPrivateGroupQuery, callback);

};

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
    delete_private_group: delete_private_group,
    get_private_group: get_private_group,
    update_user: update_user,
    get_all_users: get_all_users,
    compare_passwords: compare_passwords
}
