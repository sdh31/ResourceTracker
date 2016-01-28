Node v0.10.29
npm 1.4.21

Important commands:

stop http processes on port 80:  sudo /opt/bitnami/ctlscript.sh stop apache


show status of in use ports: netstat -tulnap


Server listening on port 80, need to use sudo when launching server (sudo node server.js)

Node Modules:

- express

Local Development Servers

Ashwin -> http://colab-sbx-366.oit.duke.edu

Chris -> http://colab-sbx-202.oit.duke.edu

Test Server

http://colab-sbx-212.oit.duke.edu (aliased by http://resource-tracker-test.colab.duke.edu)

Production Server

http://colab-sbx-123.oit.duke.edu (aliased by http://resource-tracker-prod.colab.duke.edu)

MySQL Database Password: db

Database Schema: https://docs.google.com/document/d/109pIj377dgMmYcTE61wDp8kBut4UyG9Q0pKHqRn_Pwc/edit

Steps to Generate SSL Certificate for Server
1) Go to /opt/bitnami/apache2/conf
2) Remove server.csr and server.crt
3) Issue command 'openssl req -new -newkey rsa:4096 -nodes -keyout server.key -out server.csr' , which generates a certificate signing request. Info given should be

    Country Name (2 letter code) [AU]:US
    State or Province Name (full name) [Some-State]:North Carolina
    Locality Name (eg, city) []:Durham
    Organization Name (eg, company) [Internet Widgits Pty Ltd]:Dev
    Organizational Unit Name (eg, section) []:Dev
    Common Name (e.g. server FQDN or YOUR name) []: *** NAME OF SERVER MUST BE USED HERE***, an example would be       colab-sbx-212.oit.duke.edu
    Email Address []:rs268@duke.edu
    
4) Make sure server.key and server.csr have the same modulus, so issue the commands 
    openssl rsa -noout -modulus -in server.key | openssl md5
    openssl req -noout -modulus -in server.csr | openssl md5
    
    and make sure that the hashes match. 

5) Go to https://oit.duke.edu/net-security/security/certs.php to submit the CSR

6) Go to /opt/bitnami/apache2/conf/extra and open the httpd-ssl.conf file. Update the ServerName variable to the domain name, such as colab-sbx-212.oit.duke.edu

7) Upon receiving the actual certificate, only include the certificate (and not chain of intermediate certificates) in the file server.crt in /opt/bitnami/apache2/conf



