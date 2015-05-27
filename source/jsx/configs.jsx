define([], function() {

    /*
        You need to replace these API keys and hostnames with
        your own. Then run 'grunt dev' on the console to transpile
        this file into .js
    */

    var local = {
        env: 'local',
        Skylink: {
            apiKey: '4fbc45b1-a458-4396-aeb6-579d58ffda1b'
        },
        maxUsers: 4
    };

    var dev = {
        env: 'dev',
        Skylink: {
            //apiKey: '7bcba74c-ee42-4fb7-ba17-94a9edb3c1bf'
            apiKey: '7e31b061-71e6-4dd7-bd55-516579973930'
        },
        maxUsers: 4
    };

    var prod = {
        env: 'prod',
        Skylink: {
            apiKey: '7e31b061-71e6-4dd7-bd55-516579973930'
        },
        maxUsers: 4
    };

    return location.host === 'getaroom.io' ? prod : (
            location.host === 'dev.getaroom.io' ? dev : local
        );

});
