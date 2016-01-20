'use strict';
var applescript = require( 'applescript' );
var exec = require( 'child_process' ).exec;

module.exports = {
    lock: function ( res, callback ) {
        var lockScript = 'do shell script "./lockscreen"';

        applescript.execString( lockScript , function ( err, rtn ) {
            callback( res, err, rtn );
        });
    },

    isScreenlocked: function ( callback ) {
        // easier test for screen lock based on https://gist.github.com/OmgImAlexis/1519cc5fa1ac392fb2d1
        // more info on using CGSessionCopyCurrentDictionary http://stackoverflow.com/questions/11505255/osx-check-if-the-screen-is-locked
        // but this seems sufficient so far
        exec( 'python -c \'import sys,Quartz; d=Quartz.CGSessionCopyCurrentDictionary(); print d.get("CGSSessionScreenIsLocked")\'', function ( error, stdout, stderr ) {
            // response = True / None
            if ( error ) console.error( error );

            if ( stdout.trim() == 'True' ) callback( true );
            else callback( false );
        });
    },

    unlock: function ( pw, res, callback  ) {
        var unlockScript =
            'tell application "System Events"\n\
                if name of every process contains "ScreenSaverEngine" then \n\
                    tell application "ScreenSaverEngine"\n\
                        quit\n\
                    end tell\n\
                    delay 0.2\n\
                else \n\
                tell application "Terminal"\n\
                    do shell script "caffeinate -u -t 1"\n\
                    end tell\n\
                    delay 0.5\n\
                end if\n\
                tell application "System Events" to tell process "loginwindow"\n\
                    activate\n\
                    delay 0.2\n\
                    tell window "Login Panel"\n\
                        keystroke "password"\n\
                        keystroke return\n\
                    end tell\n\
                end tell\n\
            end tell';
        
        unlockScript = unlockScript.replace( 'password', pw );
        
        applescript.execString( unlockScript, function ( err, rtn ) {
            callback( res, err, rtn );
        });
    }
};