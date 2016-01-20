var UnchainSecurity = require('./security.js');
// var gui = require('nw.gui');

var passwordSet = false;

UnchainSecurity.resetPasswords(function(err) {

    UnchainSecurity.setUp(function(err, settings) {
        if (err) {
            console.log('Setup error', err);
        } else {
            console.log('Setup ok', settings);
            
        }
    });

});