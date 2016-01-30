var user_services = require('./users');

exports.createAdmin = function(err) {

	var admin = {
		username: 'admin',
		password: 'admin',
		permission_level: 'admin'
	};
	
	var createAdminUserCallback = function (result) {
		if (result.error == true) {
			console.log('admin already created');
		} else {
			console.log('admin successfully created');
		}
	};

	user_services.create_user(admin, createAdminUserCallback);
};
