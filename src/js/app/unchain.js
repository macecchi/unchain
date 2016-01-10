/* global Pebble; */
var Unchain = {
	server: localStorage.getItem("server"),
	port: 31415,
	pin: "1234",
	configureUrl: "https://macecchi.github.io/pebble-itunesify-remote/index.html",
    
    doCommand: function(action) {
        if (action === "unlock") {
            Unchain.sendCommand("unlock");
        }
        else if (action === "lock") {
            Unchain.sendCommand("lock");
        }
    },

    sendCommand: function(command) {
        var url = 'http://' + Unchain.server + ':' + Unchain.port + '/';
        console.log("Sending POST to " + url);

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
            Pebble.showSimpleNotificationOnPebble("Unchain", "Unable to send command. Check the connection and configuration.");
            console.log('Request error');
        };
        
        req.open("POST", url, true);
        req.send(JSON.stringify(data));
    },

    getState: function() {
        var url = 'http://' + Unchain.server + ':' + Unchain.port + '/state';
        console.log("Fetching status from " + url);

        var req = new XMLHttpRequest();
        req.timeout = 2000;
        req.onload = function() {
            if (req.readyState == 4 && req.status === 200) {
                console.log("Response OK for current state");
                
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
                        if (responseObj.state) {
                            pebbleMsg.state = responseObj.state;
                        }
                    }
                
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
        
        req.open("GET", url, true);
        req.send();
    }
}

module.exports = Unchain;