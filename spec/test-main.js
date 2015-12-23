require.config({
  baseUrl: '/base' //karma servers files from base
});

require(['spec/cmdr-tests'], window.__karma__.start);
