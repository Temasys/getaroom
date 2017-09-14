module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-replace');

    var pushState = require('grunt-connect-pushstate/lib/utils').pushState;

    grunt.initConfig({

        base: grunt.config('base') || grunt.option('base') || process.cwd(),

        source: 'source',

        staging: 'staging',

        production: 'publish',

        clean: {
            staging: ['<%= staging %>/'],
            production: ['<%= production %>/']
        },

        copy: {
            staging: {
                files: [{
                    expand: true,
                    cwd: '<%= source %>/',
                    dest: '<%= staging %>/',
                    src: [
                        '**/*',
                    ]
                }]
            },
            production: {
                files: [{
                    expand: true,
                    cwd: '<%= staging %>/',
                    dest: '<%= production %>/',
                    src: [
                        '**/*'
                    ]
                }]
            }
        },

        stylus: {
            dev: {
                options: {
                    compress: true
                },
                files: {
                    '<%= source %>/styles/app.css':
                        '<%= source %>/styles/app.styl'
                }
            },
            staging: {
                options: {
                    compress: true
                },
                files: {
                    '<%= staging %>/styles/app.css':
                        '<%= staging %>/styles/app.styl'
                }
            }
        },

        cssmin: {
            options: {
                report: 'min'
            },
            compress: {
                src: ['<%= staging %>/styles/app.css'],
                dest: '<%= staging %>/styles/app.css'
            }
        },
        react: {
            staging: {
              files: [
                {
                  expand: true,
                  cwd: '<%= staging %>/jsx',
                  src: ['**/*.jsx'],
                  dest: '<%= staging %>/js',
                  ext: '.js'
                }
              ]
              /*files: {
                '<%= staging %>/js/combined.js': [
                  '<%= staging %>/jsx/**.jsx'
                ]
              }*/
            },
            dev: {
              files: [
                {
                  expand: true,
                  cwd: '<%= source %>/jsx',
                  src: ['**/*.jsx'],
                  dest: '<%= source %>/js',
                  ext: '.js'
                }
              ]
            }
        },

        htmlmin: {
            options: {
                removeComments: true,
                removeCommentsFromCDATA: true,
                removeCDATASectionsFromCDATA: true,
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: false,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true,
                removeEmptyElements: false,
                keepClosingSlash: true,
                caseSensitive: true,
                lint: false
            },
            staging: {
                files: [{
                    expand: true,
                    src: [
                        '<%= staging %>/index.html'
                    ]
                }]
            }
        },

        imagemin: {
            images: {
                options: {
                    optimizationLevel: 7,       // Max compression. 240 trials
                    progressive: true
                },
                files: [{
                    expand: true,
                    src: ['<%= staging %>/img/**/*.{jpg,jpeg,png}'],
                    dest: ''
                }]
            }
        },

        filerev: {
            js: {
                files: [{
                    src: [
                        '<%= staging %>/js/{fallback,loader}.js'
                    ]
                }]
            },
            css: {
                files: [{
                    src: [
                        '<%= staging %>/styles/app.css'
                    ]
                }]
            },
            assets: {
                files: [{
                    src: [
                        '<%= staging %>/img/**/*.{jpg,jpeg,gif,png,webp,svg}',
                        '<%= staging %>/fonts/**/*.{eot,svg,ttf,woff}'
                    ]
                }]
            }
        },

        usemin: {
            options: {
                assetsDirs: ['<%= staging %>']
            },
            css: {
                options: {
                    assetsDirs: ['<%= staging %>', '<%= staging %>/styles']
                },
                files: [{
                    src: ['<%= staging %>/styles/app.css']
                }]
            },
            html: ['<%= staging %>/index.html']
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: '<%= staging %>/js',
                    mainConfigFile: '<%= staging %>/js/loader.js',
                    out: '<%= staging %>/js/loader.js',
                    name: 'loader',
                    optimize: 'uglify',
                    // generateSourceMaps: true,
                    preserveLicenseComments: false
                }
            }
        },

        connect: {
            options: {
                middleware: function(connect, options, middlewares) {
                    return [pushState()].concat(middlewares);
                }
            },
            dev: {
                options: {
                    base: '<%= source %>/',
                    port: 8085,
                    open: 'https://localhost:8085',
                    protocol: 'https',
                    //key: grunt.file.read('server.key').toString(),
                    //cert: grunt.file.read('server.crt').toString(),
                    //ca: grunt.file.read('ca.crt').toString()
                }
            },
            production: {
                options: {
                    base: '<%= production %>/',
                    port: 8080,
                    open: 'https://localhost:8080',
                    protocol: 'https',
                    key: grunt.file.read('server.key').toString(),
                    cert: grunt.file.read('server.crt').toString(),
                    ca: grunt.file.read('ca.crt').toString()
                }
            }
        },

        watch: {
            styl: {
                files: [
                    '<%= source %>/styles/**/**/**.styl'
                ],
                tasks: 'stylus:dev',
                options: {
                    debounceDelay: 1000,
                    interrupt: true
                }
            },
            react: {
                files: [
                    '<%= source %>/jsx/**/*.jsx'
                ],
                tasks: 'react:dev',
                options: {
                    debounceDelay: 1000,
                    interrupt: true
                }
            }
        },

        replace: {
            dist: {
                options: {
                    variables: {
                        'rev': '<%= grunt.config.get("meta.rev") %>',
                        'date': '<%= grunt.config.get("meta.date") %>',
                        'tag': '<%= grunt.config.get("meta.tag") %>'
                    },
                    prefix: '@@'
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: [
                        '<%= staging %>/index.html',
                        '<%= staging %>/version.txt',
                        '<%= staging %>/jsx/configs.jsx'
                    ],
                    dest: '<%= staging %>/'
                }]
            }
        }

    });

    grunt.registerTask('versionise',
        'Adds version meta intormation to index.html', function () {
        var done = this.async(),
            arr = [];

        grunt.util.spawn({
            cmd : 'git',
            args : ['log', '-1', '--pretty=format:%h\n %ci']
        }, function (err, result) {
            if (err) {
                return done(false);
            }
            arr = result.toString().split('\n ');
            grunt.config('meta.rev', arr[0]);
            grunt.config('meta.date', arr[1]);
        });

        grunt.util.spawn({
            cmd : 'git',
            args : [
                'for-each-ref',
                '--sort=*authordate',
                '--format="%(tag)"',
                'refs/tags'
            ]
        }, function (err, result) {
            if (err) {
                return done(false);
            }
            arr = result.toString().split('\n');

            var tag = arr[arr.length - 1];
            tag = tag.toString();
            grunt.config('meta.tag', tag);

            done(result);
        });



    });

    grunt.registerTask('stage', [
        'clean:staging',
        'copy:staging',
        'replace:dist',
        'react:staging',
        'imagemin',
        'filerev:assets',
        'usemin:html',
        'stylus:staging',
        'cssmin',
        'usemin:css',
        'filerev:css',
        'htmlmin:staging',
        'requirejs',
        'filerev:js',
        'versionise',
        'usemin:html'
    ]);

    grunt.registerTask('publish', [
        'clean:production',
        'copy:production'
        //'connect:production:keepalive'
    ]);

    grunt.registerTask('dev', [
        'stylus:dev',
        'react:dev',
        'connect:dev',
        'watch'
    ]);

    grunt.registerTask('default', ['dev']);

};
