var squel = require('squel').useFlavour('mysql');

module.exports.buildQueryForGetConflictingReservations = function(reservation) {

    var time_check = generate_conflict_expression(reservation);

    var resource_filter = squel.expr();
    
    if("resource_ids" in reservation){
    	for (var i = 0; i < reservation.resource_ids.length; i++){
            resource_filter.or("reservation_resource.resource_id = " + reservation.resource_ids[i]);
        }
    }
    else if("resource_id" in reservation){
        resource_filter.or("reservation_resource.resource_id = " + reservation.resource_id);
    }

    var query = squel.select()
        .from("reservation")
        .join("reservation_resource", null, "reservation.reservation_id = reservation_resource.reservation_id")
        .where(time_check)
        .where(resource_filter)
        //NOTE: If the reservation_id is provided, don't include that reservation in conflicts
    if("reservation_id" in reservation){
        query = query.where("reservation.reservation_id !=" + reservation.reservation_id)
    }
    return query.order("reservation.reservation_id")
        .toString();
};

module.exports.buildQueryForCreateReservation = function(reservation) {
    return squel.insert()
        .into("reservation")
        .set("start_time", reservation.start_time)
        .set("end_time", reservation.end_time)
        .set("reservation_title", reservation.reservation_title)
        .set("reservation_description", reservation.reservation_description)
        .toString();
};

module.exports.buildQueryForAddUserReservationLink = function(user, reservation) {
    return squel.insert()
        .into("user_reservation")
        .set("user_id", user.user_id)
        .set("reservation_id", reservation.reservation_id)
        .toString();
};

module.exports.buildQueryForCreateReservationResourcesLinkQuery = function(reservation_id, resources) {
    var rows_to_add = [];
    for(var i = 0; i < resources.length; i++){
        var row = {"reservation_id": reservation_id, "resource_id": resources[i].resource_id, "is_confirmed": resources[i].resource_state == "free"};
        rows_to_add.push(row);
    }

    return squel.insert()
        .into('reservation_resource')
        .setFieldsRows(rows_to_add)
        .toString();
};

module.exports.buildQueryForUpdateReservationById = function(reservation, user, has_auth) {
    var query = squel.update()
        .table("reservation inner join user_reservation on user_reservation.reservation_id = reservation.reservation_id")
        .where("reservation.reservation_id=" + reservation.reservation_id)
        .where("start_time <= ?", reservation.start_time)
        .where("end_time >= ?", reservation.end_time)
        .set("start_time", reservation.start_time)
        .set("end_time", reservation.end_time)

        if("reservation_title" in reservation){
            query.set("reservation_title", reservation.reservation_title)
        }
        if("reservation_description" in reservation){
            query.set("reservation_description", reservation.reservation_description)
        }

        if(!has_auth){
            query.where("user_id = ?", user.user_id)
        }
        return query.toString();
};

module.exports.buildQueryForDeleteReservationById = function(reservation) {
	return squel.delete()
        .from("reservation")
        .where("reservation_id =" + reservation.reservation_id)
        .toString();
};

module.exports.buildQueryForGetReservationById = function(reservation) {
    return squel.select()
        .from("reservation")
        .join("user_reservation", null, "user_reservation.reservation_id = reservation.reservation_id")
        .left_join("reservation_resource", null, "reservation.reservation_id = reservation_resource.reservation_id")
        .left_join("resource", null, "reservation_resource.resource_id = resource.resource_id")
        .join("user", null, "user_reservation.user_id = user.user_id")
        .where("reservation.reservation_id = " + reservation.reservation_id)
        .toString();
};

module.exports.buildQueryForGetAllReservationsOnResourceByUsers = function(resource_id, users) {

    var user_filter = squel.expr();
	for (var i = 0; i < users.length; i++){
        user_filter.or("user_reservation.user_id = " + users[i].user_id);
    }
    user_filter.and("reservation.resource_id = " + resource_id);

    return squel.select()
        .from("reservation")
        .join("user_reservation", null, "user_reservation.reservation_id = reservation.reservation_id")
        .join("resource", null, "reservation.resource_id = resource.resource_id")
        .join("user", null, "user_reservation.user_id = user.user_id")
        .where(user_filter)
        .toString();

};

module.exports.buildQueryForGetAllReservationsOnResourcesByUsers = function(resources, users) {
    var user_filter = squel.expr();
	for (var i = 0; i < users.length; i++){
        user_filter.or("user_reservation.user_id = " + users[i].user_id);
    }

    user_filter.and_begin();
    for (i = 0; i < resources.length; i++){
        user_filter.or("reservation.resource_id = " + resources[i].resource_id);
    }
    user_filter.end();

    return squel.select()
        .from("reservation")
        .join("user_reservation", null, "user_reservation.reservation_id = reservation.reservation_id")
        .join("resource", null, "reservation.resource_id = resource.resource_id")
        .join("user", null, "user_reservation.user_id = user.user_id")
        .where(user_filter)
        .toString();
};

module.exports.buildQueryForDeleteReservationsById = function(reservations) {
    
    var reservation_filter = squel.expr();
	for (var i = 0; i < reservations.length; i++){
        reservation_filter.or("reservation_id = " + reservations[i].reservation_id);
    }

    return squel.delete()
        .from("reservation")
        .where(reservation_filter)
        .toString();
};

module.exports.buildQueryForGetAllReservationsForUser = function(user) {
    return squel.select()
        .from("reservation")
        .join("user_reservation", null, "reservation.reservation_id = user_reservation.reservation_id")
        .left_join("reservation_resource", null, "reservation.reservation_id = reservation_resource.reservation_id")
        .left_join("resource", null, "reservation_resource.resource_id = resource.resource_id")
        .where("user_reservation.user_id = " + user.user_id)
        .toString();
};

module.exports.buildQueryForRemoveResourceFromReservation = function(reservation, user) {
    return squel.delete()
        .target("reservation_resource")
        .from("reservation_resource")
        .join("user_reservation", null, "reservation_resource.reservation_id = user_reservation.reservation_id")
        .where("reservation_resource.reservation_id = ?", reservation.reservation_id)
        .where("resource_id = ?", reservation.resource_id)
        .where("user_id = ?", user.user_id)
        .toString()
}

module.exports.buildQueryForDenyResourceReservation = function(reservation, user){
    return squel.delete()
        .target("reservation")
        .from("reservation")
        .join("reservation_resource")
        .join("resource")
        .join("resource_group")
        .join("user_group")
        .where("reservation_resource.is_confirmed = ?", false)
        .where("reservation.resource_state = ?", "restricted")
        .where("resource_group.resource_permission = ?", "manage")
        .where("user_group.user_id = ?", user.user_id)

}
var generate_conflict_expression = function(reservation){
    return squel.expr()
        .or_begin()
            .and("reservation.start_time <= " + reservation.end_time)
            .and("reservation.end_time >= " + reservation.start_time)
        .end();
};
