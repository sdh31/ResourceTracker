var express = require('express');
var router = express.Router();

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

router.put('/tag', function(req, res, next){

})

router.delete('/tag', function(req, res, next){
  
})

module.exports = router;