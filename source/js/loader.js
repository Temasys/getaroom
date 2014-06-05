require.config({

    waitSeconds: 15,

    baseUrl: '/js',

    deps: [
        'main'
    ],

    paths: {
        react: '//cdnjs.cloudflare.com' +
            '/ajax//ajax/libs/react/0.10.0/react.min',
        facebook: '//connect.facebook.net/en_US/all',
        twitter: '//platform.twitter.com/widgets',
        fastclick: '//cdnjs.cloudflare.com/' +
            'ajax/libs/fastclick/0.6.11/fastclick.min'
    },

    shim: {
        facebook: {
            exports: 'FB'
        },
        twitter: {
            exports: 'TW'
        }
    }

});
