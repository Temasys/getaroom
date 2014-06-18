define([], function() {
    var dev = {
        Skyway: {
            apiKey: 'a5aff4a5-78e4-4964-a589-54c99b963f53',
            server: 'http://developer.temasys.com.sg'
        }
        API: {
            server: 'http://api.dev.getaroom.io:8001'
        }
    };

    var prod = {
        Skyway: {
            apiKey: 'a5aff4a5-78e4-4964-a589-54c99b963f53',
            server: 'http://developer.temasys.com.sg'
        }
        API: {
            server: 'http://api.getaroom.io'
        }
    };

    return '@@env' === 'prod' ? prod : dev;
});
