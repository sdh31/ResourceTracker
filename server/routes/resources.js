var express = require('express');
var router = express.Router();
var res_service = require('../services/resources');


//var connection = db_sql.pool.getConnection();

router.get('/', function(req, res, next){
  //read user
  var callback = function (err, result) {
  		console.log(result);
  };


  res_service.get_resource_by_name("chris", callback);
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
