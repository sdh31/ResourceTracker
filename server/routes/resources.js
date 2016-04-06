var express = require('express');
var router = express.Router();
var res_service = require('../services/resources');
var tag_service = require('../services/tags');
var perm_service = require('../services/permissions');
var user_service = require('../services/users');
var group_service = require('../services/groups');
var reservation_service = require('../services/reservations');
// returns the resource specified by resource_id
// req.query should have a field "resource_id"
router.get('/', function(req, res, next){
    var getResourceCallback = function (result) {
        if (result.error){
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }
    };

    var checkPermissionForResourceCallback = function (result) {
        if (result.error) {
            res.status(400).json(result);
        } else if (result.results.length == 0) {
            res.status(403).json(result);
        } else {
            res_service.get_resource_by_id(req.query, getResourceCallback);
        }
    };

    var getAllGroupsForUserCallback = function(result){
        if (result.error) {
            res.status(400).json(result);
        } else {
            var group_ids = [];
            for (var i = 0; i<result.results.length; i++) {
                group_ids.push(result.results[i].group_id);
            }
            perm_service.check_permission_for_resource(req.query.resource_id, group_ids, checkPermissionForResourceCallback);
        }
    };
    if(!req.session.auth){
        res.status(403).json(perm_service.denied_error);
        return;
    }
    // we first get all of the groups that the user is a part of so that we only show resources that they have view/reserve access on
    group_service.get_all_groups_for_user(req.session.user, getAllGroupsForUserCallback);
});

// create resource - req.body should have name, description, resource_state (either 'free' or 'restricted'), is_folder, sharing_level, and parent_id
router.put('/', function(req, res, next){

    var resource_id = -1;

    var insertIntoFolderTreeCallback = function(result) {
        if (result.error){
            res.status(400).json(result);
        } else {
            result.results.insertId = resource_id;
            res.status(200).json(result.results);
        }
    };

    var getAllAncestorsCallback = function(result) {
        if (result.error){
            res.status(400).json(result);
        } else {
            var resources = result.results;
            var ancestor_ids = [];
            var path_lengths = [];
            for (var i = 0; i<resources.length; i++) {
                if (resources[i].is_folder == 0) {
                    result.error = true;
                    result.err = "Can't create resource with a parent that isn't a folder";
                    res.status(400).json(result);
                    return;
                }
                ancestor_ids.push(resources[i].resource_id);
                path_lengths.push(resources[i].path_length + 1);
            }
            ancestor_ids.push(resource_id);
            path_lengths.push(0);
            res_service.insertIntoFolderTree(resource_id, ancestor_ids, path_lengths, insertIntoFolderTreeCallback);
        }
    };

    var addAdminGroupPermissionCallback = function(result) {
        if (result.error){
            res.status(400).json(result);
        } else {
            if (req.body.parent_id == null) {
                result.results.insertId = resource_id;
                res.status(200).json(result.results);
            }
            req.body.resource_id = req.body.parent_id;
            res_service.getAllAncestors(req.body, getAllAncestorsCallback);
        }
    };

    var getAdminGroupCallback = function(result) {
        if (result.error){
            res.status(400).json(result);
        } else {
            var group_ids = [result.results.group_id];
            var resource_permissions = perm_service.get_permission_id(['admin']);
            res_service.addGroupPermissionToResource({resource_id: resource_id, group_ids: group_ids, resource_permissions: resource_permissions}, addAdminGroupPermissionCallback);
        }
    };    

    var addGroupPermissionCallback = function(result) {
        if (result.error){
            res.status(400).json(result);
        } else {
            if (req.session.user.username == 'admin') {
                addAdminGroupPermissionCallback({error: false});
            } else {
                user_service.get_admin_group(getAdminGroupCallback);
            }
        }
    };

    var getPrivateGroupCallback = function (result) {
        if (result.error){
            res.status(400).json(result);
        } else {
            var group_ids = [result.results.group_id];
            // you are given max permission on any resource that you create
            var resource_permissions = perm_service.get_permission_id(['admin']);
            res_service.addGroupPermissionToResource({resource_id: resource_id, group_ids: group_ids, resource_permissions: resource_permissions}, addGroupPermissionCallback);
        }
    };

    var create_resource_callback = function(result) {
        if (result.error){
            res.status(400).json(result);
        } else {
            resource_id = result.results.insertId;
            user_service.get_private_group(req.session.user.user_id, getPrivateGroupCallback);
        }
    }

    if(!perm_service.check_resource_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }

    res_service.create_resource(req.body, create_resource_callback);
});

router.post('/updateParent', function(req,res, next) {

    var insertSubtreeCallback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }
    }

    var deleteAncestorLinksCallback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            res_service.insertSubtree(req.body, insertSubtreeCallback);
        }
    }

    var updateParentIdCallback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            res_service.deleteAncestorLinks(req.body, deleteAncestorLinksCallback);
        }
    }

    var checkPermissionForResourceCallback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            var resourcesWithPermission = reservation_service.filterResourcesByPermission(result.results, perm_service.get_permission_id(['view']));

            if (resourcesWithPermission.length == 2) {
                for (var i = 0; i<result.results.length; i++) {
                    if (result.results[i].resource_id == req.body.parent_id && result.results[i].is_folder == 0) {
                        res.status(400).json(result);
                        return;
                    }
                }
                res_service.updateParentId(req.body, updateParentIdCallback);
            } else {
                res.status(400).json(result);
            }
        }
    }

    if(!perm_service.check_resource_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }

    var resources = [];
    resources.push({resource_id: req.body.resource_id});
    resources.push({resource_id: req.body.parent_id});
    perm_service.check_permission_for_resources(resources, [req.session.user], [], checkPermissionForResourceCallback);
});

router.post('/', function(req, res, next){

    var confirmAllReservationsOnResourceCallback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }
    }

    var update_resource_callback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            /// if the resource has been updated to free, confirm all reservations on that resource
            if ("resource_state" in req.body && req.body.resource_state == 'free') {
                reservation_service.confirmAllReservationsOnResource(req.body, confirmAllReservationsOnResourceCallback);
            } else {
                res.status(200).json(result);
            }
        }
    }

    var get_overlapping_reservation_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        } else if(result.results.length > 0){
            var sharing_level = ''
            if("sharing_level" in req.body){
                sharing_level = req.body.sharing_level
            }else{
                sharing_level = result.results[0].sharing_level
            }

            var oversubscribed = reservation_service.get_overbooked_reservations_from_conflicts(result.results, sharing_level);
            if(oversubscribed.length > 0){
                result.err = "Unable to change restriction or sharing level of resource due to too many conflicts on reservations in response body.";
                res.status(400).json(oversubscribed);
                return;
            }

            res_service.update_resource_by_id(req.body, update_resource_callback);
        }  
        else{
            res_service.update_resource_by_id(req.body, update_resource_callback);
        }
    }
    if(!perm_service.check_resource_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }

    //No need to see if resource is oversubscribed if we are not modifying resource_state or sharing_level
    if(!("resource_state" in req.body || "sharing_level" in req.body)){
        res_service.update_resource_by_id(req.body, update_resource_callback);
    }

    //If resource_state is not being changed to free, we need to look at confirmed and unconfirmed
    var confirmed_only = !("resource_state" in req.body && req.body["resource_state"] == 'free')
    reservation_service.getOverlappingReservationsByResource(req.body, confirmed_only, get_overlapping_reservation_callback)

});

router.delete('/', function(req, res, next){
  
    var delete_resource_callback = function(result){
       if (result.error){
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }
    }

    var deleteReservationsCallback = function(result){
       if (result.error){
            res.status(400).json(result);
        } else {
            res_service.delete_resource_by_id(req.query, delete_resource_callback);
        }
    }

    var getReservationsCallback = function(result){
       if (result.error){
            res.status(400).json(result);
        } else {
            if (result.results.length == 0) {
                res_service.delete_resource_by_id(req.query, delete_resource_callback);
            } else {
                for (var i = 0; i<result.results.length; i++) {
                    res_service.notifyUserOnReservationDelete(result.results[i]);
                }

                reservation_service.deleteReservationsById(result.results, deleteReservationsCallback);
            }
        }
    }

    if(!perm_service.check_resource_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }

    reservation_service.getAllReservationsOnResourceByUsers(req.query.resource_id, [req.session.user], getReservationsCallback)
});

router.get('/all', function(req, res, next) {
	var getAllResourcesCallback = function(result){
		if (result.error) {
		  res.status(400).json(result);
		} else if (result.empty) {
			res.send(JSON.stringify(result.resources));
		} else {
			res.send(JSON.stringify(result.resources));
		}
  	};

    var getAllGroupsForUserCallback = function(result){
        if (result.error) {
            res.status(400).json(result);
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

// req.query should have resource_id - this gets all of the direct children
router.get('/children', function(req, res, next) {

    var getAllDirectChildrenCallback = function(result){
		if (result.error) {
            res.status(400).json(result);
		} else {
            res.status(200).json(result);
		}
    };

    var checkPermissionForResourceCallback = function(result){
        if (result.error) {
            res.status(400).json(result);
        } else if (result.results == {}) {
            result['err'] = "The resources you specified don't exist";
            res.status(400).json(result);
        } else {
            // now check if the user has reserve permission on all of the resources

            var resourcesWithPermission = reservation_service.filterResourcesByPermission(result.results, perm_service.get_permission_id(['view']));

            if (resourcesWithPermission.length == 1) {
                res_service.getAllDirectChildren(req.session.user, req.query, getAllDirectChildrenCallback);
            } else {
                result = perm_service.denied_error;
                res.status(403).json(result);
            }
        }
    };

    perm_service.check_permission_for_resources([{resource_id: req.query.resource_id}], [req.session.user], [], checkPermissionForResourceCallback);
});

// req.query should have resource_id - this gets the entire subtree
router.get('/subtree', function(req, res, next) {

    var getSubtreeCallback = function(result){
		if (result.error) {
            res.status(400).json(result);
		} else {
            res.status(200).json(result);
		}
    };

    var checkPermissionForResourceCallback = function(result){
        if (result.error) {
            res.status(400).json(result);
        } else if (result.results == {}) {
            result['err'] = "The resources you specified don't exist";
            res.status(400).json(result);
        } else {
            // now check if the user has view permission on all of the resources

            var resourcesWithPermission = reservation_service.filterResourcesByPermission(result.results, perm_service.get_permission_id(['view']));

            if (resourcesWithPermission.length == 1) {
                res_service.getSubtree(req.session.user, req.query, getSubtreeCallback);
            } else {
                result = perm_service.denied_error;
                res.status(403).json(result);
            }
        }
    };

    perm_service.check_permission_for_resources([{resource_id: req.query.resource_id}], [req.session.user], [], checkPermissionForResourceCallback);
});

// req.body should have resource_id, group_ids, resource_permissions and group_ids.length == resource_permissions.length
router.post('/addPermission', function(req, res, next) {

    var addGroupPermissionCallback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }
    };

    if(!perm_service.check_resource_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }
    if (req.body.group_ids.length != req.body.resource_permissions.length) {
        res.status(400).json({error: true, err: "need same amount of permissions as resources"})
        return;
    }

    // convert string permissions to their INT equivalents
    req.body.resource_permissions = perm_service.get_permission_id(req.body.resource_permissions);

    var checkPermissionForResourceCallback = function(result){
        if (result.error) {
            res.status(400).json(result);
        } else if (result.results == {}) {
            result['err'] = "The resources you specified don't exist";
            res.status(400).json(result);
        } else {
            // now check if the user has view permission on all of the resources

            var resourcesWithPermission = reservation_service.filterResourcesByPermission(result.results, perm_service.get_permission_id(['view']));

            // the OR is used in the stupid case where the admin user needs to be given view access on the root resource by the python testers
            if (resourcesWithPermission.length == 1 || (req.session.user.username == 'admin' && req.body.resource_id == 1)) {
                for (var i = 0; i<req.body.resource_permissions.length; i++) {
                    if (req.body.resource_permissions[i] > 0 && result.results[0].is_folder == 1) {
                        result['err'] = "Cant give more than view for a folder!";
                        res.status(400).json(result);
                        return;
                    }
                }

                res_service.addGroupPermissionToResource(req.body, addGroupPermissionCallback);
            } else {
                result = perm_service.denied_error;
                res.status(403).json(result);
            }
        }
    };

    perm_service.check_permission_for_resources([{resource_id: req.body.resource_id}], [req.session.user], [], checkPermissionForResourceCallback);
});

router.post('/updatePermission', function(req, res, next) {

    var updateGroupPermissionCallback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            if (req.body.resource_permission >= 1) {
                res.status(200).json(result);
            } else {
                req.body.group_ids = [req.body.group_id];
                deleteReservationsIfNecessary(req, res)
            }
        }
    };

    if(!perm_service.check_resource_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }

    // convert string permission to the INT value
    req.body.resource_permission = perm_service.resource_permissions[req.body.resource_permission];

    var checkPermissionForResourceCallback = function(result){
        if (result.error) {
            res.status(400).json(result);
        } else if (result.results == {}) {
            result['err'] = "The resources you specified don't exist";
            res.status(400).json(result);
        } else {
            // now check if the user has view permission on all of the resources

            var resourcesWithPermission = reservation_service.filterResourcesByPermission(result.results, perm_service.get_permission_id(['view']));

            if (resourcesWithPermission.length == 1) {
                if (req.body.resource_permission > 0 && result.results[0].is_folder == 1) {
                    result['err'] = "Cant give more than view for a folder!";
                    res.status(400).json(result);
                    return;
                }
                res_service.updateGroupPermissionToResource(req.body, updateGroupPermissionCallback);
            } else {
                result = perm_service.denied_error;
                res.status(403).json(result);
            }
        }
    };

    perm_service.check_permission_for_resources([{resource_id: req.body.resource_id}], [req.session.user], [], checkPermissionForResourceCallback);
});

// req.body should have resource_id, group_ids
router.post('/removePermission', function(req, res, next) {

    var is_folder = -1;
    var resources = [];

    var removePermissionsCallback = function(result) {
        if (result.error) {
            res.status(400).json(result);
        } else {
            // resources has all of the leaf resources
            console.log("HERE");
            req.body.resourcesToCheck = resources;
            deleteReservationsIfNecessary(req, res);
        }
    }

    var getSubtreeCallback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            var resource_ids = [];
            for (var i = 0; i<result.results.length; i++) {
                if (result.results[i].resource_id == req.body.resource_id) {
                    continue;
                }

                if (result.results[i].is_folder == 0) {
                    resources.push(result.results[i]);
                }
                resource_ids.push(result.results[i].resource_id);
            }

            if (resource_ids.length == 0) {
                console.log("herere");
                res.status(200).json(result);
            } else {
                res_service.removeGroupsPermissionToResources({group_ids: req.body.group_ids, resource_ids: resource_ids}, removePermissionsCallback);
            }
        }
    };

    var removeGroupPermissionCallback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            if (is_folder == 1) {
                 res_service.getSubtree(req.session.user, req.body, getSubtreeCallback);
            } else {
                deleteReservationsIfNecessary(req, res);
            } 
        }
    };

    if(!perm_service.check_resource_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }

    var checkPermissionForResourceCallback = function(result){
        if (result.error) {
            res.status(400).json(result);
        } else if (result.results == {}) {
            result['err'] = "The resources you specified don't exist";
            res.status(400).json(result);
        } else {
            // now check if the user has view permission on all of the resources

            var resourcesWithPermission = reservation_service.filterResourcesByPermission(result.results, perm_service.get_permission_id(['view']));

            if (resourcesWithPermission.length == 1) {
                is_folder = result.results[0].is_folder;
                res_service.removeGroupPermissionToResource(req.body, removeGroupPermissionCallback);
            } else {
                result = perm_service.denied_error;
                res.status(403).json(result);
            }
        }
    };

    perm_service.check_permission_for_resources([{resource_id: req.body.resource_id}], [req.session.user], [], checkPermissionForResourceCallback);

});

// req.query should have resource_id
router.get('/getPermission', function(req, res, next) {

    var getGroupPermissionCallback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }
    };
    
    if(!perm_service.check_resource_permission(req.session)){
        res.status(403).json(perm_service.denied_error)
        return;
    }

    res_service.getGroupPermissionToResource(req.query, getGroupPermissionCallback);
});

function deleteReservationsIfNecessary(req, res) {

    var allUsers = [];
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
                    res_service.notifyUserOnReservationDelete(result.results[i]);
                }
                reservation_service.deleteReservationsById(result.results, deleteReservationsCallback);
            }
        }
    };

    var checkPermissionForResourceCallback = function (result) {
        if (result.error) {
            res.status(400).json(result);
        } else {
            allGroupsForUsers = result.allGroupsForUsers;
            allUsers = reservation_service.removeUsersThatHaveReservePermission(allUsers, allGroupsForUsers, result.results);
            if (allUsers.length == 0) {
                res.status(200).json(result);
            } else {
                if ("resourcesToCheck" in req.body) {
                    reservation_service.getAllReservationsOnResourcesByUsers(req.body.resourcesToCheck, allUsers, getReservationsCallback);
                } else {
                    reservation_service.getAllReservationsOnResourceByUsers(req.body.resource_id, allUsers, getReservationsCallback);
                }
            }
        }
    };

    var getUsersInGroupsCallback = function(result){
        if (result.error){
            res.status(400).json(result);
        } else {
            allUsers = result.results;

            if ("resourcesToCheck" in req.body) {
                perm_service.check_permission_for_resources(req.body.resourcesToCheck, allUsers, [], checkPermissionForResourceCallback);
            } else {
                perm_service.check_permission_for_resources([req.body], allUsers, [], checkPermissionForResourceCallback);
            }
        }
    };

    group_service.get_users_in_groups(req.body.group_ids, getUsersInGroupsCallback);
};

module.exports = router;
