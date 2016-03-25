import requester as r
from requester import test_print

r.initialize_and_clear_tables()

def is_success(desc, res):
	test_print(desc, session_response.status_code < 300)

def is_failure(desc, res):
	test_print(desc, res.status_code >= 400 and res.status_code < 500)

def get_id(res):
	json_content = r.json.loads(res.content)
	if 'insertId' in json_content:
	 	return json_content['insertId']
	return json_content['results']['insertId']

desc = '#### initialize session ####'
session_response = r.login_to_session('admin', 'Treeadmin')
is_success(desc, session_response)
admin_session = session_response.cookies
r.session = admin_session

desc = '### create restricted resource ###'
res = r.create_resource("restricted", "restricted", "restricted")
is_success(desc, res)
restricted_id1 = get_id(res)

desc = '### create another restricted resource ###'
res = r.create_resource("restricted2", "restricted2", "restricted2")
is_success(desc, res)
restricted_id2 = get_id(res)

desc = '### create free resource ###'
res = r.create_resource("free", "free", "free")
is_success(desc, res)
free_id = get_id(res)

desc = '### create reservation on restricted1 ###'
res = r.create_reservation([restricted_id1], 1, 5, 't', 'd')
is_success(desc, res)
r1_id = get_id(res)

desc = '### create reservation on restricted2 and one unrestricted ###'
res = r.create_reservation([restricted_id1, free_id], 2, 7, 't', 'd')
is_success(desc, res)
r2F_id = get_id(res)

desc = '### create reservation on both restricted resources ###'
res = r.create_reservation([restricted_id2, restricted_id1], 1, 10, 't', 'd')
is_success(desc, res)
r2r1_id = get_id(res)

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
test_print(desc, len(r.json.loads(res.content)['results']))

desc = "### make sure you can't deny an already confirmed reservation ###"
res = r.deny_resource_reservation(restricted_id1, r2r1_id)
is_failure(desc, res)

r.finish_test("Confirm Deny Test")