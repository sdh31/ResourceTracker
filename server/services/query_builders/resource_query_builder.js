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
        .set("sharing_level", resource.sharing_level)
        .set("is_folder", resource.is_folder)
        .set("parent_id", resource.parent_id)
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

    if (("sharing_level" in resource)){
        query.set("sharing_level", resource.sharing_level);
    }

    if (("is_folder" in resource)){
        query.set("is_folder", resource.is_folder);
    }

    if (("parent_id" in resource)){
        query.set("parent_id", resource.parent_id);
    }

    return query.toString();
};

module.exports.buildQueryForGetAllAncestors = function(body) {
    return squel.select()
        .from("resource")
        .join("folder_tree", null, "resource.resource_id = folder_tree.ancestor_id")
        .where("folder_tree.descendant_id = " + body.resource_id)
        .toString();
};

module.exports.buildQueryForInsertIntoFolderTree = function(descendant_id, ancestor_ids, path_lengths) {
    var rows_to_add = [];
    for(var i = 0; i < ancestor_ids.length; i++){
        var row = {"descendant_id": descendant_id, "ancestor_id": ancestor_ids[i], "path_length": path_lengths[i]};
        rows_to_add.push(row);
    }

    return squel.insert()
        .into('folder_tree')
        .setFieldsRows(rows_to_add)
        .toString();
};

module.exports.buildQueryForGetAllDirectChildren = function(user, resource) {
    return squel.select()
        .from("resource")
        .join("folder_tree", null, "resource.resource_id = folder_tree.descendant_id")
        .join("resource_group", null, "resource_group.resource_id = resource.resource_id")
        .join("permission_group", null, "resource_group.group_id = permission_group.group_id")
        .join("user_group", null, "user_group.group_id = permission_group.group_id")
        .join("user", null, "user_group.user_id = user.user_id")
        .where("folder_tree.ancestor_id = " + resource.resource_id + " AND folder_tree.path_length = 1")
        .toString();
};

module.exports.buildQueryForGetSubtree = function(user, resource) {
    return squel.select()
        .from("resource")
        .join("folder_tree", null, "resource.resource_id = folder_tree.descendant_id")
        .join("resource_group", null, "resource_group.resource_id = resource.resource_id")
        .join("permission_group", null, "resource_group.group_id = permission_group.group_id")
        .join("user_group", null, "user_group.group_id = permission_group.group_id")
        .join("user", null, "user_group.user_id = user.user_id")
        .where("folder_tree.ancestor_id = " + resource.resource_id + " AND user.user_id = " + user.user_id)
        .toString();
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

// body has group_id, resource_id, resource_permission
module.exports.buildQueryForUpdateGroupPermissionToResource = function(body) {

    return squel.update()
        .table("resource_group")
        .set("resource_permission", body.resource_permission)
        .where("resource_id = " + body.resource_id + " AND group_id = " + body.group_id)
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

// body contains resource_ids, group_ids
module.exports.buildQueryForRemoveGroupsPermissionToResource = function(body) {

    var filter = squel.expr();
    filter.or_begin();
    for(var i = 0; i < body.group_ids.length; i++){
        filter.or("group_id = " + body.group_ids[i]);
        filter.and_begin();
        for (var j = 0; j<body.resource_ids.length; j++) {
            filter.or("resource_id = " + body.resource_ids[j]);
        }
        filter.end();
    }

    filter.end();
    return squel.delete().from("resource_group").where(filter).toString();
};

// body contains resource_id
module.exports.buildQueryForGetGroupPermissionToResource = function(body) {
    return squel.select()
            .from("resource_group")
            .where("resource_id = " + body.resource_id)
            .toString();
};

// body contains resource_id
module.exports.buildQueryForDeleteAncestorLinks = function(body) {
    return "DELETE a FROM folder_tree AS a JOIN folder_tree AS d ON a.descendant_id = d.descendant_id LEFT JOIN folder_tree AS x ON x.ancestor_id = d.ancestor_id AND x.descendant_id = a.ancestor_id WHERE d.ancestor_id = " + body.resource_id + " AND x.ancestor_id IS NULL";
};

// body contains resource_id, parent_id
module.exports.buildQueryForInsertSubtree = function(body) {
    return "INSERT INTO folder_tree (ancestor_id, descendant_id, path_length) SELECT supertree.ancestor_id, subtree.descendant_id, supertree.path_length+subtree.path_length+1 FROM folder_tree AS supertree JOIN folder_tree AS subtree WHERE subtree.ancestor_id = " + body.resource_id + " AND supertree.descendant_id = " + body.parent_id;
};

// body contains resource_id, parent_id
module.exports.buildQueryForUpdateParentId = function(body) {
    return squel.update()
        .table('resource')
        .where("resource_id=" + body.resource_id)
        .set("parent_id=" + body.parent_id)
        .toString();
};