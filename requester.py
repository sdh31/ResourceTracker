import requests
import json

url = 'http://colab-sbx-202.oit.duke.edu/resource'
method = "PUT"
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
	'name': 'dresource',
	'description': 'it',
	'max_users': 1
}

response = requests.request(
	method,
	url = url,
	#query = query,
	json = resource_params,
	#params = resource_params,
	#headers = headers
	)

response_json = response.content
print response.content
print response.status_code
#content = json.loads(response.json)
#print(content)