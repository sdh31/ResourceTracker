var squel = require('squel');

module.exports.buildQueryForCreateUser = function(user, hash) {
    return squel.insert().into("user")
            .set("username", user.username)
            .set("password", hash)
            //.set("permission_level", user.permission_level)
            .set("first_name", user.first_name)
            .set("last_name", user.last_name)
            .set("email_address", user.email_address)
            .set("is_shibboleth", user.is_shibboleth)
            .toString();
};

module.exports.buildQueryForGetUserPermissions = function(user){
     return squel.select()
                .field("user.username")
                .field("user.first_name")
                .field("user.last_name")
                .field("user.user_id")
                .field("user.password")
                .field("user.is_shibboleth")
                .field("user.email_address")
                .field("user.emails_enabled")
                .field("permission_group.group_id")
                .field("permission_group.group_name")
                .field("permission_group.user_management_permission")
                .field("permission_group.resource_management_permission")
                .field("permission_group.reservation_management_permission")
                .field("permission_group.is_private")
                .from("user")
                .left_join("user_group", null, "user_group.user_id = user.user_id")
                .left_join("permission_group", null, "permission_group.group_id = user_group.group_id")
                .where("username = ?", user.username)
                .toString();
};

module.exports.buildQueryForDeleteUser = function(username) {
    return squel.delete()
                .from("user")
                .where("username = '" + username + "'")
                .toString();
};

module.exports.buildQueryForDeletePrivateGroup = function(group_name) {
    return squel.delete()
            .from("permission_group")
            .where("group_name = '" + group_name + "'")
            .toString();
};

module.exports.buildQueryForGetAllUsers = function() {

    return squel.select()
        .field("user.username")
        .field("user.first_name")
        .field("user.last_name")
        .field("user.user_id")
        .field("user.email_address")      
        .from("user")
        .toString();
};

module.exports.buildQueryForGetPrivateGroup = function(user_id) {

    return squel.select()
        .field("user_group.user_id")
        .field("user_group.group_id")
        .from("user_group")
        .left_join("permission_group", null, "permission_group.group_id = user_group.group_id")
        .where("user_id = " + user_id + " AND " + "is_private = 1")
        .toString();
};

module.exports.buildQueryForGetAdminGroup = function() {

    return squel.select()
        .field("user_group.user_id")
        .field("user_group.group_id")
        .from("user_group")
        .left_join("permission_group", null, "permission_group.group_id = user_group.group_id")
        .left_join("user", null, "user_group.user_id = user.user_id")
        .where("permission_group.is_private = 1 AND user.username = " + "'admin'")
        .toString();
};
