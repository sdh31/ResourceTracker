var fs = require('fs');
var express = require('express');
var app = express();
var router = express.Router();
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('/home/bitnami/server.conf');
// SHIBBOLETH CONFIGURATION

var serverCert = fs.readFileSync('/opt/bitnami/apache2/conf/server.crt', 'utf8');
var privateKey = fs.readFileSync('/opt/bitnami/apache2/conf/server.key', 'utf8');
var sp_cert = fs.readFileSync('/etc/shibboleth/sp-cert.pem', 'utf-8');

var passport = require('passport');
var saml = require('passport-saml');


passport.serializeUser(function(user, done){
    console.log(user);
    done(null, user);
});

passport.deserializeUser(function(user, done){
    console.log(user);
    done(null, user);
});


var serverNumber = properties.get('server_number');
var samlStrategy = new saml.Strategy({
    entryPoint: 'https://shib.oit.duke.edu/idp/profile/SAML2/Redirect/SSO',
    issuer: 'https://colab-sbx-' + serverNumber + '.oit.duke.edu/login-shib',
    callbackUrl: 'https://colab-sbx-' + serverNumber + '.oit.duke.edu/Shibboleth.sso/SAML2/POST',
    cert: sp_cert,
    decryptionPvk: privateKey,
    identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
    decryptionCert: serverCert,
    validateInResponseTo: true
  }, function(profile, done) {
        // I'm not sure what this part is doing. It was taken from online, but
        // does not ever appear to be called.
        return done(null, {
            id : profile.uid,
            email : profile.email,
            displayName : profile.cn,
            firstName : profile.givenName,
            lastName : profile.sn
        }); 
});

passport.use(samlStrategy);
app.use(passport.initialize());
app.use(passport.session());

router.get('/signin-shib', passport.authenticate('saml', {failureRedirect: '/login/fail'}));

// Duke calls this endpoint after verifying the user. For some reason the request
// body is in a weird format, so we have to make sense of it.
router.post('/Shibboleth.sso/SAML2/POST', function(req, res, next) {
    var xpath = require('xpath');
    var dom = require('xmldom').DOMParser
    var xmlenc = require('xml-encryption');
    if (!(req && req.body && req.body.SAMLResponse)) {
        return;
    }

    // turn data into XML format
    var xmlData = new Buffer(req.body.SAMLResponse, 'base64').toString('ascii');

    // grab the encrypted data from the XML file
    var doc = new dom().parseFromString(xmlData);
    var nodes = xpath.select("//*[local-name() = 'EncryptedData']", doc)
    var encryptedData = nodes[0].toString();

    // private key given to us by Duke shibboleth installation
    var sp_key = fs.readFileSync('/etc/shibboleth/sp-key.pem', 'utf-8');
    var options = { key: sp_key };

    // decrypt the XML data
    var decryptedData = '';
    xmlenc.decrypt(encryptedData, options, function(err, result) { 
       decryptedData = result;
    });

    // grab email, first name, and last name from clean (decrypted) XML doc
    var cleanDoc = new dom().parseFromString(decryptedData)
    
    var eduPersonPrincipalName_node = xpath.select("//*[@FriendlyName='eduPersonPrincipalName']", cleanDoc);
    var email = "EMAIL: " + eduPersonPrincipalName_node[0].firstChild.firstChild.data;

    var givenName_node = xpath.select("//*[@FriendlyName='givenName']", cleanDoc);
    var firstName = "FIRST NAME: " + givenName_node[0].firstChild.firstChild.data;

    var sn_node = xpath.select("//*[@FriendlyName='sn']", cleanDoc);
    var lastName = "LAST NAME: " + sn_node[0].firstChild.firstChild.data;

    console.log(email + firstName + lastName);

    req.session.user = email;
    // lets log them in and then redirect them back to the home page
    res.redirect('/#/');
});

router.get('/login/fail', 
    function(req, res) {
        res.send(401, 'Login failed');
    }
);

router.get('/Shibboleth.sso/Metadata', 
    function(req, res) {
        res.type('application/xml');
        res.sendFile('/etc/shibboleth/duke-metadata-2-signed.xml');
    }
);

module.exports = router;