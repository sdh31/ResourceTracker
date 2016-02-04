var express = require('express');
var router = express.Router();
var reservation_service = require('../services/reservations');

router.get('/', function(req, res, next){
  //read user
    var query = req.query;
    if(query.start_time == null || query.end_time == null || query.resource_id == null){
        res.sendStatus(400);
    }
    reservation_service.get_reservations_by_resource(req.query, null);
});

router.put('/', function(req, res, next){
  //create user
 var query = req.query;
    if(query.start_time == null || query.end_time == null || query.resource_id == null){
        res.sendStatus(400);
    }

    //reservation_service.create_reservation();
});

router.post('/', function(req, res, next){
  //update user
  var query = req.query;
  if(query.reservation_id == null){
    res.sendStatus(400);
  }

  //reservation_service.update_reservation();
});

router.delete('/', function(req, res, next){
  //delete user
  var query = req.query;
  if(query.reservation_id == null){
    res.sendStatus(400);
  }

  //reservation_service.delete_reservation();


});

module.exports = router;
