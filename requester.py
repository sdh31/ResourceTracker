import requests
import json

url = 'http://colab-sbx-202.oit.duke.edu/resource'
method = "DELETE"
headers = {
	"Content-Type:":'application/json'
}

user_params = {
	'username':'chris',
	'password':'pass',
	'permission_level':'admin'
}
resource_params = {
	'id' : 13,
	'name': 'test_resource',
	'description': 'huh',
	'max_users': 1,
	'tags':['anteater']
}

tag_params = {
	'resource_id': 500,
	'tags': ['a', 'b']
}

response = requests.request(
	method,
	url = url,
	#json = tag_params,
	params = resource_params,
	)

response_json = response.content
print response.content
print response.status_code
#content = json.loads(response.json)
#print(content)