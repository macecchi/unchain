/* global Pebble; */
var Unchain = require('./unchain');

function init() {
    if (localStorage.getItem("server") === null || Unchain.server == '') {
		Pebble.showSimpleNotificationOnPebble("Almost there!", "Please configure Unchain on the Pebble app.");	
	} else {
		updateState();
	}
}

function updateState() {
    Unchain.getState(function(err, state) {
        if (!err) {
            var pebbleMsg = { state: state };
            Pebble.sendAppMessage(pebbleMsg);
        }
        else {
            console.log('Command error: ' + err);
            Pebble.showSimpleNotificationOnPebble("Unchain Error", "Could not connect to your Mac.");
        }
    });
}

function parseCommand(command) {
    if (command === "unlock") {
        Unchain.unlock(function(err, response) {
            if (!err) {
                var pebbleMsg = { status: "ok" };
                if (response.status === "unlocked") pebbleMsg.state = "unlocked";
                Pebble.sendAppMessage(pebbleMsg);
            }
            else {
                console.log('Command error: ' + err);
                Pebble.showSimpleNotificationOnPebble("Unchain", "Unable to unlock. Check the connection and configuration.");
            }
        });
    }
    else if (command === "lock") {
        Unchain.lock(function(err, response) {
            if (!err) {
                var pebbleMsg = { status: "ok" };
                if (response.status === "screensaver activated") pebbleMsg.state = "locked";
                Pebble.sendAppMessage(pebbleMsg);
            }
            else {
                console.log('Command error: ' + err);
                Pebble.showSimpleNotificationOnPebble("Unchain", "Unable to lock. Check the connection and configuration.");
            }
        });
    }
    else {
        console.log('Unknown command received (' + command + ').');
    }
}

Pebble.addEventListener("appmessage", function(e) {
	console.log("Received message: " + JSON.stringify(e.payload));
    
	if (e.payload.action) {
        var command = e.payload.action;
		parseCommand(command);
	}
});

Pebble.addEventListener("showConfiguration", function(e) {
	Pebble.openURL(Unchain.configureUrl);
});

Pebble.addEventListener("webviewclosed", function(e) {
	if (e.response) {
		var configuration = JSON.parse(decodeURIComponent(e.response));
		console.log("Configuration window returned: " + JSON.stringify(configuration));

		console.log("Unchain Server: " + configuration.server);
		localStorage.setItem("server", configuration.server);

		Unchain.server = configuration.server;

		updateState();
	}
});

init();

