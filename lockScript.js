var applescript = require( 'applescript' );

var script = 'do shell script "./lockscreen"';

function lock ( res, callback ) {
	applescript.execString( script , function ( err, rtn ) {
		callback( res, err, rtn );
	});

}

module.exports = lock;