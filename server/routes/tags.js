var express = require('express');
var router = express.Router();
var tag_service = require('../services/tags');
var group_service = require('../services/groups');
var perm_service = require('../services/permissions')

// this gets all tags
router.get('/', function(req, res, next){
    if(!req.session.auth){
        res.status(403).json(perm_service.denied_error)
        return;
    }
	var tags_callback = function(result){
		if (result.error){
			res.status(400).json(result);
		} else {
			res.status(200).json(result);
		}
	}

	tag_service.get_all_tags(tags_callback);
});

// this takes includedTags and excludedTags in req.body and returns all resources that have any one of the included tags and none of the excluded tags
router.post('/filter', function(req, res, next){
    if(!req.session.auth){
        res.status(403).json(perm_service.denied_error)
        return;
    }
    var filter_callback = function(result){
		if (result.error){
		  res.status(400).json(result);
		} else {
			res.status(200).json(result);
		}
	}

	var includedTags = req.body.includedTags;
	var excludedTags = req.body.excludedTags;
    var start_time = req.body.start_time;
    var end_time = req.body.end_time;

    var getAllGroupsForUserCallback = function(result){
        if (result.error) {
            res.status(400).json(result);
        } else {
            var group_ids = [];
            for (var i = 0; i<result.results.length; i++) {
                group_ids.push(result.results[i].group_id);
            }
            tag_service.filter_by_tag(includedTags, excludedTags, start_time, end_time, group_ids, filter_callback);
        }
    };

    group_service.get_all_groups_for_user(req.session.user, getAllGroupsForUserCallback);
});

router.put('/', function(req, res, next){

    if(!perm_service.check_resource_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }

    // make sure that there are tags
    if (req.body.addedTags == null || req.body.addedTags.length == 0) {
        res.sendStatus(400);
    }

    var createResourceTagLinkCallback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            res.sendStatus(200);
        } 
    }

    var selectTagIdsCallback = function(result) {
        if (result.error) {
            res.status(400).json(result);
        } else {
            var tag_ids = [];
            for (var i = 0; i<result.results.length; i++) {
                tag_ids.push(result.results[i].tag_id);
            }
            tag_service.create_resource_tag_link(req.body.resource_id, tag_ids, createResourceTagLinkCallback);
        }
    };

    var createTagCallback = function(result) {
        if (result.error) {
            res.status(400).json(result);
        } else {
            tag_service.select_tag_ids(req.body.addedTags, selectTagIdsCallback);
        }
    };

    var initialSelectTagsIdsCallback = function(result) {
        if (result.error) {
            res.status(400).json(result);
        } else {
            var addedTags = [];

            for (var i = 0; i<req.body.addedTags.length; i++) {
                addedTags.push(req.body.addedTags[i]);
            }

            var tag_names = [];
            for (i = 0; i<result.results.length; i++) {
                tag_names.push(result.results[i].tag_name);
            }
            
            for (i = 0; i<tag_names.length; i++) {
                if (addedTags.indexOf(tag_names[i]) != -1) {
                    addedTags.splice(addedTags.indexOf(tag_names[i]), 1);
                }
            }
            if (addedTags.length > 0) {
                tag_service.create_tag(addedTags, createTagCallback);
            } else {
                tag_service.select_tag_ids(req.body.addedTags, selectTagIdsCallback);
            }
        }
    }

    tag_service.select_tag_ids(req.body.addedTags, initialSelectTagsIdsCallback);
});

router.post('/', function(req, res, next){
    if(!perm_service.check_resource_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }
    var delete_callback = function(result){
        if (result.error == true){
			res.status(400).json(result);
        } else {
        	res.sendStatus(200);
		}
    }
    tag_service.remove_tag_from_object(req.body, delete_callback);
});

module.exports = router;
