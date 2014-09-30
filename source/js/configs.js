define([], function() {

    /*
        You need to replace these API keys and hostnames with
        your own. Then run 'grunt dev' on the console to transpile
        this file into .js
    */

    var local = {
        env: 'local',
        Skyway: {
            apiKey: '4fbc45b1-a458-4396-aeb6-579d58ffda1b'
        },
        maxUsers: 16
    };

    var dev = {
        env: 'dev',
        Skyway: {
            apiKey: '7bcba74c-ee42-4fb7-ba17-94a9edb3c1bf',
            roomServer: 'http://sgbeta.signaling.temasys.com.sg:8018/'
        },
        maxUsers: 16
    };

    var prod = {
        env: 'prod',
        Skyway: {
            apiKey: '7e31b061-71e6-4dd7-bd55-516579973930'
        },
        maxUsers: 16
    };

    return location.host === 'getaroom.io' ? prod : (
            location.host === 'dev.getaroom.io' ? dev : local
        );

});
