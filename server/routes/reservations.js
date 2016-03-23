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
            // schedule the email reminder for this reservation!
            var reservation = {
                reservation_id: req.body.reservation_id,
                resources: resourcesOnReservation,
                start_time: req.body.start_time,
                end_time: req.body.end_time,
                reservation_title: req.body.reservation_title,
                reservation_description: req.body.reservation_description
            };
            agenda.schedule(new Date(reservation.start_time), 'send email', {user: req.session.user, reservation: reservation});

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
            res.status(400).json(result);
        } else if (result.results == {}) {
            result['err'] = "The resources you specified don't exist";
            res.status(400).json(result);
        } else {
            // now check if the user has reserve permission on all of the resources

            var resourcesWithPermission = [];
            for (var i = 0; i<result.results.length; i++) {
                if ((result.results[i].resource_permission == 'reserve' || result.results[i].resource_permission == 'manage') && resourcesWithPermission.indexOf(result.results[i].resource_id) == -1) {
                    resourcesWithPermission.push(result.results[i].resource_id);
                }
            }
            if (resourcesWithPermission.length == req.body.resource_ids.length) {
                reservation_service.get_conflicting_reservations(req.body, getConflictingReservationsCallback);
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
            // TODO: NEEED TO CHANGE THIS PERMISSION CHECK TO TAKE RESOURCE_IDS
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
    if(!("start_time" in req.body) || !("end_time" in req.body) || !("reservation_id" in req.body)){
        res.status(400).json({result:{err:"missing field"}});
        return;
    }

    var updateReservationCallback = function(result) {
        if(result.error){
            res.status(403).json(result);
        } else {
            //**Commented this out because the method was commented out in the service
            //reservation_service.scheduleEmailForReservation(req.session.user, req.body);
            res.status(200).json(result);
        }
    };

    var getConflictingReservationsCallback = function(result){
        if(result.error){
                    console.log(result)
            res.status(403).json(result);
        } else if (result.results.length > 0) {
            res.status(403).json({results:{err: "conflicting reservations"}});
        } else {
            // this means that we can make the reservation
            reservation_service.update_reservation_by_id(req.body, updateReservationCallback)
        }
    };

    var getReservationByIdCallback = function(result) {
        if (result.error) {
            res.status(403).json(result);
        } else {
            if (req.session.user.user_id == result.results.user_id) {
                reservation_service.get_conflicting_reservations(req.body, getConflictingReservationsCallback);
            } else {
                // this means that the user doesn't have reservation management AND the reservation isn't theirs
                res.status(403).json(perm_service.denied_error);
            }
        }
    };
    if(!perm_service.check_resource_permission(req.session)){
        
            // if user does not have reservation management permission, check if this is their own reservation
            reservation_service.get_reservation_by_id(req.body, getReservationByIdCallback);
        } else {
            // if they do have reservation management permission, just let them do what they gotta do
            reservation_service.get_conflicting_reservations(req.body, getConflictingReservationsCallback);
    }
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
        if (result.error) {
            res.status(400).json(result);
        } else {
            // if this is the user's reservation just delete it, if the user has requisite permission delete the reservation and send an email, else send a 403
            if (req.session.user.user_id == result.results.user_id) {
                reservation_service.delete_reservation_by_id(req.query, request_callback);
            } else if (hasAuth) {
                resource_service.notifyUserOnReservationDelete(result.results);
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

    var remove_resource_callback = function(result){
        if(result.error){
            res.status(400).json({results: {err: "You don't appear to have a reservation with the given ID"}})
        } else{
            res.status(200).json(result)
        }
    }

    if (perm_service.check_reservation_permission(req.session)) {
        reservation_service.remove_resource_from_reservation(req.body, req.session.user, remove_resource_callback);
    } else{
        res.status(403).json(perm_service.denied_error);
    }
});

router.post('/deny_request', function(result){
    //Gonna end up being basically the same as deleting a reservation
});

router.post('/confirm_request', function(result){
    //Check if it is last reservation needed to be confirmed
    //if yes, delete conflicting reservations
    //if no, just change status of reservation
});

module.exports = router;
