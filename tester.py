import requester as r

r.verify = False

session_response = r.login_to_session('admin', 'admin')
print session_response.status_code
r.session = session_response.cookies
print r.session

res = r.create_resource("my resource", "huh", 1, ['ant', 'eater', 'shit'])
resource_id = r.json.loads(res.content)['insert_id']
print resource_id

res = r.create_reservation(resource_id, 1, 2)
print res.status_code
reservation_id = r.json.loads(res.content)['insertId']

res = r.create_reservation(resource_id, 2, 3)
print res.status_code

res = r.create_reservation(resource_id, 3, 3)
print res.status_code

res = r.create_reservation(resource_id, 3, 4)
print res.status_code

res = r.get_reservations(resource_id, 0, 99999)
print r.json.loads(res.content)['results']

res = r.update_reservations(resource_id, 5, 10, reservation_id)
print res.status_code

res = r.get_reservations(resource_id, 0, 99999)
print r.json.loads(res.content)['results']