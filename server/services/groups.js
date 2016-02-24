var db_sql = require('./db_wrapper');
var squel = require('squel');
var group_queries = require('./query_builders/group_query_builder');
var basic_db_utility = require('./basic_db_utility');

function create_group(group, callback){
	var createGroupQuery = group_queries.buildQueryCreateGroups(group);
	basic_db_utility.performSingleRowDBOperation(createGroupQuery, callback);
}

function update_group_by_id(group, callback){
	var update_query = group_queries.buildQueryUpdateGroups(group);
	basic_db_utility.performSingleRowDBOperation(update_query, callback);
}

function delete_group_by_id(group, callback){
	var delete_query = group_queries.buildQueryDeleteGroups(group)
	basic_db_utility.performSingleRowDBOperation(delete_query, callback);
}

function get_groups_by_id(group, callback){
	//If no id is specified, returns all groups
	var get_query = group_queries.buildQueryGetGroups(group)
	basic_db_utility.performMultipleRowDBOperation(get_query, callback);
}

function add_users_to_group(group, callback){
	var addUsersToGroupQuery = group_queries.buildQueryAddUsersToGroup(group)
	basic_db_utility.performSingleRowDBOperation(addUsersToGroupQuery, callback);
}

function remove_users_from_group(group, callback){
	var removeUsersFromGroupQuery = group_queries.buildQueryRemoveUsersFromGroup(group)
	basic_db_utility.performSingleRowDBOperation(removeUsersFromGroupQuery, callback);
}

function get_users_in_group(group, callback){
	var get_query = group_queries.buildQueryGetUsersFromGroup(group)
	basic_db_utility.performMultipleRowDBOperation(get_query, callback);
}

function get_users_in_groups(group_ids, callback) {
    var getUsersInGroupsQuery = group_queries.buildQueryGetUsersFromGroups(group_ids);
    basic_db_utility.performMultipleRowDBOperation(getUsersInGroupsQuery, callback);
}

function toggle_group_privacy(group, is_private){
	group['is_private'] = is_private;
}

function get_all_groups_for_user(user, callback) {
    var getAllGroupsForUser = group_queries.buildQueryForGetAllGroupsForUser(user)
	basic_db_utility.performMultipleRowDBOperation(getAllGroupsForUser, callback);
};

function get_all_groups_for_users(users, callback) {
    var getAllGroupsForUsersQuery = group_queries.buildQueryForGetAllGroupsForUsers(users);
    basic_db_utility.performMultipleRowDBOperation(getAllGroupsForUsersQuery, callback);
}

function checkReservePermission(groups) {
    for (var i = 0; i<groups.length; i++) {
        if (groups[i].resource_permission == 'reserve') {
            return true;
        }
    }
    return false;
};

module.exports = {
	delete_group_by_id:delete_group_by_id,
	create_group:create_group,
	toggle_group_privacy:toggle_group_privacy,
	get_groups_by_id:get_groups_by_id,
	update_group_by_id:update_group_by_id,
	add_users_to_group:add_users_to_group,
	remove_users_from_group:remove_users_from_group,
    get_all_groups_for_user: get_all_groups_for_user,
    get_all_groups_for_users: get_all_groups_for_users,
    checkReservePermission: checkReservePermission,
	get_users_in_group:get_users_in_group,
    get_users_in_groups: get_users_in_groups
}
