define([], function() {
  /*
    You need to replace these API keys and hostnames with
    your own. Then run 'grunt dev' on the console to transpile
    this file into .js
  */

  // localhost
  var local = {
    env: 'local',
    Skylink: {
      apiMCUKey: '7bcba74c-ee42-4fb7-ba17-94a9edb3c1bf',
      apiNoMCUKey: '7e31b061-71e6-4dd7-bd55-516579973930'
    }
  };

  // dev.getaroom.io
  var dev = {
    env: 'dev',
    Skylink: {
      apiMCUKey: '92898880-ab04-4f94-a82f-cabd7c0d120c',
      apiNoMCUKey: '691e9702-bdde-4611-889e-8c57eacbcfca'
    },
  };

  // getaroom.io
  var prod = {
    env: 'prod',
    Skylink: {
      apiMCUKey: '92898880-ab04-4f94-a82f-cabd7c0d120c',
      apiNoMCUKey: '691e9702-bdde-4611-889e-8c57eacbcfca'
    },
  };

  return location.host === 'getaroom.io' ? prod : (location.host === 'dev.getaroom.io' ? dev : local);
});
