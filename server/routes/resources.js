var express = require('express');
var router = express.Router();
var res_service = require('../services/resources');
var tag_service = require('../services/tags');
var auth = require('../services/authorization');
var perm_service = require('../services/permissions');

// returns the resource specified by resource_id
// req.query should have a field "resource_id"
router.get('/', function(req, res, next){
  
    var getResourceCallback = function (result) {
        if (result.error){
            res.sendStatus(400);
        } else {
            res.status(200).json(result);
        }
    };

    res_service.get_resource_by_id(req.query, getResourceCallback);
});

router.put('/', function(req, res, next){
  
    var resource_id = 0;
    var create_tag_resource_callback = function(result) {
        if (result.error){
            res.sendStatus(400);
        } else {
            // not sure how we should handle this situation, ideally this method doesn't do multiple things
            result.results.insertId = resource_id;
            res.status(200).json(result.results);
        }
    }

    var create_resource_callback = function(result) {
        if(result.error) {
            res.sendStatus(400);
        } else {
            resource_id = result.results.insertId;
            if ("tags" in req.body && req.body.tags.length > 0) {
                tag_service.create_tag(resource_id, req.body.tags, create_tag_resource_callback, tag_service.create_resource_tag_link);
            } else {
                res.status(200).json(result.results);
            }
        }
    }

    var resource_permission_callback = function(results){
        if(results.error){
            res.status(400).json(result.err)
        }
        else if(!results.auth){
            res.sendStatus(403);
        }
        else{
             res_service.create_resource(req.body, create_resource_callback);
        }
    }

    perm_service.check_reservation_management_permission(1, req.session.user, resource_permission_callback);

});

router.post('/', function(req, res, next){
  
    var update_resource_callback = function(result){
        if (result.error){
            res.sendStatus(400);
        } else {
            res.status(200).json(result);
        }
    }

    var resource_permission_callback = function(results){
        if(results.error){
            res.status(400).json(result.err)
        }
        else if(!results.auth){
            res.sendStatus(403);
        }
        else{
             res_service.update_resource_by_id(req.body, update_resource_callback);
        }
    }

    perm_service.check_resource_management_permission(1, req.session.user, resource_permission_callback);

});

router.delete('/', auth.is('user'), function(req, res, next){
  
    var delete_resource_callback = function(result){
       if (result.error){
            res.sendStatus(400);
        } else {
            res.status(200).json(result);
        }
    }

    res_service.delete_resource_by_id(req.query, delete_resource_callback);
});

router.get('/all', auth.is('user'), function(req, res, next) {
	var getAllResourcesCallback = function(result){
		if (result.error) {
		  res.sendStatus(400);
		} else if (result.empty) {
			console.log("no resources!");
			res.send(JSON.stringify(result.resources));
		} else {
			console.log('we good, we got resources');
			res.send(JSON.stringify(result.resources));
		}
  	}
    
    tag_service.filter_by_tag([], [], 0, 0, getAllResourcesCallback);
});

router.put('/addPermission', function(req, res, next) {
    
    var addGroupPermissionCallback = function(result){
        if (result.error){
            res.sendStatus(400);
        } else {
            res.status(200).json(result);
        }
    };

    var resource_permission_callback = function(results){
        if (results.error){
            res.status(400).json(result.err)
        }
        else if (!results.auth){
            res.sendStatus(403);
        } else{
             res_service.addGroupPermissionToResource(req.body, addGroupPermissionCallback);
        }
    }

    perm_service.check_resource_management_permission(1, req.session.user, resource_permission_callback);
});

module.exports = router;
