var express = require('express');
var router = express.Router();
var tag_service = require('../services/tags');

router.get('/', function(req, res, next){
  var filter_callback = function(result){
    if (result.error == true){
      console.log("err" + " "+result.err)
      res.sendStatus(400);
    }
    res.send(JSON.stringify(result));
  }

  //This is due to weird json behavior -- if there is only one string it isn't recognized as a list
  //-- if list is only one string long, it reads characters instead of words
  var tags = [].concat(req.query['tags'])

  tag_service.filter_by_tag(tags, filter_callback)
});

router.put('/', function(req, res, next){

    var create_tag_resource_callback = function(result){
        console.log(result.error)
        if(result.error == true){
            console.log(result.err)
                res.sendStatus(400);
        }
        else{
            //res.write(JSON.stringify(result));
            res.sendStatus(200);
        }
        
    }
    tag_service.create_tag(req.body.resource_id, req.body.addedTags, create_tag_resource_callback, tag_service.create_resource_tag_link);
})

router.post('/', function(req, res, next){
    var delete_callback = function(result){
        if (result.error == true){
          console.log("err" + " "+result.err)
          res.sendStatus(400);
        }
            res.sendStatus(200);
        }
        tag_service.remove_tag_from_object(req.body, delete_callback)
    })

module.exports = router;
