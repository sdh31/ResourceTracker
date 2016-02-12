var squel = require('squel');

var group_table = "permission_group";
var group_id = "group_id";
var group_name = "group_name";
var description = "group_description";
var user_permission = "user_management_permission";
var resource_permission = "resource_management_permission";
var reservation_permission = "reservation_management_permission";
var private_group = "is_private"

module.exports.buildQueryCreateGroups = function(group){
    var query = squel.insert()
        .into(group_table)
        .set(group_name, group.name)
        .set(description, group.description)
        if(user_permission in group){
            query = query.set(user_permission, group.user_management_permission)
        }
        if(resource_permission in group){
           query = query.set(resource_permission, group.resource_management_permission)
        }
        if(reservation_permission in group){
            query = query.set(reservation_permission, group.reservation_management_permission)
        }
        query = query.set(private_group, group.is_private)
        query = query.toString()
        return query;
}

module.exports.buildQueryDeleteGroups = function(group){
    return query = squel.delete()
        .from(group_table)
        .where(group_id + "= ?", group.group_id)
        .toString()
}

module.exports.buildQueryUpdateGroups = function(group){
    var query  = squel.update()
        .table(group_table)
        .where(group_id + "=?", group.group_id)
        .set(group_name, group.group_name)
        .set(description, group.description)
         if(user_permission in group){
            query = query.set(user_permission, group.user_management_permission)
        }
        if(resource_permission in group){
           query = query.set(resource_permission, group.resource_management_permission)
        }
        if(reservation_permission in group){
            query = query.set(reservation_permission, group.reservation_management_permission)
        }
        query = query.toString()
        return query
}

module.exports.buildQueryGetGroups = function(group){
    var query = squel.select()
        .from(group_table)
    if(group_id in group){
        query = query.where(group_id + "= ?", group.group_id)
    }
    return query.toString()
}