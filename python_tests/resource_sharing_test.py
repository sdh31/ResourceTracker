import requester as r
from requester import test_print
import time

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
def get_time(iter):
	millis = int(round(time.time() * 1000)) + iter*86400000
	return millis

desc = '#### initialize session ####'
res = r.login_to_session('admin', 'Treeadmin')
is_success(desc, res)
admin_session = res.cookies
r.session = admin_session

desc = '### create restricted resource ###'
res = r.create_resource("restricted", "restricted", "restricted", 3, 1, 0)
is_success(desc, res)
resource_id1 = get_id(res)

desc = '### Create Free Resource ###'
res = r.create_resource("free", "free", "free", 2, 1, 0)
is_success(desc, res)
free_id = get_id(res)

desc = '### create 1 to 2 reservation ###'
res = r.create_reservation([free_id, resource_id1], get_time(1), get_time(2), 't', 'd')
is_success(desc, res)
reservation_id1 = get_id(res)

desc = '### create 1 to 3 reservation #1 ###'
res = r.create_reservation([free_id, resource_id1], get_time(1), get_time(3), 't', 'd')
is_success(desc, res)
reservation_id2 = get_id(res)

desc = '### Test that resource sharing level can be moved up and down ###'
res = r.update_resource(resource_id1, sharing_level = 4)
is_success(desc, res)
res = r.update_resource(resource_id1, sharing_level = 2)
is_success(desc, res)

desc = '### create 1 to 3 reservation on free ###'
res = r.create_reservation([free_id], get_time(1), get_time(3), 't', 'd')
is_failure(desc, res)

desc = '### create a conflicitng on both free and restricted ###'
res = r.create_reservation([free_id, resource_id1], get_time(1), get_time(3), 't', 'd')
is_success(desc, res)

desc = '### Test that cannot set resource to free when oversubscribed with unconfirmed rsrvts.'
res = r.update_resource(resource_id1, resource_state = 'free')
is_failure(desc, res)
test_print(desc, len(r.json.loads(res.content)) == 3)

desc = '### Test that can reduce sharing_level when overbooked with unconfirmed reservations, and change back'
res = r.update_resource(resource_id1, sharing_level=1)
is_success(desc, res)
res = r.update_resource(resource_id1, sharing_level=2)
is_success(desc, res)

desc = '### create 1 to 3 reservation on restricted ###'
res = r.create_reservation([resource_id1], get_time(1), get_time(3), 't', 'd')
is_success(desc, res)

desc = '### create 3 to 4 reservation ###'
res = r.create_reservation([free_id, resource_id1], get_time(3), get_time(4), 't','d')
is_success(desc, res)
reservation1 = get_id(res)

desc = '### confirm first resource ###'
res = r.confirm_resource_reservation(resource_id1, reservation_id1)
is_success(desc, res)

desc = '### confirm second resource -- reservations should be deleted'
res = r.confirm_resource_reservation(resource_id1, reservation_id2)
is_success(desc, res)

desc = '### Test that cannot change resource to free and reduce sharing_level when only confirmed overbooked ###'
res = r.update_resource(resource_id1, resource_state='free', sharing_level=1)
is_failure(desc, res)

desc = '### Test that can change resource to free when only confirmed resources ###'
res = r.update_resource(resource_id1, resource_state='free')
is_success(desc, res)

desc = '### Check that three reservations remain (two confirmed, one not overlapping)'
res = r.get_reservations_by_resources([resource_id1])
is_success(desc, res)
test_print(desc, len(r.json.loads(res.content)['results']) == 3)


r.finish_test("basic resource sharing test")