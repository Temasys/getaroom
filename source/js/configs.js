define([], function() {

    var dev = {
        Skyway: {
            server: 'http://developer.temasys.com.sg/',
            apiKey: '7bcba74c-ee42-4fb7-ba17-94a9edb3c1bf'
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
