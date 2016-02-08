var db_sql = require('./db_wrapper');
var squel = require('squel');
var tag_service = require('../services/tags');
var agenda = require('./agenda');

function get_resource_by_name(resource, callback){
    /*
    return resource specified by resource_id (might have to change to id if names aren't unique)
    resource_id: resource id
    */
	var query = squel.select()
		.from("resource")
        if("resource_id" in resource){
		  query = query.where("resource_id = '" + resource.resource_id + "'")
        }
		query = query.toString();
		//Query the database, return all resources with given name
    var rowCount = 0;

	db_sql.connection.query(query)
		.on('result', function (row) {
            rowCount ++;
            callback(JSON.stringify(row));
     })
    .on('error', function (err) {
            callback({error: true, err: err});
     })
    .on('end', function (err){
        if (rowCount == 0){
            callback({error: true, err: err});
        }
    });
}

function create_resource(resource, callback){
    /*
    Create a resource, given all parameters 
    resource: dictionary of all parameters, as stored in the json body of a request    
    */
	var query = squel.insert()
		.into('resource')
		.set("name", resource.name)
		.set("description", resource.description)
		.set("max_users", resource.max_users)
		.toString();

    var rowCount = 0;
	db_sql.connection.query(query)
		.on('result', function (row) {
            rowCount++;
            callback(row);
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

function update_resource_by_id(resource,callback){
/*
Update specified fields of specified resource
resource: dictionary of fields TO UPDATE, and the id of specified resource
*/
	var query = squel.update()
		.table('resource')
		.where("resource_id=" + resource.resource_id);
        if (("name" in resource)){
		  query.set("name", resource.name);
        }
		if (("description" in resource)){
            query.set("description", resource.description);
        }
        if (("max_users" in resource)){
            query.set("max_users", resource.max_users);
        }
        query = query.toString();
		console.log(query);

	db_sql.connection.query(query)
		.on('result', function (row) {
            callback(JSON.stringify(row));
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
    var id = resource.resource_id;

    var checkReservationsOnResourceQuery = squel.select().from("reservation").left_join("user_reservation", null, "reservation.reservation_id = user_reservation.reservation_id").left_join("resource", null, "reservation.resource_id = resource.resource_id").left_join("user", null, "user_reservation.user_id = user.user_id").where("reservation.resource_id = '" + id + "'").toString();

    console.log(checkReservationsOnResourceQuery);

    db_sql.connection.query(checkReservationsOnResourceQuery)
        .on('result', function (row) {
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
        })
        .on('error', function (err) {
            console.log("error in check reservations for delete resource " + err);
           // callback({error: true, err: err});
        })
        .on('end', function (){
            deleteResource(id, callback);
        });
}

var deleteResource = function(resource_id, callback) {

    var deleteQuery = squel.delete()
    .from("resource")
    .where("resource_id = " + resource_id)
    .toString();
    console.log(deleteQuery);
    
    db_sql.connection.query(deleteQuery)
        .on('error', function (err) {
            callback({error: true, err: err});
        })
        .on('end', function (){
            callback({error: false});
        });
}

module.exports = {
	get_resource_by_name: get_resource_by_name,
	create_resource: create_resource,
    update_resource_by_id: update_resource_by_id,
    delete_resource_by_id:delete_resource_by_id
};
