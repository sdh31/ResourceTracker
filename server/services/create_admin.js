var user_services = require('./users');
var group_services = require('./groups');

exports.createAdmin = function(err) {

	var admin = {
		username: 'admin',
		password: 'Treeadmin',
		permission_level: 'admin',
		firstName: 'admin',
		lastName: 'admin',
		email: 'admin@admin.com'
	};
	var admin_group = {
		username: 'admin',
		description: 'admin user private group',
		user_management_permission: true,
		resource_management_permission: true,
		reservation_management_permission: true,
		is_private: true
	}
	var addAdminToGroupCallback = function(result){
		if(result.error == true){
			console.log('could not create admin group link')
		}
		else{
			console.log('admin completely created :D')
		}
	}

	var createAdminGroupCallback = function(result){
		if(result.error == true){
			console.log('admin group created')
		}
		else{
			group_services.add_user_to_group(admin_group, addAdminToGroupCallback);
		}
	}
	
	var createAdminUserCallback = function (result) {
		if (result.error == true) {
			console.log('admin already created');
		} else {
			admin_group.group_id = result.insertId;
			admin_group.username = admin.username
			group_services.create_group(admin_group, createAdminGroupCallback);
		}
	};

	user_services.create_user(admin, createAdminUserCallback);
};
