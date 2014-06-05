require.config({

    waitSeconds: 15,

    baseUrl: '/js',

    deps: [
        'main'
    ],

    paths: {
        react: '//cdnjs.cloudflare.com/' +
            'ajax/libs/react/0.10.0/react.min',
        skyway: '/js/libs/skyway',
        facebook: '//connect.facebook.net/en_US/all',
        twitter: '//platform.twitter.com/widgets',
        fastclick: '//cdnjs.cloudflare.com/' +
            'ajax/libs/fastclick/0.6.11/fastclick.min'
    },

    shim: {
        skyway: {
            exports: 'Skyway'
        },
        facebook: {
            exports: 'FB'
        },
        twitter: {
            exports: 'TW'
        },

    }

});
