(function () {
    module.exports = function (grunt) {
        require('load-grunt-tasks')(grunt); 
        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            jshint: {
                options: {
                    esnext: true
                },
                all: ['src/**/*.js', 'spec/**/*.js']
            },
            watch: {
                options: {
                    spawn: false
                },
                scripts: {
                    files: ['src/**/*.js', 'src/**/*.scss'],
                    tasks: ['jshint', 'browserify', 'sass']
                }
            },
            bower: {
                tests: {
                    rjsConfig: 'spec/test-main.js',
                    options: {
                        baseUrl: './'
                    }
                }
            },
            bowerVerify: {
                test: {
                    tasks: ['bower', 'karma:once']
                }
            },
            karma: {
                options: {
                    configFile: 'karma.conf.js'
                },
                once: {
                    singleRun: true,
                },
                server: {
                    background: true,
                },
            },
            babel: {
                options: {
                    sourceMap: true,
                    presets: ['es2015']
                },
                dist: {
                    files: {
                        'dist/cmdr.js': 'src/cmdr.js'
                    }
                }
            },
            browserify: {
                dist: {
                    options: {
                        transform: [["babelify", {
                            presets: ['es2015']
                        }]],
                        browserifyOptions: {
                            standalone: 'cmdr',
                            debug: true
                        },
                        plugin: [
                            //["browserify-header"]
                        ]
                    },
                    files: {
                        "dist/cmdr.js": "src/cmdr.js"
                    }
                }
            },
            sass: {
                options: {
                    sourceMap: true
                },
                dist: {
                    files: {
                        'dist/cmdr.css': 'src/cmdr.scss'
                    }
                }
            },
            uglify: {
                options: {
                    preserveComments: 'some'
                },
                dist: {
                    files: {
                        'dist/cmdr.min.js': ['dist/cmdr.js']
                    }
                }
            },
            cssmin: {
                dist: {
                    files: {
                        'dist/cmdr.min.css': ['dist/cmdr.css']
                    }
                }
            }
        });

        //development
        grunt.registerTask('dev', ['jshint', 'browserify', 'sass', 'watch:scripts']);

        //test
        grunt.registerTask('test', ['jshint', 'karma:once']);
        grunt.registerTask('test:full', ['jshint', 'bowerVerify']);
    
        //build
        grunt.registerTask('build', ['browserify', 'sass', 'uglify', 'cssmin']);
    };
})();
