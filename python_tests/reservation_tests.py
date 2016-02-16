import requester as r
import checker as c

r.verify = False

session_response = r.login_to_session('admin', 'Treeadmin')
c.check_valid_response(session_response.status_code, 'signin')
r.session = session_response.cookies

res = r.create_resource("my resource", "huh", 1, ['ant', 'eater', 'shit'])
content = r.json.loads(res.content)['results']
c.check_result_length(content, 1, 'create resource')
c.check_result_value_exists("")
resource_id = content['insert_id']
print resource_id