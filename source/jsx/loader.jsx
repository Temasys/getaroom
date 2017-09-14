require.config({

  waitSeconds: 15,

  baseUrl: '/js',

  deps: ['main'],

  paths: {
    adapter: '//cdn.temasys.com.sg/adapterjs/0.15.x/adapter.screenshare',
    socketio: '//cdn.temasys.com.sg/libraries/socket.io-client/1.4.8/socket.io',
    skylink: '//cdn.temasys.com.sg/skylink/skylinkjs/0.6.x/skylink.debug',
    react: '//cdnjs.cloudflare.com/ajax/libs/react/0.10.0/react',
    router: 'libs/director',
    history: 'libs/history',
    marked: 'libs/marked',
    fastclick: '//cdnjs.cloudflare.com/ajax/libs/fastclick/0.6.11/fastclick.min',
    // facebook: '//connect.facebook.net/en_US/all',
    // twitter: '//platform.twitter.com/widgets'
    
  },

  shim: {

    skylink: {
      exports: 'Skylink',
      deps: ['socketio', 'adapter'],
      init: function(io) {
        window.io = io;
        return new this.Skylink();
      }
    },

    router: {
      exports: 'Router',
      deps: ['history'],
      init: function() {
        return new this.Router();
      }
    }

    // facebook: { exports: 'FB' },
    // twitter: { exports: 'TW' }
  }
});
