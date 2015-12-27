/*jshint node:true, es3:false*/
(function () {
    'use strict';
    module.exports = function (grunt) {
        require('load-grunt-tasks')(grunt); // Load grunt tasks automatically
        // Project configuration.
        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            jshint: {
                options: {
                    esnext: true
                },
                all: ['Gruntfile.js', 'src/**/*.js', 'spec/**/*.js']
            },
            watch: {
                options: {
                    spawn: false
                },
                //watches all scripts an rerun hinting and the tests immediately
                scripts: {
                    files: ['<%= jshint.all %>'],
                    tasks: ['jshint', 'karma:server:run']
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
                //for a single run of test
                once: {
                    singleRun: true,
                },
                //for use while developing and in combination with watch task
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
            copy: {
                dist: {
                    files: [
                        { expand: true, cwd: 'src/', src: ['cmdr.css'], dest: 'dist/' }
                    ]
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
        grunt.registerTask('dev', ['jshint', 'karma:server', 'watch:scripts']);

        //test
        grunt.registerTask('test', ['jshint', 'karma:once']);
        grunt.registerTask('test:full', ['jshint', 'bowerVerify']);
    
        //build
        grunt.registerTask('build', ['browserify', 'sass', 'copy', 'uglify', 'cssmin']);
    };
})();
