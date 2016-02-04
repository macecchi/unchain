'use strict';
var nw = require('nw.gui');
var UnchainGUI = require('./gui');
var UnchainLock = require('./lockScripts');
var UnchainSecurity = require('./security.js');
var UnchainServer = require('./server.js');

var serverSettings;

function appDidFinishLaunching(menu) {
UnchainSecurity.resetPasswords(function(err) {
    UnchainSecurity.setUp(function(err, settings) {
        if (err) {
            console.error('Setup error', err);
            return;
        }

        console.log('Setup ok', settings);
        serverSettings = settings;
        
        if (!settings.password) {
            console.log('Password not set by user');
            UnchainGUI.showSetPasswordMenu('Configure');
            UnchainGUI.showPreferencesWindow();
            return;
        }

        UnchainServer.start({ pin: serverSettings.pin, password: serverSettings.password }, function(err) {
            if (err) {
                console.error(err.message);
                return;
            }
            
            didStartServer();
        });

    });
});
}

function didSetPassword() {
    UnchainSecurity.getPassword(function(err, pass) {
        if (err) {
            console.error('Could not fetch new password.', err.message);
            return;
        }
        
        console.log('Did set password');
        serverSettings.password = pass;
        
        UnchainServer.start({ pin: serverSettings.pin, password: serverSettings.password }, function(startError) {
            if (startError) {
                console.error(startError.message);
                return;
            }
            
            UnchainGUI.hideSetPasswordMenu();
            didStartServer();
        });
    });
}

function didStartServer() {
    console.log('did start server');
    UnchainGUI.showRunningMenu();
    UnchainGUI.showSetPasswordMenu('Preferences');
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

