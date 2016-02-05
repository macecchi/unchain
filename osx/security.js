var keychain = require('keychain');

var passwordSet = false;

var UnchainSecurity = {
    serviceName: 'Unchain',
    
    setUp: function(callback) {
        UnchainSecurity.getPin(function(err, pin) {
            if (err) {
                UnchainSecurity.setRandomPin(function(err, pin) {
                    if (err) callback(err, null);
                    else {
                        UnchainSecurity.getPassword(function(err, pass) {
                            if (!err && pass) passwordSet = true;
                            callback(null, { pin: pin, passwordSet: passwordSet, password: pass });
                        });
                    }
                });
            } else {
                UnchainSecurity.getPassword(function(err, pass) {
                    if (!err && pass) passwordSet = true;
                    callback(null, { pin: pin, passwordSet: passwordSet, password: pass });
                });
            }
        });
    },
    
    resetPasswords: function(callback) {
        keychain.deletePassword({ account: 'authpin', service: this.serviceName }, function(err) {
            keychain.deletePassword({ account: 'authpassword', service: UnchainSecurity.serviceName }, function(err) {
                callback();
            });
        });
    },
    
    getPin: function(callback) {
        keychain.getPassword({ account: 'authpin', service: this.serviceName }, callback);
    },
    
    setRandomPin: function(callback) {
        var random = '0000' + Math.floor((Math.random() * 10000));
        var pin = random.substr(random.length-4);
        keychain.setPassword({ account: 'authpin', service: this.serviceName, password: pin }, function(err) {
            callback(err, pin);
        });
    },
    
    getPassword: function(callback) {
        keychain.getPassword({ account: 'authpassword', service: this.serviceName }, callback);
    },
    
    setPassword: function(password, callback) {
        keychain.setPassword({ account: 'authpassword', service: this.serviceName, password: password }, callback);
    }
};

module.exports = UnchainSecurity;