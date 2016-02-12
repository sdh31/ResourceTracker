var express = require('express');
var router = express.Router();
var res_service = require('../services/resources');
var tag_service = require('../services/tags');
var auth = require('../services/authorization');

// returns the resource specified by resource_id
// req.query should have a field "resource_id"
router.get('/', auth.is('user'), function(req, res, next){
  
    var getResourceCallback = function (result) {
        if (result.error == true){
            res.sendStatus(400)
        } else {
            res.send(JSON.stringify(result));
        }
    };

    res_service.get_resource_by_id(req.query, getResourceCallback);
});

router.put('/', function(req, res, next){
  
    var create_tag_resource_callback = function(result) {
        if (result.error == true){
            res.sendStatus(400);
        } else {
            res.status(200).json(result.results);
        }
    }

    var create_resource_callback = function(result) {
        if(result.error == true) {
            res.sendStatus(400);
        } else {
            var resource_id = result.results.insertId;
            if ("tags" in req.body && req.body.tags.length > 0) {
                tag_service.create_tag(resource_id, req.body.tags, create_tag_resource_callback, tag_service.create_resource_tag_link);
            } else {

                res.status(200).json(result.results);
            }
        }
    }

    res_service.create_resource(req.body, create_resource_callback);
});

router.post('/', auth.is('user'), function(req, res, next){
  
    var update_resource_callback = function(result){
        if (result.error == true){
            res.sendStatus(400);
        } else {
            res.sendStatus(200);
        }
    }

    res_service.update_resource_by_id(req.body, update_resource_callback);
});

router.delete('/', auth.is('user'), function(req, res, next){
  
    var delete_resource_callback = function(result){
        if (result.error == true){
          res.sendStatus(400);
        } else {
            res.sendStatus(200);
        }
    }

    res_service.delete_resource_by_id(req.query, delete_resource_callback);
});

router.get('/all', auth.is('user'), function(req, res, next) {
	var getAllResourcesCallback = function(result){
		if (result.error == true) {
		  res.sendStatus(400);
		} else if (result.empty == true) {
			console.log("no resources!");
			res.send(JSON.stringify(result.resources));
		} else {
			console.log('we good, we got resources');
			res.send(JSON.stringify(result.resources));
		}
  	}

  tag_service.filter_by_tag([], [], 0, Number.MAX_VALUE, getAllResourcesCallback);
});

module.exports = router;
