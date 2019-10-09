const sass = require('node-sass');

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
        version: {
            default: {
                src: ['package.json', 'src/cmdr.js']
            }
        },
        browserify: {
            dev: {
                options: {
                    transform: [["babelify", {
                        presets: ['@babel/preset-env']
                    }]],
                    browserifyOptions: {
                        standalone: 'cmdr',
                        debug: true
                    }
                },
                files: {
                    "dev/cmdr.js": "src/cmdr.js"
                }
            },
            dist: {
                options: {
                    transform: [["babelify", {
                        presets: ['@babel/preset-env']
                    }]],
                    browserifyOptions: {
                        standalone: 'cmdr'
                    }
                },
                files: {
                    "dist/cmdr.js": "src/cmdr.js"
                }
            }
        },
        sass: {
            options: {
                implementation: sass
            },
            dev: {
                files: {
                    'dev/cmdr.css': 'src/cmdr.scss'
                }
            },
            dist: {
                files: {
                    'dist/cmdr.css': 'src/cmdr.scss'
                }
            }
        },
        uglify: {
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
        },
        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    banner: '/* <%= pkg.name %> | version <%= pkg.version %> | license <%= pkg.license %> | (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %> | <%= pkg.homepage %> */'
                },
                files: {
                    src: 'dist/*.*'
                }
            }
        },
        connect: {
            dev: {
                options: {
                    base: 'dev'
                }
            }
        },
        watch: {
            options: {
                spawn: false
            },
            dev: {
                files: ['src/**/*.*'],
                tasks: ['jshint', 'browserify:dev', 'sass:dev']
            }
        },
        readpkg: {
            default: {}
        }
    });

    //utils
    grunt.registerTask('readpkg', function () {
        grunt.config.set('pkg', grunt.file.readJSON('package.json'));
    });

    //development
    grunt.registerTask('dev', ['jshint', 'browserify:dev', 'sass:dev', 'connect:dev', 'watch:dev']);

    //test
    grunt.registerTask('test', ['jshint', 'karma:once']);
    grunt.registerTask('test:full', ['jshint']);

    //build
    grunt.registerTask('build', ['browserify:dist', 'sass:dist', 'uglify:dist', 'cssmin:dist', 'usebanner:dist']);

    //For releasing
    grunt.registerTask('release', ['release:patch']);
    grunt.registerTask('release:major', ['version::major', 'readpkg', 'build']);
    grunt.registerTask('release:minor', ['version::minor', 'readpkg', 'build']);
    grunt.registerTask('release:patch', ['version::patch', 'readpkg', 'build']);

};