var express = require('express');
var app = express();

var body_parser = require('body-parser');
var cookie_parser = require('cookie-parser');
var session = require('express-session');
var redis = require('redis');
var redis_store = require('connect-redis')(session);
var client = redis.createClient();
var views = require('./routes/views');
var user_routes = require('./routes/users');
var resource_routes = require('./routes/resources');
var reservation_routes = require('./routes/reservations');
var script_routes = require('./routes/scripts');
var script_routes = require('./routes/node_modules');
var style_routes = require('./routes/styles');
var initialize_tables = require('./services/initialize_tables');
var user_db_functions = require('./services/users');

app.use(body_parser.json());
app.use(cookie_parser());
app.use(session({
    secret: 'ssshhhhh',
    store: new redis_store({ host: 'localhost', port: 6379, client: client,ttl :  260}),
    saveUninitialized: false,
    resave: false,
	key: 'sid'
}));
app.use('/', views);
app.use('/views', views);
app.use('/user', user_routes);
app.use('/resource', resource_routes);
app.use('/reservations', reservation_routes);
app.use('/scripts', script_routes);
app.use('/node_modules', node_modules_routes);
app.use('/styles', style_routes);

app.engine('html', require('ejs').renderFile);

initialize_tables.initializeDB(function callback(){});

app.listen(80, function () {
  console.log('Example app listening on port 80!');
});

// leaves the server up when exception occurs

process.on('uncaughtException', function (err) {
    console.log(err);
});
