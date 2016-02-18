var user_services = require('./users');

exports.createAdmin = function(err) {

	var admin = {
		username: 'admin',
		password: 'Treeadmin',
		user_management_permission: 1,
		resource_management_permission: 1,
		reservation_management_permission: 1,
        is_shibboleth: 0,
		first_name: 'admin',
		last_name: 'admin',
		email_address: 'admin@admin.com',
        emails_enabled: 1
	};
	
	var createAdminUserCallback = function (result) {
		if (result.error) {
			console.log('admin already created');
		} else {
			console.log('admin successfully created')
		}
	};

	user_services.create_user(admin, createAdminUserCallback);
};
