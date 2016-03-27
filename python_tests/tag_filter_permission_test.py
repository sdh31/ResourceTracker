import requester as r
from requester import test_print

r.initialize_and_clear_tables()

def is_success(desc, res):
	test_print(desc, res.status_code < 300)

def is_failure(desc, res):
	test_print(desc, res.status_code >= 400 and res.status_code < 500)

def get_id(res):
	json_content = r.json.loads(res.content)
	if 'insertId' in json_content:
	 	return json_content['insertId']
	return json_content['results']['insertId']

desc = '#### initialize session ####'
res = r.login_to_session('admin', 'Treeadmin')
is_success(desc, res)
admin_session = res.cookies
r.session = admin_session

desc = '### create non-admin user & session ###'
res = r.create_user("chris", "dee")
is_success(desc, res)
r.session = ''
res = r.login_to_session("chris", "dee")
non_admin_session = res.cookies

"""" ---Signin as admin--- """
r.session = admin_session

desc = "### create 3 resources with tags ###"
res = r.create_resource("r1", "r1", "free")
resource1 = get_id(res)
is_success(desc, res)
res = r.add_tag(resource1, ["resource1", "a resource"])
is_success(desc, res)
res = r.create_resource("r2", "r2", "free")
resource2 = get_id(res)
is_success(desc, res)
res = r.add_tag(resource2, ["resource2", "a resource"])
is_success(desc, res)
res = r.create_resource("r2", "r2", "free")
resource3 = get_id(res)
is_success(desc, res)
res = r.add_tag(resource3, ["resource3"])
is_success(desc, res)

desc = "### check that the tag filter sees three resources as admin ###"
res = r.filter_tags([], [], 0, 99999999)
is_success(desc, res)
r.test_print(desc, len(r.json.loads(res.content)['resources']) == 3)

desc = "### Check included and excluded tags work ###"
res = r.filter_tags(["resource2", "resource3"], ["a resource"], 0, 999999999)
is_success(desc, res)
r.test_print(desc, len(r.json.loads(res.content)['resources']) == 1)
r.test_print(desc, r.json.loads(res.content)['resources'][0]['resource_id'] == resource3)

desc = "### Check behavior with empty included tags ###"
res = r.filter_tags([], ["a resource"], 0, 999999999)
is_success(desc, res)
r.test_print(desc, len(r.json.loads(res.content)['resources']) == 1)
r.test_print(desc, r.json.loads(res.content)['resources'][0]['resource_id'] == resource3)

desc = "### Add permission to one resource to non_admin user ###"
res = r.get_groups()
is_success(desc, res)
group_id = r.json.loads(res.content)['results'][1]['group_id']
res = r.add_group_permission_to_resource(resource1, [group_id], [r.permissions['view']])
is_success(desc, res)

"""" ---login as non_admin user with permissions to resource1--- """
r.session = non_admin_session

desc = "### ensure that tag filter can only see one resource ###"
res = r.filter_tags([],[], 0, 99999999)
is_success(desc, res)
r.test_print(desc, len(r.json.loads(res.content)['resources']) == 1)




r.finish_test("tag filter test")
