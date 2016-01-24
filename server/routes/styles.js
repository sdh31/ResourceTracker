var express = require('express');
var router = express.Router();
var app = express();

// sendFile needs full path
app.set('/styles', '/home/bitnami/ResourceTracker/client/app/styles/');
var basePath = app.settings['/styles'];

router.get('/main.css', function(req, res, next){
  res.sendFile(basePath + 'main.css');
});

module.exports = router;

