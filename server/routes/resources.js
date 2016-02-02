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
    var create_tag_resource_callback = function(result) {
        console.log(result.error)
        if(result.error == true){
            console.log(result.err)
            res.sendStatus(400);
        } else {
            //res.write(JSON.stringify(result));
            res.sendStatus(200);
        }
    }

    var create_resource_callback = function(result) {
        if(result.error == true) {
            res.sendStatus(400);
        } else {
            var res_id = result.insertId;
            if (req.body.tags.length) {
                tag_service.create_tag(res_id, req.body.tags, create_tag_resource_callback, tag_service.create_resource_tag_link);
            } else {
                res.sendStatus(200);
            }
        }
    }

    res_service.create_resource(req.body, create_resource_callback);
});

router.post('/', function(req, res, next){
  //update resource

	var deleteTagsCallback = function(result){
		if (result.error == true){
		  console.log("err" + " "+result.err)
		  res.sendStatus(400);
		} else {
        	res.sendStatus(200);

		}
    }

	var addTagsCallback = function(result){
        if(result.error == true){
            console.log(result.err)
            res.sendStatus(400);
        }
        else{
            //res.write(JSON.stringify(result));
			tag_service.remove_tag_from_object(req.body.resource.resource_id, req.body.deletedTags, deleteTagsCallback)
            //res.sendStatus(200);
        }
    }

    var update_resource_callback = function(result){
        if(result.error == true){
            res.sendStatus(400);
        }
        else{
            //res.write(JSON.stringify(result));
			tag_service.create_tag(req.body.resource.resource_id, req.body.addedTags, addTagsCallback, tag_service.create_resource_tag_link);
            //res.sendStatus(200);
        }
    }

    res_service.update_resource_by_id(req.body.resource, update_resource_callback);
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
  tag_service.delete_resource_tag_pairs_by_resource(id,delete_resource_callback, res_service. delete_resource_by_id);
});

router.get('/tag', function(req, res, next){
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

router.get('/all', function(req, res, next) {
	var getAllResourcesCallback = function(result){
		if (result.error == true) {
		  console.log("err" + " "+result.err)
		  res.sendStatus(400);
		} else if (result.empty == true) {
			console.log("no resources!");
			res.send(JSON.stringify(result.resources));
		} else {
			console.log('we good, we got resources');
			res.send(result.resources);
		}
  	}

  res_service.get_all_resources(getAllResourcesCallback);
	
});

router.put('/tag', function(req, res, next){

})

router.delete('/tag', function(req, res, next){
  
})

module.exports = router;
