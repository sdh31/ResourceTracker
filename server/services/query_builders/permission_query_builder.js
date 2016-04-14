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
var user_group_group = "group_id";

module.exports.buildQueryForSystemPermissionChecks = function(user){
    return squel.select()
        .from(user_table)
        .field("user.email_address")
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

    var group_filter = buildGroupFilter(group_ids);
    //group_filter.and("resource.resource_id = " + resource_id);

    return squel.select()
        .from("permission_group")
        .join("resource_group", null, "permission_group.group_id = resource_group.group_id")
        .join("resource", null, "resource_group.resource_id = resource.resource_id")
        .where(group_filter)
        .where("resource.resource_id = " + resource_id)
        .toString();
};

module.exports.buildQueryForCheckPermissionForResources = function (resources, group_ids) {

    var group_filter = buildGroupFilter(group_ids);

    var resource_filter = squel.expr();//group_filter.and_begin();
    for (i = 0; i < resources.length; i++){
        resource_filter.or("resource.resource_id = " + resources[i].resource_id);
    }

    return squel.select()
        .from("permission_group")
        .join("resource_group", null, "permission_group.group_id = resource_group.group_id")
        .join("resource", null, "resource_group.resource_id = resource.resource_id")
        .where(group_filter)
        .where(resource_filter)
        .toString();
};

module.exports.buildQueryForGetAncestorsWithPermission = function(body){
    var where_expression = squel.expr().or_begin();
    for (var i = 0; i < body.group_ids.length; i++){
        where_expression.or("resource_group.group_id = " + body.group_ids[i]);
    }
    where_expression.end()
    where_expression.and("folder_tree.descendant_id=" +  body.resource_id)
    where_expression.and("folder_tree.descendant_id != folder_tree.ancestor_id")
        
    //Root resource always has priveliges
    var query = squel.select()
        .from("folder_tree")
        .join("resource_group", null, "resource_group.resource_id=folder_tree.ancestor_id")
        .where(where_expression)
        .order("ancestor_id")
    return query.toString()
}

var buildGroupFilter = function(group_ids){
    var group_filter = squel.expr();
    for (var i = 0; i < group_ids.length; i++){
        group_filter.or("permission_group.group_id = " + group_ids[i]);
    }
    return group_filter
}