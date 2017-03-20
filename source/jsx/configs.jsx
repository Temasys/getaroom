define([], function() {

    /*
        You need to replace these API keys and hostnames with
        your own. Then run 'grunt dev' on the console to transpile
        this file into .js
    */

    var local = {
        env: 'local',
        Skylink: {
            apiMCUKey: '92898880-ab04-4f94-a82f-cabd7c0d120c',
            apiNoMCUKey: '691e9702-bdde-4611-889e-8c57eacbcfca'
        },
        maxUsers: 4
    };

    var dev = {
        env: 'dev',
        Skylink: {
            apiMCUKey: '92898880-ab04-4f94-a82f-cabd7c0d120c',
            apiNoMCUKey: '691e9702-bdde-4611-889e-8c57eacbcfca'
        },
        maxUsers: 4
    };

    var prod = {
        env: 'prod',
        Skylink: {
            apiMCUKey: '92898880-ab04-4f94-a82f-cabd7c0d120c',
            apiNoMCUKey: '691e9702-bdde-4611-889e-8c57eacbcfca'
        },
        maxUsers: 4
    };

    return location.host === 'getaroom.io' ? prod : (
            location.host === 'dev.getaroom.io' ? dev : local
        );

});
