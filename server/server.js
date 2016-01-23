var express = require('express');
var app = express();
var __dirname = '../client';

var views = require('./routes/views');
var user_routes = require('./routes/users');
var resource_routes = require('./routes/resources');
var reservation_routes = require('./routes/reservations');
var db_modules = require('./database_modules');

app.use('/', views);
app.use('/user', user_routes);
app.use('/resource', resource_routes);
app.use('/reservations', reservation_routes);

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

db_modules.initializeDB(null);

app.listen(80, function () {
  console.log('Example app listening on port 80!');
});

// leaves the server up when exception occurs

process.on('uncaughtException', function (err) {
    console.log(err);
}); 
