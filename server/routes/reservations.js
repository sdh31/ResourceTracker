var express = require('express');
var router = express.Router();
var reservation_service = require('../services/reservations');
var auth = require('../services/authorization');
var perm_service = require('../services/permissions');
var group_service = require('../services/groups');
var resource_service = require('../services/resources');

router.get('/', auth.is('user'), function(req, res, next){
    var getAllReservationsForUserCallback = function(result){
        if(result.error){
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }
    };

    reservation_service.getAllReservationsForUser(req.session.user, getAllReservationsForUserCallback);
});

router.put('/', function(req, res, next){

    var addUserReservationLinkCallback = function(result) {
        if(result.error){
            res.status(403).json(result);
        } else {
            result.results.insertId = req.body.reservation_id;
            res.status(200).json(result);
        }
    };

    var createReservationCallback = function(result) {
        if(result.error){
            res.status(403).json(result);
        } else {
            // this means that we can add the link to user
            req.body.reservation_id = result.results.insertId;
            reservation_service.scheduleEmailForReservation(req.session.user, req.body);
            reservation_service.add_user_reservation_link(req.session.user, req.body, addUserReservationLinkCallback);
        }
    };

    var getConflictingReservationsCallback = function(result){
        if(result.error){
            res.status(403).json(result);
        } else if (result.results.length > 0) {
            result.error = true;
            result.err = "Conflicting Reservation(s)!"
            res.status(403).json(result);
        } else {
            // this means that we can make the reservation
            reservation_service.create_reservation(req.session.user, req.body, createReservationCallback)
        }
    };

    var checkPermissionForResourceCallback = function(result){
        if (result.error) {
            res.sendStatus(400);
        } else if (result.results == {}) {
            res.sendStatus(403);
        } else {
            // now check if the user has reserve permission
            if (group_service.checkReservePermission(result.results)) {
                reservation_service.get_conflicting_reservations(req.body, getConflictingReservationsCallback);
            } else {
                res.sendStatus(403);
            }
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
            // this gets all permissions for the resource
            perm_service.check_permission_for_resource(req.body.resource_id, group_ids, checkPermissionForResourceCallback);
        }
    };

    if(!("start_time" in req.body) || !("end_time" in req.body) || !("resource_id" in req.body)){
        res.sendStatus(400);
    } else if(req.body.start_time >= req.body.end_time){
        res.sendStatus(400);
    } else {
        // we first get all of the groups that the user is a part of
        group_service.get_all_groups_for_user(req.session.user, getAllGroupsForUserCallback);
    }
});

router.post('/', auth.is('user'), function(req, res, next){

    if(!("start_time" in req.body) || !("end_time" in req.body) || !("reservation_id" in req.body)){
        res.sendStatus(400);
        return;
    }

    var updateReservationCallback = function(result) {
        if(result.error){
            res.status(403).json(result);
        } else {
            reservation_service.scheduleEmailForReservation(req.session.user, req.body);
            res.status(200).json(result);
        }
    };

    var getConflictingReservationsCallback = function(result){
        if(result.error){
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
            res.sendStatus(403).json(result);
        } else {
            if (req.session.user.user_id == result.results.user_id) {
                reservation_service.get_conflicting_reservations(req.body, getConflictingReservationsCallback);
            } else {
                // this means that the user doesn't have reservation management AND the reservation isn't theirs
                res.sendStatus(403).json(perm_service.denied_error);
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
        res.sendStatus(400);
        return;
    }

    var request_callback = function(result){
        if(result.error){
            res.sendStatus(403);
        } else {
            res.sendStatus(200);
        }
    };

    var getReservationByIdCallback = function(result) {
        if (result.error) {
            res.sendStatus(403);
        } else {
            // if this is the user's reservation just delete it, if the user has requisite permission delete the reservation and send an email, else send a 403
            if (req.session.user.user_id == result.results.user_id) {
                reservation_service.delete_reservation_by_id(req.query, request_callback);
            } else if (hasAuth) {
                resource_service.notifyUserOnReservationDelete(result.results);
                reservation_service.delete_reservation_by_id(req.query, request_callback);
            } else {
                // this means that the user doesn't have reservation management AND the reservation isn't theirs
                res.sendStatus(403);
            }
        }
    };
    
    if (perm_service.check_resource_permission(req.session)) {
            hasAuth = true;
    }
        reservation_service.get_reservation_by_id(req.query, getReservationByIdCallback);
});

module.exports = router;
