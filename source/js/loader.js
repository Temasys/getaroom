require.config({

    waitSeconds: 15,

    baseUrl: '/js',

    deps: [
        'main'
    ],

    paths: {
        socketio: '//cdn.temasys.com.sg/libraries/'
            + 'socket.io-client/1.0.6/socket.io',
        router: 'libs/director',
        react: '//cdnjs.cloudflare.com/' +
            'ajax/libs/react/0.10.0/react.min',
        adapter: '//cdn.temasys.com.sg/adapterjs/' +
            'latest/adapter.min',
        skyway: '//cdn.temasys.com.sg/skyway/' +
            'skywayjs/0.3.0/skyway.debug',
        // skyway: '//cdn.temasys.com.sg/skyway/skywayjs/' +
        //     'latest/skyway.min',
        // facebook: '//connect.facebook.net/en_US/all',
        // twitter: '//platform.twitter.com/widgets',
        fastclick: '//cdnjs.cloudflare.com/' +
            'ajax/libs/fastclick/0.6.11/fastclick.min'
    },

    shim: {
        router: {
            exports: 'Router',
            init: function() {
                return new this.Router();
            }
        },
        skyway: {
            exports: 'Skyway',
            deps: [
                'socketio',
                'adapter'
            ],
            init: function(io) {
                window.io = io;
                return new this.Skyway();
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
