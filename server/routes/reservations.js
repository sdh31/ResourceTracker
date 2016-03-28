var express = require('express');
var router = express.Router();
var reservation_service = require('../services/reservations');
var auth = require('../services/authorization');
var perm_service = require('../services/permissions');
var group_service = require('../services/groups');
var resource_service = require('../services/resources');
var agenda = require('../services/agenda');

router.get('/', auth.is('user'), function(req, res, next){
    var getAllReservationsForUserCallback = function(result){
        if(result.error){
            res.status(400).json(result);
        } else {
            result.results = reservation_service.organizeReservations(result.results);
            res.status(200).json(result);
        }
    };
    if(!req.session.auth){
        res.status(403).json(perm_service.denied_error);
        return;
    }
    reservation_service.getAllReservationsForUser(req.session.user, getAllReservationsForUserCallback);
});

router.put('/', function(req, res, next){

    if(!req.session.auth){
        res.status(403).json(perm_service.denied_error);
        return;
    }

    var resourcesOnReservation = [];

    var createReservationResourcesLinkCallback = function(result) {
        if(result.error){
            res.status(403).json(result);
        } else {
            // email scheduling work
            var reservation = {
                reservation_id: req.body.reservation_id,
                resources: resourcesOnReservation,
                start_time: req.body.start_time,
                end_time: req.body.end_time,
                reservation_title: req.body.reservation_title,
                reservation_description: req.body.reservation_description
            };

            var hasRestrictedResource = false;
            for (var i = 0; i<resourcesOnReservation.length; i++) {
                if (resourcesOnReservation[i].resource_state == 'restricted') {
                    hasRestrictedResource = true;
                    break;
                }
            }

            // if this reservation has a restricted resource, schedule emails for notifying that reservation is starting when incomplete and for reminding when reservation is incomplete
            // otherwise just schedule the standard reservation starting email
            if (hasRestrictedResource) {
               agenda.schedule(new Date(reservation.start_time - (2*24*60*60*1000)), 'remind if reservation is incomplete', {user: req.session.user, reservation: reservation});
               agenda.schedule(new Date(reservation.start_time), 'notify on reservation starting when still incomplete', {user: req.session.user, reservation: reservation});
            } else {
                agenda.schedule(new Date(reservation.start_time), 'notify on reservation starting', {user: req.session.user, reservation: reservation});
            }
            // set the insertId properly and send back a 200
            result.results.insertId = req.body.reservation_id;
            res.status(200).json(result);
        }
    };

    var getResourcesByIdsCallback = function(result) {
        if(result.error){
            res.status(403).json(result);
        } else {
            resourcesOnReservation = result.results;
            reservation_service.create_reservation_resources_link(req.body.reservation_id, result.results, createReservationResourcesLinkCallback);
        }
    };
    
    var addUserReservationLinkCallback = function(result) {
        if(result.error){
            res.status(403).json(result);
        } else {
            resource_service.get_resources_by_ids(req.body.resource_ids, getResourcesByIdsCallback);
        }
    };

    var createReservationCallback = function(result) {
        if(result.error){
            res.status(403).json(result);
        } else {
            // this means that we can add the link to user
            req.body.reservation_id = result.results.insertId;
            //TODO: reservation_service.scheduleEmailForReservation(req.session.user, req.body);
            reservation_service.add_user_reservation_link(req.session.user, req.body, addUserReservationLinkCallback);
        }
    };

    var getConflictingReservationsCallback = function(result){

        if(result.error){
            res.status(403).json(result);

        } else if (result.results.length == 0) {
            // we can create the reservation
            reservation_service.create_reservation(req.session.user, req.body, createReservationCallback);
        } else {
            if (reservation_service.filterAllowedOverlappingReservations(reservation_service.organizeReservations(result.results)).length == 0) {
                // this means that we can make the reservation
                reservation_service.create_reservation(req.session.user, req.body, createReservationCallback);
            } else {
                result['error'] = true;
                result['err'] = "Conflicting Reservation(s)!";
                res.status(403).json(result);
            }
        }
    };

    var checkPermissionForResourceCallback = function(result){
        if (result.error) {
            console.log("here")
            res.status(400).json(result);
        } else if (result.results == {}) {
            result['err'] = "The resources you specified don't exist";
            res.status(400).json(result);
        } else {
            // now check if the user has reserve permission on all of the resources

            var resourcesWithPermission = reservation_service.filterResourcesByPermission(result.results, perm_service.get_permission_id(['reserve']));

            if (resourcesWithPermission.length == req.body.resource_ids.length) {
                reservation_service.get_conflicting_reservations(req.body, getConflictingReservationsCallback);
            } else {
                result = perm_service.denied_error;
                console.log(req.body.resource_ids)
                res.status(403).json(result);
            }
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
            // this gets all permissions for the resource
            var resources = [];
            for (i = 0; i<req.body.resource_ids.length; i++) {
                resources.push({resource_id: req.body.resource_ids[i]});
            }
            perm_service.check_permission_for_resources(resources, group_ids, checkPermissionForResourceCallback);
        }
    };

    if(!("start_time" in req.body) || !("end_time" in req.body) || !("resource_ids" in req.body)){
        res.status(400).json({err: "Missing fields"});
    } else if(req.body.start_time >= req.body.end_time){
        res.status(400).json({err: "start time must be less than end time"});
    } else {
        // we first get all of the groups that the user is a part of
        group_service.get_all_groups_for_user(req.session.user, getAllGroupsForUserCallback);
    }
});

router.post('/', auth.is('user'), function(req, res, next){
    var has_auth = false;

    if(!("start_time" in req.body) || !("end_time" in req.body) || !("reservation_id" in req.body)){
        res.status(400).json({result:{err:"missing field"}});
        return;
    }

    var updateReservationCallback = function(result) {
        if(result.error){
            res.status(400).json(result);
        } else if(result.results.affectedRows == 0){
            res.status(403).json(perm_service.denied_error)
        }else {
            //**Commented this out because the method was commented out in the service
            //reservation_service.scheduleEmailForReservation(req.session.user, req.body);
            res.status(200).json(result);
        }
    };

    if(perm_service.check_resource_permission(req.session)){
        has_auth = true;
    }    
    reservation_service.update_reservation_by_id(req.body, req.session.user, has_auth, updateReservationCallback)

});

router.delete('/', auth.is('user'), function(req, res, next){

    var hasAuth = false;
    if(!("reservation_id" in req.query)){
        res.status(400).json({results: {err: "no id provided"}});
        return;
    }

    var request_callback = function(result){
        if(result.error){
            res.status(403).json(result);
        } else {
            res.sendStatus(200);
        }
    };

    var getReservationByIdCallback = function(result) {
        if (result.error || result.results.length == 0) {
            res.status(400).json(result);
        } else {
            // if this is the user's reservation just delete it, if the user has requisite permission delete the reservation and send an email, else send a 403
            if (req.session.user.user_id == result.results[0].user_id) {
                reservation_service.delete_reservation_by_id(req.query, request_callback);
            } else if (hasAuth) {
                resource_service.notifyUserOnReservationDelete(result.results[0], req.session.user, result.results[0]);
                reservation_service.delete_reservation_by_id(req.query, request_callback);
            } else {
                // this means that the user doesn't have reservation management AND the reservation isn't theirs
                res.status(403).json(perm_service.denied_error);
            }
        }

    };

    if (perm_service.check_reservation_permission(req.session)) {
        hasAuth = true;
    }

    reservation_service.get_reservation_by_id(req.query, getReservationByIdCallback);
});

router.post('/remove_resource', function(req, res, next){
    var has_auth = false;
    var remove_resource_callback = function(result){
        if(result.error || result.results.affectedRows == 0){
            res.status(400).json({results: {err: perm_service.denied_error}})
        } else{
            res.status(200).json(result)
        }
    }

    if (perm_service.check_reservation_permission(req.session)) {
        has_auth = true;
    } 
    reservation_service.remove_resource_from_reservation(req.body, req.session.user, has_auth, remove_resource_callback);

});

router.post('/deny_request', function(req, res, next){

    var reservation = {};
    var resource_name = '';
    var deny_resource_callback = function(result){
        if(result.error){
            res.status(400).json(result)
        } else if(result.results.affectedRows == 0){
            res.status(403).json(perm_service.denied_error)
        } else{
            // send email for resource denial notification on success
            agenda.now('notify on resource denial', {user: req.session.user, reservation: reservation, resource_name: resource_name});
            res.status(200).json(result)
        }
    }

    // first get the reservation to get needed info for email notification
    var getReservationCallback = function(result) {
        if (result.error) {
            res.status(400).json(result);
        } else if(result.results.length == 0){
            res.status(400).json({err: "Invalid reservation id"})
        }else {
            // this is a list because the function returns an array - only going to be 1 element
            reservation = reservation_service.organizeReservations(result.results)[0];
            /// this gets the resource_name that was denied, the resource_id comes from job.attrs.data.reservation.resource_id
            var resources = reservation.resources;
            for (var i = 0; i<resources.length; i++) {
                if (req.body.resource_id == resources[i].resource_id) {
                    resource_name = resources[i].name;
                }
            }

            reservation_service.denyResourceReservation(req.body, req.session.user, deny_resource_callback);
        }
    };
    if(!req.session.auth){
        res.status(403).json(perm_service.denied_error);
        return;
    }
    check_for_management_permission(req, res, reservation_service.get_reservation_by_id, getReservationCallback);
});

router.post('/getReservationsByResources', function(req, res, next){
    var has_auth = false;
    var getReservationsByResourcesCallback = function(result){
        if(result.error){
            res.status(400).json({results: {err: perm_service.denied_error}});
        } else{
            res.status(200).json(result);
        }
    }

    var checkPermissionForResourceCallback = function(result){
        if (result.error) {
            res.status(400).json(result);
        } else if (result.results == {}) {
            result['err'] = "The resources you specified don't exist";
            res.status(400).json(result);
        } else {
            // now check if the user has reserve permission on all of the resources

            var resourcesWithPermission = reservation_service.filterResourcesByPermission(result.results, perm_service.get_permission_id(['reserve']));
            var resource_ids = [];
            for (var i = 0; i<resourcesWithPermission.length; i++) {
                resource_ids.push(resourcesWithPermission[i]);
            }
            if (resourcesWithPermission.length > 0) {
                reservation_service.get_reservations_by_resources({resource_ids: resource_ids}, getReservationsByResourcesCallback);
            } else {
                result = perm_service.denied_error;
                res.status(403).json(result);
            }
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
            // this gets all permissions for the resource
            var resources = [];
            for (i = 0; i<req.body.resource_ids.length; i++) {
                resources.push({resource_id: req.body.resource_ids[i]});
            }
            perm_service.check_permission_for_resources(resources, group_ids, checkPermissionForResourceCallback);
        }
    };

    if(!req.session.auth){
        res.status(403).json(perm_service.denied_error);
        return;
    }

    group_service.get_all_groups_for_user(req.session.user, getAllGroupsForUserCallback);
});

router.post('/confirm_request', function(req, res, next){

    //Check if it is last reservation needed to be confirmed
    //if yes, delete conflicting reservations
    //if no, just change status of reservation
    var delete_conflicting_reservation_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        }
        else{
            res.status(200).json(result);
        }
    }

    var check_reservation_confirmation_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        }
        else if(result.results.length == 0){
            reservation_service.deleteConflictingReservations(req.body, delete_conflicting_reservation_callback)
        }
        else{
            res.status(200).json(result)
        }
    }

    var confirm_resource_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        }
        else if(result.results.affectedRows == 0){
            res.status(403).json(perm_service.denied_error);
        }
        else{
            reservation_service.get_unconfirmed_resources_for_reservation(req.body, check_reservation_confirmation_callback)
        }
    }
    var get_reservation_info_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        }
        else if(result.results.length == 0){
            res.status(403).json(perm_service.denied_error)
        }
        else{
            req.body.start_time = result.results[0].start_time;
            req.body.end_time = result.results[0].end_time;

            reservation_service.confirmResourceReservation(req.body, req.session.user, confirm_resource_callback);
        }
    }
    if(!req.session.auth){
        res.status(403).json(perm_service.denied_error);
        return;
    }
    check_for_management_permission(req, res, reservation_service.get_reservation_by_id, get_reservation_info_callback);


});

var check_for_management_permission = function(req, res, to_call, callback){
        var checkPermissionForResourceCallback = function(result){
        if (result.error) {
            res.status(400).json(result);
        } else if (result.results == {}) {
            result['err'] = "The resources you specified don't exist";
            res.status(400).json(result);
        } else {
            // now check if the user has reserve permission on all of the resources

            var resourcesWithPermission = reservation_service.filterResourcesByPermission(result.results, perm_service.get_permission_id(['manage']));

            if (resourcesWithPermission.length == 1) {
                to_call(req.body, callback)
            } else {
                result = perm_service.denied_error;
                res.status(403).json(result);
            }
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
            // this gets all permissions for the resource
            var resources = [];
            resources.push({resource_id: req.body.resource_id});
            perm_service.check_permission_for_resources(resources, group_ids, checkPermissionForResourceCallback);
        }
    };
    group_service.get_all_groups_for_user(req.session.user, getAllGroupsForUserCallback);
}

module.exports = router;
