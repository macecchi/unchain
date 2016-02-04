'use strict';
var packageInfo = require('./package.json');

var nw, window, tray, menu;
var runningMenu, setPasswordMenu;

module.exports = {
    setUp: function(_nw, didLoadCallback, lockCallback, quitCallback) {
        nw = _nw;
        window = nw.Window.get();
        
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
        
        didLoadCallback();
    },

    showRunningMenu: function() {
        require('dns').lookup(require('os').hostname(), function(err, ip, fam) {
            runningMenu = new nw.MenuItem({
                label: 'Running on ' + ip,
                enabled: false
            });
            menu.insert(runningMenu, 0);
        });
    },
    
    hideRunningMenu: function() {
        menu.remove(runningMenu);
    },
    
    showSetPasswordMenu: function(label) {
        setPasswordMenu = new nw.MenuItem({
            label: label,
            click: this.showPreferencesWindow
        });
        menu.insert(setPasswordMenu, 0);
    },
    
    hideSetPasswordMenu: function() {
        menu.remove(setPasswordMenu);
    },
    
    showPreferencesWindow: function() {
        window.show();
        window.focus();
    }
};
