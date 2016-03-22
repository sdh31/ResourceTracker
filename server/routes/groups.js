var express = require('express');
var router = express.Router();
var group_service = require('../services/groups');
var perm_service = require('../services/permissions');
var tag_service = require('../services/tags');
var reservation_service = require('../services/reservations');
var resource_service = require('../services/resources');

router.get('/', function(req,res,next){
    var get_group_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        }
        else{
            res.status(200).json(result);
        }
    }
    if(!(perm_service.check_user_permission(req.session) || perm_service.check_resource_permission(req.session))){
        res.status(403).json(perm_service.denied_error)
        return;
    }
    group_service.get_groups_by_id(req.query, get_group_callback);

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
    if(!perm_service.check_user_permission(req.session)){
        console.log()
        res.status(403).json(perm_service.denied_error)
        return;
    }
    group_service.create_group(req.body, create_group_callback);
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

    if(!perm_service.check_user_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }
    group_service.update_group_by_id(req.body, update_group_callback);
});

router.delete('/', function(req,res,next){

    var allUsers = [];
    var allResources = [];
    var allGroupsForUsers = [];

    var delete_group_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        } else {
             res.status(200).json(result);
        }
    };

    var deleteReservationsCallback = function(result) {
        if (result.error) {
            res.status(400).json(result);
        } else {
            group_service.delete_group_by_id(req.query, delete_group_callback);
        }
    };

    var getReservationsCallback = function(result) {
        if (result.error) {
            res.status(400).json(result);
        } else {
            if (result.results.length == 0) {
                res.status(200).json(result);
            } else {
                for (var i = 0; i<result.results.length; i++) {
                    resource_service.notifyUserOnReservationDelete(result.results[i]);
                }
                reservation_service.deleteReservationsById(result.results, deleteReservationsCallback);
            }
        }
    };

    var checkPermissionForResourceCallback = function (result) {
        if (result.error) {
            res.status(400).json(result);
        } else {
            var groupsThatHaveReservePermission = [];

            for (var i = 0; i<result.results.length; i++) {
                if (result.results[i].resource_permission == 'reserve') {
                    if (result.results[i].group_id == req.query.group_id) {
                        continue;
                    }
                    groupsThatHaveReservePermission.push(result.results[i].group_id);
                }
            }

            for (i = 0; i<allGroupsForUsers.length; i++) {
                if (groupsThatHaveReservePermission.indexOf(allGroupsForUsers[i].group_id) != -1) {
                    for (var j = 0; j < allUsers.length; j++) {
                        if (allUsers[j].user_id == allGroupsForUsers[i].user_id) {
                            allUsers.splice(j, 1);
                            break;
                        }
                    }
                }
            }

            if (allUsers.length == 0) {
                group_service.delete_group_by_id(req.query, delete_group_callback);
            } else {
                reservation_service.getAllReservationsOnResourcesByUsers(allResources, allUsers, getReservationsCallback);
            }
        }
    };

    var getAllGroupsForUsersCallback = function(result) {
        if (result.error){
            res.status(400).json(result);
        } else {
            allGroupsForUsers = result.results;

            var group_ids = [];
            for (var i = 0; i<result.results.length; i++) {
                group_ids.push(result.results[i].group_id);
            }
            
            perm_service.check_permission_for_resources(allResources, group_ids, checkPermissionForResourceCallback);
        }
    };

    var getUsersInGroupsCallback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            allUsers = result.results;
            group_service.get_all_groups_for_users(result.results, getAllGroupsForUsersCallback);
        }
    };

    var getAllResourcesCallback = function(result) {
        if (result.error) {
            res.status(400).json(result);
        } else {
            if (result.resources.length == 0) {
                group_service.delete_group_by_id(req.query, delete_group_callback);
            } else {
                allResources = result.resources;
                group_service.get_users_in_groups([req.query.group_id], getUsersInGroupsCallback);
            }
        }
    };
    
    if(!perm_service.check_user_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }

    tag_service.filter_by_tag([], [], 0, Number.MAX_VALUE, [req.query.group_id], getAllResourcesCallback);

});

// req.body should have user_ids and group_id

router.post('/addUsers', function(req,res,next){
    var add_user_callback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }

    }

    if(!perm_service.check_user_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }

    group_service.add_users_to_group(req.body, add_user_callback)
});

// req.body should have user_ids and group_id
router.post('/removeUsers', function(req,res,next){

    // get all resources that this group has reserve permission on
    // get all groups for these users
    // check permissions for all resource_ids for these groups
    // filter users out and delete reservations on the rest
    
    var allUsers = [];
    var allResources = [];
    var allGroupsForUsers = [];

    var deleteReservationsCallback = function(result) {
        if (result.error) {
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }
    };

    var getReservationsCallback = function(result) {
        if (result.error) {
            res.status(400).json(result);
        } else {
            if (result.results.length == 0) {
                res.status(200).json(result);
            } else {
                for (var i = 0; i<result.results.length; i++) {
                    resource_service.notifyUserOnReservationDelete(result.results[i]);
                }
                reservation_service.deleteReservationsById(result.results, deleteReservationsCallback);
            }
        }
    };

    var checkPermissionForResourceCallback = function (result) {
        if (result.error) {
            res.status(400).json(result);
        } else {
            var groupsThatHaveReservePermission = [];

            for (var i = 0; i<result.results.length; i++) {
                if (result.results[i].resource_permission == 'reserve') {
                    groupsThatHaveReservePermission.push(result.results[i].group_id);
                }
            }

            for (i = 0; i<allGroupsForUsers.length; i++) {
                if (groupsThatHaveReservePermission.indexOf(allGroupsForUsers[i].group_id) != -1) {
                    for (var j = 0; j < allUsers.length; j++) {
                        if (allUsers[j].user_id == allGroupsForUsers[i].user_id) {
                            allUsers.splice(j, 1);
                            break;
                        }
                    }
                }
            }

            if (allUsers.length == 0) {
                res.status(200).json(result);
            } else {
                reservation_service.getAllReservationsOnResourcesByUsers(allResources, allUsers, getReservationsCallback);
            }
        }
    };

    var getAllGroupsForUsersCallback = function(result) {
        if (result.error){
            res.status(400).json(result);
        } else {
            allGroupsForUsers = result.results;

            var group_ids = [];
            for (var i = 0; i<result.results.length; i++) {
                group_ids.push(result.results[i].group_id);
            }
            
            perm_service.check_permission_for_resources(allResources, group_ids, checkPermissionForResourceCallback);
        }
    };

    var getAllResourcesCallback = function(result) {
        if (result.error) {
            res.status(400).json(result);
        } else {

            if (result.resources.length == 0) {
                res.sendStatus(200);
            } else {
                allResources = result.resources;
                for (var i = 0; i<req.body.user_ids.length; i++) {
                    allUsers.push({user_id: req.body.user_ids[i]});
                }

                group_service.get_all_groups_for_users(allUsers, getAllGroupsForUsersCallback);
            }
        }
    };

    var remove_user_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        } else {
            tag_service.filter_by_tag([], [], 0, Number.MAX_VALUE, [req.body.group_id], getAllResourcesCallback);
        }
    };

    if(!perm_service.check_user_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }
    group_service.remove_users_from_group(req.body, remove_user_callback);

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

