var squel = require('squel');

module.exports.buildQueryForGetResourceById = function(resource) {
    var query = squel.select().from("resource");

    if("resource_id" in resource){
      query = query.where("resource_id = '" + resource.resource_id + "'");
    }

    return query.toString();
};

module.exports.buildQueryForGetResourcesByIds = function (resource_ids) {
    
    var resourceIdFilter = squel.expr();

    for (var i = 0; i<resource_ids.length; i++) {
        resourceIdFilter.or("resource_id = " + resource_ids[i]);
    }

    return squel.select().from("resource").where(resourceIdFilter).toString();
};

module.exports.buildQueryForCreateResource = function(resource) {
    return squel.insert()
		.into('resource')
		.set("name", resource.name)
		.set("description", resource.description)
		.set("resource_state", resource.resource_state)
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

    if (("resource_state" in resource)){
        query.set("resource_state", resource.resource_state);
    }

    return query.toString();
};

module.exports.buildQueryForCheckReservationsOnDeleteResource = function(resource) {
    return squel.select()
            .from("reservation")
            .left_join("user_reservation", null, "reservation.reservation_id = user_reservation.reservation_id")
            .left_join("reservation_resource", null, "reservation.reservation_id = reservation_resource.reservation_id")
            .left_join("resource", null, "reservation_resource.resource_id = resource.resource_id")
            .left_join("user", null, "user_reservation.user_id = user.user_id")
            .where("reservation_resource.resource_id = '" + resource.resource_id + "'")
            .toString();
};

module.exports.buildQueryForDeleteResource = function(resource_id) {
    return squel.delete()
    .from("resource")
    .where("resource_id = " + resource_id)
    .toString();
};

//body contains resource_id, group_ids, resource_permissions
module.exports.buildQueryForAddGroupPermissionToResource = function(body) {

    var rows_to_add = [];
    for(var i = 0; i < body.group_ids.length; i++){
        var row = {"resource_id": body.resource_id, "group_id": body.group_ids[i], "resource_permission": body.resource_permissions[i]};
        rows_to_add.push(row);
    }

    return squel.insert()
        .into('resource_group')
        .setFieldsRows(rows_to_add)
        .toString();
};

// body contains resource_id, group_ids
module.exports.buildQueryForRemoveGroupPermissionToResource = function(body) {

    var expr = squel.delete().from("resource_group");

    for(var i = 0; i < body.group_ids.length; i++){
        expr.where("group_id = " + body.group_ids[i] + " AND resource_id = " + body.resource_id);
    }

    return expr.toString();
};

// body contains resource_id
module.exports.buildQueryForGetGroupPermissionToResource = function(body) {

    return squel.select()
            .from("resource_group")
            .where("resource_id = " + body.resource_id)
            .toString();
};

