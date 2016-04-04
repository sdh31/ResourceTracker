var tag_service = require('../services/tags');
var agenda = require('./agenda');
var resource_query_builder = require('./query_builders/resource_query_builder');
var basic_db_utility = require('./basic_db_utility');
var db_sql = require('./db_wrapper');

function get_resource_by_id(resource, callback){
    /*
    return resource specified by resource_id in resource.resource_id
    */
	var getResourceByIdQuery = resource_query_builder.buildQueryForGetResourceById(resource);
    basic_db_utility.performSingleRowDBOperation(getResourceByIdQuery, callback);
};

function get_resources_by_ids(resource_ids, callback) {
    var getResourceByIdsQuery = resource_query_builder.buildQueryForGetResourcesByIds(resource_ids);
    basic_db_utility.performMultipleRowDBOperation(getResourceByIdsQuery, callback);
};

function create_resource(resource, callback){
    /*
    Create a resource, given all parameters 
    resource: dictionary of all parameters, as stored in the json body of a request    
    */
	var createResourceQuery = resource_query_builder.buildQueryForCreateResource(resource);
    basic_db_utility.performSingleRowDBOperation(createResourceQuery, callback);
}

function update_resource_by_id(resource, callback){
/*
Update specified fields of specified resource
resource: dictionary of fields TO UPDATE, and the id of specified resource
*/
	var updateResourceQuery = resource_query_builder.buildQueryForUpdateResource(resource);
    basic_db_utility.performSingleRowDBOperation(updateResourceQuery, callback);
}

function delete_resource_by_id(resource, callback){
/*
deletes resource row given id of the resource
id:id of resource to delete

*/
    var deleteResourceQuery = resource_query_builder.buildQueryForDeleteResource(resource.resource_id);
    basic_db_utility.performSingleRowDBOperation(deleteResourceQuery, callback);
};

function addGroupPermissionToResource(body, callback) {

    var addGroupPermissionToResourceQuery = resource_query_builder.buildQueryForAddGroupPermissionToResource(body);
    basic_db_utility.performSingleRowDBOperation(addGroupPermissionToResourceQuery, callback);
};

function updateGroupPermissionToResource(body, callback) {

    var updateGroupPermissionToResourceQuery = resource_query_builder.buildQueryForUpdateGroupPermissionToResource(body);
    basic_db_utility.performSingleRowDBOperation(updateGroupPermissionToResourceQuery, callback);
};

function removeGroupPermissionToResource(body, callback) {

    var removeGroupPermissionToResourceQuery = resource_query_builder.buildQueryForRemoveGroupPermissionToResource(body);
    basic_db_utility.performSingleRowDBOperation(removeGroupPermissionToResourceQuery, callback);
};

function getGroupPermissionToResource(body, callback) {
    
    var getGroupPermissionToResourceQuery = resource_query_builder.buildQueryForGetGroupPermissionToResource(body);
    basic_db_utility.performMultipleRowDBOperation(getGroupPermissionToResourceQuery, callback);
    
};

function getAllAncestors(body, callback) {

    var getAllAncestorsQuery = resource_query_builder.buildQueryForGetAllAncestors(body);
    basic_db_utility.performMultipleRowDBOperation(getAllAncestorsQuery, callback);
}

function insertIntoFolderTree(descendant_id, ancestor_ids, path_lengths, callback) {

    var insertIntoFolderTreeQuery = resource_query_builder.buildQueryForInsertIntoFolderTree(descendant_id, ancestor_ids, path_lengths);
    basic_db_utility.performSingleRowDBOperation(insertIntoFolderTreeQuery, callback);
}

function getAllDirectChildren(user, resource, callback) {
    var getAllDirectChildrenQuery = resource_query_builder.buildQueryForGetAllDirectChildren(user, resource);
    basic_db_utility.performMultipleRowDBOperation(getAllDirectChildrenQuery, callback);
}

function getSubtree(user, resource, callback) {
    var getSubtreeQuery = resource_query_builder.buildQueryForGetSubtree(user, resource);
    basic_db_utility.performMultipleRowDBOperation(getSubtreeQuery, callback);
}

var notifyUserOnReservationDelete = function(info) {
    var emailInfo = {
        resource_name: info.name,
        user: {
            first_name: info.first_name,
            last_name: info.last_name,
            email_address: info.email_address,
            emails_enabled: info.emails_enabled,
            username: info.username,
            user_id: info.user_id
        },
        reservation: {
            start_time: info.start_time,
            end_time: info.end_time,
            reservation_title: info.reservation_title,
            reservation_description: info.reservation_description
        }
    };
    
    var currentTime = new Date();

    if (currentTime.valueOf() <= emailInfo.reservation.start_time) {
        agenda.now('notify on delete reservation', emailInfo);
    }
};

module.exports = {
	get_resource_by_id: get_resource_by_id,
    get_resources_by_ids: get_resources_by_ids,
	create_resource: create_resource,
    update_resource_by_id: update_resource_by_id,
    delete_resource_by_id:delete_resource_by_id,
    addGroupPermissionToResource: addGroupPermissionToResource,
    removeGroupPermissionToResource: removeGroupPermissionToResource,
    updateGroupPermissionToResource: updateGroupPermissionToResource,
    getGroupPermissionToResource: getGroupPermissionToResource,
    notifyUserOnReservationDelete: notifyUserOnReservationDelete,
    getAllAncestors: getAllAncestors,
    insertIntoFolderTree: insertIntoFolderTree,
    getAllDirectChildren: getAllDirectChildren,
    getSubtree: getSubtree
};
