var squel = require('squel');

module.exports.buildQueryForCreateUser = function(user, hash) {
    return squel.insert().into("user")
            .set("username", user.username)
            .set("password", hash)
            .set("permission_level", user.permission_level)
            .set("first_name", user.firstName)
            .set("last_name", user.lastName)
            .set("email_address", user.email)
            .toString();
};

module.exports.buildQueryForGetUser = function(username) {
   return squel.select()
                .field("resource.name")
                .field("resource.resource_id")
                .field("resource.description")
                .field("resource.max_users")
                .field("resource.created_by")
                .field("tag.tag_name")
                .field("reservation.reservation_id")
                .field("reservation.start_time")
                .field("reservation.end_time")
                .field("user.username")
                .field("user.first_name")
                .field("user.last_name")
                .field("user.user_id")
                .field("user.password")
                .field("user.permission_level")
                .from("user")
                .left_join("user_reservation", null, "user.user_id = user_reservation.user_id")
                .left_join("reservation", null, "user_reservation.reservation_id = reservation.reservation_id")
                .left_join("resource", null, "reservation.resource_id = resource.resource_id")
                .left_join("resource_tag", null, "resource.resource_id = resource_tag.resource_id")
                .left_join("tag", null, "resource_tag.tag_id = tag.tag_id")
                .where("username = '" + username + "'")
                .toString();
};

module.exports.buildQueryForDeleteUser = function(username) {
    return squel.delete()
                .from("user")
                .where("username = '" + username + "'")
                .toString();
};
