var body_parser = require('body-parser');
var express = require('express');
var app = express();

var fs = require('fs');
var https = require('https');
var privateKey = fs.readFileSync('/opt/bitnami/apache2/conf/server.key', 'utf8');
var certificate = fs.readFileSync('/opt/bitnami/apache2/conf/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var auth_middleware = require('./middleware/permission_middleware');

var body_parser = require('body-parser');
var cookie_parser = require('cookie-parser');
var session = require('express-session');
var redis = require('redis');
var redis_store = require('connect-redis')(session);
var client = redis.createClient();

var views = require('./routes/views');
var tag_routes = require('./routes/tags');
var user_routes = require('./routes/users');
var resource_routes = require('./routes/resources');
var reservation_routes = require('./routes/reservations');
var script_routes = require('./routes/scripts');
var node_modules_routes = require('./routes/node_modules');
var style_routes = require('./routes/styles');
var group_routes = require('./routes/groups')
var initialize_tables = require('./services/initialize_tables');
var create_admin = require('./services/create_admin');
var shibboleth = require('./routes/shibboleth');


app.use(body_parser.json());
// Added for Duke Shibboleth POST
app.use(body_parser.urlencoded({ extended: true }));
app.use(cookie_parser());

app.use(session({
    secret: 'ssshhhhh',
    store: new redis_store({ host: 'localhost', port: 6379, client: client,ttl :  260}),
    saveUninitialized: false,
    resave: false,
	key: 'sid'
}));

app.use(auth_middleware.api_auth);
app.use(auth_middleware.populate_permissions);

app.use('/', views);
app.use('/views', views);
app.use('/tag', tag_routes);
app.use('/user', user_routes);
app.use('/resource', resource_routes);
app.use('/reservation', reservation_routes);
app.use('/group', group_routes);
app.use('/scripts', script_routes);
app.use('/node_modules', node_modules_routes);
app.use('/styles', style_routes);
app.use('/', shibboleth);

app.engine('html', require('ejs').renderFile);

initialize_tables.initializeDB(create_admin.createAdmin);

https.createServer(credentials, app).listen(443);

// leaves the server up when exception occurs

process.on('uncaughtException', function (err) {
    console.log(err);
});
