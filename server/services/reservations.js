var db_sql = require('./db_wrapper');
//var agenda = require('./agenda');
var reservation_query_builder = require('./query_builders/reservation_query_builder');
var basic_db_utility = require('./basic_db_utility');

function get_conflicting_reservations(reservation, callback){
    var getConflictingReservationsQuery = reservation_query_builder.buildQueryForGetConflictingReservations(reservation);
    basic_db_utility.performMultipleRowDBOperation(getConflictingReservationsQuery, callback);
}

function get_reservations_by_resources(body, callback) {
    var reservation = {
        start_time: 0,
        end_time: Number.MAX_VALUE,
        resource_ids: body.resource_ids
    };
    get_conflicting_reservations(reservation, callback);
}

function get_reservation_by_id(reservation, callback){
    var getReservationByIdQuery = reservation_query_builder.buildQueryForGetReservationById(reservation);
    basic_db_utility.performMultipleRowDBOperation(getReservationByIdQuery, callback);
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

function get_unconfirmed_resources_for_reservation(reservation, callback){
    var getUnconfirmedResourcesQuery = reservation_query_builder.buildQueryForGetUnconfirmedResources(reservation);
    basic_db_utility.performMultipleRowDBOperation(getUnconfirmedResourcesQuery, callback);
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

function remove_resource_from_reservation(reservation, user, has_auth, callback){
    var removeResourceFromReservation = reservation_query_builder.buildQueryForRemoveResourceFromReservation(reservation, user);
    basic_db_utility.performSingleRowDBOperation(removeResourceFromReservation, callback);
}

function getAllReservationsForUser(user, callback) {
    var getAllReservationsForUserQuery = reservation_query_builder.buildQueryForGetAllReservationsForUser(user);
    basic_db_utility.performMultipleRowDBOperation(getAllReservationsForUserQuery, callback);
};

function filterResourcesByPermission(resources, minPermission) {
    var resourcesWithPermission = [];
    console.log(minPermission)
    for (var i = 0; i<resources.length; i++) {
        if ((resources[i].resource_permission >= minPermission) && resourcesWithPermission.indexOf(resources[i].resource_id) == -1) {
            resourcesWithPermission.push(resources[i].resource_id);
        }
    }

    return resourcesWithPermission;
};

function getOverlappingReservationsByResource(reservation, callback){
    var getoverlappingQuery = reservation_query_builder.buildQueryForGetOverlappingReservationsByResource(reservation)
    basic_db_utility.performMultipleRowDBOperation(getoverlappingQuery, callback)
}

function denyResourceReservation(reservation, user, callback){
    var denyReservationQuery = reservation_query_builder.buildQueryForDenyResourceReservation(reservation, user)
    basic_db_utility.performSingleRowDBOperation(denyReservationQuery, callback);
}

function deleteConflictingReservations(reservation, callback){
    var deleteConflictingReservationQuery = reservation_query_builder.buildQueryForDeleteConflictingReservations(reservation);
    basic_db_utility.performSingleRowDBOperation(deleteConflictingReservationQuery, callback)
}

function confirmResourceReservation(reservation, user, callback){
    var confirmReservationQuery = reservation_query_builder.buildQueryForConfirmResource(reservation, user)
    basic_db_utility.performSingleRowDBOperation(confirmReservationQuery, callback);
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
                reservation_title: thisRow.reservation_title,
                reservation_description: thisRow.reservation_description,
                user: {
                    first_name: thisRow.first_name,
                    last_name: thisRow.last_name,
                    email_address: thisRow.email_address,
                    emails_enabled: thisRow.emails_enabled,
                    username: thisRow.username,
                    user_id: thisRow.user_id
                },
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
    get_reservations_by_resources: get_reservations_by_resources,
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
    filterAllowedOverlappingReservations: filterAllowedOverlappingReservations,
    filterResourcesByPermission: filterResourcesByPermission,
    denyResourceReservation: denyResourceReservation,
    confirmResourceReservation: confirmResourceReservation,
    deleteConflictingReservations:deleteConflictingReservations,
    get_unconfirmed_resources_for_reservation:get_unconfirmed_resources_for_reservation,
    getOverlappingReservationsByResource: getOverlappingReservationsByResource
}
