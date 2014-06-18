require.config({

    waitSeconds: 15,

    baseUrl: '/js',

    deps: [
        'main'
    ],

    paths: {
        socketio: '/js/libs/socket.io-client.min',
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
            init: function() {
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
