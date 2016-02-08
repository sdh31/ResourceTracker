var db_sql = require('./db_wrapper');
var agenda = require('./agenda');
var reservation_query_builder = require('./query_builders/reservation_query_builder');

function get_conflicting_reservations(user, reservation, callback, no_conflict_callback){
    
    var getConflictingReservationsQuery = reservation_query_builder.buildQueryForGetConflictingReservations(reservation);
    console.log(getConflictingReservationsQuery);
    var row_count = 0;
    response_values = [];
    db_sql.connection.query(getConflictingReservationsQuery)
        .on('result', function (row) {
            row_count++;
            response_values.push(row);
         })
        .on('error', function (err) {
            callback({error: true, err: err});
         })
        .on('end', function (err){
            if (row_count == 0){
                no_conflict_callback(user, reservation, callback);
            } else{
                //TODO: Going to need to change what we do here ... Maybe another callback field?
                callback({error: true, results: response_values});
            }
        });
}

function create_reservation(user, reservation, callback, success_callback){
    
    var createReservationQuery = reservation_query_builder.buildQueryForCreateReservation(reservation);
    console.log(createReservationQuery);
    db_sql.connection.query(createReservationQuery)
        .on('result', function (row) {
            var res = {
                start_time: reservation.start_time,
                end_time: reservation.end_time,
                resource_id: reservation.resource_id,
                reservation_id: row.insertId
            };
            reservation["reservation_id"] = row.insertId;
            scheduleEmailForReservation(user, res, callback);
        })
        .on('error', function (err) {
            callback({error: true, err: err})
        })
        .on('end', function (err) {
            add_user_reservation_link(user, reservation, callback);
        });
}

function add_user_reservation_link(user, reservation, callback){
    
    var addUserReservationLinkQuery = reservation_query_builder.buildQueryForAddUserReservationLink(user, reservation);
    console.log(addUserReservationLinkQuery);
    db_sql.connection.query(addUserReservationLinkQuery)                
        .on('error', function (err) {
            callback({error: true, err: err})
        })
        .on('end', function (err){
            callback({error:false, insertId: reservation.reservation_id})
        });
}

function delete_reservation_by_id(reservation, callback){

    var deleteReservationByIdQuery = reservation_query_builder.buildQueryForDeleteReservationById(reservation);
    console.log(deleteReservationByIdQuery);
    db_sql.connection.query(deleteReservationByIdQuery)                
        .on('error', function (err) {
            callback({error: true, err: err})
        })
        .on('end', function (err){
            callback({error: false})
        });
}

function update_reservation_by_id(user, reservation, callback){

    var updateReservationByIdQuery = reservation_query_builder.buildQueryForUpdateReservationById(reservation);
    console.log(updateReservationByIdQuery);
    db_sql.connection.query(updateReservationByIdQuery)                
        .on('error', function (err) {
            callback({error: true, err: err})
        })
        .on('end', function (err){
            callback({error: false, insertId: reservation.reservationId})
        });
}

function scheduleEmailForReservation(user, reservation) {
    //Doesn't have a callback so that the other data functions can run first.
    //Also don't really want to throw an error if all of the INSERTS worked correctly
    if (user.emailsEnabled == false) {
        console.log("YOUR EMAILS AINT ENABLED BRUH");
    } else {
        var data = {
            user: user,
            reservation: reservation
        };
        agenda.schedule(new Date(reservation.start_time), 'send email', data);
    }
};

module.exports = {
    get_conflicting_reservations:get_conflicting_reservations,
    create_reservation:create_reservation,
    delete_reservation_by_id:delete_reservation_by_id,
    update_reservation_by_id:update_reservation_by_id,
    add_user_reservation_link:add_user_reservation_link
}
