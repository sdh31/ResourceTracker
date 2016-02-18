var express = require('express');
var router = express.Router();
var reservation_service = require('../services/reservations');
var auth = require('../services/authorization');

router.get('/', auth.is('user'), function(req, res, next){
    var request_callback = function(result){
        if(result.error){
            res.status(400).json(result);
        } else{
            res.status(200).json(result);
        }
    };

    var query = req.query;

    if(!("start_time" in query) || !("end_time" in query) || !("resource_id" in query)){
        res.sendStatus(400);
    }

    reservation_service.get_conflicting_reservations(req.query, request_callback);
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
            res.status(403).json(result);
        } else {
            // this means that we can make the reservation
            reservation_service.create_reservation(req.session.user, req.body, createReservationCallback)
        }
    };

    if(!("start_time" in req.body) || !("end_time" in req.body) || !("resource_id" in req.body)){
        res.sendStatus(400);
    } else if(req.body.start_time >= req.body.end_time){
        res.sendStatus(400);
    } else {
        reservation_service.get_conflicting_reservations(req.body, getConflictingReservationsCallback);
    }
});

router.post('/', auth.is('user'), function(req, res, next){

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
            res.status(403).json(result);
        } else {
            // this means that we can make the reservation
            reservation_service.update_reservation_by_id(req.body, updateReservationCallback)
        }
    };

    if(!("start_time" in req.body) || !("end_time" in req.body) || !("reservation_id" in req.body)){
        res.sendStatus(400);
    } else {
        reservation_service.get_conflicting_reservations(req.body, getConflictingReservationsCallback);
    }
});

router.delete('/', auth.is('user'), function(req, res, next){
    var request_callback = function(result){
        if(result.error){
            res.sendStatus(403);
        } else {
            res.sendStatus(200);
        }
    };

    var reservation = req.query;
    if(!("reservation_id" in reservation)){
        res.sendStatus(400);
    } else {
        reservation_service.delete_reservation_by_id(
            reservation,
            request_callback
        );
    }
});

module.exports = router;
