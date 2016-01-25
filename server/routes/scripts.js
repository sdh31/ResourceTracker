var express = require('express');
var router = express.Router();
var app = express();

// sendFile needs full path
var basePath =  '/home/bitnami/ResourceTracker/client/scripts';

router.get('/app.js', function(req, res, next){
  res.sendFile(basePath + '/app.js');
});

router.get('/controllers/*.js', function(req, res, next){
  res.sendFile(basePath + req.path);
});


module.exports = router;

