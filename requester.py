import requests
import json

requests.packages.urllib3.disable_warnings()


headers = {
		"Content-Type:":'application/json'
	}

session = ''

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
	url = 'https://colab-sbx-202.oit.duke.edu/user/signin'
	method = "POST"
	
	params = {
		'username':username,
		'password':password,
		'permission_level':'admin'
	}
	
	return send_request(method, params, url)

def create_user(username, password, permission_level):
	url = 'https://colab-sbx-202.oit.duke.edu/user'
	method = "PUT"
	 

	params = {
		'username':username,
		'password':password,
		'permission_level':permission_level
	}
	return send_request(method, params, url)

def update_user(username, password = None, permission_level = None):
	url = 'https://colab-sbx-202.oit.duke.edu/user'
	method = "POST"
	params['username'] = username
	if password:
		params['password'] = password
	if permission_level:
		params['permission_level'] = permission_level

	return send_request(method, params, url)

def get_user(username):
	url = 'https://colab-sbx-202.oit.duke.edu/user'
	method = "GET"

	params['username'] = username

	return send_request(method, params, url)

def delete_user(username):
	url = 'https://colab-sbx-202.oit.duke.edu/user'
	method = "DELETE"

	params['username'] = username

	return send_request(method, params, url)

def create_resource(name, description, max_users, tags = None):
	url = 'https://colab-sbx-202.oit.duke.edu/resource'
	method = "PUT"

	params = {
	'name': name,
	'description':description,
	'max_users': max_users,
	'tags': tags
	}

	return send_request(method, params, url)

def update_resource(id, name = None, description = None, max_users = None):
	url = 'https://colab-sbx-202.oit.duke.edu/resource'
	method = "POST"

	params['resource_id'] = id
	if name:
		params['name'] = name
	if description:
		params['description'] = description
	if max_users:
		params['max_users'] = max_users

	return send_request(method, params, url)

def delete_resource(id):
	url = 'https://colab-sbx-202.oit.duke.edu/resource'
	method = "DELETE"

	params['resource_id'] = id

	return send_request(method, params, url)

def add_tag(resource_id, tags):
	url = 'https://colab-sbx-202.oit.duke.edu/tag'
	method = "PUT"

	params['resource_id'] = resource_id
	params['addedTags'] = tags

	return send_request(method, params, url)

def remove_tags(resource_id, tags):
	url = 'https://colab-sbx-202.oit.duke.edu/tag'
	method = "POST"

	params['resource_id'] = resource_id
	params['deletedTags'] = tags

	return send_request(method, params, url)

def create_reservation(resource_id, start, end):
	url = 'https://colab-sbx-202.oit.duke.edu/reservation'
	method = "PUT"

	params = {
		'resource_id':resource_id,
		'start_time':start,
		'end_time':end
	}

	return send_request(method, params, url)

def delete_reservation(reservation_id):
	url = 'https://colab-sbx-202.oit.duke.edu/reservation'
	method = "DELETE"

	params = {
		'reservation_id':reservation_id
	}

	return send_request(method, params, url)

def get_reservations(resource_id, start, end ,reservation_id = None):
	url = 'https://colab-sbx-202.oit.duke.edu/reservation'
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
	url = 'https://colab-sbx-202.oit.duke.edu/reservation'
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
	url = 'https://colab-sbx-202.oit.duke.edu/group';
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
	url = 'https://colab-sbx-202.oit.duke.edu/group';
	method = "DELETE";
	params = {
		'group_id': group_id
	}

	return send_request(method, params, url)

def update_group(group_id, name, description, user_permissions, resource_permissions, reservation_permissions):
	url = 'https://colab-sbx-202.oit.duke.edu/group';
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
	url = 'https://colab-sbx-202.oit.duke.edu/group';
	method = "GET";
	params = {}
	if group_id:
		params['group_id'] = group_id
	return send_request(method, params, url)

def add_user_to_group(username, group_id):
	url = 'https://colab-sbx-202.oit.duke.edu/group/user';
	method = "PUT";
	params = {
		"group_id": group_id,
		"username": username
	}
	return send_request(method, params, url)

def remove_user_from_group(username, group_id):
	url = 'https://colab-sbx-202.oit.duke.edu/group/user';
	method = "DELETE";
	params = {
		"group_id": group_id,
		"username": username
	}
	return send_request(method, params, url)

def get_users_in_group(group_id):
	url = 'https://colab-sbx-202.oit.duke.edu/group/user';
	method = "GET";
	params = {
		"group_id": group_id
	}
	return send_request(method, params, url)