var express = require('express');
var router = express.Router();
var reservation_service = require('../services/reservations');
var auth = require('../services/authorization');

router.get('/', auth.is('user'), function(req, res, next){
    var request_callback = function(result){
        if(result.error == true){
            res.status(400).json(result);
        } else{
            res.status(200).json(result);
        }
    };

    var query = req.query;

    if(!("start_time" in query) || !("end_time" in query) || !("resource_id" in query)){
        res.sendStatus(400);
    }

    reservation_service.get_conflicting_reservations(
        req.session.user,
        req.query,
        request_callback, 
        request_callback);
});

router.put('/', function(req, res, next){

    var request_callback = function(result){
        if(result.error){
            res.status(403).json(result);
        } else{
            res.status(200).json(result);
        }
    };

    var reservation = req.body;
    if(!("start_time" in reservation) || !("end_time" in reservation) || !("resource_id" in reservation)){
        res.sendStatus(400);
    } else if(reservation.start_time >= reservation.end_time){
        res.sendStatus(400);
    } else {
        reservation_service.get_conflicting_reservations(
            req.session.user,
            reservation,
            request_callback,
            reservation_service.create_reservation
        );
    }
});

router.post('/', auth.is('user'), function(req, res, next){

    var request_callback = function(result){
        if(result.error == true){
            res.sendStatus(403);
        } else{
            res.sendStatus(200);
        }
    };

    var reservation = req.body;
    if(!("start_time" in reservation) || !("end_time" in reservation) || !("reservation_id" in reservation)){
        res.sendStatus(400);
    } else {
        reservation_service.get_conflicting_reservations(
            req.session.user,
            reservation,
            request_callback, 
            reservation_service.update_reservation_by_id
        );
    }
});

router.delete('/', auth.is('user'), function(req, res, next){
    var request_callback = function(result){
        if(result.error == true){
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
