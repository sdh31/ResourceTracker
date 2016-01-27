import requests
import json

url = 'http://colab-sbx-202.oit.duke.edu/resource'
method = "DELETE"
query = {}
headers = {
	"Content-Type:":'application/json'
}

user_params = {
	'username':'chris',
	'password':'pass',
	'permission_level':'admin'
}
resource_params = {
	'id' : 15,
	'name': 'daresource',
	'description': 'huh',
	'max_users': 1,
	'tag':'that'
}

response = requests.request(
	method,
	url = url,
	#query = query,
	#json = resource_params,
	params = resource_params,
	#headers = headers
	)

response_json = response.content
print response.content
print response.status_code
#content = json.loads(response.json)
#print(content)