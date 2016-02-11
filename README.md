Node v0.10.29
npm 1.4.21

Important Commands

        Stop HTTP Processes: sudo /opt/bitnami/ctlscript.sh stop apache
        Show Status of Ports in Use: netstat -tulnap
        Start Server: sudo node server.js
        Use MySQL: mysql -u root -p

Node Modules

        Express

Servers

        Development Servers
            Ashwin -> https://colab-sbx-366.oit.duke.edu
            Chris -> https://colab-sbx-202.oit.duke.edu
        Test Server
            Rahul -> https://colab-sbx-212.oit.duke.edu
        Production Server
            Stephen -> https://colab-sbx-123.oit.duke.edu

Database Structure

        MySQL Database Password: db
        Schema: https://docs.google.com/document/d/109pIj377dgMmYcTE61wDp8kBut4UyG9Q0pKHqRn_Pwc/edit

Steps to Generate SSL Certificate for Server

        1) Go to /opt/bitnami/apache2/conf
        
        2) Remove server.csr and server.crt
        
        3) Issue command 'openssl req -new -newkey rsa:4096 -nodes -keyout server.key -out server.csr' , which generates a certificate signing request. Info given should be
        
                Country Name (2 letter code) [AU]:US
                State or Province Name (full name) [Some-State]:North Carolina
                Locality Name (eg, city) []:Durham
                Organization Name (eg, company) [Internet Widgits Pty Ltd]:Dev
                Organizational Unit Name (eg, section) []:Dev
                Common Name (e.g. server FQDN or YOUR name) []: colab-sbx-212.oit.duke.edu (your server name)
                Email Address []:rs268@duke.edu
                
        4) Make sure server.key and server.csr have the same modulus, so issue the commands
        
                openssl rsa -noout -modulus -in server.key | openssl md5
                openssl req -noout -modulus -in server.csr | openssl md5
                
        and make sure that the hashes match. 
        
        5) Go to https://oit.duke.edu/net-security/security/certs.php to submit the CSR
        
        6) Go to /opt/bitnami/apache2/conf/extra and open the httpd-ssl.conf file. Update the ServerName variable to the domain name, such as colab-sbx-212.oit.duke.edu
        
        7) Upon receiving the actual certificate, only include the certificate (and not chain of intermediate certificates) in the file server.crt in /opt/bitnami/apache2/conf.
        
        Then, restart apache with the command 'sudo /opt/bitnami/ctlscript.sh restart apache'. 
        Lastly, stop apache using the command 'sudo /opt/bitnami/ctlscript.sh stop apache'

Using Redis Store to store info for session handling

Can launch redis command line interface using redis-cli

Session keys might build up in the db if "logout" isn't clicked every time to destroy the key..you can flush the redisDB using FLUSHDB


How to install mongo on Ubuntu VMs:

follow steps from https://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org


How to install mocha.js on the VM

run command to install mocha in the server folder: 

sudo npm install -g mocha

tutorial to create different types of tests https://mochajs.org/

To run the tests you created, place them in the test directory in server and then run the command "mocha" from either the server or test directory
