var express = require('express');
var router = express.Router();
var tag_service = require('../services/tags');

// this gets all tags
router.get('/', function(req, res, next){
  var tags_callback = function(result){
    if (result.error == true){
      console.log("err" + " "+result.err);
      res.sendStatus(400);
    }
    res.send(JSON.stringify(result));
  }

  //This is due to weird json behavior -- if there is only one string it isn't recognized as a list
  //-- if list is only one string long, it reads characters instead of words

  tag_service.get_all_tags(tags_callback);
});

// this takes includedTags and excludedTags in req.body and returns all resources that have any one of the included tags and none of the excluded tags
router.post('/filter', function(req, res, next){
    var filter_callback = function(result){
    if (result.error == true){
      console.log("err" + " "+result.err);
      res.sendStatus(400);
    }
    res.send(JSON.stringify(result));
  }

	var includedTags = req.body.includedTags;
	var excludedTags = req.body.excludedTags;
    var start_time = req.body.start_time;
    var end_time = req.body.end_time;

	tag_service.filter_by_tag(includedTags, excludedTags, start_time, end_time, filter_callback);
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
});

router.post('/', function(req, res, next){
    var delete_callback = function(result){
        if (result.error == true){
          console.log("err" + " "+result.err)
          res.sendStatus(400);
        }
        res.sendStatus(200);
    }
    tag_service.remove_tag_from_object(req.body, delete_callback);
});

module.exports = router;
