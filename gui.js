'use strict';
var packageInfo = require('./package.json');

var nw, tray, menu;

module.exports = {
    setUp: function (_nw, didLoadCallback, lockCallback, quitCallback) {
        nw = _nw;
        
        tray = new nw.Tray({
            icon: 'resources/images/bar_icon.png'
        });

        menu = new nw.Menu();
        tray.menu = menu;

        menu.append(new nw.MenuItem({
            label: 'Lock Screen',
            click: lockCallback
        }));

        menu.append(new nw.MenuItem({
            type: 'separator'
        }));

        menu.append(new nw.MenuItem({
            label: 'Unchain for OS X v' + packageInfo.version,
            enabled: false
        }));

        menu.append(new nw.MenuItem({
            label: 'Quit',
            click: quitCallback
        }));
        
        didLoadCallback(menu);
    },

    showRunningMenu: function () {
        require('dns').lookup(require('os').hostname(), function (err, ip, fam) {
            menu.insert(new nw.MenuItem({
                label: 'Running on ' + ip,
                enabled: false
            }), 0);
        });
    },
    
    showSetPasswordMenu: function(didSetPasswordCallback) {
        menu.insert(new nw.MenuItem({
            label: 'Set your password',
            click: function() {
                if (didSetPasswordCallback) didSetPasswordCallback();
            }
        }), 0);
    }
};