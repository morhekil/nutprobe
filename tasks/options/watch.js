var Helpers = require('../helpers'),
    filterAvailable = Helpers.filterAvailableTasks,
    LIVERELOAD_PORT = 35729,
    liveReloadPort = (parseInt(process.env.PORT || 8000, 10) - 8000) + LIVERELOAD_PORT;

var docs = '{app}/**/*.{js,coffee,em}',
    scripts = '{probe,app,tests,config}/**/*.{js,coffee,em}',
    templates = 'app/templates/**/*.{hbs,handlebars,hjs,emblem}',
    sprites = 'app/sprites/**/*.{png,jpg,jpeg}',
    styles = 'app/styles/**/*.{css,sass,scss,less,styl}',
    indexHTML = '{probe,app}/index.html',
    other = '{app,tests,public}/**/*',
    bowerFile = 'bower.json',
    npmFile = 'package.json';

module.exports = {
  scripts: {
    files: [scripts],
    tasks: ['lock', 'buildScripts', 'unlock', 'notify:built']
  },
  templates: {
    files: [templates],
    tasks: ['lock', 'buildTemplates:debug', 'unlock', 'notify:built']
  },
  sprites: {
    files: [sprites],
    tasks: filterAvailable(['lock', 'fancySprites:create', 'unlock', 'notify:built'])
  },
  styles: {
    files: [styles],
    tasks: ['lock', 'buildStyles', 'unlock', 'notify:built']
  },
  indexHTML: {
    files: [indexHTML],
    tasks: ['lock', 'buildIndexHTML:debug', 'unlock', 'notify:built']
  },
  docs: {
    files: [docs],
    tasks: ['lock', 'buildDocs', 'unlock', 'notify:built']
  },
  other: {
    files: [other, '!'+scripts, '!'+templates, '!'+styles, '!'+indexHTML, bowerFile, npmFile],
    tasks: ['lock', 'build:debug', 'unlock', 'notify:built']
  },

  options: {
    // No need to debounce
    debounceDelay: 0,
    // When we don't have inotify
    interval: 100,
    livereload: liveReloadPort,
    livereload_external: liveReloadPort, // + 1,
  }
};
