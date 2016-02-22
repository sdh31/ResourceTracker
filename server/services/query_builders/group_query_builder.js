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
        if(group_name in group){
            query = query.set(group_name, group.group_name)
        }
        if(description in group){
            query = query.set(description, group.description)
        }
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

module.exports.buildQueryAddUsersToGroup = function(group){

    var rows_to_add = [];
    for(var i = 0; i < group.user_ids.length; i++){
        console.log(group.user_ids[i]);
        var row = {"group_id": group.group_id, "user_id": group.user_ids[i]};
        rows_to_add.push(row);
    }

    return squel.insert()
        .into(user_group_table)
        .setFieldsRows(rows_to_add)
        .toString()
}

module.exports.buildQueryRemoveUsersFromGroup = function(group){
    var expr = squel.expr();

    for(var i = 0; i < group.user_ids.length; i++){
        expr.or("user_id = " + group.user_ids[i] + " AND group_id = " + group.group_id);
    }

    return squel.delete().from(user_group_table).where(expr).toString();
        
}

module.exports.buildQueryGetUsersFromGroup = function(group){
    return squel.select()
        .from(user_group_table)
        .fields(['username', 'first_name', 'last_name', user_group_table + '.' + user_group_user, user_group_table + '.' + user_group_group])
        .join("user", null, user_group_table + '.' + user_group_user + '= user.user_id')
        .where(user_group_table + '.' + user_group_group + '=?', group.group_id)
        .toString();
}

module.exports.buildQueryForGetAllGroupsForUser = function(user) {
    return squel.select()
        .from(user_group_table)
        .join(group_table, null, "user_group.group_id = permission_group.group_id")
        .where("user_id = " + user.user_id)
        .toString();
}
