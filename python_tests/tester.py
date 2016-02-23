import requester as r

r.verify = False

print '#### initialize session ####'
session_response = r.login_to_session('admin', 'Treeadmin')
print session_response.status_code < 300
r.session = session_response.cookies

print '#### update admin user to have new email ####'
res = r.update_user(username="admin",email_address="ericichonglam17@gmail.com")
print res.status_code < 300

res = r.get_api_token()
r.headers['Auth-Token'] = r.json.loads(res.content)['results']['token']
print res.status_code
print r.headers['Auth-Token']

print '#### get all users in DB, make sure theres only 1 and that the username == admin ####'
res = r.get_all_users()
print res.content
print len(r.json.loads(res.content)['results']) == 1
print r.json.loads(res.content)['results'][0]['email_address'] == 'ericichonglam17@gmail.com'

print '#### create resource with tags ####'
res = r.create_resource("YAAAAAAAM", "huh", 1)
print res.status_code < 300
resource_id = r.json.loads(res.content)['insertId']

res = r.add_tag(resource_id, ['ant', 'eater', 'shit'])
print res.status_code < 300

print '#### get permissions for resource with tags and make that the admin user has permission ####'
res = r.get_group_permission_to_resource(resource_id)
print res.status_code < 300
print len(r.json.loads(res.content)['results']) == 1

print '#### create resource without tags ####'
res = r.create_resource("YAAAAAMU", "notags", 1)
print res.status_code < 300
no_tags_id = r.json.loads(res.content)['insertId']

print '#### get permissions for resource without tags and make that the admin user has permission ####'
res = r.get_group_permission_to_resource(resource_id)
print res.status_code < 300
print len(r.json.loads(res.content)['results']) == 1

print '#### get all resources and make sure there are 2 ####'
res = r.get_all_resources()
print res.status_code < 300
print len(r.json.loads(res.content)) == 2

print '#### create another user ####' 
res = r.create_user('rahul', 'rahul123')
print res.status_code < 300
user_id = r.json.loads(res.content)['insertId']

print '#### get all users in DB, make sure there are 2 now and that the second username == rahul ####'
res = r.get_all_users()
print len(r.json.loads(res.content)['results']) == 2
print r.json.loads(res.content)['results'][1]['username'] == 'rahul'

print '#### create a group ####'
res = r.create_group("fungroup", "nope", True, True, True, False)
print res.status_code < 300
group_id = r.json.loads(res.content)['results']['insertId']

print '#### get groups and check if there are 3 ####'
res = r.get_groups()
#Check is 3 because of users private groups
print len(r.json.loads(res.content)['results']) == 3
print r.json.loads(res.content)['results'][2]['group_name'] == "fungroup"

print '#### update group ####'
res = r.update_group(group_id, "nopegroup", "fun", False, False, True)
print res.status_code < 300

print '#### make sure update has persisted ####'
res = r.get_groups()
print len(r.json.loads(res.content)['results']) == 3
print r.json.loads(res.content)['results'][2]['group_name'] == 'nopegroup'

print '#### add admin and rahul to the group ####'
res = r.add_users_to_group([1, user_id], group_id)
print res.status_code < 300

print '#### make sure that they have been successfully added ####'
res = r.get_users_in_group(group_id)
print len(r.json.loads(res.content)['results']) == 2
print r.json.loads(res.content)['results'][0]['username'] == 'admin'
print r.json.loads(res.content)['results'][0]['first_name'] == 'admin'

print '#### add view permission to the group for the resource with tags ####'
res = r.add_group_permission_to_resource(resource_id, [group_id], ['view'])
print res.status_code < 300

print '#### get permissions for resource with tags and make sure we good ####'
res = r.get_group_permission_to_resource(resource_id)
print res.status_code < 300
print r.json.loads(res.content)['results'][1]['group_id'] == group_id

print '#### add view permission to the group for the resource without tags ####'
res = r.add_group_permission_to_resource(no_tags_id, [group_id], ['view'])
print res.status_code < 300

print '#### delete resource without tags ####'
res = r.delete_resource(no_tags_id)
print res.status_code < 300

print '#### update resource with tags ####'
res = r.update_resource(resource_id, "YAAAAAAAAAAAAAAAAAAAAAM", "huh edited")
print res.status_code < 300

print '#### get updated resource ####'
res = r.get_resource_by_id(resource_id)
print res.status_code < 300
print r.json.loads(res.content)['results']['name'] == "YAAAAAAAAAAAAAAAAAAAAAM"

print '#### create reservation ####'
res = r.create_reservation(resource_id, 1, 2)
print res.status_code < 300
reservation_id = r.json.loads(res.content)['results']['insertId']

print '#### create an aliasing reservation ####'
res = r.create_reservation(resource_id, 2, 3)
print res.status_code >= 400

print '#### create a reservation with invalid start_time/end_time ####'
res = r.create_reservation(resource_id, 3, 3)
print res.status_code >= 400

print '#### create another valid reservation ####'
res = r.create_reservation(resource_id, 3, 4)
print res.status_code < 300

print '#### get all reservations ####'
res = r.get_reservations(resource_id, 0, 99999)
print len(r.json.loads(res.content)['results']) == 2

print '#### update first reservation ####'
res = r.update_reservations(resource_id, 5, 10, reservation_id)
print res.status_code < 300

print '#### get reservations and check if updated values have persisted ####'
res = r.get_reservations(resource_id, 0, 99999)
print len(r.json.loads(res.content)['results']) == 2
print r.json.loads(res.content)['results'][0]['start_time'] == 5
print r.json.loads(res.content)['results'][0]['end_time'] == 10

print '#### delete reservation ####'
res = r.delete_reservation(reservation_id)
print res.status_code < 300

print '#### get reservations and check reservation has been deleted successfully ####'
res = r.get_reservations(resource_id, 0, 99999)
print len(r.json.loads(res.content)['results']) == 1

print '#### remove view permission to the group for the resource with tags ####'
res = r.remove_group_permission_to_resource(resource_id, [group_id])
print res.status_code < 300

print '#### get permissions for resource with tags and make sure theres nothing ####'
res = r.get_group_permission_to_resource(resource_id)
print res.status_code < 300
print len(r.json.loads(res.content)['results']) == 1

print '#### remove the admin and rahul user from the group ####'
res = r.remove_users_from_group([1, user_id], group_id)
print res.status_code < 300

print '#### make sure that the users have been successfully removed ####'
res = r.get_users_in_group(group_id)
print len(r.json.loads(res.content)['results']) == 0

print '#### delete the group ####'
res = r.delete_group(group_id)
print res.status_code < 300

print '#### get groups and make sure the group was deleted ####'
res = r.get_groups()
print len(r.json.loads(res.content)['results']) == 2

print '#### update admin user to have new email ####'
res = r.update_user(username="admin", email_address="admin@admin.com")
print res.status_code < 300

print '#### get all users in DB, make sure theres only 2 and that the username == admin ####'
res = r.get_all_users()
print len(r.json.loads(res.content)['results']) == 2
print r.json.loads(res.content)['results'][0]['username'] == 'admin'
print r.json.loads(res.content)['results'][0]['email_address'] == 'admin@admin.com'

print '#### cleanup by deleting the resource that we created ####'
res = r.delete_resource(resource_id)
print res.status_code < 300

print '#### delete user rahul from DB and check if only 1 user now exists ####'
res = r.delete_user('rahul')
print res.status_code < 300
res = r.get_all_users()
print len(r.json.loads(res.content)['results']) == 1
