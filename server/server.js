var express = require('express');
var app = express();

var views = require('./routes/views');
var user_routes = require('./routes/users');
var resource_routes = require('./routes/resources');
var reservation_routes = require('./routes/reservations');
var script_routes = require('./routes/scripts');
var style_routes = require('./routes/styles');
var db_modules = require('./database_modules');

app.use('/', views);
app.use('/views', views);
app.use('/user', user_routes);
app.use('/resource', resource_routes);
app.use('/reservations', reservation_routes);
app.use('/scripts', script_routes);
app.use('/styles', style_routes);

app.engine('html', require('ejs').renderFile);

db_modules.initializeDB(null);

app.listen(80, function () {
  console.log('Example app listening on port 80!');
});

// leaves the server up when exception occurs

process.on('uncaughtException', function (err) {
    console.log(err);
}); 
