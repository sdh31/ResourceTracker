def check_valid_response(status_code, test_name):
	if status_code >= 200 and status_code < 300:
		print "success on " + test_name
	else:
		raise Exception("response code " + status_code + "was not valid on " + test_name)

def check_invalid_response(status_code, test_name):
	if status_code >= 400 and  status_code< 500:
		print "correct fail on " + test_name
	else:
		raise Exception("response code " + status_code + "was incorrectly valid on " + test_name)

def check_result_length(results, length, test_name):
	if len(results) == length:
		print "correct length on " + test_name
	else:
		raise Exception("length " + results.length + "was incorrect on " + test_name)

def check_result_value_exists(array_results, field, value, test_name):
	for row in array_results:
		if row[field] == value:
			return
	raise Exception("value " + value + "was not found in " + test_name)
