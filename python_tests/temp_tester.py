import requester as r
from time import sleep

r.verify = False

failed = 0
passed = 0

def test_print(desc, expression):
	global failed, passed
	if not expression:
		print desc
		print expression
		failed += 1
	else:
		passed += 1

desc = '#### initialize session ####'
session_response = r.login_to_session('admin', 'Treeadmin')
test_print(desc, session_response.status_code < 300)

admin_session = session_response.cookies
r.session = admin_session

dec = '#### update admin user to have new email ####'
res = r.update_user(username="admin",email_address="jag.buddhavarapu@gmail.com")
test_print(desc, res.status_code < 300)

desc = '#### create API token ####'
res = r.get_api_token()
test_print(desc, res.status_code < 300)
token = r.json.loads(res.content)['results']['token']
test_print(desc, token != None)

#r.headers['Auth-Token'] = token

desc = '#### get current user ####'
res = r.get_user()
test_print(desc, r.json.loads(res.content)['results']['username'] == 'admin')

desc = '#### get all users in DB, make sure theres only 1 and that the username == admin ####'
res = r.get_all_users()
test_print(desc, len(r.json.loads(res.content)['results']) == 1)
test_print(desc, r.json.loads(res.content)['results'][0]['email_address'] == 'jag.buddhavarapu@gmail.com')

desc = '#### create resource with tags ####'
res = r.create_resource("server1", "this is a server", 'free')
test_print(desc, res.status_code < 300)
resource_id = r.json.loads(res.content)['insertId']

res = r.add_tag(resource_id, ['tag1', 'tag2'])
test_print(desc, res.status_code < 300)

desc = '#### Check all tags created ####'
res = r.get_all_tags()
test_print(desc, len(r.json.loads(res.content)["tags"]) == 2)

desc =  '#### get permissions for resource with tags and make that the admin user has permission ####'
res = r.get_group_permission_to_resource(resource_id)
test_print(desc, res.status_code < 300)
test_print(desc, len(r.json.loads(res.content)['results']) == 1)

desc =  '#### create resource without tags ####'
res = r.create_resource("notags", "notags", 'free')
test_print(desc, res.status_code < 300)
no_tags_id = r.json.loads(res.content)['insertId']

desc =  '#### get permissions for resource without tags and make that the admin user has permission ####'
res = r.get_group_permission_to_resource(resource_id)
test_print(desc, res.status_code < 300)
test_print(desc, len(r.json.loads(res.content)['results']) == 1)

desc =  '#### get all resources and make sure there are 2 ####'
res = r.get_all_resources()
test_print(desc, res.status_code < 300)
test_print(desc, len(r.json.loads(res.content)) == 2)

desc =  '#### create another user ####' 
res = r.create_user('rahul', 'rahul123')
test_print(desc, res.status_code < 300)
user_id = r.json.loads(res.content)['insertId']

desc =  '#### get all users in DB, make sure there are 2 now and that the second username == rahul ####'
res = r.get_all_users()
test_print(desc, len(r.json.loads(res.content)['results']) == 2)
test_print(desc, r.json.loads(res.content)['results'][1]['username'] == 'rahul')

desc =  '#### create a group ####'
res = r.create_group("fungroup", "nope", True, True, True, False)
test_print(desc, res.status_code < 300)
test_print(desc, res.content)

group_id = r.json.loads(res.content)['results']['insertId']

desc =  '#### get groups and check if there are 3 ####'
res = r.get_groups()
#Check is 3 because of users private groups
test_print(desc, len(r.json.loads(res.content)['results']) == 3)
test_print(desc, r.json.loads(res.content)['results'][2]['group_name'] == "fungroup")

desc =  '#### update group ####'
res = r.update_group(group_id, "editedGroup", "fun", False, False, True)
test_print(desc, res.status_code < 300)

desc =  '#### make sure update has persisted ####'
res = r.get_groups()
test_print(desc, len(r.json.loads(res.content)['results']) == 3)
test_print(desc, r.json.loads(res.content)['results'][2]['group_name'] == 'editedGroup')

desc =  '#### add admin and rahul to the group ####'
res = r.add_users_to_group([1, user_id], group_id)
test_print(desc, res.status_code < 300)

desc =  '#### make sure that they have been successfully added ####'
res = r.get_users_in_group(group_id)
test_print(desc, len(r.json.loads(res.content)['results']) == 2)
test_print(desc, r.json.loads(res.content)['results'][0]['username'] == 'admin')
test_print(desc, r.json.loads(res.content)['results'][0]['first_name'] == 'admin')

desc =  '#### add view permission to the group for the resource with tags ####'
res = r.add_group_permission_to_resource(resource_id, [group_id], ['view'])
test_print(desc, res.status_code < 300)

desc =  '#### get permissions for resource with tags and make sure we good ####'
res = r.get_group_permission_to_resource(resource_id)
test_print(desc, res.status_code < 300)
test_print(desc, r.json.loads(res.content)['results'][1]['group_id'] == group_id)

desc =  '#### add view permission to the group for the resource without tags ####'
res = r.add_group_permission_to_resource(no_tags_id, [group_id], ['view'])
test_print(desc, res.status_code < 300)

desc =  '#### update resource with tags ####'
res = r.update_resource(resource_id, "serverEdited", "huh edited")
test_print(desc, res.status_code < 300)

desc =  '#### get updated resource ####'
res = r.get_resource_by_id(resource_id)
test_print(desc, res.status_code < 300)
test_print(desc, r.json.loads(res.content)['results']['name'] == "serverEdited")

desc =  '#### create reservation ####'
res = r.create_reservation([no_tags_id, resource_id], 0, 2, 'title', 'description')
test_print(desc, res.status_code < 300)
reservation_id = r.json.loads(res.content)['results']['insertId']

desc =  '#### create an aliasing reservation ####'
res = r.create_reservation([resource_id], 2, 3, 'title', 'description')
test_print(desc, res.status_code >= 400)

desc =  '#### create a reservation with invalid start_time/end_time ####'
res = r.create_reservation([resource_id], 3, 3, 'title', 'description')
test_print(desc, res.status_code >= 400)

desc =  '#### create another valid reservation ####'
res = r.create_reservation([resource_id], 3, 4, 'title', 'description')
test_print(desc, res.status_code < 300)

desc =  '#### get all reservations ####'
res = r.get_reservations(resource_id, 0, 99999)
test_print(desc, len(r.json.loads(res.content)['results']) == 2)

desc = '### fail to extend reservation ###'
res = r.update_reservations(resource_id, 200, 201, reservation_id, 'updated_reserv', 'u_desc')
test_print(desc, res.status_code > 300)

desc = "### successfully update reservation ###"
res = r.update_reservations(resource_id, 1, 2, reservation_id, 'updated_reserv', 'u_desc')
test_print(desc, res.status_code < 300)

desc = "### get all reservations for resource_id and no_tags_id"
res = r.get_reservations_by_resources([resource_id, no_tags_id])
test_print (desc, len(r.json.loads(res.content)['results']) == 3)
test_print(desc, res.status_code < 300)

desc =  '#### delete resource without tags ####'
res = r.delete_resource(no_tags_id)
test_print(desc, res.status_code < 300)

r.session = ''
desc = '#### create non-admin session ####'
session_response = r.login_to_session('rahul', 'rahul123')
test_print(desc, session_response.status_code < 300)
rahul_session = session_response.cookies

desc = "### fail to remove resource from someone else's reservation ###"
r.session = rahul_session
res = r.remove_resource_from_reservation(reservation_id, resource_id)
test_print(desc, res.status_code > 300)
print res.status_code
r.session = admin_session

desc = "### remove resource as reservation owner"
res = r.remove_resource_from_reservation(reservation_id, resource_id)
test_print(desc, res.status_code < 300)
print res.status_code



print str(failed) + "tests failed"
print str(passed) + "tests passed"


