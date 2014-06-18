define([], function() {

    var dev = {
        Skyway: {
            server: 'http://developer.temasys.com.sg/',
            apiKey: 'e8a4f194-ff4d-493d-b80c-5349728db008'
        },
        API: {
            server: 'http://dev.api.getaroom.io:8001'
        }
    }

    var prod = {
        Skyway: {
            server: 'http://developer.temasys.com.sg/',
            apiKey: '0cd2b351-3d95-4ece-88ea-44a114d5c9f5'
        },
        API: {
            server: 'http://api.getaroom.io'
        }
    }

    return '@@env' === 'prod' ? prod : dev;

});
