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

module.exports.buildQueryForCheckPermissionForResource = function (user_id, resource_id) {
    return squel.select()
        .from(user_group_table)
        .where(user_id + " = " + user_id + " AND " + resource_id + " = " + resource_id)
        .toString();
};
