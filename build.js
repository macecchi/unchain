var NwBuilder = require('nw-builder');
var nw = new NwBuilder({
    files: './**/**',
    cacheDir: './build/cache',
    platforms: ['osx64'],
    version: '0.12.3',
    appName: 'Unchain',
    buildType: 'versioned'
});

// Log stuff you want

nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {
   console.log('All done!');
}).catch(function (error) {
    console.error(error);
});