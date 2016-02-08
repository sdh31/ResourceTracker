var express = require('express');
var router = express.Router();
var tag_service = require('../services/tags');
var auth = require('../services/authorization');

// this gets all tags
router.get('/', auth.is('user'), function(req, res, next){
	var tags_callback = function(result){
		if (result.error == true){
			res.sendStatus(400);
		} else {
			res.send(JSON.stringify(result));
		}
	}

	tag_service.get_all_tags(tags_callback);
});

// this takes includedTags and excludedTags in req.body and returns all resources that have any one of the included tags and none of the excluded tags
router.post('/filter', auth.is('user'), function(req, res, next){
    var filter_callback = function(result){
		if (result.error == true){
		  res.sendStatus(400);
		} else {
			res.send(JSON.stringify(result));
		}
	}

	var includedTags = req.body.includedTags;
	var excludedTags = req.body.excludedTags;
    var start_time = req.body.start_time;
    var end_time = req.body.end_time;

	tag_service.filter_by_tag(includedTags, excludedTags, start_time, end_time, filter_callback);
});

router.put('/', auth.is('user'), function(req, res, next){

    var create_tag_resource_callback = function(result){
        if (result.error == true){
            res.sendStatus(400);
        } else {
            res.sendStatus(200);
        }
        
    }
    tag_service.create_tag(req.body.resource_id, req.body.addedTags, create_tag_resource_callback, tag_service.create_resource_tag_link);
});

router.post('/', auth.is('user'), function(req, res, next){
    var delete_callback = function(result){
        if (result.error == true){
			res.sendStatus(400);
        } else {
        	res.sendStatus(200);
		}
    }
    tag_service.remove_tag_from_object(req.body, delete_callback);
});

module.exports = router;
