var grunt = require('grunt');

module.exports = {
  "tests": {
    type: 'amd',
    moduleName: function(path) {
      return grunt.config.process('<%= package.namespace %>/tests/') + path;
    },
    files: [{
      expand: true,
      cwd: 'tmp/javascript/tests/',
      src: '**/*.js',
      dest: 'tmp/transpiled/tests/'
    }]
  },
  "probe": {
    type: 'amd',
    moduleName: function(path) {
      return grunt.config.process('<%= package.namespace %>/') + path;
    },
    files: [{
      expand: true,
      cwd: 'tmp/javascript/probe/',
      src: '**/*.js',
      dest: 'tmp/transpiled/probe/'
    }]
  },
  "modules": {
    type: 'amd',
    moduleName: function(path) {
      return grunt.config.process('<%= package.namespace %>/') + path;
    },
    files: [{
      expand: true,
      cwd: 'modules/',
      src: '**/*.js',
      dest: 'tmp/transpiled/probe/modules/'
    }]
  },

  "app": {
    type: 'amd',
    moduleName: function(path) {
      return grunt.config.process('<%= package.namespace %>/') + path;
    },
    files: [{
      expand: true,
      cwd: 'tmp/javascript/app/',
      src: '**/*.js',
      dest: 'tmp/transpiled/app/'
    }]
  }
};
