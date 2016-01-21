'use strict';
var gui = require('nw.gui');
var UnchainLock = require('./lockScripts');
var packageInfo = require('./package.json');

var tray = new gui.Tray({
    icon: 'resources/images/bar_icon.png'
});

var menu = new gui.Menu();
tray.menu = menu;

require('dns').lookup(require('os').hostname(), function (err, ip, fam) {
    menu.insert(new gui.MenuItem({
        label: 'Running on ' + ip,
        enabled: false
    }), 0);
});

menu.append(new gui.MenuItem({
    label: 'Lock Screen',
    click: function() {
        UnchainLock.lock();
    }
}));

menu.append(new gui.MenuItem({
    type: 'separator'
}));

menu.append(new gui.MenuItem({
    label: 'Unchain for OS X v' + packageInfo.version,
	enabled: false
}));


menu.append(new gui.MenuItem({
    label: 'Quit',
    click: function() { 
    	console.log('Clicked exit menu');
        // server.close();
		gui.App.quit();
    }
}));