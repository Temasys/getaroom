define([], function() {

    var local = {
        env: 'local',
        Skyway: {
            server: '//sgbeta.signaling.temasys.com.sg:8018/',
            apiKey: '4fbc45b1-a458-4396-aeb6-579d58ffda1b'
        },
        API: {
            server: 'http://dev.api.getaroom.localhost:8001'
        }
    };

    var dev = {
        env: 'dev',
        Skyway: {
            server: '//sgbeta.signaling.temasys.com.sg:8018/',
            apiKey: '7bcba74c-ee42-4fb7-ba17-94a9edb3c1bf'
        },
        API: {
            server: 'http://dev.api.getaroom.io:8001'
        }
    };

    var prod = {
        env: 'prod',
        Skyway: {
            server: '//signaling.temasys.com.sg/',
            apiKey: '0cd2b351-3d95-4ece-88ea-44a114d5c9f5'
        },
        API: {
            server: 'http://api.getaroom.io'
        }
    };

    return location.host === 'getaroom.io' ? prod : (
            location.host === 'dev.getaroom.io' ? dev : local
        );

});
