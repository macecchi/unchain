'use strict';

var UnchainSecurity = require('./security.js');
var UnchainServer = require('./server.js');
// var gui = require('nw.gui');

var passwordSet = false;

// UnchainSecurity.resetPasswords(function(err) {

    UnchainSecurity.setUp(function(err, settings) {
        if (err) {
            console.log('Setup error', err);
        } else {
            console.log('Setup ok', settings);
            if (!settings.password) {
                console.log('Password not set by user');
                settings.password = 'oi';
                UnchainServer.start({ pin: settings.pin, password: settings.password });
            } else {
                UnchainServer.start({ pin: settings.pin, password: settings.password });
            }
        }
    });

// });