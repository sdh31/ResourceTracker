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

admin_session = r.session

desc = '### create non-admin user & session ###'
res = r.create_user("chris", "dee")
is_success(desc, res)
r.session = ''
res = r.login_to_session("chris", "dee")
non_admin_session = res.cookies

""" --- login as admin --- """
r.session = admin_session

desc = '### create restricted resource ###'
res = r.create_resource("restricted", "restricted", "restricted", 1, 0, 1)
is_success(desc, res)
restricted_id1 = get_id(res)

desc = '### create another restricted resource ###'
res = r.create_resource("restricted2", "restricted2", "restricted", 1, 0, 1)
is_success(desc, res)
restricted_id2 = get_id(res)

desc = '### create free resource ###'
res = r.create_resource("free", "free", "free", 1000, 0, 1)
is_success(desc, res)
free_id = get_id(res)

millis = int(round(time.time() * 1000)) + 86400000
millis2 = int(round(time.time() * 1000)) + 2*86400000
millis3 = int(round(time.time() * 1000)) + 3*86400000
millis4 = int(round(time.time() * 1000)) + 4*86400000

desc = '### create reservation on restricted1 ###'
res = r.create_reservation([restricted_id1], millis, millis2, 't', 'd')
is_success(desc, res)
r1_id = get_id(res)

desc = '### create reservation on restricted2 and one unrestricted ###'
res = r.create_reservation([restricted_id1, free_id], millis+1, millis3, 't', 'd')
is_success(desc, res)
r2F_id = get_id(res)

desc = '### create reservation on both restricted resources ###'
res = r.create_reservation([restricted_id2, restricted_id1], millis, millis4, 't', 'd')
is_success(desc, res)
r2r1_id = get_id(res)

desc = "### test that resource cannot be changed to free while oversubscribed ###"
res = r.update_resource(restricted_id1, "s", "s", "free")
is_failure(desc, res)

"""" ---login as non_admin--- """
r.session = non_admin_session

desc = '### confirm restricted1 w/ no permissions ###'
res = r.confirm_resource_reservation(restricted_id2, r2r1_id)
is_failure(desc, res)

desc = '### deny restricted resource w/ no permission ###'
res = r.deny_resource_reservation(restricted_id1, r2r1_id)
is_failure(desc, res)

desc = "### test that resource cannot be updated w/ no permissions ###"
res = r.update_resource(restricted_id1, "s", "s", "free")
is_failure(desc, res)

""" ---login as admin--- """
r.session = admin_session

desc = '### confirm restricted1 on reservation w/ two restricted resources ###'
res = r.confirm_resource_reservation(restricted_id2, r2r1_id)
is_success(desc, res)
desc = '### make sure overlapping reservation was not deleted yet ###'
res = r.get_reservations_by_resources([restricted_id1])
is_success(desc, res)
test_print(desc, len(r.json.loads(res.content)['results']) == 3)

desc = '### confirm other resource on same resource ###'
res = r.confirm_resource_reservation(restricted_id1, r2r1_id)
is_success(desc, res)

desc = '### make sure overlapping reservations were deleted ###'
res = r.get_reservations_by_resources([restricted_id1, restricted_id2])
test_print(desc, len(r.json.loads(res.content)['results']) == 2)

desc = "### make sure you can't deny an already confirmed reservation ###"
res = r.deny_resource_reservation(restricted_id1, r2r1_id)
is_failure(desc, res)

desc = "### test that resource can be changed once conflicts are resolved ###"
res = r.update_resource(restricted_id1, "s", "s", "free")
is_success(desc, res)

r.finish_test("Confirm Deny Test")