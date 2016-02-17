import requester as r

r.verify = False

print '#### initialize session ####'
session_response = r.login_to_session('admin', 'Treeadmin')
print session_response.status_code < 300
r.session = session_response.cookies

print '#### create resource with tags ####'
res = r.create_resource("my resource", "huh", 1, ['ant', 'eater', 'shit'])
print res.status_code < 300
resource_id = r.json.loads(res.content)['insert_id']

print '#### create resource without tags ####'
res = r.create_resource("notags", "notags", 1, [])
print res.status_code < 300
no_tags_id = r.json.loads(res.content)['insertId']

print '#### delete resource without tags ####'
res = r.delete_resource(no_tags_id)
print res.status_code < 300

print '#### update resource ####'
res = r.update_resource(resource_id, "my resource edited", "huh edited")
print res.status_code < 300

print '#### get updated resource ####'
res = r.get_resource_by_id(resource_id)
print res.status_code < 300
print r.json.loads(res.content)['results']['name'] == "my resource edited"

print '#### create reservation ####'
res = r.create_reservation(resource_id, 1, 2)
print res.status_code < 300

reservation_id = r.json.loads(res.content)['insertId']

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
print r.json.loads(res.content)['results'][0]['start_time'] == 5
print r.json.loads(res.content)['results'][0]['end_time'] == 10

print '#### create a group ####'
res = r.create_group("fungroup", "nope", True, True, True, False)
print res.status_code < 300
group_id = r.json.loads(res.content)['results']['insertId']

print '#### get groups and check if there are 2 ####'
res = r.get_groups(group_id)
#Check is 2 because of admin users private group
print len(r.json.loads(res.content)) == 2
print r.json.loads(res.content)['results'][0]['group_name'] == "fungroup"

print '#### update group ####'
res = r.update_group(group_id, "nopegroup", "fun", False, False, True)
print res.status_code < 300

print '#### make sure update has persisted ####'
res = r.get_groups()
print len(r.json.loads(res.content)) == 2
print r.json.loads(res.content)['results'][1]['group_name'] == 'nopegroup'

print '#### add the admin user to the group ####'
res = r.add_users_to_group([1], group_id)
print res.status_code < 300

print '#### make sure that the admin user has been successfully added ####'
res = r.get_users_in_group(group_id)
print len(r.json.loads(res.content)['results']) == 1
print r.json.loads(res.content)['results'][0]['username'] == 'admin'

print '#### remove the admin user from the group ####'
res = r.remove_users_from_group([1], group_id)
print res.status_code < 300

print '#### delete the group ####'
res = r.delete_group(group_id)
print res.status_code < 300

print '#### get groups and make sure the group was deleted ####'
res = r.get_groups()
print len(r.json.loads(res.content)['results']) == 1

print '#### get all users in DB, make sure theres only 1 and that the username == admin ####'
res = r.get_all_users()
print len(r.json.loads(res.content)['users']) == 1
print r.json.loads(res.content)['users'][0]['username'] == 'admin'

# creating local users cooks us as of now because when they get deleted the private group they are a part of isnt deleted

#print 'create another user' 
#res = r.create_user('rahul', 'rahul123')
#print res.status_code < 300

#print 'get all users in DB, make sure there are 2 now and that the second username == rahul'
#res = r.get_all_users()
#print len(r.json.loads(res.content)['users']) == 2
#print r.json.loads(res.content)['users'][1]['username'] == 'rahul'

#print 'delete user rahul from DB and check if only 1 user now exists'
#res = r.delete_user('rahul')
#print res.status_code < 300
#res = r.get_all_users()
#print len(r.json.loads(res.content)['users']) == 1




