var db_sql = require('./db_wrapper');
var agenda = require('./agenda');
var reservation_query_builder = require('./query_builders/reservation_query_builder');
var basic_db_utility = require('./basic_db_utility');

function get_conflicting_reservations(reservation, callback){
    var getConflictingReservationsQuery = reservation_query_builder.buildQueryForGetConflictingReservations(reservation);
    basic_db_utility.performMultipleRowDBOperation(getConflictingReservationsQuery, callback);
}

function get_reservation_by_id(reservation, callback){
    var getReservationByIdQuery = reservation_query_builder.buildQueryForGetReservationById(reservation);
    basic_db_utility.performSingleRowDBOperation(getReservationByIdQuery, callback);
}

function create_reservation(user, reservation, callback){
    var createReservationQuery = reservation_query_builder.buildQueryForCreateReservation(reservation);
    basic_db_utility.performSingleRowDBOperation(createReservationQuery, callback);
}

function add_user_reservation_link(user, reservation, callback){
    var addUserReservationLinkQuery = reservation_query_builder.buildQueryForAddUserReservationLink(user, reservation);
    basic_db_utility.performSingleRowDBOperation(addUserReservationLinkQuery, callback);
}

function delete_reservation_by_id(reservation, callback){
    var deleteReservationByIdQuery = reservation_query_builder.buildQueryForDeleteReservationById(reservation);
    basic_db_utility.performSingleRowDBOperation(deleteReservationByIdQuery, callback);
}

function update_reservation_by_id(reservation, callback){
    var updateReservationByIdQuery = reservation_query_builder.buildQueryForUpdateReservationById(reservation);
    basic_db_utility.performSingleRowDBOperation(updateReservationByIdQuery, callback);
}

function scheduleEmailForReservation(user, reservation) {
    //Doesn't have a callback so that the other data functions can run first.
    //Also don't really want to throw an error if all of the INSERTS worked correctly
    if (!user.emails_enabled) {
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
    add_user_reservation_link:add_user_reservation_link,
    get_reservation_by_id: get_reservation_by_id,
    scheduleEmailForReservation: scheduleEmailForReservation
}
