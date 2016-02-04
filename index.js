'use strict';
var nw = require('nw.gui');
var UnchainGUI = require('./gui');
var UnchainLock = require('./lockScripts');
var UnchainSecurity = require('./security.js');
var UnchainServer = require('./server.js');

var serverSettings;

function appDidFinishLaunching(menu) {
// UnchainSecurity.resetPasswords(function(err) {
    UnchainSecurity.setUp(function(err, settings) {
        if (err) {
            console.log('Setup error', err);
        }
        else {
            console.log('Setup ok', settings);
            serverSettings = settings;
            
            if (!settings.password) {
                console.log('Password not set by user');
                UnchainGUI.showSetPasswordMenu('Configure');
                UnchainGUI.showPreferencesWindow();
            }
            else {
                UnchainServer.start({ pin: serverSettings.pin, password: serverSettings.password });
                UnchainGUI.showRunningMenu();
                UnchainGUI.showSetPasswordMenu('Preferences');
            }
        }
    });
// });
}

function didSetPassword() {
    console.log('Did set password');
    UnchainGUI.hideSetPasswordMenu();
    UnchainServer.start({ pin: serverSettings.pin, password: serverSettings.password });
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

UnchainGUI.setUp(nw, appDidFinishLaunching, lockCallback, quitCallback);

