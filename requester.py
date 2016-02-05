import requests
import json

def login_to_session():
	url = 'http://colab-sbx-202.oit.duke.edu/user/signin'
	method = "POST"
	headers = {
		"Content-Type:":'application/json'
	}

	user_params = {
		'username':'admin',
		'password':'admin',
		'permission_level':'admin'
	}
	response = requests.request(
		method,
		url = url,
		json = user_params,
		)
	session = response.cookies
	return session



session = login_to_session()

url = 'http://colab-sbx-202.oit.duke.edu/resource'
method = "DELETE"
reservation_params = {
	'reservation_id':31,
	'start_time': 20,
	'end_time':21,
	'resource_id':1
}
resource_params = {
	'resource_id' : 1,
	'name': 'test_resource',
	'description': 'huh',
	'max_users': 1,
	'tags':['anteater']
}

tag_params = {
	'resource_id': 1,
	'addedTags': ['a', 'b']
}

response = requests.request(
	method,
	url = url,
	params = tag_params,
	cookies = session,
	)

response_json = response.content
print response.content
print response.status_code