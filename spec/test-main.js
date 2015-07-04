require.config({
  baseUrl: '/base', //karma servers files from base
  paths: {
    jquery: 'bower_components/jQuery/dist/jquery',
  }
});

require(['spec/cmdr-tests'], window.__karma__.start);
