/* global Pebble; */
var safe = require("safe");

Pebble.addEventListener("ready", function(e) {
	console.log("Unchain JS is ready.");

	require("./app");
});
