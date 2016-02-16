var db_sql = require('./db_wrapper');
var squel = require('squel');
var group_queries = require('./query_builders/group_query_builder');

function create_group(group, callback){
	var create_query = group_queries.buildQueryCreateGroups(group);
	console.log(create_query);
	var row_count = 0;
	var row_to_return;
	db_sql.connection.query(create_query)
	    .on('result', function (row) {
	    	row_count ++;
	    	row_to_return = row
	     })
	    .on('error', function (err) {
	        callback({error: true, err: err});
	     })
	    .on('end', function (){
	        if(row_count == 0){
	        	callback({error: true, err: "Not created"});
	        }
	        else{
	        	callback({error: false, results: row_to_return});
	        }
	    });
}

function update_group_by_id(group, callback){
	var update_query = group_queries.buildQueryUpdateGroups(group);
	console.log(update_query)
	db_sql.connection.query(update_query)
	    
	    .on('error', function (err) {
	        callback({error: true, err: err});
	     })
	    .on('end', function (){
	       callback({error: false, results: {delete_id: group.group_id}})
	    });
}

function delete_group_by_id(group, callback){
	var delete_query = group_queries.buildQueryDeleteGroups(group)
	db_sql.connection.query(delete_query)
	    
	    .on('error', function (err) {
	        callback({error: true, err: err});
	     })
	    .on('end', function (){
	       callback({error: false, results: {delete_id: group.group_id}})
	    });
}

function get_groups_by_id(group, callback){
	//If no id is specified, returns all groups
	var get_query = group_queries.buildQueryGetGroups(group)
	rows_to_return = []
	db_sql.connection.query(get_query)
	    .on('result', function (row) {
	    	rows_to_return.push(row)
	     })
	    .on('error', function (err) {
	        callback({error: true, err: err});
	     })
	    .on('end', function (){       
	        callback({error: false, results: rows_to_return});
	    });
}

function add_user_to_group(group, callback){
	var create_query = group_queries.buildQueryAddUserToGroup(group)
	row_to_return = [];
	console.log(create_query);
	db_sql.connection.query(create_query)
	    .on('result', function (row) {
	    	row_to_return.push(row)
	     })
	    .on('error', function (err) {
	        callback({error: true, err: err});
	     })
	    .on('end', function (){       
	        callback({error: false, results: row_to_return});
	    });
}

function remove_user_from_group(group, callback){
	var delete_query = group_queries.buildQueryRemoveUserFromGroup(group)
	row_to_return = [];
	console.log(delete_query);
	db_sql.connection.query(delete_query)
	    .on('result', function (row) {
	    	row_to_return.push(row)
	     })
	    .on('error', function (err) {
	        callback({error: true, err: err});
	     })
	    .on('end', function (){       
	        callback({error: false, results: row_to_return});
	    });
}

function get_users_in_group(group, callback){
	var get_query = group_queries.buildQueryGetUsersFromGroup(group)
	row_to_return = [];
	console.log(get_query);
	db_sql.connection.query(get_query)
	    .on('result', function (row) {
	    	row_to_return.push(row)
	     })
	    .on('error', function (err) {
	        callback({error: true, err: err});
	     })
	    .on('end', function (){       
	        callback({error: false, results: row_to_return});
	    });
}


function toggle_group_privacy(group, is_private){
	group['is_private'] = is_private;
}

module.exports = {
	delete_group_by_id:delete_group_by_id,
	create_group:create_group,
	toggle_group_privacy:toggle_group_privacy,
	get_groups_by_id:get_groups_by_id,
	update_group_by_id:update_group_by_id,
	add_user_to_group:add_user_to_group,
	remove_user_from_group:remove_user_from_group,
	get_users_in_group:get_users_in_group
}