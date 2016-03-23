var db_sql = require('./db_wrapper');
//var agenda = require('./agenda');
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

function create_reservation_resources_link(reservation_id, resources, callback) {
    var createReservationResourcesLinkQuery = reservation_query_builder.buildQueryForCreateReservationResourcesLinkQuery(reservation_id, resources);
    basic_db_utility.performSingleRowDBOperation(createReservationResourcesLinkQuery, callback);
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

function update_reservation_by_id(reservation, user, has_auth, callback){
    var updateReservationByIdQuery = reservation_query_builder.buildQueryForUpdateReservationById(reservation, user, has_auth);
    basic_db_utility.performSingleRowDBOperation(updateReservationByIdQuery, callback);
}

function filterAllowedOverlappingReservations(reservations) {

    var confirmedReservations = [];

    for (var i = 0; i<reservations.length; i++) {
        var thisReservation = reservations[i];
        var allConfirmed = true;
        for (var j = 0; j<thisReservation.resources.length; j++) {
            if (!thisReservation.resources[j].is_confirmed) {
                allConfirmed = false;
                break;
            }
        }

        if (allConfirmed) {
            confirmedReservations.push(thisReservation);
        }
    }

    return confirmedReservations;
}

/*function scheduleEmailForReservation(user, reservation) {
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
};*/

function getAllReservationsOnResourceByUsers(resource_id, users, callback) {
    var getAllReservationsOnResourceByUsersQuery = reservation_query_builder.buildQueryForGetAllReservationsOnResourceByUsers(resource_id, users);
    basic_db_utility.performMultipleRowDBOperation(getAllReservationsOnResourceByUsersQuery, callback);
};

function getAllReservationsOnResourcesByUsers(resources, users, callback) {
    var getAllReservationsOnResourcesByUsersQuery = reservation_query_builder.buildQueryForGetAllReservationsOnResourcesByUsers(resources, users);
    basic_db_utility.performMultipleRowDBOperation(getAllReservationsOnResourcesByUsersQuery, callback);
};

function deleteReservationsById(reservations, callback) {
    var deleteReservationsByIdQuery = reservation_query_builder.buildQueryForDeleteReservationsById(reservations);
    basic_db_utility.performSingleRowDBOperation(deleteReservationsByIdQuery, callback);
};

function remove_resource_from_reservation(reservation, user, callback){
    var removeResourceFromReservation = reservation_query_builder.buildQueryForRemoveResourceFromReservation(reservation, user);
    basic_db_utility.performSingleRowDBOperation(removeResourceFromReservation, callback);
}

function getAllReservationsForUser(user, callback) {
    var getAllReservationsForUserQuery = reservation_query_builder.buildQueryForGetAllReservationsForUser(user);
    basic_db_utility.performMultipleRowDBOperation(getAllReservationsForUserQuery, callback);
};

function denyResourceReservation(reservation, user, callback){
    var denyreservationQuery = buildQueryForDenyResourceReservation(reservation, user)
    basic_db_utility.performSingleRowDBOperation(denyreservationQuery, callback);
}

function organizeReservations(reservations) {
    var finalReservations = [];
    var seenReservationIds = [];
    for (var i = 0; i<reservations.length; i++) {
        var thisRow = reservations[i];
        var thisResource = {
            resource_id: thisRow.resource_id,
            name: thisRow.name,
            description: thisRow.description,
            resource_state: thisRow.resource_state,
            is_confirmed: thisRow.is_confirmed
        };
        if (seenReservationIds.indexOf(thisRow.reservation_id) == -1) {
            var reservationToAdd = {
                reservation_id: thisRow.reservation_id,
                start_time: thisRow.start_time,
                end_time: thisRow.end_time,
                resources: [thisResource]
            };
            seenReservationIds.push(thisRow.reservation_id);
            finalReservations.push(reservationToAdd);
        } else {
            for (var j = 0; j<finalReservations.length; j++) {
                if (finalReservations[j].reservation_id == thisRow.reservation_id) {
                    finalReservations[j].resources.push(thisResource);
                }
            }
        }
    }
    
    return finalReservations;
};

module.exports = {
    get_conflicting_reservations:get_conflicting_reservations,
    create_reservation:create_reservation,
    create_reservation_resources_link: create_reservation_resources_link,
    delete_reservation_by_id:delete_reservation_by_id,
    update_reservation_by_id:update_reservation_by_id,
    add_user_reservation_link:add_user_reservation_link,
    get_reservation_by_id: get_reservation_by_id,
    getAllReservationsOnResourcesByUsers: getAllReservationsOnResourcesByUsers,
    //scheduleEmailForReservation: scheduleEmailForReservation,
    getAllReservationsOnResourceByUsers: getAllReservationsOnResourceByUsers,
    deleteReservationsById: deleteReservationsById,
    getAllReservationsForUser: getAllReservationsForUser,
    organizeReservations: organizeReservations,
    remove_resource_from_reservation:remove_resource_from_reservation,
    filterAllowedOverlappingReservations: filterAllowedOverlappingReservations
}
