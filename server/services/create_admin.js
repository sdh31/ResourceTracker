var user_services = require('./users');

exports.createAdmin = function(err) {

	var admin = {
		username: 'admin',
		password: 'Treeadmin',
		permission_level: 'admin',
		firstName: 'admin',
		lastName: 'admin',
		email: 'admin@admin.com'
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
