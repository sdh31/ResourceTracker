import requester as r
import time
from requester import test_print

r.verify = False

r.initialize_and_clear_tables()

desc = '#### initialize admin session ####'
session_response = r.login_to_session('admin', 'Treeadmin')
test_print(desc, session_response.status_code < 300)

admin_session = session_response.cookies
r.session = admin_session

desc =  '#### create 2 more users ####' 
res = r.create_user('rahul', 'rahul123')
test_print(desc, res.status_code < 300)
rahul_user_id = r.json.loads(res.content)['insertId']

res = r.create_user('ashwin', 'ashwin123')
test_print(desc, res.status_code < 300)
ashwin_user_id = r.json.loads(res.content)['insertId']

desc =  '#### get all users in DB, make sure there are 3 now and that the second username == rahul ####'
res = r.get_all_users()
test_print(desc, len(r.json.loads(res.content)['results']) == 3)
test_print(desc, r.json.loads(res.content)['results'][1]['username'] == 'rahul')

desc =  '#### create 2 groups ####'
res = r.create_group("group1", "nope", True, True, True, False)
test_print(desc, res.status_code < 300)
test_print(desc, res.content)
group_id1 = r.json.loads(res.content)['results']['insertId']

res = r.create_group("group2", "nope", True, True, True, False)
test_print(desc, res.status_code < 300)
test_print(desc, res.content)
group_id2 = r.json.loads(res.content)['results']['insertId']

desc =  '#### add rahul, and ashwin to the first group ####'
res = r.add_users_to_group([rahul_user_id, ashwin_user_id], group_id1)
test_print(desc, res.status_code < 300)

desc =  '#### add just ashwin to the second group ####'
res = r.add_users_to_group([ashwin_user_id], group_id2)
test_print(desc, res.status_code < 300)

desc = '#### create 4 resources ####'
res = r.create_resource("res1", "res1", 'free')
test_print(desc, res.status_code < 300)
resource_id1 = r.json.loads(res.content)['insertId']

res = r.create_resource("res2", "res2", 'free')
test_print(desc, res.status_code < 300)
resource_id2 = r.json.loads(res.content)['insertId']

res = r.create_resource("res3", "res3", 'free')
test_print(desc, res.status_code < 300)
resource_id3 = r.json.loads(res.content)['insertId']

res = r.create_resource("res4", "res4", 'free')
test_print(desc, res.status_code < 300)
resource_id4 = r.json.loads(res.content)['insertId']

desc =  '#### add reserve permission for both groups to all  resources ####'
res = r.add_group_permission_to_resource(resource_id1, [group_id1, group_id2], ['reserve', 'reserve'])
test_print(desc, res.status_code < 300)
res = r.add_group_permission_to_resource(resource_id2, [group_id1, group_id2], ['reserve', 'reserve'])
test_print(desc, res.status_code < 300)
res = r.add_group_permission_to_resource(resource_id3, [group_id1, group_id2], ['reserve', 'reserve'])
test_print(desc, res.status_code < 300)
res = r.add_group_permission_to_resource(resource_id4, [group_id1, group_id2], ['reserve', 'reserve'])
test_print(desc, res.status_code < 300)

r.session = ''
desc = '#### login as rahul ####'
session_response = r.login_to_session('rahul', 'rahul123')
test_print(desc, session_response.status_code < 300)
rahul_session = session_response.cookies
r.session = rahul_session

millis = int(round(time.time() * 1000)) + 86400000
millis2 = int(round(time.time() * 1000)) + 2*86400000
millis3 = int(round(time.time() * 1000)) + 3*86400000
millis4 = int(round(time.time() * 1000)) + 4*86400000
millis5 = int(round(time.time() * 1000)) + 5*86400000
millis6 = int(round(time.time() * 1000)) + 6*86400000
millis7 = int(round(time.time() * 1000)) + 7*86400000
millis8 = int(round(time.time() * 1000)) + 8*86400000

desc =  '#### create reservation for rahul on resource1 ####'
res = r.create_reservation([resource_id1], millis, millis2, 'title', 'description')
test_print(desc, res.status_code < 300)

desc =  '#### create reservation for rahul on resources1 and 2 ####'
res = r.create_reservation([resource_id1, resource_id2], millis3, millis4, 'title', 'description')
test_print(desc, res.status_code < 300)

desc =  '#### create reservation for rahul on resource3 ####'
res = r.create_reservation([resource_id3], millis, millis2, 'title', 'description')
test_print(desc, res.status_code < 300)

desc =  '#### create reservation for rahul on resources3 and 4 ####'
res = r.create_reservation([resource_id3, resource_id4], millis3, millis4, 'title', 'description')
test_print(desc, res.status_code < 300)

r.session = ''
desc = '#### login as ashwin ####'
session_response = r.login_to_session('ashwin', 'ashwin123')
test_print(desc, session_response.status_code < 300)
ashwin_session = session_response.cookies
r.session = ashwin_session

desc =  '#### create reservation for ashwin on resource1 ####'
res = r.create_reservation([resource_id1], millis5, millis6, 'title', 'description')
test_print(desc, res.status_code < 300)

desc =  '#### create reservation for ashwin on resources1 and 2 ####'
res = r.create_reservation([resource_id1, resource_id2], millis7, millis8, 'title', 'description')
test_print(desc, res.status_code < 300)

desc =  '#### create reservation for ashwin on resource3 ####'
res = r.create_reservation([resource_id3], millis5, millis6, 'title', 'description')
test_print(desc, res.status_code < 300)

desc =  '#### create reservation for ashwin on resources3 and 4 ####'
res = r.create_reservation([resource_id3, resource_id4
], millis7, millis8, 'title', 'description')
test_print(desc, res.status_code < 300)

r.session = ''
desc = '#### login as admin again ####'
r.session = admin_session

desc =  '#### get all reservations on resources, make sure there are 12 total rows ####'
res = r.get_reservations_by_resources([resource_id1, resource_id2, resource_id3, resource_id4])
test_print(desc, len(r.json.loads(res.content)['results']) == 12)

desc =  '#### update group 1 to manage on resource1 ####'
res = r.update_group_permission_to_resource(resource_id1, group_id1, 'manage')
test_print(desc, res.status_code < 300)

desc =  '#### get all reservations on resources, make sure there are still 12 rows after update to manage ####'
res = r.get_reservations_by_resources([resource_id1, resource_id2, resource_id3, resource_id4])
test_print(desc, len(r.json.loads(res.content)['results']) == 12)

desc =  '#### update group 1 to view only on resource1 ####'
res = r.update_group_permission_to_resource(resource_id1, group_id1, 'view')
test_print(desc, res.status_code < 300)

desc =  '#### get all reservations on resources, make sure there are only 9 rows after update to view - rahuls reservations on res1 should be gone, ashwins shouldnt ####'
res = r.get_reservations_by_resources([resource_id1, resource_id2, resource_id3, resource_id4])
test_print(desc, len(r.json.loads(res.content)['results']) == 9)

desc =  '#### remove permission for group2 on resource1 ####'
res = r.remove_group_permission_to_resource(resource_id1, [group_id2])
test_print(desc, res.status_code < 300)

desc =  '#### get all reservations on resources, make sure there are only 6 rows remove permission - ashwins reservations on res1 should now be gone too ####'
res = r.get_reservations_by_resources([resource_id1, resource_id2, resource_id3, resource_id4])
test_print(desc, len(r.json.loads(res.content)['results']) == 6)

desc =  '#### remove rahul and ashwin from group1 ####'
res = r.remove_users_from_group([rahul_user_id, ashwin_user_id], group_id1)
test_print(desc, res.status_code < 300)

desc =  '#### get all reservations on resources, make sure there are only 3 rows after removal of rahul - rahuls reservations should be gone ####'
res = r.get_reservations_by_resources([resource_id1, resource_id2, resource_id3, resource_id4])
test_print(desc, len(r.json.loads(res.content)['results']) == 3)

desc =  '#### delete group2 ####'
res = r.delete_group(group_id2)
test_print(desc, res.status_code < 300)

desc =  '#### get all reservations on resources, make sure there are only no rows left ####'
res = r.get_reservations_by_resources([resource_id1, resource_id2, resource_id3, resource_id4])
test_print(desc, len(r.json.loads(res.content)['results']) == 0)

r.finish_test("remove permissions test")

