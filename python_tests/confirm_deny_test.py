failed = 0
passed = 0

def test_print(desc, expression):
	global failed, passed
	if not expression:
		print desc
		print expression
		failed += 1
	else:
		passed += 1


print "confirm/deny test"
print str(failed) + "tests failed"
print str(passed) + "tests passed"