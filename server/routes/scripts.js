var express = require('express');
var router = express.Router();
var app = express();

// sendFile needs full path
app.set('/scripts', '/home/bitnami/ResourceTracker/client/app/scripts/');
var basePath = app.settings['/scripts'];

router.get('/app.js', function(req, res, next){
  res.sendFile(basePath + 'app.js');
});

router.get('/controllers/login.js', function(req, res, next){
  res.sendFile(basePath + 'controllers/login.js');
});

router.get('/controllers/register.js', function(req, res, next){
  res.sendFile(basePath + 'controllers/register.js');
});

module.exports = router;
