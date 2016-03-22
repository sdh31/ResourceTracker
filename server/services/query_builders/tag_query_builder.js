var squel = require('squel').useFlavour('mysql');

exports.buildQueryForIncludedTags = function(includedTags, start_time, end_time, group_ids) {
    var included_filter = squel.expr();
	for (var i = 0; i < includedTags.length; i++){
        included_filter.or("tag_name = '" + includedTags[i] + "'");
    }

    included_filter.and_begin();

    for (var i = 0; i < group_ids.length; i++){
        included_filter.or("permission_group.group_id = '" + group_ids[i] + "'");
    }

    included_filter.end();
    return squel.select()
        .field("resource.name")
        .field("resource.resource_id")
        .field("resource.description")
        .field("resource.resource_state")
        .field("resource.created_by")
        .field("tag.tag_name")
        //.field("reservation.reservation_id")
        //.field("reservation.start_time")
        //.field("reservation.end_time")
        //.field("user.username")
        //.field("user.first_name")
        //.field("user.last_name")
        //.field("user.user_id")
        .field("resource_group.resource_permission")
        .field("permission_group.group_id")
        .from("resource")
        .left_join("resource_tag", null, "resource.resource_id = resource_tag.resource_id")		
        .left_join("tag", null, "resource_tag.tag_id = tag.tag_id")
        .join("resource_group", null, "resource.resource_id = resource_group.resource_id")
        .left_join("permission_group", null, "resource_group.group_id = permission_group.group_id")
       // .left_join("reservation", null, "reservation.resource_id = resource.resource_id AND reservation.start_time <= " + end_time + " AND reservation.end_time >= " + start_time)        
       // .left_join("user_reservation", null, "reservation.reservation_id = user_reservation.reservation_id")
        //.left_join("user", null, "user_reservation.user_id = user.user_id")
        
		.where(included_filter).toString();
};

exports.buildQueryForExcludedTags = function(excludedTags) {
    var excluded_filter = squel.expr();
     
	for (var j = 0; j < excludedTags.length; j++) {
		excluded_filter.or("tag_name = '" + excludedTags[j] + "'");
	}

    // this is necessary because we dont want to make an excluded query if there are no tags to exclude!
    var excludedQuery;
    if (excludedTags.length == 0) {
        excludedQuery = "";
    } else{
        excludedQuery = squel.select()
		    .from("resource_tag")

		    //can add more joins (i.e. reservations, resources if more info is needed in return)
		    .join("tag", null, "resource_tag.tag_id = tag.tag_id")
		    .where(excluded_filter).toString();
    }

    return excludedQuery;

};

exports.buildQueryForCreateResourceTagLink = function(resource_id, tag_ids) {
	var rows_to_add = [];
    for(var i = 0; i < tag_ids.length; i++){
        var row = {"tag_id": tag_ids[i], "resource_id": resource_id};
        rows_to_add.push(row);
    }

    return squel.insert()
                .into('resource_tag')
                .setFieldsRows(rows_to_add)
                .toString();
};

exports.buildQueryForCreateTag = function(tags) {
    var rows_to_add = [];
    for(var i = 0; i < tags.length; i++){
        var row = {"tag_name": tags[i]};
        rows_to_add.push(row);
    }

    return squel.insert()
        .into('tag')
        .setFieldsRows(rows_to_add)
        .toString();
};

exports.buildQueryForSelectTagIds = function(tags) {
    var select_expression = squel.expr();
    for (var i = 0; i < tags.length; i++){
        select_expression.or("tag_name = '" + tags[i] + "'")
    }
    return squel.select()
                .from('tag')
                .where(select_expression)
                .toString();
};

exports.buildQueryForGetAllTags = function() {
    return squel.select()
        .from("tag")
        .join("resource_tag", null, "tag.tag_id = resource_tag.tag_id")
        .toString();
};

exports.buildQueryForRemoveTagFromObject = function(tag_info) {
    var tags = tag_info.deletedTags;
    var resource_id = tag_info.resource_id;
    var tag_filter = squel.expr();
    for (var i = 0; i < tags.length; i++){
        tag_filter.or("tag_name = '" + tags[i] + "'")
    }
    tag_filter.and("resource_id = '" + resource_id + "'");
 
    return squel.delete()
        .target("resource_tag")
        .from("resource_tag")
        .join("tag", null, "tag.tag_id = resource_tag.tag_id")
        .where(tag_filter)
        .toString();
};

