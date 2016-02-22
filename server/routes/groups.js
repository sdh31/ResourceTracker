var express = require('express');
var router = express.Router();
var group_service = require('../services/groups');
var perm_service = require('../services/permissions');

router.get('/', function(req,res,next){
    var get_group_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        }
        else{
            res.status(200).json(result);
        }
    }

    var user_permission_callback = function(results){
        if(results.error){
            res.status(400).json(result)
        }
        else if(!results.auth){
            res.sendStatus(403);
        }
        else{
            group_service.get_groups_by_id(req.query, get_group_callback);
        }
    }

    perm_service.check_user_management_permission(1, req.session.user, user_permission_callback);

});

router.put('/', function(req,res,next){
        if(!('name' in req.body) ){
        res.status(400).json({err: 'no group name specified'});
    }
    group_service.toggle_group_privacy(req.body, false);

    var create_group_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        }
        else{
            res.status(200).json(result);
        }
    }

    var user_permission_callback = function(results){
        if(results.error){
            res.status(400).json(result)
        }
        else if(!results.auth){
            res.sendStatus(403);
        }
        else{
            group_service.create_group(req.body, create_group_callback);
        }
    }

    perm_service.check_user_management_permission(1, req.session.user, user_permission_callback);

});

router.post('/', function(req,res,next){
    var update_group_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        }
        else{
            res.status(200).json(result);
        }
    }

    var user_permission_callback = function(results){
        if(results.error){
            res.status(400).json(result)
        }
        else if(!results.auth){
            res.sendStatus(403);
        }
        else{
            group_service.update_group_by_id(req.body, update_group_callback);
        }
    }
    perm_service.check_user_management_permission(1, req.session.user, user_permission_callback);
    
});

router.delete('/', function(req,res,next){
    var delete_group_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        }
        else{
            res.status(200).json(result.results);
        }
    }

    var user_permission_callback = function(results){
        if(results.error){
            res.status(400).json(result)
        }
        else if(results.auth == false){
            res.sendStatus(403);
        }
        else{
            group_service.delete_group_by_id(req.query, delete_group_callback);
        }
    }
    perm_service.check_user_management_permission(1, req.session.user, user_permission_callback);
});

// req.body should have user_ids and group_id

router.post('/addUsers', function(req,res,next){
    var add_user_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        }
        else{
            res.status(200).json(result);
        }

    }

    var user_permission_callback = function(results){
        if(results.error){
            res.status(400).json(result)
        }
        else if(results.auth == false){
            res.sendStatus(403);
        }
        else{
            group_service.add_users_to_group(req.body, add_user_callback)
        }
    }
    
    perm_service.check_user_management_permission(1, req.session.user, user_permission_callback);

});

// req.body should have user_ids and group_id
router.post('/removeUsers', function(req,res,next){
    var remove_user_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        }
        else{
            res.status(200).json(result);
        }
    }

    var user_permission_callback = function(results){
        if(results.error){
            res.status(400).json(result)
        }
        else if(!results.auth){
            res.sendStatus(403);
        }
        else{
             group_service.remove_users_from_group(req.body, remove_user_callback);
        }
    }

    perm_service.check_user_management_permission(1, req.session.user, user_permission_callback);

});

router.get('/user', function(req,res,next){
    var get_user_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        }
        else{
            res.status(200).json(result);
        }
    }
    group_service.get_users_in_group(req.query, get_user_callback);

});

module.exports = router;

