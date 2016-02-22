var db_sql = require('./db_wrapper');
var squel = require('squel');
var permission_queries = require('./query_builders/permission_query_builder');
var basic_db_utility = require('./basic_db_utility');

function check_user_management_permission(min_permission_level, user, callback){
	var getUserPermissionQuery = permission_queries.buildQueryForSystemPermissionChecks(user)
	console.log(getUserPermissionQuery);
	var max_user_permission = 0;
	var results = {};

	db_sql.connection.query(getUserPermissionQuery)
	    .on('result', function (row) {
	       	if (row.user_management_permission > max_user_permission){
	       		max_user_permission = row.user_management_permission;
	       	}
	     })
	    .on('error', function (err) {
	        results = {error: true, err: err};
	     })
	    .on('end', function (err){
	        if (max_user_permission >= min_permission_level){
	        	results = {error:false, auth: true}
	        }
	        else if(!('error' in results)){
	        	results = {error:false, auth: false};
	        }
	        callback(results)
	    });
}

function check_reservation_management_permission(min_permission_level, user, callback){
	var getReservationPermissionQuery = permission_queries.buildQueryForSystemPermissionChecks(user)
	console.log(getReservationPermissionQuery);
	var max_reservation_permission = 0;
    var results = {};

	db_sql.connection.query(getReservationPermissionQuery)
	    .on('result', function (row) {
	       	if (row.reservation_management_permission > max_reservation_permission){
	       		max_reservation_permission = row.reservation_management_permission;
	       	}
	     })
	    .on('error', function (err) {
	        results = {error: true, err: err};
	     })
	    .on('end', function (err){
	        if (max_reservation_permission >= min_permission_level){
	        	results = {error:false, auth: true}
	        }
	        else if(!('error' in results)){
	        	results = {error:false, auth: false};
	        }
	        callback(results)
	    });
}

function check_resource_management_permission(min_permission_level, user, callback){
	var getResourcePermissionQuery = permission_queries.buildQueryForSystemPermissionChecks(user);
	console.log(getResourcePermissionQuery);
	var max_resource_permission = 0;
    var results = {};

	db_sql.connection.query(getResourcePermissionQuery)
	    .on('result', function (row) {
	       	if (row.resource_management_permission > max_resource_permission){
	       		max_resource_permission = row.resource_management_permission;
	       	}
	     })
	.on('error', function (err) {
        results = {error: true, err: err};
     })
    .on('end', function (err){
        if (max_resource_permission >= min_permission_level){
        	results = {error:false, auth: true}
        }
        else if(!('error' in results)){
        	results = {error:false, auth: false};
        }
        callback(results)
    });
};

function check_permission_for_resource(resource_id, group_ids, callback) {
    var checkPermissionForResourceQuery = permission_queries.buildQueryForCheckPermissionForResource(resource_id, group_ids);
    basic_db_utility.performMultipleRowDBOperation(checkPermissionForResourceQuery, callback);
};

module.exports = {
	check_user_management_permission: check_user_management_permission,
	check_resource_management_permission: check_resource_management_permission,
	check_reservation_management_permission: check_reservation_management_permission,
    check_permission_for_resource: check_permission_for_resource
}
