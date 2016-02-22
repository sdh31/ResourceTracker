var fs = require('fs');
var express = require('express');
var app = express();
var router = express.Router();
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('/home/bitnami/server.conf');
var user_service = require('../services/users');
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
    var email_address = eduPersonPrincipalName_node[0].firstChild.firstChild.data;

    var givenName_node = xpath.select("//*[@FriendlyName='givenName']", cleanDoc);
    var first_name = givenName_node[0].firstChild.firstChild.data;

    var sn_node = xpath.select("//*[@FriendlyName='sn']", cleanDoc);
    var last_name = sn_node[0].firstChild.firstChild.data;

    var username = email_address.substring(0, email_address.indexOf('@'));

    // check if shibboleth user already exists in local database
    // if they do set req.session.user to that user and redirect back to homepage
    // otherwise create the user in DB and redirect back to homepage
    
    var createUserCallback = function(result) {
        if (result.error) {
            console.log("damn, ya hate to hear that");
        } else {
            req.session.isValid = true;
            req.session.user = {};
            req.session.user.username = username;
            req.session.user.is_shibboleth = 1;
            req.session.user.user_id = result.insertId;
            res.redirect('/#/');
        }
    };

    var checkIfUserExistsCallback = function(result) {
        if (result.empty) {
            var thisUser = {
                username: username,
                email_address: email_address,
                first_name: first_name,
                last_name: last_name,
                password: '',
                is_shibboleth: 1,
                emails_enabled: 1
            };
            
            user_service.create_user(thisUser, createUserCallback);
        } else {
            req.session.isValid = true;
            req.session.user = result.user;
            res.redirect('/#/');
        }
    };
    
    user_service.get_user_permissions({username: username, is_shibboleth: 1}, checkIfUserExistsCallback);
});


router.get('/signout-shib', function(req, res, next) {
    req.session.destroy(function() {
        res.type('text/plain');
        res.send('YOU ARE LOGGED OUT');
    });
    var returnToUrl = 'https://colab-sbx-' + serverNumber + '.oit.duke.edu';

    res.redirect('https://shib.oit.duke.edu/cgi-bin/logout.pl?logoutWithoutPrompt=1&returnto=' + returnToUrl);
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
