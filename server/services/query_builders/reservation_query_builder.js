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
        .where("reservation.reservation_id = " + reservation.reservation_id)
        .toString();
};

var generate_conflict_expression = function(reservation){
    return squel.expr()
        .or_begin()
            .and("reservation.start_time <= " + reservation.end_time)
            .and("reservation.end_time >= " + reservation.start_time)
        .end();
};
