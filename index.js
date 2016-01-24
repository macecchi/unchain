'use strict';
var nw = require('nw.gui');
var UnchainGUI = require('./gui');
var UnchainLock = require('./lockScripts');
var UnchainSecurity = require('./security.js');
var UnchainServer = require('./server.js');

function didLoadViewCallback(menu) {
// UnchainSecurity.resetPasswords(function(err) {
    UnchainSecurity.setUp(function(err, settings) {
        if (err) {
            console.log('Setup error', err);
        }
        else {
            console.log('Setup ok', settings);
            
            if (!settings.password) {
                console.log('Password not set by user');
                UnchainGUI.showSetPasswordMenu(didSetPasswordCallback);
            }
            else {
                UnchainServer.start({ pin: settings.pin, password: settings.password });
                UnchainGUI.showRunningMenu();
                UnchainGUI.showSetPasswordMenu(didSetPasswordCallback);

            }
        }
    });
// });
}

function didSetPasswordCallback() {
    console.log('Did set password');
    UnchainGUI.hideSetPasswordMenu();
    // todo: start server
    UnchainGUI.showRunningMenu();
}

function lockCallback() {
    UnchainLock.lock();
}

function quitCallback() {
    console.log('Tapped quit');
    //serverquit
    nw.App.quit();
}

UnchainGUI.setUp(nw, didLoadViewCallback, lockCallback, quitCallback);

