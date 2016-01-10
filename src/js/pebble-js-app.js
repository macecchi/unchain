/* global Pebble; */
var Unchain = {
	server: localStorage.getItem("server"),
	port: 31415,
	pin: "1234",
	configureUrl: "https://macecchi.github.io/pebble-itunesify-remote/index.html"
}

Unchain.doCommand = function(action) {
	if (action == "unlock") {
		Unchain.sendCommand("unlock", "POST");
	}
};

Unchain.sendCommand = function(command, method) {
	if (!method) method = "GET";
	var url = 'http://' + Unchain.server + ':' + Unchain.port + '/';
	console.log("Sending " + method + " to " + url);

	var data = { cmd: command, pin: Unchain.pin };

	var req = new XMLHttpRequest();
	req.timeout = 2000;
	
	req.onload = function() {
		if (req.readyState == 4 && req.status === 200) {
			console.log("Response OK for command: " + command);
			
			try {
				var responseObj = JSON.parse(req.responseText);
				var pebbleMsg = {};
				
				if (responseObj.err) {
					var err = responseObj.err;
					console.log('Error: ' + err);
					pebbleMsg.status = "err";
				}
				else {
					pebbleMsg.status = "ok";
				}
			
				// if (responseObj.track) {
				// 	console.log('Found track info');
				// 	pebbleMsg.trackName = responseObj.track.name;
				// 	pebbleMsg.trackArtist = responseObj.track.artist;
					
				// 	// Request track info again after a while
				// 	setTimeout(function() {
				// 		Unchain.sendCommand('');
				// 	}, 30000);
				// }
			
				Pebble.sendAppMessage(pebbleMsg);
			} catch (error) {
				console.log('Could not decode JSON');
			}
		}
		else {
			console.log("Request to " + url + " failed with status " + req.status + " Response: " + req.responseText);
			
			if (req.status == 404) {
				Pebble.showSimpleNotificationOnPebble("Unchain Error", "You are running an outdated version of the Mac app. Please update it on bit.ly/itunesify-update.");	
			}
		}
	};
	
	req.onerror = function(e) {
		Pebble.showSimpleNotificationOnPebble("Unchain", "Unable to connect. Check the connection and configuration.");
		console.log('Request error');
	};
	
	req.open(method, url, true);
	req.send(JSON.stringify(data));
};

Pebble.addEventListener("ready", function(e) {
	console.log("Unchain JS is ready.");

	if (localStorage.getItem("server") === null || Unchain.server == '') {
		Pebble.showSimpleNotificationOnPebble("Almost there!", "Please configure Unchain on the Pebble app.");	
	}
	else {
		Unchain.sendCommand('');
	}
});

Pebble.addEventListener("appmessage", function(e) {
	console.log("Received message: " + JSON.stringify(e.payload));
	if (e.payload.action) {
		Unchain.doCommand(e.payload.action);
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
	}
});
