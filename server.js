'use strict';
var http = require( 'http' ),

	// state switches can take time, so must keep track
	currentState = 'unlocked', awaitedState,
	maxTries = 20, tries = 0, retryDelay = 500;

var UnchainLock = require('./lockScripts');
var port = 31415;
var config;
var unlock;
var UnchainServer = {
    start: function(_config) {
        config = _config;
        if (config.pin && config.password) {
            http.createServer(onRequest).listen(port);
            console.log('Started server on port ' + port + ' with settings: ', config);
        } else {
            console.error('Could not start Unchain server because a parameter was missing');
        }
    }
}


function onRequest ( req, res ) {

	var eventName;

	if ( req.method === 'POST' ) {

		var body = '';

		req.on( 'data', function ( data ) {
			body += data;
			// kill large requests
			if ( body.length > 1e4 ) {
				req.connection.destroy();
			}
		});

		req.on( 'end', function () {
            try {
                var data = JSON.parse(body);

                if ( config.pin !== data.pin ) {
                    eventName = 'incorrect pin';
                    sendJSON( res, { err: eventName });

                } else if ( data.cmd === 'unlock' ) {

                    UnchainLock.isScreenlocked( function ( isLocked ) {
                        if ( isLocked ) {
                            awaitedState = 'unlocked';
                            currentState = undefined;
                            UnchainLock.unlock( config.password, res, unlockCallback );
                        } else {
                            currentState = 'unlocked';
                            sendJSON( res, { state: currentState });
                        }
                    });

                    eventName = 'unlocked';

                } else if ( data.cmd === 'lock' ) {

                    UnchainLock.isScreenlocked( function ( isLocked ) {
                        if ( !isLocked ) {
                            awaitedState = 'locked';
                            currentState = undefined;
                            UnchainLock.lock( res, sleepCallback );
                        } else {
                            currentState = 'locked';
                            sendJSON( res, { state: currentState });
                        }
                    });
                    eventName = 'locked';
                }
			    logRequest( eventName, req );
            }
            catch (err) {
                console.log('Error:', err);
                res.end();
            }
		});

	} else if ( req.url == '/state' ) {
		awaitAndSendState( res );
		eventName = 'State requested';
		logRequest( eventName, req );
    }
}

function awaitAndSendState ( res ) {
    UnchainLock.isScreenlocked( function ( isLocked ) {
        currentState = isLocked ? 'locked' : 'unlocked';
        sendJSON( res, { state: currentState });
    });
}

function unlockCallback ( res, err, rtn ) {
	var resp = {};

	if ( err ) {
		console.error( err );
		resp.err = err;
	} else {
		currentState = 'unlocked';
		resp.state = 'unlocked';
	}
	sendJSON( res, resp );
}

function sleepCallback ( res, err, rtn ) {
	var resp = {};

	if ( err ) {
		console.error( err );
		resp.err = err;
	} else {
		currentState = 'locked';
		resp.state = 'locked';
	}
	sendJSON( res, resp );
}

function sendJSON ( res, resp ) {
	res.writeHead( 200, { 'Content-Type': 'application/json' });
	res.write( JSON.stringify( resp ));
	res.end();
}

function logRequest ( eventName, req ) {
	var ip = req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress,
	logEntry = [ eventName, 'from', ip ].join( ' ' );

	log( logEntry );
}

function log ( logEntry ) {
	var now = new Date(),
		time = now.getFullYear() + '/' + ( now.getMonth() + 1 ) + '/' + now.getDate() + ' ' + now.toTimeString(),
		logEntry = [ time, logEntry ].join( ' ' );

	console.log( logEntry );
}

module.exports = UnchainServer;