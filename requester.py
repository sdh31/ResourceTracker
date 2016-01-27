import requests
import json

url = 'http://colab-sbx-202.oit.duke.edu/resource'
method = "PUT"
query = {}
headers = {
	"content-type:":'application/json'
}

params = {
	'name':'resource!',
	'description':'a resource',
	'max-users':1
}
print(params)
response = requests.request(
	method,
	url = url,
	#query = query,
	data = params,
	#params = params,
	headers = headers
	)

response_json = response.content
print response.content
#content = json.loads(response.json)
#print(content)