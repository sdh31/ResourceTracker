var db_sql = require('./db_wrapper');
var tag_service = require('../services/tags');
var agenda = require('./agenda');
var resource_query_builder = require('./query_builders/resource_query_builder');

function get_resource_by_id(resource, callback){
    /*
    return resource specified by resource_id in resource.resource_id
    */
	var getResourceByIdQuery = resource_query_builder.buildQueryForGetResourceById(resource);
	console.log(getResourceByIdQuery);
    var rowCount = 0;
	db_sql.connection.query(getResourceByIdQuery)
        .on('result', function (row) {
            rowCount++;
            callback(row);
        })
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function (err){
            if (rowCount == 0){
                callback({error: true, err: err});
            }
    });
};

function create_resource(resource, callback){
    /*
    Create a resource, given all parameters 
    resource: dictionary of all parameters, as stored in the json body of a request    
    */
	var createResourceQuery = resource_query_builder.buildQueryForCreateResource(resource);
    console.log(createResourceQuery);
    var rowCount = 0;
	db_sql.connection.query(createResourceQuery)
		.on('result', function (row) {
            rowCount++;
            callback({error:false, results: row});
        })
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function (err) {
            if (rowCount == 0){
                callback({error: true, err: err});
            }
        });
}

function update_resource_by_id(resource, callback){
/*
Update specified fields of specified resource
resource: dictionary of fields TO UPDATE, and the id of specified resource
*/
	var updateResourceQuery = resource_query_builder.buildQueryForUpdateResource(resource);
    console.log(updateResourceQuery);
	db_sql.connection.query(updateResourceQuery)
		.on('result', function (row) {
            callback(row);
        })
        .on('error', function (err) {
            console.log(err)
            callback({error: true, err: err});
        });
}

function delete_resource_by_id(resource, callback){
/*
deletes resource row given id of the resource
id:id of resource to delete

*/
    var checkReservationsOnResourceQuery = resource_query_builder.buildQueryForCheckReservationsOnDeleteResource(resource);
    console.log(checkReservationsOnResourceQuery);
    db_sql.connection.query(checkReservationsOnResourceQuery)
        .on('result', function (row) {
            notifyUserOnReservationDelete(row);
        })
        .on('error', function (err) {
            console.log("error in check reservations for delete resource " + err);
           // callback({error: true, err: err});
        })
        .on('end', function (){
            deleteResource(resource.resource_id, callback);
        });
};

function addGroupPermissionToResource(body, callback) {

    if (body.group_ids.length != body.resource_permissions.length) {
        callback({error: true});
        return;
    }
    
    var addGroupPermissionToResourceQuery = resource_query_builder.buildQueryForAddGroupPermissionToResource(body);
    console.log(addGroupPermissionToResourceQuery);
    var error = false;
    var insertId = -1;
    db_sql.connection.query(addGroupPermissionToResourceQuery)
        .on('result', function (row) {
            insertId = row.insertId;
        })
        .on('error', function (err) {
            error = true;
        })
        .on('end', function (){
            callback({insertId: insertId, error: error});
        });
};

var deleteResource = function(resource_id, callback) {

    var deleteQuery = resource_query_builder.buildQueryForDeleteResource(resource_id);
    console.log(deleteQuery);
    
    db_sql.connection.query(deleteQuery)
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function (){
            callback({error: false});
        });
}

var notifyUserOnReservationDelete = function(row) {
    var info = {
        resource_name: row.name,
        user: {
            username: row.username,
            first_name: row.first_name,
            email_address: row.email_address,
            last_name: row.last_name
        },
        reservation: {
            start_time: row.start_time,
            end_time: row.end_time
        }
    };
    
    var currentTime = new Date();

    if (currentTime.valueOf() <= info.reservation.start_time) {
        agenda.now('notify on delete reservation', info);
    }
};

module.exports = {
	get_resource_by_id: get_resource_by_id,
	create_resource: create_resource,
    update_resource_by_id: update_resource_by_id,
    delete_resource_by_id:delete_resource_by_id,
    addGroupPermissionToResource: addGroupPermissionToResource
};
