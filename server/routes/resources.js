var express = require('express');
var router = express.Router();
var res_service = require('../services/resources');


//var connection = db_sql.pool.getConnection();

router.get('/', function(req, res, next){
  //read user
  res_service.get_res("chris");
  res.type('text/plain');
  res.send('YOU ARE LOGGED IN');
});

router.put('/', function(req, res, next){
  //create user
  create_resource();

});

router.post('/', function(req, res, next){
  //update user
});

router.delete('/', function(req, res, next){
  //delete user
});

module.exports = router;
