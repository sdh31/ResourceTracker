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
create_resource(username, req.body, createResourceCallback);

});

router.post('/', function(req, res, next){
  //update user
    var update_resource_callback = function(result){
        if(result.error == true){
            res.sendStatusCode(401);
        }
        else{
            res.write(JSON.stringify(result));
            res.sendStatusCode(200);
        }
    }

    res_service.update_resource_by_id(req.body, update_resource_callback);
});

router.delete('/', function(req, res, next){
  //delete resource
  var delete_resource_callback(result){
    res.write(JSON.stringify(result));
    res.sendStatusCode(200);
  }

  id = req.query["id"];
  res_service.delete_resource_by_id(id,delete_resource_callback);
});

module.exports = router;
