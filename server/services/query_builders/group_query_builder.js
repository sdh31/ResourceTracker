var squel = require('squel');

var group_table = "group";
var name_field = "name";
var description = "description";
var user_permission = "user_management_permission";
var resource_permission = "resource_management_permission";
var reservation_permission = "reservation_management_permission";
var private_group = "is_private"

module.exports.buildQueryCreateGroups = function(group){
    return query = squel.insert()
        .into(group_table)
        .set(name_field, group.name)
        .set(description, group.description)
        if(user_permission in group){
            query = query.set(user_permission, group.user_management_permission)
        }
        if(resource_permission in group){
           query = query.set(resource_permission, group.resource_management_permission)
        }
        if(reservation_permission in group){
            query = query.set(reservation_permission, group.reservation_permission)
        }
        query = query.set(private_group, group.is_private)
        .toString();

}