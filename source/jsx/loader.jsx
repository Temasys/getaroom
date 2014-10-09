require.config({

    waitSeconds: 15,

    baseUrl: '/js',

    deps: [
        'main'
    ],

    paths: {
        socketio: '//cdn.temasys.com.sg/libraries/'
            + 'socket.io-client/1.0.6/socket.io',
        adapter: 'libs/adapter',
        //adapter: '//cdn.temasys.com.sg/adapterjs/0.9.1/' +
        //    'adapter.min',
        skyway: 'libs/skyway',
        //skyway: '//cdn.temasys.com.sg/skyway/skywayjs/' +
        //    '0.5.x/skyway.debug',
        // facebook: '//connect.facebook.net/en_US/all',
        // twitter: '//platform.twitter.com/widgets',
        fastclick: '//cdnjs.cloudflare.com/' +
            'ajax/libs/fastclick/0.6.11/fastclick.min',
        router: 'libs/director',
        react: '//cdnjs.cloudflare.com/' +
            'ajax/libs/react/0.10.0/react.min'
    },

    shim: {
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
