var express = require('express');
var router = express.Router();
var res_service = require('../services/resources');
var tag_service = require('../services/tags');

router.get('/', function(req, res, next){
  //read user from name in URL queries
  var getResourceCallback = function (result) {
      if (result.error == true){
        res.sendStatus(400)
      }
      else{
        res.send(JSON.stringify(result));
      }
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
        console.log(result.error)
        if(result.error == true){
          console.log('etf')
            res.sendStatus(400);
        }
        else{
            //res.write(JSON.stringify(result));
            res.sendStatus(200);
        }
    }
  var create_resource_callback = function(result){
    console.log('here')
    if(result.error == true){
      res.sendStatus(400);
  }
    else{
        var res_id = result.insertId;//JSON.parse(result).insertId;
        //console.log("yo"+JSON.parse(result).insertId)
        tag_service.create_tag(res_id, req.body.tag, create_tag_resource_callback, tag_service.create_resource_tag_link);
  }
}
res_service.create_resource(req.body, create_resource_callback);
});

router.post('/', function(req, res, next){
  //update user
    var update_resource_callback = function(result){
        if(result.error == true){
            res.sendStatus(400);
        }
        else{
            //res.write(JSON.stringify(result));
            res.sendStatus(200);
        }
    }

    res_service.update_resource_by_id(req.body, update_resource_callback);
});

router.delete('/', function(req, res, next){
  //delete resource
  var delete_resource_callback = function(result){
    if (result.error == true){
      console.log("err" + " "+result.err)
      res.sendStatus(400);
    }
    //res.write(JSON.stringify(result));
    res.sendStatus(200);
  }

  id = req.query["id"];
  res_service.delete_resource_tag_pair_by_resource(id,delete_resource_callback);
});

router.get('/filter', function(req, res, next){
  var filter_callback = function(result){
    if (result.error == true){
      console.log("err" + " "+result.err)
      res.sendStatus(400);
    }
    res.send(JSON.stringify(result));
  }

  var tags = [].concat(req.query['tags'])
  //This is due to weird js string behavior 
  //-- if list is only one string long, it reads characters instead of words
  tags.push('')

  tag_service.filter_by_tag(tags, filter_callback)
});

module.exports = router;
