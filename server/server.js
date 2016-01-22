var express = require('express');
var app = express();
var __dirname = '../client';

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.get('/', function (req, res) {
  res.render('default.html');
});

app.listen(80, function () {
  console.log('Example app listening on port 80!');
});
