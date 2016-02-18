import requests
import json

requests.packages.urllib3.disable_warnings()


headers = {
		"Content-Type:":'application/json'
	}

session = ''
baseUrl = 'https://colab-sbx-212.oit.duke.edu'

def send_request(method, params, url):
	if method == 'GET' or method == 'DELETE':
		response = requests.request(
			method,
			url = url,
			params = params,
			cookies = session,
			verify = False
		)
	else:
			response = requests.request(
			method,
			url = url,
			json = params,
			cookies = session,
			verify = False
		)
	return response



def login_to_session(username, password):
	url = baseUrl + '/user/signin'
	method = "POST"
	
	params = {
		'username':username,
		'password':password,
		'permission_level':'admin'
	}
	
	return send_request(method, params, url)

def create_user(username, password):
	url = baseUrl + '/user'
	method = "PUT"
	 

	params = {
		'username':username,
		'password':password,
		'email_address': 'a@a.com',
        'first_name': 'rahul',
        'last_name': 'abcd',
		'is_shibboleth': 0
	}
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

def get_user(username):
	url = baseUrl + '/user'
	method = "GET"

	params['username'] = username

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

def create_resource(name, description, max_users):
	url = baseUrl + '/resource'
	method = "PUT"

	params = {
	'name': name,
	'description':description,
	'max_users': max_users
	}

	return send_request(method, params, url)

def update_resource(id, name = None, description = None, max_users = None):
	url = baseUrl + '/resource'
	method = "POST"
    
	params = {
        'resource_id': id
    }
	if name:
		params['name'] = name
	if description:
		params['description'] = description
	if max_users:
		params['max_users'] = max_users

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

def remove_group_permission_to_resource(resource_id, group_ids):
	url = baseUrl + '/resource/removePermission'
	method = "POST"

	params = {
        'resource_id': resource_id,
		'group_ids': group_ids
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

def create_reservation(resource_id, start, end):
	url = baseUrl + '/reservation'
	method = "PUT"

	params = {
		'resource_id':resource_id,
		'start_time':start,
		'end_time':end
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

def update_reservations(resource_id, start, end, reservation_id):
	url = baseUrl + '/reservation'
	method = "POST"

	params = {
		'resource_id': resource_id,
		'reservation_id': reservation_id,
		'start_time': start,
		'end_time': end,
	}
	if reservation_id:
		params['reservation_id'] = reservation_id

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
