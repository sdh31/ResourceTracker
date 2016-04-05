import requests
import json
import os

requests.packages.urllib3.disable_warnings()


headers = {
		
	}

session = ''
baseUrl = 'https://colab-sbx-212.oit.duke.edu'

passed = 0
failed = 0

permissions = {
	"view": 0,
	"reserve": 1,
	"manage": 2
}

def test_print(desc, expression):
	global failed, passed
	if not expression:
		print desc
		print expression
		failed += 1
	else:
		passed += 1

def finish_test(test_name):
	global failed, passed
	logout()
	print ""
	print test_name + " has finished with:"
	print str(failed) + "tests failed"
	print str(passed) + "tests passed"
	print ""
	passed = 0
	failed = 0

def send_request(method, params, url):
	if method == 'GET' or method == 'DELETE':
		response = requests.request(
			method,
			headers=headers,
			url = url,
			params = params,
			cookies = session,
			verify = False
		)
	else:
			response = requests.request(
			method,
			headers=headers,
			url = url,
			json = params,
			cookies = session,
			verify = False
		)
	return response

def initialize_and_clear_tables():
	global session
	os.system("mysql -u root -pdb test_db -e 'DROP DATABASE test_db; CREATE DATABASE test_db;'")
	os.system("mysql -u root -pdb test_db < ~/ResourceTracker/server/create_tables.sql")
	res = initialize_admin_user()
	test_print("initialize create", res.status_code < 300)
	session_response = login_to_session('admin', 'Treeadmin')
	test_print('login as admin in init', session_response.status_code < 300)
	admin_session = session_response.cookies
	session = admin_session
	res = add_group_permission_to_resource(1, [1], ['view'])
	test_print("admin permission on root", res.status_code < 300)

def login_to_session(username, password):
	url = baseUrl + '/user/signin'
	method = "POST"
	
	params = {
		'username':username,
		'password':password,
		'permission_level':'admin'
	}
	
	return send_request(method, params, url)

def logout():
	url = baseUrl + '/user/signout'
	method = "POST"
	params = {}
	return send_request(method, params, url)

def create_user (username, password):
	url = baseUrl + '/user'
	method = "PUT"
	 

	params = {
		'username':username,
		'password':password,
		'email_address': 'a@example.com',
        'first_name': 'rahul',
        'last_name': 'abcd',
		'is_shibboleth': 0
	}
	return send_request(method, params, url)

def initialize_admin_user():
	url = baseUrl + '/user'
	method = "PUT"
	 

	params = {
		'username': 'admin',
		'password': 'Treeadmin',
		'user_management_permission': 1,
		'resource_management_permission': 1,
		'reservation_management_permission': 1,
        'is_shibboleth': 0,
		'first_name': 'admin',
		'last_name': 'admin',
		'email_address': 'admin@admin.com',
        'emails_enabled': 1
	};
	return send_request(method, params, url)

def update_user(username, newUsername = None, password = None, email_address = None):
	url = baseUrl + '/user'
	method = "POST"
	params = {
        'username': username
    }
        if password:
		    params['password'] = password
        if email_address:
            params['email_address'] = email_address
        if newUsername:
		    params['newUsername'] = newUsername

	return send_request(method, params, url)

def get_user(username = None):
	url = baseUrl + '/user'
	method = "GET"
	params = {}
	if username:
		params = {
			'username': username
		}
	
	return send_request(method, params, url)

def get_all_users():

	url = baseUrl + '/user/all'
	method = "GET"
	params = {}

	return send_request(method, params, url)

def delete_user(username):
	url = baseUrl + '/user'
	method = "DELETE"

	params = {
        'username': username
    }

	return send_request(method, params, url)

def get_resource_by_id(id):
	url = baseUrl + '/resource'
	method = "GET"

	params = {
	    'resource_id': id
	}

	return send_request(method, params, url)

def get_all_resources():
	url = baseUrl + '/resource/all'
	method = "GET"

	params = {}

	return send_request(method, params, url)

def get_all_direct_children(resource_id):
	url = baseUrl + '/resource/children'
	method = "GET"

	params = {
    'resource_id': resource_id
    }

	return send_request(method, params, url)

def get_subtree(resource_id):
	url = baseUrl + '/resource/subtree'
	method = "GET"

	params = {
    'resource_id': resource_id
    }

	return send_request(method, params, url)

def create_resource(name, description, resource_state, sharing_level, is_folder, parent_id):
	url = baseUrl + '/resource'
	method = "PUT"

	params = {
	'name': name,
	'description':description,
	'resource_state': resource_state,
    'sharing_level': sharing_level,
    'is_folder': is_folder,
    'parent_id': parent_id
	}

	return send_request(method, params, url)

def update_resource(id, name = None, description = None, resource_state = None, sharing_level = None):
	url = baseUrl + '/resource'
	method = "POST"
    
	params = {
        'resource_id': id
    }
	if name:
		params['name'] = name
	if description:
		params['description'] = description
	if resource_state:
		params['resource_state'] = resource_state
	if sharing_level:
		params['']
	return send_request(method, params, url)

def delete_resource(id):
	url = baseUrl + '/resource'
	method = "DELETE"

	params = {
        'resource_id': id
    }

	return send_request(method, params, url)

def add_group_permission_to_resource(resource_id, group_ids, resource_permissions):
	url = baseUrl + '/resource/addPermission'
	method = "POST"

	params = {
        'resource_id': resource_id,
		'group_ids': group_ids,
		'resource_permissions': resource_permissions
    }

	return send_request(method, params, url)

def update_group_permission_to_resource(resource_id, group_id, resource_permission):
	url = baseUrl + '/resource/updatePermission'
	method = "POST"

	params = {
        'resource_id': resource_id,
		'group_id': group_id,
		'resource_permission': resource_permission
    }

	return send_request(method, params, url)

def remove_group_permission_to_resource(resource_id, group_ids):
	url = baseUrl + '/resource/removePermission'
	method = "POST"

	params = {
        'resource_id': resource_id,
		'group_ids': group_ids
    }

	return send_request(method, params, url)

def filter_tags(included_tags, excluded_tags, start_time, end_time):
 	url = baseUrl + '/tag/filter'
 	method = "POST"
 
 	params = {
         'includedTags': included_tags,
 		'excludedTags': excluded_tags,
 		'start_time': start_time,
 		'end_time': end_time
     }
 
 	return send_request(method, params, url)

def get_group_permission_to_resource(resource_id):
	url = baseUrl + '/resource/getPermission'
	method = "GET"

	params = {
        'resource_id': resource_id
    }

	return send_request(method, params, url)

def add_tag(resource_id, tags):
	url = baseUrl + '/tag'
	method = "PUT"

	params = {
		'resource_id': resource_id,
		'addedTags': tags
	}

	return send_request(method, params, url)

def remove_tags(resource_id, tags):
	url = baseUrl + '/tag'
	method = "POST"
	params = {
		'resource_id': resource_id,
		'deletedTags': tags
	}

	return send_request(method, params, url)

def get_all_tags():
 	url = baseUrl + '/tag'
 	method = "GET"
 	params = {}
 
 	return send_request(method, params, url)
 

def create_reservation(resource_ids, start, end, title, description):
	url = baseUrl + '/reservation'
	method = "PUT"

	params = {
		'resource_ids':resource_ids,
		'start_time':start,
		'end_time':end,
		'reservation_title':title,
		'reservation_description':description
	}

	return send_request(method, params, url)

def delete_reservation(reservation_id):
	url = baseUrl + '/reservation'
	method = "DELETE"

	params = {
		'reservation_id':reservation_id
	}

	return send_request(method, params, url)

def get_reservations(resource_id, start, end ,reservation_id = None):
	url = baseUrl + '/reservation'
	method = "GET"

	params = {
		'resource_id': resource_id,
		'start_time': start,
		'end_time': end,
	}
	if reservation_id:
		params['reservation_id'] = reservation_id

	return send_request(method, params, url)

def update_reservations(resource_id, start, end, reservation_id, title, description):
	url = baseUrl + '/reservation'
	method = "POST"

	params = {
		'resource_id': resource_id,
		'reservation_ids': reservation_id,
		'start_time': start,
		'end_time': end
	}
	if reservation_id:
		params['reservation_id'] = reservation_id
	if title:
		params['reservation_title'] = title
	if description:
		params['reservation_description'] = description

	return send_request(method, params, url)

def get_reservations_by_resources(resource_ids):
	url = baseUrl + '/reservation/getReservationsByResources';
	method = "POST";

	params = {
		'resource_ids': resource_ids
	}
	return send_request(method, params, url)

def create_group(name, description, user_permissions, resource_permissions, reservation_permissions, privacy):
	url = baseUrl + '/group';
	method = "PUT";

	params = {
		'name': name,
		'description': description,
		'user_management_permission': user_permissions,
		'resource_management_permission': resource_permissions,
		'reservation_management_permission': reservation_permissions,
		'is_private': privacy
	}
	return send_request(method, params, url)

def delete_group(group_id):
	url = baseUrl + '/group';
	method = "DELETE";
	params = {
		'group_id': group_id
	}

	return send_request(method, params, url)

def update_group(group_id, name, description, user_permissions, resource_permissions, reservation_permissions):
	url = baseUrl + '/group';
	method = "POST";
	params = {
		'group_name': name,
		'description': description,
		'user_management_permission': user_permissions,
		'resource_management_permission': resource_permissions,
		'reservation_management_permission': reservation_permissions,
		'group_id': group_id
	}
	return send_request(method, params, url)

def get_groups(group_id = None):
	url = baseUrl + '/group';
	method = "GET";
	params = {}
	if group_id:
		params['group_id'] = group_id
	return send_request(method, params, url)

def add_users_to_group(user_ids, group_id):
	url = baseUrl + '/group/addUsers';
	method = "POST";
	params = {
		"group_id": group_id,
		"user_ids": user_ids
	}
	return send_request(method, params, url)

def remove_users_from_group(user_ids, group_id):
	url = baseUrl + '/group/removeUsers';
	method = "POST";
	params = {
		"group_id": group_id,
		"user_ids": user_ids
	}
	return send_request(method, params, url)

def get_users_in_group(group_id):
	url = baseUrl + '/group/user';
	method = "GET";
	params = {
		"group_id": group_id
	}
	return send_request(method, params, url)

def get_api_token():
	url = baseUrl + '/user/token'
	method = "POST"
	params = {}

	return send_request(method, params, url)

def remove_resource_from_reservation(reservation_id, resource_ids):
	url = baseUrl + '/reservation/remove_resources'
	method = "POST"
	params = {
		"reservation_id": reservation_id,
		"resource_ids": resource_ids
	}

	return send_request(method, params, url)

def confirm_resource_reservation(resource_id, reservation_id):
	url = baseUrl + '/reservation/confirm_request'
	method = "POST"
	params = {
		"reservation_id": reservation_id,
		"resource_id": resource_id
	}

	return send_request(method, params, url)

def deny_resource_reservation(resource_id, reservation_id):
	url = baseUrl + '/reservation/deny_request'
	method = "POST"
	params = {
		"reservation_id": reservation_id,
		"resource_id": resource_id
	}
	
	return send_request(method, params, url)

	
