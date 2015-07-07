/*jshint node:true, es3:false*/
(function() {
  'use strict';
  module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt); // Load grunt tasks automatically
    // Project configuration.
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      jshint: {
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
      copy: {
        dist: {
          files: [
            { expand: true, cwd: 'src/', src: ['cmdr.js'], dest: 'dist/' },
            { expand: true, cwd: 'src/', src: ['cmdr.css'], dest: 'dist/' }
          ]
        },
        pages: {
          expand: true,
          cwd: 'src/',
          src: '*',          
          dest: 'pages/'          
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
      }
    });

    //development
    grunt.registerTask('dev', ['jshint', 'karma:server', 'watch:scripts']);

    //test
    grunt.registerTask('test', ['jshint', 'karma:once']);
    grunt.registerTask('test:full', ['jshint', 'bowerVerify']);
    
    //build
    grunt.registerTask('build', ['copy:dist', 'uglify', 'cssmin', 'copy:pages']);
  };
})();
