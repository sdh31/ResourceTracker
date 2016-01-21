var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(80,'152.3.53.215', function () {
  console.log('Example app listening on port 80!');
});
