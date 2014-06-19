require.config({

    waitSeconds: 15,

    baseUrl: '/js',

    deps: [
        'main'
    ],

    paths: {
        socketio: 'http://signaling.temasys.com.sg:6001/'
            + 'socket.io/socket.io',
        router: '/js/libs/director',
        react: '//cdnjs.cloudflare.com/' +
            'ajax/libs/react/0.10.0/react.min',
        skyway: '/js/libs/skyway',
        facebook: '//connect.facebook.net/en_US/all',
        twitter: '//platform.twitter.com/widgets',
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
                'socketio'
            ],
            init: function(io) {
                window.io = io;
                return new this.Skyway();
            }
        },
        facebook: {
            exports: 'FB'
        },
        twitter: {
            exports: 'TW'
        },

    }

});
