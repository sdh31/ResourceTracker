var squel = require('squel').useFlavour('mysql');;

var group_table = "permission_group";
var group_id = "group_id";
var group_name = "group_name";
var description = "group_description";
var user_permission = "user_management_permission";
var resource_permission = "resource_management_permission";
var reservation_permission = "reservation_management_permission";
var private_group = "is_private";

var user_group_table = "user_group";
var user_group_user = "user_id";
var user_group_group = "group_id";

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
	// TODO: make setting group_name and group_description optional
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

module.exports.buildQueryAddUserToGroup = function(group){  
    return squel.insert()
        .into(user_group_table)
        .fromQuery(
            ['user_id', user_group_group],
            squel.select()
                .fields(['user_id', group.group_id.toString()])
                .from('user')
                .where('username = ?', group.username)
        )
        .toString()
}

module.exports.buildQueryRemoveUserFromGroup = function(group){
    return squel.delete()
        .target(user_group_table)
        .from(user_group_table)
        .join("user", null, user_group_table + '.' + user_group_user + '= user.user_id')
        .where('user.username = ?', group.username)
        .where(user_group_table + '.' + user_group_group + '= ?', group.group_id)
        .toString();
}

module.exports.buildQueryGetUsersFromGroup = function(group){
    return squel.select()
        .from(user_group_table)
        .fields(['username', user_group_table + '.' + user_group_user, user_group_table + '.' + user_group_group])
        .join("user", null, user_group_table + '.' + user_group_user + '= user.user_id')
        .where(user_group_table + '.' + user_group_group + '=?', group.group_id)
        .toString()
}
