import requester as r

r.verify = False

counter = 0

def test_print(desc, expression):
	if not expression:
		print desc
		print expression
		counter +=1

desc = '#### initialize session ####'
session_response = r.login_to_session('admin', 'Treeadmin')
test_print(desc, session_response.status_code < 300)
r.session = session_response.cookies

dec = '#### update admin user to have new email ####'
res = r.update_user(username="admin",email_address="jag.buddhavarapu@gmail.com")
test_print(desc, res.status_code < 300)

desc = '#### create API token ####'
res = r.get_api_token()
test_print(desc, res.status_code < 300)
token = r.json.loads(res.content)['results']['token']
test_print(desc, token != None)
r.headers['Auth-Token'] = token

desc = '#### get current user ####'
res = r.get_user()
test_print(desc, r.json.loads(res.content)['results']['username'] == 'admin')

desc = '#### get all users in DB, make sure theres only 1 and that the username == admin ####'
res = r.get_all_users()
test_print(desc, len(r.json.loads(res.content)['results']) == 1)
test_print(desc, r.json.loads(res.content)['results'][0]['email_address'] == 'jag.buddhavarapu@gmail.com')

desc = '#### create resource with tags ####'
res = r.create_resource("YAAAAAAAM", "huh")
test_print(desc, res.status_code < 300)
resource_id = r.json.loads(res.content)['insertId']

res = r.add_tag(resource_id, ['ant', 'eater', 'shit'])
test_print(desc, res.status_code < 300)

desc =  '#### get permissions for resource with tags and make that the admin user has permission ####'
res = r.get_group_permission_to_resource(resource_id)
test_print(desc, res.status_code < 300)
test_print(desc, len(r.json.loads(res.content)['results']) == 1)

desc =  '#### create resource without tags ####'
res = r.create_resource("YAAAAAMU", "notags", 1)
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
<<<<<<< HEAD
test_print(desc, res.status_code < 300)
test_print(desc, res.content)
=======
print res.status_code < 300
print res.content
>>>>>>> 865845ba6febb56e60ed2d9fe2adc0d161f1770c
group_id = r.json.loads(res.content)['results']['insertId']

desc =  '#### get groups and check if there are 3 ####'
res = r.get_groups()
#Check is 3 because of users private groups
test_print(desc, len(r.json.loads(res.content)['results']) == 3)
test_print(desc, r.json.loads(res.content)['results'][2]['group_name'] == "fungroup")

desc =  '#### update group ####'
res = r.update_group(group_id, "nopegroup", "fun", False, False, True)
test_print(desc, res.status_code < 300)

desc =  '#### make sure update has persisted ####'
res = r.get_groups()
test_print(desc, len(r.json.loads(res.content)['results']) == 3)
test_print(desc, r.json.loads(res.content)['results'][2]['group_name'] == 'nopegroup')

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

desc =  '#### delete resource without tags ####'
res = r.delete_resource(no_tags_id)
test_print(desc, res.status_code < 300)

desc =  '#### update resource with tags ####'
res = r.update_resource(resource_id, "YAAAAAAAAAAAAAAAAAAAAAM", "huh edited")
test_print(desc, res.status_code < 300)

desc =  '#### get updated resource ####'
res = r.get_resource_by_id(resource_id)
test_print(desc, res.status_code < 300)
test_print(desc, r.json.loads(res.content)['results']['name'] == "YAAAAAAAAAAAAAAAAAAAAAM")

desc =  '#### create reservation ####'
res = r.create_reservation(resource_id, 1, 2)
test_print(desc, res.status_code < 300)
reservation_id = r.json.loads(res.content)['results']['insertId']

desc =  '#### create an aliasing reservation ####'
res = r.create_reservation(resource_id, 2, 3)
test_print(desc, res.status_code >= 400)

desc =  '#### create a reservation with invalid start_time/end_time ####'
res = r.create_reservation(resource_id, 3, 3)
test_print(desc, res.status_code >= 400)

desc =  '#### create another valid reservation ####'
res = r.create_reservation(resource_id, 3, 4)
test_print(desc, res.status_code < 300)

desc =  '#### get all reservations ####'
res = r.get_reservations(resource_id, 0, 99999)
test_print(desc, len(r.json.loads(res.content)['results']) == 2)

desc =  '#### update first reservation ####'
res = r.update_reservations(resource_id, 5, 10, reservation_id)
test_print(desc, res.status_code < 300)

desc =  '#### get reservations and check if updated values have persisted ####'
res = r.get_reservations(resource_id, 0, 99999)
test_print(desc, len(r.json.loads(res.content)['results']) == 2)
test_print(desc, r.json.loads(res.content)['results'][0]['start_time'] == 5)
test_print(desc, r.json.loads(res.content)['results'][0]['end_time'] == 10)

desc =  '#### delete reservation ####'
res = r.delete_reservation(reservation_id)
test_print(desc, res.status_code < 300)

desc =  '#### get reservations and check reservation has been deleted successfully ####'
res = r.get_reservations(resource_id, 0, 99999)
test_print(desc, len(r.json.loads(res.content)['results']) == 1)

desc =  '#### remove view permission to the group for the resource with tags ####'
res = r.remove_group_permission_to_resource(resource_id, [group_id])
test_print(desc, res.status_code < 300)

desc =  '#### get permissions for resource with tags and make sure theres nothing ####'
res = r.get_group_permission_to_resource(resource_id)
test_print(desc, res.status_code < 300)
test_print(desc, len(r.json.loads(res.content)['results']) == 1)

desc =  '#### remove the admin and rahul user from the group ####'
res = r.remove_users_from_group([1, user_id], group_id)
test_print(desc, res.status_code < 300)

desc =  '#### make sure that the users have been successfully removed ####'
res = r.get_users_in_group(group_id)
test_print(desc, len(r.json.loads(res.content)['results']) == 0)

desc =  '#### delete the group ####'
res = r.delete_group(group_id)
test_print(desc, res.status_code < 300)

desc =  '#### get groups and make sure the group was deleted ####'
res = r.get_groups()
test_print(desc, len(r.json.loads(res.content)['results']) == 2)

desc =  '#### update admin user to have new email ####'
res = r.update_user(username="admin", email_address="admin@admin.com")
test_print(desc, res.status_code < 300)

desc =  '#### get all users in DB, make sure theres only 2 and that the username == admin ####'
res = r.get_all_users()
test_print(desc, len(r.json.loads(res.content)['results']) == 2)
test_print(desc, r.json.loads(res.content)['results'][0]['username'] == 'admin')
test_print(desc, r.json.loads(res.content)['results'][0]['email_address'] == 'admin@admin.com')

desc =  '#### cleanup by deleting the resource that we created ####'
res = r.delete_resource(resource_id)
test_print(desc, res.status_code < 300)

desc =  '#### delete user rahul from DB and check if only 1 user now exists ####'
res = r.delete_user('rahul')
test_print(desc, res.status_code < 300)
res = r.get_all_users()
<<<<<<< HEAD
test_print(desc, len(r.json.loads(res.content)['results']) == 1)

print str(counter) + " tests failed"
=======
print len(r.json.loads(res.content)['results']) == 1
>>>>>>> 865845ba6febb56e60ed2d9fe2adc0d161f1770c
