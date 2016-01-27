var express = require('express');
var router = express.Router();
var res_service = require('../services/resources');
var tag_service = require('../services/tags');

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
    res_service.get_resource_by_name(name, getResourceCallback);
}
});

router.put('/', function(req, res, next){
  //create user
 var create_tag_resource_callback = function(result){
        if(result.error == true){
            res.sendStatus(400);
        }
        else{
            //res.write(JSON.stringify(result));
            res.status(200);
            res.send();
        }
    }
  var createResourceCallback = function(result){

    if(result.error == true){
      res.sendStatus(400);
  }
  else{
        console.log("yay")
        var res_id = JSON.parse(result).insertId;
        console.log("yo"+JSON.parse(result).insertId)
        tag_service.create_tag(res_id, req.body.tag, create_tag_resource_callback, tag_service.create_resource_tag);
  }
}
var username = "chris";
console.log(req.body)
res_service.create_resource(username, req.body, createResourceCallback);

});

router.post('/', function(req, res, next){
  //update user
    var update_resource_callback = function(result){
        if(result.error == true){
            res.sendStatus(400);
        }
        else{
            res.write(JSON.stringify(result));
            res.sendStatus(200);
        }
    }

    res_service.update_resource_by_id(req.body, update_resource_callback);
});

router.delete('/', function(req, res, next){
  //delete resource
  var delete_resource_callback = function(result){
    res.write(JSON.stringify(result));
    res.sendStatus(200);
  }

  id = req.query["id"];
  res_service.delete_resource_by_id(id,delete_resource_callback);
});

module.exports = router;
