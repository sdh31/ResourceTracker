var express = require('express');
var app = express();
var ConnectRoles = require('connect-roles');

// Role based authorization
var authorization = new ConnectRoles({
	// failureHandler obtained from https://www.npmjs.com/package/connect-roles
	failureHandler: function (req, res, action) {
		var accept = req.headers.accept || '';
		res.status(403);
		if (~accept.indexOf('html')) {
			res.render('access-denied', {action: action});
		} else {
			res.send("Access Denied. You need the permission level '" + action + "' to make this request.");
		}
	}
});

authorization.use('admin', function (req) {
	return req.session && req.session.user && req.session.user.permission_level == 'admin';
});

authorization.use('user', function (req) {
	return req.session && req.session.user &&
		(req.session.user.permission_level == 'user' || req.session.user.permission_level == 'admin');
});

app.use(authorization.middleware());

module.exports = authorization
