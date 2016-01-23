'use strict';
var UnchainLock = require('./lockScripts');
var UnchainSecurity = require('./security.js');
var UnchainServer = require('./server.js');
var nw = require('nw.gui');
var UnchainGUI = require('./gui');

function didLoadViewCallback(menu) {

UnchainSecurity.resetPasswords(function(err) {

    UnchainSecurity.setUp(function(err, settings) {
        if (err) {
            console.log('Setup error', err);
        }
        else {
            console.log('Setup ok', settings);
            
            if (!settings.password) {
                console.log('Password not set by user');
                UnchainGUI.showSetPasswordMenu();
            }
            else {
                UnchainServer.start({ pin: settings.pin, password: settings.password });
                UnchainGUI.showRunningMenu();
                menu.popup(10,10);
            }
        }
    });

});
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

