require.config({

    waitSeconds: 15,

    baseUrl: '/js',

    deps: [
        'main'
    ],

    paths: {
        socketio: '//cdn.temasys.com.sg/libraries/'
            + 'socket.io-client/1.0.6/socket.io',
        //adapter: 'libs/adapter',
        adapter: '//cdn.temasys.com.sg/adapterjs/0.10.x/' +
            'adapter.min',
        //skylink: 'libs/skylink',
        skylink: '//cdn.temasys.com.sg/skylink/skylinkjs/0.5.x/' +
            'skylink.min',
        // facebook: '//connect.facebook.net/en_US/all',
        // twitter: '//platform.twitter.com/widgets',
        fastclick: '//cdnjs.cloudflare.com/' +
            'ajax/libs/fastclick/0.6.11/fastclick.min',
        router: 'libs/director',
        react: '//cdnjs.cloudflare.com/' +
            'ajax/libs/react/0.10.0/react.min'
    },

    shim: {
        skylink: {
            exports: 'Skylink',
            deps: [
                'socketio',
                'adapter'
            ],
            init: function(io) {
                window.io = io;
                return new this.Skylink();
            }
        },
        router: {
            exports: 'Router',
            init: function() {
                return new this.Router();
            }
        },
        // facebook: {
        //     exports: 'FB'
        // },
        // twitter: {
        //     exports: 'TW'
        // }
    }

});
