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
            Stephen -> https://colab-sbx-338.oit.duke.edu
        Test Server
            Rahul -> https://colab-sbx-212.oit.duke.edu
        Production Server
            Stephen -> https://colab-sbx-123.oit.duke.edu

Database Structure

        MySQL Database Password: db
        Schema: https://docs.google.com/document/d/109pIj377dgMmYcTE61wDp8kBut4UyG9Q0pKHqRn_Pwc/edit
        
Server node_modules

        Server side node modules SHOULD NOT be checked into source control
        Update npm (you will have to do this since certain libraries required it):sudo npm install -g npm
        make sure everything is installed:sudo npm install
        install packages and save to package.json: npm install <pkg_name> --save-dev
        add all existing packages to package.json: npm-collect --save
        

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
        

Shibboleth

        This is an interesting one....
        1) Take a look at this site http://dev.colab.duke.edu/resource/shibboleth-tools
        2) Download the source code, and run the installation script. This will install some files in /etc/shibboleth/
                
                sp-cert.pem
                sp-key.pem
                
        3) Follow the rest of the instructions, which will make you make a request at https://idms-web.oit.duke.edu/spreg/sps
        4) In our application, we issue a Shibboleth request, which redirects the user, and eventually POSTs to          '/Shibboleth.sso/SAML2/POST'

Frontend Testing

        Karma is a tool which allows you run tests in your browser.
        Jasmine is a javascript testing framework. The two work well with angular.
        We're running frontend tests on port 1234, so on the server you have to open that up so its publicly reachable.
        Use the command 'sudo iptables -I INPUT -p tcp --dport 1234 --syn -j ACCEPT' to do so.
        Also, add /home/bitnami/ResourceTracker/client/node_modules/karma/bin to your PATH.
        Go to ~/ResourceTracker/client/ and run 'karma start'

Run Node Server on Reboot

        This one should probably only be used for our production server.
        Go to /etc/init/ and create the file resource-tracker.conf
        Inside, put the contents
        
        author      "name of author"
        # Used to Be: Start on Startup
        # until we found some mounts weren't ready yet while booting:
        start on started mountall
        stop on shutdown
        # Automatically Respawn:
        respawn
        respawn limit 99 5
        script
        # Not sure why $HOME is needed, but we found that it is:
        export HOME="/root"
        exec  /opt/bitnami/nodejs/bin/node /home/bitnami/ResourceTracker/server/server.js >> /var/log/node.log 2>&1
        end script
        post-start script
        # Optionally put a script here that will notifiy you node has (re)started
        # /root/bin/hoptoad.sh "node.js has started!"
        end script
        
        In addition, kill the apache server with 'sudo /opt/bitnami/ctlscript.sh stop apache'
        and make sure apache does not run on reboot with
        'sudo mv /opt/bitnami/apache2/scripts/ctl.sh /opt/bitnami/apache2/scripts/ctl.sh.disabled'
        
        You can now control the server with the command 'resource-tracker start' or 'resource-tracker stop'

Redirect HTTP to HTTPS

        On your server, enter the command 'sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 443'.
        Then, open the file '/etc/network/interfaces' and type in the following:
                pre-up iptables-restore < /etc/iptables.rules
                post-down iptables-save > /etc/iptables.rules
                
        This will ensure that the redirect still works if the server reboots!


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
