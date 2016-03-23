
#!/bin/bash 
mysql -u root "-pdb" test_db << EOF
DROP DATABASE test_db;
CREATE DATABASE test_db;
EOF

sudo node ../server/server.js & export NODE_PID=$!
sleep 2
python temp_tester.py

sudo kill $NODE_PID

