cmdrjs
======
A JavaScript based command line interface for web pages.

[![Build status](https://travis-ci.org/cmdrjs/cmdrjs.png)](https://travis-ci.org/cmdrjs/cmdrjs)

## Installing the module

#### NPM
```
npm install cmdrjs
```

## Loading the module

The `cmdr` module is bundled using the standalone option in [browserify](http://browserify.org/) which uses the [umd](https://github.com/forbeslindesay/umd) library. This allows the module to be loaded in various ways.

> #### IE and older browser support
> The [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) is not included in the bundle. Older browsers and IE may require the polyfill for cmdrjs to function properly.

#### CommonJS

```javascript
var cmdr = require('cmdr.js');
var terminal = new cmdr.Terminal(...);
```

#### RequireJS

```javascript
require('cmdr.js', function(cmdr) {
    var terminal = new cmdr.Terminal(...);
});
```

#### Global/Window

```html
<script src="cmdr.js"></script>
<script>
    var terminal = new cmdr.Terminal(...);
</script>
```

## Documentation

See the [wiki](https://github.com/cmdrjs/cmdrjs/wiki/Documentation) for full documentation.

## Dependencies

The `cmdr` module is bundled with its dependencies and therefore has no external dependencies.

__Bundled dependencies__
* [es6-promise](https://github.com/jakearchibald/es6-promise)

See [package.json](https://github.com/cmdrjs/cmdrjs/blob/master/package.json) for accurate versions.
