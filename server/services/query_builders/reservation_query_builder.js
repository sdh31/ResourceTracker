var squel = require('squel');

module.exports.buildQueryForGetConflictingReservations = function(reservation) {

    var time_check = generate_conflict_expression(reservation);

    var query = squel.select()
        .from("reservation")
        .where(time_check)
        .where("reservation.resource_id = " + reservation.resource_id)
        //NOTE: If the reservation_id is provided, don't include that reservation in conflicts
    if("reservation_id" in reservation){
        query = query.where("reservation_id !=" + reservation.reservation_id)
    }
    return query.order("reservation.resource_id")
        .toString();
};

module.exports.buildQueryForCreateReservation = function(reservation) {
    return squel.insert()
        .into("reservation")
        .set("start_time", reservation.start_time)
        .set("end_time", reservation.end_time)
        .set("resource_id", reservation.resource_id)
        .toString();
};

module.exports.buildQueryForAddUserReservationLink = function(user, reservation) {
    return squel.insert()
        .into("user_reservation")
        .set("user_id", user.user_id)
        .set("reservation_id", reservation.reservation_id)
        .toString();
};

module.exports.buildQueryForUpdateReservationById = function(reservation) {
    return squel.update()
        .table("reservation")
        .where("reservation_id=" + reservation.reservation_id)
        .set("start_time", reservation.start_time)
        .set("end_time", reservation.end_time)
        .toString();
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
        .join("resource", null, "reservation.resource_id = resource.resource_id")
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
        .join("resource", null, "reservation.resource_id = resource.resource_id")
        .where("user_reservation.user_id = " + user.user_id)
        .toString();
};

var generate_conflict_expression = function(reservation){
    return squel.expr()
        .or_begin()
            .and("reservation.start_time <= " + reservation.end_time)
            .and("reservation.end_time >= " + reservation.start_time)
        .end();
};
