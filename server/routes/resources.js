var express = require('express');
var router = express.Router();
var res_service = require('../services/resources');
var tag_service = require('../services/tags');
var auth = require('../services/authorization');
var perm_service = require('../services/permissions');
var user_service = require('../services/users');
var group_service = require('../services/groups');

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

    var checkPermissionForResourceCallback = function (result) {
        if (result.error) {
            res.sendStatus(400);
        } else if (result.results == []) {
            res.sendStatus(403);
        } else {
            res_service.get_resource_by_id(req.query, getResourceCallback);
        }
    };

    var getAllGroupsForUserCallback = function(result){
        if (result.error) {
            res.sendStatus(400);
        } else {
            var group_ids = [];
            for (var i = 0; i<result.results.length; i++) {
                group_ids.push(result.results[i].group_id);
            }
            perm_service.check_permission_for_resource(req.query.resource_id, group_ids, checkPermissionForResourceCallback);
        }
    };

    // we first get all of the groups that the user is a part of so that we only show resources that they have view/reserve access on
    group_service.get_all_groups_for_user(req.session.user, getAllGroupsForUserCallback);
});

router.put('/', function(req, res, next){

    var resource_id = -1;

    var addGroupPermissionCallback = function(result) {
        if (result.error){
            res.sendStatus(400);
        } else {
            result.results.insertId = resource_id;
            res.status(200).json(result.results);
        }
    };

    var getPrivateGroupCallback = function (result) {
        if (result.error){
            res.sendStatus(400);
        } else {
            var group_ids = [result.results.group_id];
            // TODO: not sure if this should be 'view' or 'reserve'; helps with testing for it to be 'reserve' for now
            var resource_permissions = ['reserve'];
            res_service.addGroupPermissionToResource({resource_id: resource_id, group_ids: group_ids, resource_permissions: resource_permissions}, addGroupPermissionCallback);
        }
    };

    var create_resource_callback = function(result) {
        if (result.error){
            res.sendStatus(400);
        } else {
            resource_id = result.results.insertId;
            user_service.get_private_group(req.session.user.user_id, getPrivateGroupCallback);
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

    perm_service.check_resource_management_permission(1, req.session.user, resource_permission_callback);
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

    var resource_permission_callback = function(results){
        if (results.error){
            res.status(400).json(result.err);
        } else if (!results.auth){
            res.sendStatus(403);
        } else {
             res_service.delete_resource_by_id(req.query, delete_resource_callback);
        }
    }

    perm_service.check_resource_management_permission(1, req.session.user, resource_permission_callback);
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
  	};

    var getAllGroupsForUserCallback = function(result){
        if (result.error) {
            res.sendStatus(400);
        } else {
            var group_ids = [];
            for (var i = 0; i<result.results.length; i++) {
                group_ids.push(result.results[i].group_id);
            }
            tag_service.filter_by_tag([], [], 0, Number.MAX_VALUE, group_ids, getAllResourcesCallback);
        }
    };

    // we first get all of the groups that the user is a part of so that we only show resources that they have view/reserve access on
    group_service.get_all_groups_for_user(req.session.user, getAllGroupsForUserCallback);
});

// req.body should have resource_id, group_ids, resource_permissions and group_ids.length == resource_permissions.length
router.post('/addPermission', function(req, res, next) {
    
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

// req.body should have resource_id, group_ids
router.post('/removePermission', function(req, res, next) {
    
    var removeGroupPermissionCallback = function(result){
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
             res_service.removeGroupPermissionToResource(req.body, removeGroupPermissionCallback);
        }
    }

    perm_service.check_resource_management_permission(1, req.session.user, resource_permission_callback);
});

// req.query should have resource_id
router.get('/getPermission', function(req, res, next) {
    
    var getGroupPermissionCallback = function(result){
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
             res_service.getGroupPermissionToResource(req.query, getGroupPermissionCallback);
        }
    }

    perm_service.check_resource_management_permission(1, req.session.user, resource_permission_callback);
});
module.exports = router;
