var user_services = require('./users');
var resource_service = require('./resources');

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
	
	var addGroupPermissionToResourceCallback = function (result) {
		if (result.error) {
			console.log('oh no');
		} else {
			console.log('admin successfully created');
		}
	};

    var createAdminUserCallback = function (result) {
		if (result.error) {
			console.log('admin already created');
		} else {
			resource_service.addGroupPermissionToResource({resource_id: 1, group_ids: [1], resource_permissions: ['view']}, addGroupPermissionToResourceCallback);
		}
	};

	user_services.create_user(admin, createAdminUserCallback);
};
