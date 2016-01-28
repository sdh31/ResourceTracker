import requests
import json

url = 'http://colab-sbx-202.oit.duke.edu/resource/filter'
method = "GET"
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
	'tag':['anteater']
}

filter_params = {
	'tags': ['anteater']
}

response = requests.request(
	method,
	url = url,
	#query = query,
	#json = resource_params,
	params = filter_params,
	#headers = headers
	)

response_json = response.content
print response.content
print response.status_code
#content = json.loads(response.json)
#print(content)