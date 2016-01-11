var Unchain = {
	server: localStorage.getItem('unchain_server'),
	port: 31415,
	pin: localStorage.getItem('unchain_pin'),
	configureUrl: "https://macecchi.github.io/unchain/",
    
    lock: function(callback) {
        Unchain.sendCommand("lock", callback);
    },
    
    unlock: function(callback) {
        Unchain.sendCommand("unlock", callback);
    },

    sendCommand: function(command, callback) {
        var url = 'http://' + Unchain.server + ':' + Unchain.port + '/';
        console.log("Sending POST to " + url);

        var data = { cmd: command, pin: Unchain.pin };

        var req = new XMLHttpRequest();
        req.timeout = 2000;
        req.onload = function() {
            if (req.readyState == 4 && req.status === 200) {
                try {
                    var responseObj = JSON.parse(req.responseText);
                    callback(responseObj.err, responseObj);
                } catch (error) {
                    callback('Could not decode JSON.' + error, null);
                }
            }
            else {
                callback("Request to " + url + " failed with status " + req.status + " Response: " + req.responseText, null);
            }
        };
        
        req.onerror = function(e) {
            callback(e, null);
        };
        
        req.open("POST", url, true);
        req.send(JSON.stringify(data));
    },

    getState: function(callback) {
        var url = 'http://' + Unchain.server + ':' + Unchain.port + '/state';
        console.log("Fetching status from " + url);

        var req = new XMLHttpRequest();
        req.timeout = 2000;
        req.onload = function() {
            if (req.readyState == 4 && req.status === 200) {
                try {
                    var responseObj = JSON.parse(req.responseText);
                    callback(responseObj.err, responseObj.state);
                } catch (error) {
                    callback('Could not decode JSON.', null);
                }
            }
            else {
                callback("Request to " + url + " failed with status " + req.status + " Response: " + req.responseText, null);
            }
        };
        
        req.onerror = function(e) {
            callback(e, null);
        };
        
        req.open("GET", url, true);
        req.send();
    }
}

module.exports = Unchain;