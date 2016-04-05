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

function get_overbooked_reservations_from_conflicts(reservation_conflicts, sharing_level){
    var conflicts_per_reservation_id = {}
    var overbooked_resources = []
    var reservation_titles = {}

    //initialize everything
    for(var i = 0; i<reservation_conflicts.length;i++){
        conflicts_per_reservation_id[reservation_conflicts[i].id1] = 1;
        reservation_titles[reservation_conflicts[i].id1] = reservation_conflicts[i].title1
        conflicts_per_reservation_id[reservation_conflicts[i].id2] = 1;
        reservation_titles[reservation_conflicts[i].id2] = reservation_conflicts[i].title2

    }
    //count total conflicts for each reservation
    for (var i = 0; i < reservation_conflicts.length; i++){
        var id1 = reservation_conflicts[i].id1;
        var id2 = reservation_conflicts[i].id2;
        conflicts_per_reservation_id[id1] ++;
        conflicts_per_reservation_id[id2] ++;
    }
    //find and return overbooked resources
    for(var reservation_id in conflicts_per_reservation_id){
        reservation = {}
        if(conflicts_per_reservation_id[reservation_id] > sharing_level){
            reservation['reservation_title'] = (reservation_titles[reservation_id])
            reservation['reservation_id'] = reservation_id
            overbooked_resources.push(reservation)
        }
    }
    return overbooked_resources;
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

function filter_unconfirmed_overbooked_resources(reservations){
    var sharing_check = {};
    var unconfirmed_reservations = [];
    for (var i = 0; i<reservations.length; i++){
         var thisReservation = reservations[i];
        for (var j = 0; j<thisReservation.resources.length; j++) {
            if(!sharing_check[j]){
                //Initialize sharing_check value to 1 -- we have found a reservation on that resource
                sharing_check[j] = 1;
            }
            if(thisReservation.resources[j].is_confirmed){
                sharing_check[j] ++;
            }
        }
    }
    for (var i = 0; i<reservations.length; i++) {
        var thisReservation = reservations[i];
        var theseResources = thisReservation.resources;
        for (var j = 0; j<thisReservation.resources.length; j++) {
            if((sharing_check[j] >= theseResources[j].sharing_level)){
                if(!theseResources[j].is_confirmed){
                    unconfirmed_reservations.push(thisReservation)
                    break;
                }
            }
        }
    }
    return unconfirmed_reservations
}

function filterAllowedOverlappingReservations(reservations) {
    //Gets rid of the allowed ones
    var confirmedReservations = [];
    var sharing_check = {};
    var is_overbooked;
    for (var i = 0; i<reservations.length; i++) {
        var thisReservation = reservations[i];
        var allConfirmed = true;
        is_overbooked = false;
        for (var j = 0; j<thisReservation.resources.length; j++) {
            if(!sharing_check[j]){
                //Initialize sharing_check value to 1 -- we have found a reservation on that resource
                sharing_check[j] = 1
            }
            if (!thisReservation.resources[j].is_confirmed) {
                allConfirmed = false;
                break;
            }
            else{
                sharing_check[j] ++;
            }
            //update number of shared reservations on each resource -- if too many, don't filter
            if(sharing_check[j] > thisReservation.resources[j].sharing_level){
                is_overbooked = (true || is_overbooked);
            }
        }
        if (allConfirmed && is_overbooked) {
            confirmedReservations.push(thisReservation);
        }
    }

    return confirmedReservations;
}

function get_unconfirmed_resources_for_reservation(reservation, callback){
    var getUnconfirmedResourcesQuery = reservation_query_builder.buildQueryForGetUnconfirmedResources(reservation);
    basic_db_utility.performMultipleRowDBOperation(getUnconfirmedResourcesQuery, callback);
}

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

function remove_resources_from_reservation(reservation, user, has_auth, callback){
    var removeResourcesFromReservation = reservation_query_builder.buildQueryForRemoveResourcesFromReservation(reservation, user);
    basic_db_utility.performSingleRowDBOperation(removeResourcesFromReservation, callback);
}

function getAllReservationsForUser(user, callback) {
    var getAllReservationsForUserQuery = reservation_query_builder.buildQueryForGetAllReservationsForUser(user);
    basic_db_utility.performMultipleRowDBOperation(getAllReservationsForUserQuery, callback);
};

function filterResourcesByPermission(resources, minPermission) {
    var resourcesWithPermission = [];
    for (var i = 0; i<resources.length; i++) {
        if ((resources[i].resource_permission >= minPermission) && resourcesWithPermission.indexOf(resources[i].resource_id) == -1) {
            resourcesWithPermission.push(resources[i].resource_id);
        }
    }
    return resourcesWithPermission;
};

//Only_confirmed specifies if you only want to return conflicts in confirmed reservations
function getOverlappingReservationsByResource(reservation, only_confirmed, callback){
    var getoverlappingQuery = reservation_query_builder.buildQueryForGetOverlappingReservationsByResource(reservation, only_confirmed)
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

function confirmAllReservationsOnResource(resource, callback) {
    var confirmAllReservationsOnResourceQuery = reservation_query_builder.buildQueryForConfirmAllReservationsOnResource(resource);
    basic_db_utility.performSingleRowDBOperation(confirmAllReservationsOnResourceQuery, callback);
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
            sharing_level: thisRow.sharing_level,
            is_folder: thisRow.is_folder,
            parent_id: thisRow.parent_id,
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

function removeUsersThatHaveReservePermission(allUsers, allGroupsForUsers, resourcePermissions) {

    var groupsThatHaveReservePermission = [];

    for (var i = 0; i<resourcePermissions.length; i++) {
        if (resourcePermissions[i].resource_permission >= 1) {
            groupsThatHaveReservePermission.push(resourcePermissions[i].group_id);
        }
    }

    for (i = 0; i<allGroupsForUsers.length; i++) {
        if (groupsThatHaveReservePermission.indexOf(allGroupsForUsers[i].group_id) != -1) {
            for (var j = 0; j < allUsers.length; j++) {
                if (allUsers[j].user_id == allGroupsForUsers[i].user_id) {
                    allUsers.splice(j, 1);
                    break;
                }
            }
        }
    }
    return allUsers;
}

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
    getAllReservationsOnResourceByUsers: getAllReservationsOnResourceByUsers,
    deleteReservationsById: deleteReservationsById,
    getAllReservationsForUser: getAllReservationsForUser,
    organizeReservations: organizeReservations,
    remove_resources_from_reservation:remove_resources_from_reservation,
    filterAllowedOverlappingReservations: filterAllowedOverlappingReservations,
    filterResourcesByPermission: filterResourcesByPermission,
    denyResourceReservation: denyResourceReservation,
    confirmResourceReservation: confirmResourceReservation,
    deleteConflictingReservations:deleteConflictingReservations,
    get_unconfirmed_resources_for_reservation:get_unconfirmed_resources_for_reservation,
    getOverlappingReservationsByResource: getOverlappingReservationsByResource,
    confirmAllReservationsOnResource: confirmAllReservationsOnResource,
    removeUsersThatHaveReservePermission: removeUsersThatHaveReservePermission,
    filter_unconfirmed_overbooked_resources:filter_unconfirmed_overbooked_resources,
    get_overbooked_reservations_from_conflicts:get_overbooked_reservations_from_conflicts
}
