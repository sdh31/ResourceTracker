var express = require('express');
var router = express.Router();
var res_service = require('../services/resources');


//var connection = db_sql.pool.getConnection();

router.get('/', function(req, res, next){
  //read user from name in URL queries
  var callback = function (err, result) {
      res.send(result);
  		//need to modify response here
  };

  name = req.query['name'];
  if (name == null){
    res.sendStatus(401);
  }
  else{
    res_service.get_resource_by_name(name, callback);
  }
});

router.put('/', function(req, res, next){
  //create user

  var callback = function(err, result){
    res.send(result);
    //Maybe just send a json true or false?
  }
  create_resource();

});

router.post('/', function(req, res, next){
  //update user
});

router.delete('/', function(req, res, next){
  //delete user
});

module.exports = router;
