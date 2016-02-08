import requester as r

session_response = r.login_to_session('admin', 'admin')
print session_response.status_code
r.session = session_response.cookies
print r.session

res = r.create_resource("my resource", "huh", 1, ['ant', 'eater', 'shit'])
resource_id = r.json.loads(res.content)['insert_id']

res = r.create_reservation(resource_id, 1, 2)
print res.status_code

res = r.create_reservation(resource_id, 2, 3)
print res.status_code

res = r.create_reservation(resource_id, 3, 3)
print res.status_code

res = r.create_reservation(resource_id, 3, 4)
print res.status_code

res = r.get_reservations(resource_id, 0, 99999)
print res

