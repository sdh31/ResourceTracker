var express = require('express');
var router = express.Router();
var res_service = require('../services/resources');

router.get('/', function(req, res, next){
  //read user from name in URL queries
  var getResourceCallback = function (result) {
      res.send(JSON.stringify(result));
  };

  name = req.query['name'];
  if (name == null){
    res.sendStatus(401);
  }
  else{
    res_service.get_resource_by_name(name, getResourceCallBack);
  }
});

router.put('/', function(req, res, next){
  //create user

  var createResourceCallback = function(result){
    if(result.error == true){
      res.sendStatusCode(401);
    }
    else{
      res.sendStatusCode(200);
      res.send(JSON.stringify(result));
    }
  }
  

  create_resource(req.body, createResourceCallback);

});

router.post('/', function(req, res, next){
  //update user
});

router.delete('/', function(req, res, next){
  //delete user
});

module.exports = router;
