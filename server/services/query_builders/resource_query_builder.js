var squel = require('squel');

module.exports.buildQueryForGetResourceById = function(resource) {
    var query = squel.select().from("resource");

    if("resource_id" in resource){
      query = query.where("resource_id = '" + resource.resource_id + "'");
    }

    return query.toString();
};

module.exports.buildQueryForCreateResource = function(resource) {
    return squel.insert()
		.into('resource')
		.set("name", resource.name)
		.set("description", resource.description)
		.set("max_users", resource.max_users)
		.toString();
};

module.exports.buildQueryForUpdateResource = function(resource) {

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

    return query.toString();
};

module.exports.buildQueryForCheckReservationsOnDeleteResource = function(resource) {
    return squel.select()
            .from("reservation")
            .left_join("user_reservation", null, "reservation.reservation_id = user_reservation.reservation_id")
            .left_join("resource", null, "reservation.resource_id = resource.resource_id")
            .left_join("user", null, "user_reservation.user_id = user.user_id")
            .where("reservation.resource_id = '" + resource.resource_id + "'")
            .toString();
};

module.exports.buildQueryForDeleteResource = function(resource_id) {
    return squel.delete()
    .from("resource")
    .where("resource_id = " + resource_id)
    .toString();
};
