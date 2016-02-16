import requester as r

r.verify = False

session_response = r.login_to_session('admin', 'Treeadmin')
print session_response.status_code < 300
r.session = session_response.cookies

res = r.create_resource("my resource", "huh", 1, ['ant', 'eater', 'shit'])
print res.status_code < 300
resource_id = r.json.loads(res.content)['insert_id']

res = r.create_reservation(resource_id, 1, 2)
print res.status_code < 300

reservation_id = r.json.loads(res.content)['insertId']

res = r.create_reservation(resource_id, 2, 3)
print res.status_code >= 400

res = r.create_reservation(resource_id, 3, 3)
print res.status_code >= 400

res = r.create_reservation(resource_id, 3, 4)
print res.status_code < 300

res = r.get_reservations(resource_id, 0, 99999)
print len(r.json.loads(res.content)['results']) == 2

res = r.update_reservations(resource_id, 5, 10, reservation_id)
print res.status_code < 300

res = r.get_reservations(resource_id, 0, 99999)
print r.json.loads(res.content)['results'][0]['start_time'] == 5
print r.json.loads(res.content)['results'][0]['end_time'] == 10

res = r.create_group("fungroup", "nope", True, True, True, False)
print res.status_code < 300
group_id = r.json.loads(res.content)['results']['insertId']

#res = r.update_resource()

res = r.get_groups(group_id)
#Check is 2 because of admin users private group
print len(r.json.loads(res.content)) == 2
print r.json.loads(res.content)['results'][0]['group_name'] == "fungroup"

res = r.update_group(group_id, "nopegroup", "fun", False, False, True)
print res.status_code < 300

res = r.get_groups()
print len(r.json.loads(res.content)) == 2
print r.json.loads(res.content)['results'][1]['group_name'] == 'nopegroup'

res = r.add_users_to_group([1], group_id)
print res.status_code < 300

res = r.get_users_in_group(group_id)
print len(r.json.loads(res.content)['results']) == 1
print r.json.loads(res.content)['results'][0]['username'] == 'admin'

res = r.remove_users_from_group([1], group_id)
print res.status_code < 300

res = r.delete_group(group_id)
print res.status_code < 300

res = r.get_groups()
print len(r.json.loads(res.content)['results']) == 1

res = r.get_all_users()
print len(r.json.loads(res.content)['users']) == 1

res = r.create_user('rahul', 'rahul123')
print res.status_code < 300

res = r.get_all_users()
print len(r.json.loads(res.content)['users']) == 2



