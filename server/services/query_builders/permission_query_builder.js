var squel = require('squel');
var group_q = require('./group_query_builder')
var user_table = "user";
var user_id = "user_id";

var group_table = "permission_group";
var group_id = "group_id";
var group_name = "group_name";
var description = "group_description";
var user_permission = "user_management_permission";
var resource_permission = "resource_management_permission";
var reservation_permission = "reservation_management_permission";
var private_group = "is_private"

var user_group_table = "user_group";
var user_group_user = "user_id";
var user_group_group = "group_id"


module.exports.buildQueryForSystemPermissionChecks = function(user){
    return squel.select()
        .from(user_table)
        .field(user_permission)
        .field(resource_permission)
        .field(reservation_permission)
        .field(group_name)
        .join(user_group_table, null, user_group_table+'.'+user_id+'='+user_table+'.'+user_id)
        .join(group_table, null, user_group_table+'.'+group_id+'='+group_table+'.'+group_id)
        .where(user_group_table+'.'+user_id+'= ?', user.user_id)
        .toString();
};

module.exports.buildQueryForCheckPermissionForResource = function (resource_id, group_ids) {

    var group_filter = squel.expr();
    for (var i = 0; i < group_ids.length; i++){
        group_filter.or("permission_group.group_id = '" + group_ids[i] + "'");
    }

    group_filter.and("resource.resource_id = " + resource_id);

    return squel.select()
        .from("permission_group")
        .join("resource_group", null, "permission_group.group_id = resource_group.group_id")
        .join("resource", null, "resource_group.resource_id = resource.resource_id")
        .where(group_filter)
        .toString();
};
