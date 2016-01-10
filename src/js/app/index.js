/* global Pebble; */
var Unchain = require('./unchain');

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

		Unchain.getState();
	}
});


