import requester as r
import time
from requester import test_print

r.verify = False

r.initialize_and_clear_tables()

admin_session = r.session

root_resource_id = 1

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

desc =  '#### create 1 more user ####' 
res = r.create_user('rahul', 'rahul123')
test_print(desc, res.status_code < 300)
rahul_user_id = r.json.loads(res.content)['insertId']
rahul_group_id = 2

desc =  '#### create 1 group ####'
res = r.create_group("group1", "nope", True, True, True, False)
test_print(desc, res.status_code < 300)
test_print(desc, res.content)
group_id1 = r.json.loads(res.content)['results']['insertId']

desc =  '#### add rahul to the first group ####'
res = r.add_users_to_group([rahul_user_id], group_id1)
test_print(desc, res.status_code < 300)

desc = '#### Give group 1 view access to root resource ####'
res = r.add_group_permission_to_resource(root_resource_id, [group_id1], ['view'])
test_print(desc, res.status_code < 300)

desc = '#### Give rahul view access to root ####'
res = r.add_group_permission_to_resource(root_resource_id, [rahul_group_id], ['view'])
test_print(desc, res.status_code < 300)

desc = '#### add view permission to folder1 ####'
res = r.add_group_permission_to_resource(folder_id1, [group_id1], ['view'])
test_print(desc, res.status_code < 300)

desc = '#### try to update parent for folder1 ####'
res = r.update_parent_of_resource(folder_id1, folder_id2)
test_print(desc, res.status_code > 300)
test_print(desc, r.json.loads(res.content)['parentResourcePermissionMismatchError'] == 1)

desc = '#### add view permission to folder2 ####'
res = r.add_group_permission_to_resource(folder_id2, [group_id1], ['view'])
test_print(desc, res.status_code < 300)

desc = '#### successfully update parent for folder1 ####'
res = r.update_parent_of_resource(folder_id1, folder_id2)
test_print(desc, res.status_code < 300)

r.finish_test("update resources test")
