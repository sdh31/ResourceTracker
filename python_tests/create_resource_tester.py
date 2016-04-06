import requester as r
import time
from requester import test_print

r.verify = False

r.initialize_and_clear_tables()

admin_session = r.session

desc = '#### create two folders ####'
res = r.create_resource("folder1", "folder1", 'free', 1000, 1, 1)
test_print(desc, res.status_code < 300)
folder_id1 = r.json.loads(res.content)['insertId']

res = r.create_resource("folder2", "folder2", 'free', 1000, 1, 1)
test_print(desc, res.status_code < 300)
folder_id2 = r.json.loads(res.content)['insertId']

desc = '#### create 4 resources ####'
res = r.create_resource("res1", "res1", 'free', 1000, 0, folder_id1)
test_print(desc, res.status_code < 300)
resource_id1 = r.json.loads(res.content)['insertId']

res = r.create_resource("res2", "res2", 'free', 1000, 0, folder_id2)
test_print(desc, res.status_code < 300)
resource_id2 = r.json.loads(res.content)['insertId']

res = r.create_resource("res3", "res3", 'free', 1000, 0, folder_id1)
test_print(desc, res.status_code < 300)
resource_id3 = r.json.loads(res.content)['insertId']

res = r.create_resource("res4", "res4", 'free', 1000, 0, folder_id2)
test_print(desc, res.status_code < 300)
resource_id4 = r.json.loads(res.content)['insertId']

desc = '#### get direct children for folder 1 and verify if correct ####'
res = r.get_all_direct_children(folder_id1)
test_print(desc, res.status_code < 300)
test_print(desc, len(r.json.loads(res.content)['results']) == 2)
test_print(desc, r.json.loads(res.content)['results'][0]['resource_id'] == resource_id1)
test_print(desc, r.json.loads(res.content)['results'][1]['resource_id'] == resource_id3)

desc = '#### get subtree starting at root and verify if correct ####'
res = r.get_subtree(1)
test_print(desc, res.status_code < 300)
test_print(desc, len(r.json.loads(res.content)['results']) == 7)

desc = '#### get subtree starting at folder2 and verify if correct ####'
res = r.get_subtree(folder_id2)
test_print(desc, res.status_code < 300)
test_print(desc, len(r.json.loads(res.content)['results']) == 3)

desc =  '#### create 1 more user ####' 
res = r.create_user('rahul', 'rahul123')
test_print(desc, res.status_code < 300)
rahul_user_id = r.json.loads(res.content)['insertId']

desc =  '#### create 1 group ####'
res = r.create_group("group1", "nope", True, True, True, False)
test_print(desc, res.status_code < 300)
test_print(desc, res.content)
group_id1 = r.json.loads(res.content)['results']['insertId']

desc =  '#### add rahul to the first group ####'
res = r.add_users_to_group([rahul_user_id], group_id1)
test_print(desc, res.status_code < 300)

desc = '#### try adding reserve permission to a folder ####'
res = r.add_group_permission_to_resource(folder_id1, [group_id1], ['reserve'])
test_print(desc, res.status_code > 300)

desc = '#### try adding manage permission to a folder ####'
res = r.add_group_permission_to_resource(folder_id2, [group_id1], ['manage'])
test_print(desc, res.status_code > 300)

desc = '#### successfully add view permissions to folders ####'
res = r.add_group_permission_to_resource(folder_id2, [group_id1], ['view'])
test_print(desc, res.status_code < 300)
res = r.add_group_permission_to_resource(folder_id1, [group_id1], ['view'])
test_print(desc, res.status_code < 300)

desc = '#### successfully add reserve permission to a resource ####'
res = r.add_group_permission_to_resource(resource_id1, [group_id1], ['reserve'])
test_print(desc, res.status_code < 300)

desc = '#### successfully add manage permission to a resource ####'
res = r.add_group_permission_to_resource(resource_id2, [group_id1], ['manage'])
test_print(desc, res.status_code < 300)

desc = '#### try to update to reserve permission on a folder ####'
res = r.update_group_permission_to_resource(folder_id2, group_id1, 'reserve')
test_print(desc, res.status_code > 300)

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

desc =  '#### create reservation for rahul on resource1 ####'
res = r.create_reservation([resource_id1], millis, millis2, 'title', 'description')
test_print(desc, res.status_code < 300)

desc =  '#### create reservation for rahul on resource2 ####'
res = r.create_reservation([resource_id2], millis, millis2, 'title', 'description')
test_print(desc, res.status_code < 300)

r.session = admin_session

desc =  '#### get all reservations on resources, make sure there are 2 rows ####'
res = r.get_reservations_by_resources([resource_id1, resource_id2, resource_id3, resource_id4])
test_print(desc, len(r.json.loads(res.content)['results']) == 2)

desc = '#### remove view permission from folder1 ####'
res = r.remove_group_permission_to_resource(folder_id1, [group_id1])
test_print(desc, res.status_code < 300)

desc =  '#### get all reservations on resources, make sure theres 1 row left ####'
res = r.get_reservations_by_resources([resource_id1, resource_id2, resource_id3, resource_id4])
test_print(desc, len(r.json.loads(res.content)['results']) == 1)

desc = '#### remove view permission from folder2 ####'
res = r.remove_group_permission_to_resource(folder_id2, [group_id1])
test_print(desc, res.status_code < 300)

desc =  '#### get all reservations on resources, make sure there arent any rows ####'
res = r.get_reservations_by_resources([resource_id1, resource_id2, resource_id3, resource_id4])
test_print(desc, len(r.json.loads(res.content)['results']) == 0)

desc = '#### update parent for folder2 ####'
res = r.update_parent_of_resource(folder_id2, folder_id1)
test_print(desc, res.status_code < 300)

desc = '#### get subtree starting at folder1 ####'
res = r.get_subtree(folder_id1)
test_print(desc, res.status_code < 300)
test_print(desc, len(r.json.loads(res.content)['results']) == 6)

desc = '#### update parent for resource1 ####'
res = r.update_parent_of_resource(resource_id1, 1)
test_print(desc, res.status_code < 300)

desc = '#### get subtree starting at folder1 ####'
res = r.get_subtree(folder_id1)
test_print(desc, res.status_code < 300)
test_print(desc, len(r.json.loads(res.content)['results']) == 5)

desc = '#### try to update parent for resource1 to resource2 ####'
res = r.update_parent_of_resource(resource_id1, resource_id2)
test_print(desc, res.status_code > 300)

desc = '#### get subtree starting at folder1 ####'
res = r.get_subtree(folder_id1)
test_print(desc, res.status_code < 300)
test_print(desc, len(r.json.loads(res.content)['results']) == 5)

r.finish_test("create resources test")
