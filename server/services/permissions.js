var db_sql = require('./db_wrapper');
var squel = require('squel');
var permission_queries = require('./query_builders/permission_query_builder');
var basic_db_utility = require('./basic_db_utility');
var jwt = require('jsonwebtoken');

//This will need to be moved out of source control
var secret_token = "so secret"
var denied_error = {
    err: "You do not have the requisite permissions to perform this action"
}

function generate_api_auth_token(payload, callback){
    var username = payload.username;
    var user_id = payload.user_id;
    var timestamp = new Date().getTime()/1000;
    var payload = {
        username: username,
        user_id: user_id,
        first_name: payload.first_name,
        last_name: payload.last_name,
        emails_enabled: payload.emails_enabled,
        email_address: payload.email_address
    }
    var options = {
        expiresIn: "1h",
    };
    jwt.sign(payload, secret_token,options,function(token){
        callback({results:{token: token}});
    });
}

function verify_api_auth_token(token, callback){
    var decoded_token = jwt.verify(token, secret_token, function(err, decoded){
        if(decoded == undefined){
            callback({error: true, err: err});
        }
        else{
            callback({error: false, user: decoded});
        }
    });

}

function check_user_permission(session){
    if(session.auth && session.user.user_management_permission > 0){
        return true;
    }
    return false;
}

function check_resource_permission(session){
    if(session.auth && session.user.resource_management_permission > 0){
        return true;
    }
    return false;
}

function check_reservation_permission(session){
    if(session.auth && session.user.reservation_management_permission > 0){
        return true;
    }
    return false;
}

function get_all_system_permissions(user, callback){
    var getResourcePermissionQuery = permission_queries.buildQueryForSystemPermissionChecks(user);
    var user_permission = 0;
    var resource_permission = 0;
    var reservation_permission = 0;
    db_sql.connection.query(getResourcePermissionQuery)
        .on('result', function (row) {
        if(user_permission < row.user_management_permission){
            user_permission = row.user_management_permission;
        }
        if(resource_permission < row.resource_management_permission){
            resource_permission = row.resource_management_permission;
        }
        if(reservation_permission < row.reservation_management_permission){
            reservation_permission = row.reservation_management_permission;
        }

         })
    .on('error', function (err) {
        results = {error: true, err: err};
     })
    .on('end', function (err){
        results = {error:false, results: {
            user_management_permission: user_permission,
            resource_management_permission: resource_permission,
            reservation_management_permission: reservation_permission
        }}
        callback(results)
    });
}

function check_permission_for_resource(resource_id, group_ids, callback) {
    var checkPermissionForResourceQuery = permission_queries.buildQueryForCheckPermissionForResource(resource_id, group_ids);
    basic_db_utility.performMultipleRowDBOperation(checkPermissionForResourceQuery, callback);
};

function check_permission_for_resources(resources, group_ids, callback) {
    var checkPermissionForResourcesQuery = permission_queries.buildQueryForCheckPermissionForResources(resources, group_ids);
    basic_db_utility.performMultipleRowDBOperation(checkPermissionForResourcesQuery, callback);
};

module.exports = {
    check_permission_for_resource: check_permission_for_resource,
    check_permission_for_resources: check_permission_for_resources,
    generate_api_auth_token: generate_api_auth_token,
    verify_api_auth_token: verify_api_auth_token,
    get_all_system_permissions: get_all_system_permissions,
    check_user_permission:check_user_permission,
    check_resource_permission:check_resource_permission,
    check_reservation_permission:check_reservation_permission,
    denied_error:denied_error
}
