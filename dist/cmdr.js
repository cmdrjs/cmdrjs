/*!
 * @overview    cmdrjs - A JavaScript based command line interface for web pages.
 * @copyright   Copyright (c) 2015 John Cruikshank 
 * @license     Licensed under MIT license
 * @version     1.1.0-alpha
*/

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cmdr = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.0.2
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function() {
        process.nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertx() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$asap(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AutocompleteProvider = (function () {
    function AutocompleteProvider(shell) {
        _classCallCheck(this, AutocompleteProvider);

        this.shell = shell;

        this.history = ["test", "woot", "hi"];
        this.historyIndex = -1;
    }

    _createClass(AutocompleteProvider, [{
        key: "dispose",
        value: function dispose() {}
    }, {
        key: "cycle",
        value: function cycle(forward) {
            if (!forward && this.historyIndex > 0) {
                this.historyIndex--;
                return this.history[this.historyIndex];
            }
            if (forward && this.history.length > this.historyIndex + 1) {
                this.historyIndex++;
                return this.history[this.historyIndex];
            }
            return null;
        }
    }]);

    return AutocompleteProvider;
})();

exports.default = AutocompleteProvider;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = exports.AutocompleteProvider = exports.HistoryProvider = exports.OverlayShell = exports.Shell = undefined;

var _shell = require('./shell.js');

Object.defineProperty(exports, 'Shell', {
  enumerable: true,
  get: function get() {
    return _shell.default;
  }
});

var _overlayShell = require('./overlay-shell.js');

Object.defineProperty(exports, 'OverlayShell', {
  enumerable: true,
  get: function get() {
    return _overlayShell.default;
  }
});

var _historyProvider = require('./history-provider.js');

Object.defineProperty(exports, 'HistoryProvider', {
  enumerable: true,
  get: function get() {
    return _historyProvider.default;
  }
});

var _autocompleteProvider = require('./autocomplete-provider.js');

Object.defineProperty(exports, 'AutocompleteProvider', {
  enumerable: true,
  get: function get() {
    return _autocompleteProvider.default;
  }
});

var _es6Promise = require('es6-promise');

var _es6Promise2 = _interopRequireDefault(_es6Promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_es6Promise2.default.polyfill(); /*!
                                  * @overview    cmdrjs - A JavaScript based command line interface for web pages.
                                  * @copyright   Copyright (c) 2015 John Cruikshank 
                                  * @license     Licensed under MIT license
                                  * @version     1.1.0-alpha
                                 */

var version = exports.version = '1.1.0-alpha';

},{"./autocomplete-provider.js":3,"./history-provider.js":5,"./overlay-shell.js":6,"./shell.js":7,"es6-promise":1}],5:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HistoryProvider = (function () {
    function HistoryProvider(shell) {
        var _this = this;

        _classCallCheck(this, HistoryProvider);

        this.shell = shell;
        this.history = [];
        this.historyIndex = -1;

        this._preexecuteHandler = function (command) {
            _this.history.unshift(command);
            _this.historyIndex = -1;
        };
        this.shell.on('preexecute', this._preexecuteHandler);
    }

    _createClass(HistoryProvider, [{
        key: 'dispose',
        value: function dispose() {
            this.clear();
            this.shell.off('preexecute', this._preexecuteHandler);
        }
    }, {
        key: 'cycle',
        value: function cycle(forward) {
            if (forward && this.historyIndex > 0) {
                this.historyIndex--;
                return this.history[this.historyIndex];
            }
            if (!forward && this.history.length > this.historyIndex + 1) {
                this.historyIndex++;
                return this.history[this.historyIndex];
            }
            return null;
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.history = [];
            this.historyIndex = -1;
        }
    }]);

    return HistoryProvider;
})();

exports.default = HistoryProvider;

},{}],6:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = require('./utils.js');

var utils = _interopRequireWildcard(_utils);

var _shell = require('./shell.js');

var _shell2 = _interopRequireDefault(_shell);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _defaultOptions = {
    autoOpen: false,
    openKey: 192,
    closeKey: 27
};

var _instance = null;

var OverlayShell = (function (_Shell) {
    _inherits(OverlayShell, _Shell);

    function OverlayShell(options) {
        _classCallCheck(this, OverlayShell);

        var overlayNode = null;
        if (_instance) {
            overlayNode = _instance._overlayNode;
            _instance.dispose();
        }

        if (!overlayNode) {
            overlayNode = utils.createElement('<div style="display: none" class="cmdr-overlay"></div>');
            document.body.appendChild(overlayNode);
        }

        options = utils.extend({}, _defaultOptions, options);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(OverlayShell).call(this, overlayNode, options));

        _this._overlayNode = overlayNode;
        _this._documentEventHandler = null;

        _instance = _this;
        return _this;
    }

    _createClass(OverlayShell, [{
        key: 'init',
        value: function init() {
            var _this2 = this;

            if (this.initialized) return;

            this._documentEventHandler = function (event) {
                if (!_this2.isOpen && ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(event.target.tagName) === -1 && !event.target.isContentEditable && event.keyCode == _this2.options.openKey) {
                    event.preventDefault();
                    _this2.open();
                } else if (_this2.isOpen && event.keyCode == _this2.options.closeKey) {
                    _this2.close();
                }
            };

            document.addEventListener('keydown', this._documentEventHandler);

            _get(Object.getPrototypeOf(OverlayShell.prototype), 'init', this).call(this);

            if (this.options.autoOpen) {
                this.open();
            }
        }
    }, {
        key: 'dispose',
        value: function dispose() {
            if (!this.initialized) return;

            document.removeEventListener('keydown', this._documentEventHandler);

            this.close();

            _get(Object.getPrototypeOf(OverlayShell.prototype), 'dispose', this).call(this);
        }
    }, {
        key: 'open',
        value: function open() {
            var _this3 = this;

            this._overlayNode.style.display = '';

            setTimeout(function () {
                _this3._setPromptIndent(); //hack: using 'private' method from base class to fix indent
                _this3.focus();
            }, 0);
        }
    }, {
        key: 'close',
        value: function close() {
            this._overlayNode.style.display = 'none';
            this.blur();
        }
    }, {
        key: 'predefine',
        value: function predefine() {
            _get(Object.getPrototypeOf(OverlayShell.prototype), 'predefine', this).call(this);

            this.define(['CLOSE', 'EXIT'], function () {
                this.shell.close();
            }, {
                description: 'Closes the command prompt'
            });
        }
    }, {
        key: 'isOpen',
        get: function get() {
            return this._overlayNode.style.display !== 'none';
        }
    }]);

    return OverlayShell;
})(_shell2.default);

exports.default = OverlayShell;

},{"./shell.js":7,"./utils.js":8}],7:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = require('./utils.js');

var utils = _interopRequireWildcard(_utils);

var _historyProvider = require('./history-provider.js');

var _historyProvider2 = _interopRequireDefault(_historyProvider);

var _autocompleteProvider = require('./autocomplete-provider.js');

var _autocompleteProvider2 = _interopRequireDefault(_autocompleteProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _defaultOptions = {
    autoInit: true,
    echo: true,
    defaultPromptPrefix: '>',
    template: '<div class="cmdr-shell"><div class="output"></div><div class="input"><span class="prefix"></span><div class="prompt" spellcheck="false" contenteditable="true" /></div></div>',
    predefinedCommands: true,
    abbreviatedCommands: true
};

var _promptIndentPadding = typeof InstallTrigger !== 'undefined'; // Firefox - misplaced cursor when using 'text-indent'

var Shell = (function () {
    function Shell(containerNode, options) {
        _classCallCheck(this, Shell);

        if (!containerNode || !utils.isElement(containerNode)) {
            throw '"containerNode" must be an HTMLElement.';
        }

        this._options = utils.extend({}, _defaultOptions, options);
        this._containerNode = containerNode;
        this._shellNode = null;
        this._inputNode = null;
        this._prefixNode = null;
        this._promptNode = null;
        this._outputNode = null;
        this._outputLineNode = null;
        this._definitions = {};
        this._current = null;
        this._queue = [];
        this._promptPrefix = null;
        this._isInputInline = false;
        this._autocompleteValue = null;
        this._eventHandlers = {};
        this._isInitialized = false;

        this._historyProvider = null;
        this._autocompleteProvider = null;

        if (this._options.autoInit) {
            this.init();
        }
    }

    _createClass(Shell, [{
        key: 'init',
        value: function init() {
            var _this = this;

            if (this._isInitialized) return;

            this._shellNode = utils.createElement(this._options.template);

            this._containerNode.appendChild(this._shellNode);

            this._outputNode = this._shellNode.querySelector('.output');
            this._inputNode = this._shellNode.querySelector('.input');
            this._prefixNode = this._shellNode.querySelector('.prefix');
            this._promptNode = this._shellNode.querySelector('.prompt');

            this._promptNode.addEventListener('keydown', function (event) {
                console.log(event.keyCode);
                if (!_this._current) {
                    if (event.keyCode !== 9) {
                        _this._autocompleteReset();
                    }
                    switch (event.keyCode) {
                        case 13:
                            var value = _this._promptNode.textContent;
                            if (value) {
                                _this.execute(value);
                            }
                            event.preventDefault();
                            return false;
                        case 38:
                            _this._historyCycle(false);
                            event.preventDefault();
                            return false;
                        case 40:
                            _this._historyCycle(true);
                            event.preventDefault();
                            return false;
                        case 9:
                            _this._autocompleteCycle(!event.shiftKey);
                            event.preventDefault();
                            return false;
                    }
                } else if (_this._current.readLine && event.keyCode === 13) {
                    _this._current.readLine.resolve(_this._promptNode.textContent);
                    return false;
                }
                return true;
            });

            this._promptNode.addEventListener('keypress', function (event) {
                if (_this._current && _this._current.read) {
                    if (event.charCode !== 0) {
                        _this._current.read.char = String.fromCharCode(event.charCode);
                        if (_this._current.read.capture) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
                return true;
            });

            this._promptNode.addEventListener('keyup', function () {
                if (_this._current && _this._current.read && _this._current.read.char) {
                    _this._current.read.resolve(_this._current.read.char);
                }
            });

            this._promptNode.addEventListener('paste', function () {
                setTimeout(function () {
                    var value = _this._promptNode.textContent;
                    var lines = value.split(/\r\n|\r|\n/g);
                    var length = lines.length;
                    if (length > 1) {
                        for (var i = 1; i < length; i++) {
                            if (lines[i].length > 0) {
                                _this._queue.get(_this).push(lines[i]);
                            }
                        }
                        if (_this._current && _this._current.readLine) {
                            _this._current.readLine.resolve(lines[0]);
                        } else if (_this._current && _this._current.read) {
                            _this._current.read.resolve(lines[0][0]);
                        } else {
                            _this._current(lines[0]);
                        }
                    }
                }, 0);
            });

            if (_promptIndentPadding) {
                this._promptNode.addEventListener('input', function () {
                    prompt.css(_this._getPromptIndent());
                });
            }

            this._shellNode.addEventListener('click', function (event) {
                if (event.target !== _this._inputNode && !_this._inputNode.contains(event.target) && event.target !== _this._outputNode && !_this._outputNode.contains(event.target)) {
                    _this._promptNode.focus();
                }
            });

            if (this._options.predefinedCommands) {
                this.predefine();
            }

            if (!this._historyProvider) {
                this._historyProvider = new _historyProvider2.default(this);
            }
            if (!this._autocompleteProvider) {
                this._autocompleteProvider = new _autocompleteProvider2.default(this);
            }

            this._promptPrefix = this._options.defaultPromptPrefix;

            this._activateInput();

            this._isInitialized = true;
        }
    }, {
        key: 'dispose',
        value: function dispose() {
            if (!this._isInitialized) return;

            this._containerNode.removeChild(this._shellNode);
            this._shellNode = null;
            this._outputNode = null;
            this._inputNode = null;
            this._prefixNode = null;
            this._promptNode = null;
            this._definitions = {};
            this._current = null;
            this._queue = [];
            this._promptPrefix = null;
            this._isInputInline = false;
            this._eventHandlers = {};

            if (this._historyProvider) {
                this._historyProvider.dispose();
                this._historyProvider = null;
            }
            if (this._autocompleteProvider) {
                this._autocompleteProvider.dispose();
                this._autocompleteProvider = null;
            }

            this._isInitialized = false;
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.dispose();
            this.init();
        }
    }, {
        key: 'read',
        value: function read(callback, capture) {
            var _this2 = this;

            if (!this._current) return;

            this._activateInput(true);

            this._current.read = utils.defer();
            this._current.read.then(function (value) {
                _this2._current.read = null;
                if (!capture) {
                    _this2._promptNode.textContent = value;
                }
                _this2._deactivateInput();
                if (callback(value, _this2._current) === true) {
                    _this2.read(callback, capture);
                } else {
                    _this2._flushInput();
                }
            });
            this._current.read.capture = capture;

            if (this._queue.length > 0) {
                this._current.read.resolve(this._queue.shift()[0]);
            }
        }
    }, {
        key: 'readLine',
        value: function readLine(callback) {
            var _this3 = this;

            if (!this._current) return;

            this._activateInput(true);

            this._current.readLine = utils.defer();
            this._current.readLine.then(function (value) {
                _this3._current.readLine = null;
                _this3._promptNode.textContent = value;
                _this3._deactivateInput();
                _this3._flushInput();
                if (callback(value, _this3._current) === true) {
                    _this3.readLine(callback);
                }
            });

            if (this._queue.length > 0) {
                this._current.readLine.resolve(this._queue.shift());
            }
        }
    }, {
        key: 'write',
        value: function write(value, cssClass) {
            value = value || '';
            var outputValue = utils.createElement('<span class="' + cssClass + '">' + value + '</span>');
            if (!this._outputLineNode) {
                this._outputLineNode = utils.createElement('<div></div>');
                this._outputNode.appendChild(this._outputLineNode);
            }
            this._outputLineNode.appendChild(outputValue);
        }
    }, {
        key: 'writeLine',
        value: function writeLine(value, cssClass) {
            value = (value || '') + '\n';
            this.write(value, cssClass);
            this._outputLineNode = null;
        }
    }, {
        key: 'writePad',
        value: function writePad(value, padding, length, cssClass) {
            this.write(utils.pad(value, padding, length), cssClass);
        }
    }, {
        key: 'clear',
        value: function clear() {
            this._outputNode.innerHTML = '';
        }
    }, {
        key: 'focus',
        value: function focus() {
            this._promptNode.focus();
        }
    }, {
        key: 'blur',
        value: function blur() {
            utils.blur(this._promptNode);
        }
    }, {
        key: 'execute',
        value: function execute(command) {
            var _this4 = this;

            if (this._current) {
                this._queue.push(command);
                return;
            }

            if (typeof command !== 'string' || command.length === 0) {
                throw 'Invalid command';
            }

            this._trigger('preexecute', command);

            this._promptNode.textContent = command;
            this._flushInput(!this._options.echo);
            this._deactivateInput();

            command = command.trim();

            var parsed = this._parseCommand(command);

            var definitions = this._getDefinitions(parsed.name);
            if (!definitions || definitions.length < 1) {
                this.writeLine('Invalid command', 'error');
                this._activateInput();
                return;
            } else if (definitions.length > 1) {
                this.writeLine('Ambiguous command', 'error');
                this.writeLine();
                for (var i = 0; i < definitions.length; i++) {
                    this.writePad(definitions[i].name, ' ', 10);
                    this.writeLine(definitions[i].description);
                }
                this.writeLine();
                this._activateInput();
                return;
            }

            var definition = definitions[0];

            this._current = {
                command: command,
                definition: definition,
                shell: this
            };

            var args = parsed.args;
            if (!definition.parse) {
                args = [parsed.arg];
            }

            this._trigger('executing', this._current);

            var result = undefined;
            try {
                result = definition.callback.apply(this._current, args);
            } catch (error) {
                this.writeLine('Unhandled exception. See browser console log for details.', 'error');
                console.error(error);
            }

            Promise.all([result]).then(function () {
                setTimeout(function () {
                    _this4._trigger('execute', _this4._current);
                    _this4._current = null;
                    _this4._activateInput();
                    if (_this4._queue.length > 0) {
                        _this4.execute(_this4._queue.shift());
                    }
                }, 0);
            });
        }
    }, {
        key: 'define',
        value: function define(names, callback, options) {
            var definitions = this._createDefinitions(names, callback, options);
            for (var i = 0, l = definitions.length; i < l; i++) {
                this._definitions[definitions[i].name] = definitions[i];
            }
        }
    }, {
        key: 'predefine',
        value: function predefine() {
            this.define(['HELP', '?'], function () {
                this.shell.writeLine('The following commands are available:');
                this.shell.writeLine();
                for (var key in this.shell.definitions) {
                    var definition = this.shell.definitions[key];
                    if (!!utils.unwrap(definition.available)) {
                        this.shell.writePad(key, ' ', 10);
                        this.shell.writeLine(definition.description);
                    }
                }
                this.shell.writeLine();
            }, {
                description: 'Lists the available commands'
            });

            this.define('ECHO', function (arg) {
                var toggle = arg.toUpperCase();
                if (toggle === 'ON') {
                    this.shell.options.echo = true;
                } else if (toggle === 'OFF') {
                    this.shell.options.echo = false;
                } else {
                    this.shell.writeLine(arg);
                }
            }, {
                parse: false,
                description: 'Displays provided text or toggles command echoing'
            });

            this.define(['CLS'], function () {
                this.shell.clear();
            }, {
                description: 'Clears the command prompt'
            });
        }
    }, {
        key: 'on',
        value: function on(event, callback) {
            if (!this._eventHandlers[event]) {
                this._eventHandlers[event] = [];
            }
            this._eventHandlers[event].push(callback);
        }
    }, {
        key: 'off',
        value: function off(event, callback) {
            if (!this._eventHandlers[event]) {
                return;
            }
            var index = this._eventHandlers[event].indexOf(callback);
            if (index > -1) {
                this._eventHandlers[event].splice(index, 1);
            }
        }
    }, {
        key: '_trigger',
        value: function _trigger(event, data) {
            if (!this._eventHandlers[event]) return;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._eventHandlers[event][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var callback = _step.value;

                    callback.call(this, data);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }, {
        key: '_activateInput',
        value: function _activateInput(inline) {
            var _this5 = this;

            if (inline) {
                if (this._outputLineNode) {
                    this._prefixNode.textContent = this._outputLineNode.textContent;
                    this._outputNode.removeChild(this._outputLineNode);
                    this._outputLineNode = null;
                }
                this._isInputInline = true;
            } else {
                this._prefixNode.textContent = this._promptPrefix;
                this._isInputInline = false;
            }
            this._inputNode.style.display = '';
            setTimeout(function () {
                _this5._promptNode.setAttribute('disabled', false);
                _this5._setPromptIndent();
                _this5._promptNode.focus();
                utils.smoothScroll(_this5._shellNode, _this5._shellNode.scrollHeight, 1000);
            }, 0);
        }
    }, {
        key: '_deactivateInput',
        value: function _deactivateInput() {
            this._promptNode.setAttribute('disabled', true);
            this._inputNode.style.display = 'none';
        }
    }, {
        key: '_flushInput',
        value: function _flushInput(preventWrite) {
            if (!preventWrite) {
                this.write(this._prefixNode.textContent);
                this.writeLine(this._promptNode.textContent);
            }
            this._prefixNode.textContent = '';
            this._promptNode.textContent = '';
        }
    }, {
        key: '_historyCycle',
        value: function _historyCycle(forward) {
            var _this6 = this;

            Promise.all([this._historyProvider.cycle(forward)]).then(function (values) {
                var command = values[0];
                if (command) {
                    _this6._promptNode.textContent = command;
                    utils.cursorToEnd(_this6._promptNode);
                    utils.dispatchEvent(_this6._promptNode, 'change', true, false);
                }
            });
        }
    }, {
        key: '_autocompleteCycle',
        value: function _autocompleteCycle(forward) {
            var _this7 = this;

            var input = this._promptNode.textContent;
            console.log(input);
            var cursorPosition = utils.getCursorPosition(this._promptNode);
            console.log(cursorPosition);
            var startIndex = input.lastIndexOf(' ') + 1;
            console.log(startIndex);
            startIndex = startIndex !== -1 ? startIndex : 0;
            console.log(startIndex);
            if (this._autocompleteValue === null) {
                var endIndex = input.indexOf(' ', startIndex);
                console.log(endIndex);
                endIndex = endIndex !== -1 ? endIndex : input.length;
                console.log(endIndex);
                this._autocompleteValue = input.substring(startIndex, endIndex);
                console.log(this._autocompleteValue);
            }
            Promise.all([this._autocompleteProvider.cycle(forward, this._autocompleteValue)]).then(function (values) {
                var value = values[0];
                if (value) {
                    _this7._promptNode.textContent = input.substring(0, startIndex) + value;
                    console.log(_this7._promptNode.textContent);
                    utils.cursorToEnd(_this7._promptNode);
                    utils.dispatchEvent(_this7._promptNode, 'change', true, false);
                }
            });
        }
    }, {
        key: '_autocompleteReset',
        value: function _autocompleteReset() {
            this._autocompleteValue = null;
        }
    }, {
        key: '_parseCommand',
        value: function _parseCommand(command) {
            var exp = /[^\s"]+|"([^"]*)"/gi,
                name = null,
                arg = null,
                args = [],
                match = null;

            do {
                match = exp.exec(command);
                if (match !== null) {
                    var value = match[1] ? match[1] : match[0];
                    if (match.index === 0) {
                        name = value;
                        arg = command.substr(value.length + (match[1] ? 3 : 1));
                    } else {
                        args.push(value);
                    }
                }
            } while (match !== null);

            return {
                name: name,
                arg: arg,
                args: args
            };
        }
    }, {
        key: '_createDefinitions',
        value: function _createDefinitions(names, callback, options) {
            if (typeof names !== 'string' && !Array.isArray(names)) {
                options = callback;
                callback = names;
                names = null;
            }
            if (typeof callback !== 'function') {
                options = callback;
                callback = null;
            }

            if (typeof names === 'string') {
                names = [names];
            } else if (Array.isArray(names)) {
                names = names.filter(function (value) {
                    return typeof value === 'string';
                });
            }

            if (!Array.isArray(names) || names.length === 0 || typeof callback !== 'function') {
                throw 'Invalid command definition';
            }

            var definitions = [];

            for (var i = 0, l = names.length; i < l; i++) {
                var definition = {
                    name: names[i].toUpperCase(),
                    callback: callback,
                    parse: true,
                    available: true
                };

                utils.extend(definition, options);

                definitions.push(definition);
            }

            return definitions;
        }
    }, {
        key: '_getDefinitions',
        value: function _getDefinitions(name) {
            name = name.toUpperCase();

            var definition = this._definitions[name];

            if (definition) {
                return [definition];
            }

            var definitions = [];

            if (this._options.abbreviatedCommands) {
                for (var key in this._definitions) {
                    if (key.indexOf(name, 0) === 0 && utils.unwrap(this._definitions[key].available)) {
                        definitions.push(this._definitions[key]);
                    }
                }
            }

            return definitions;
        }
    }, {
        key: '_getPrefixWidth',
        value: function _getPrefixWidth() {
            var width = this._prefixNode.getBoundingClientRect().width;
            var text = this._prefixNode.textContent;
            var spacePadding = text.length - text.trim().length;

            if (!this._prefixNode._spaceWidth) {
                var elem1 = utils.createElement('<span style="visibility: hidden">| |</span>');
                this._prefixNode.appendChild(elem1);
                var elem2 = utils.createElement('<span style="visibility: hidden">||</span>');
                this._prefixNode.appendChild(elem2);
                this._prefixNode._spaceWidth = elem1.offsetWidth - elem2.offsetWidth;
                this._prefixNode.removeChild(elem1);
                this._prefixNode.removeChild(elem2);
            }

            width += spacePadding * this._prefixNode._spaceWidth;
            return width;
        }
    }, {
        key: '_setPromptIndent',
        value: function _setPromptIndent() {
            var prefixWidth = this._getPrefixWidth() + 'px';
            if (_promptIndentPadding) {
                if (this._promptNode.textContent) {
                    this._promptNode.style.textIndent = prefixWidth;
                    this._promptNode.style.paddingLeft = '';
                } else {
                    this._promptNode.style.textIndent = '';
                    this._promptNode.style.paddingLeft = prefixWidth;
                }
            } else {
                this._promptNode.style.textIndent = prefixWidth;
            }
        }
    }, {
        key: 'isInitialized',
        get: function get() {
            return this._isInitialized;
        }
    }, {
        key: 'options',
        get: function get() {
            return this._options;
        }
    }, {
        key: 'definitions',
        get: function get() {
            return this._definitions;
        }
    }, {
        key: 'promptPrefix',
        get: function get() {
            return this._promptPrefix;
        },
        set: function set(value) {
            this._promptPrefix = value;
            if (!this._isInputInline) {
                this._prefixNode.textContent = value;
                this._setPromptIndent();
            }
        }
    }, {
        key: 'historyProvider',
        get: function get() {
            return this._historyProvider;
        },
        set: function set(value) {
            this._historyProvider = value;
        }
    }, {
        key: 'autocompleteProvider',
        get: function get() {
            return this._autocompleteProvider;
        },
        set: function set(value) {
            this._autocompleteProvider = value;
        }
    }]);

    return Shell;
})();

exports.default = Shell;

},{"./autocomplete-provider.js":3,"./history-provider.js":5,"./utils.js":8}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extend = extend;
exports.createElement = createElement;
exports.pad = pad;
exports.unwrap = unwrap;
exports.smoothScroll = smoothScroll;
exports.defer = defer;
exports.blur = blur;
exports.isElement = isElement;
exports.cursorToEnd = cursorToEnd;
exports.getCursorPosition = getCursorPosition;
exports.dispatchEvent = dispatchEvent;

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function extend(out) {
    out = out || {};
    for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i];
        if (!obj) continue;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (_typeof(obj[key]) === 'object') extend(out[key], obj[key]);else out[key] = obj[key];
            }
        }
    }
    return out;
}

function createElement(html) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.firstChild;
}

function pad(value, padding, length) {
    var right = length >= 0;
    length = Math.abs(length);
    while (value.length < length) {
        value = right ? value + padding : padding + value;
    }
    return value;
}

function unwrap(value) {
    return typeof value === 'function' ? value() : value;
}

function smoothScroll(element, target, duration) {
    target = Math.round(target);
    duration = Math.round(duration);
    if (duration < 0) {
        return Promise.reject("Invalid duration");
    }
    if (duration === 0) {
        element.scrollTop = target;
        return Promise.resolve();
    }

    var startTime = Date.now();
    var endTime = startTime + duration;

    var startTop = element.scrollTop;
    var distance = target - startTop;

    var smoothStep = function smoothStep(start, end, point) {
        if (point <= start) {
            return 0;
        }
        if (point >= end) {
            return 1;
        }
        var x = (point - start) / (end - start);
        return x * x * (3 - 2 * x);
    };

    return new Promise(function (resolve, reject) {
        var previousTop = element.scrollTop;

        var scrollFrame = function scrollFrame() {
            if (element.scrollTop != previousTop) {
                reject("interrupted");
                return;
            }

            var now = Date.now();
            var point = smoothStep(startTime, endTime, now);
            var frameTop = Math.round(startTop + distance * point);
            element.scrollTop = frameTop;

            if (now >= endTime) {
                resolve();
                return;
            }

            if (element.scrollTop === previousTop && element.scrollTop !== frameTop) {
                resolve();
                return;
            }
            previousTop = element.scrollTop;

            setTimeout(scrollFrame, 0);
        };

        setTimeout(scrollFrame, 0);
    });
}

function defer() {
    function Deferred() {
        var _this = this;

        this.promise = new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });

        this.then = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise);
    }

    return new Deferred();
}

function blur() {
    var element = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    if (element && element !== document.activeElement) return;
    var temp = document.createElement("input");
    document.body.appendChild(temp);
    temp.focus();
    document.body.removeChild(temp);
}

function isElement(obj) {
    return (typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === "object" ? obj instanceof HTMLElement : obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string";
}

function cursorToEnd(element) {
    var range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function getCursorPosition(element) {
    var pos = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel = undefined;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCursorRange = range.cloneRange();
            preCursorRange.selectNodeContents(element);
            preCursorRange.setEnd(range.endContainer, range.endOffset);
            pos = preCursorRange.toString().length;
        }
    } else if ((sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCursorTextRange = doc.body.createTextRange();
        preCursorTextRange.moveToElementText(element);
        preCursorTextRange.setEndPoint("EndToEnd", textRange);
        pos = preCursorTextRange.text.length;
    }
    return pos;
}

function dispatchEvent(element, type, canBubble, cancelable) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent(type, canBubble, cancelable);
    element.dispatchEvent(event);
}

},{}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXM2LXByb21pc2UvZGlzdC9lczYtcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJzcmNcXGF1dG9jb21wbGV0ZS1wcm92aWRlci5qcyIsInNyY1xcY21kci5qcyIsInNyY1xcaGlzdG9yeS1wcm92aWRlci5qcyIsInNyY1xcb3ZlcmxheS1zaGVsbC5qcyIsInNyY1xcc2hlbGwuanMiLCJzcmNcXHV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2OEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFBLElBQUssR0FBRyxDQUFDLElBQUksSUFBSSxTQUFTLEVBQUU7QUFDdkQsWUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2xDLFlBQUksa0JBQWtCLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUNwRCwwQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QywwQkFBa0IsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3RELFdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3hDO0FBQ0QsV0FBTyxHQUFHLENBQUM7Q0FDZDs7QUFFTSxTQUFTLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUU7QUFDaEUsUUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMvQyxTQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDN0MsV0FBTyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNoQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIEBvdmVydmlldyBlczYtcHJvbWlzZSAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzIChDb252ZXJzaW9uIHRvIEVTNiBBUEkgYnkgSmFrZSBBcmNoaWJhbGQpXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vamFrZWFyY2hpYmFsZC9lczYtcHJvbWlzZS9tYXN0ZXIvTElDRU5TRVxuICogQHZlcnNpb24gICAzLjAuMlxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nIHx8ICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeCAhPT0gbnVsbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0Z1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZSh4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnICYmIHggIT09IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzQXJyYXkgPSBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5O1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuID0gMDtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR2ZXJ0eE5leHQ7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRjdXN0b21TY2hlZHVsZXJGbjtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcCA9IGZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2xpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW5dID0gY2FsbGJhY2s7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiArIDFdID0gYXJnO1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiArPSAyO1xuICAgICAgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW4gPT09IDIpIHtcbiAgICAgICAgLy8gSWYgbGVuIGlzIDIsIHRoYXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHNjaGVkdWxlIGFuIGFzeW5jIGZsdXNoLlxuICAgICAgICAvLyBJZiBhZGRpdGlvbmFsIGNhbGxiYWNrcyBhcmUgcXVldWVkIGJlZm9yZSB0aGUgcXVldWUgaXMgZmx1c2hlZCwgdGhleVxuICAgICAgICAvLyB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGlzIGZsdXNoIHRoYXQgd2UgYXJlIHNjaGVkdWxpbmcuXG4gICAgICAgIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4pIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4obGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHNldFNjaGVkdWxlcihzY2hlZHVsZUZuKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4gPSBzY2hlZHVsZUZuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzZXRBc2FwKGFzYXBGbikge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGFzYXAgPSBhc2FwRm47XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyV2luZG93ID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHVuZGVmaW5lZDtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJHbG9iYWwgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3NlcldpbmRvdyB8fCB7fTtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3Nlckdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNOb2RlID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJztcblxuICAgIC8vIHRlc3QgZm9yIHdlYiB3b3JrZXIgYnV0IG5vdCBpbiBJRTEwXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRpc1dvcmtlciA9IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIHR5cGVvZiBpbXBvcnRTY3JpcHRzICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJztcblxuICAgIC8vIG5vZGVcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTmV4dFRpY2soKSB7XG4gICAgICAvLyBub2RlIHZlcnNpb24gMC4xMC54IGRpc3BsYXlzIGEgZGVwcmVjYXRpb24gd2FybmluZyB3aGVuIG5leHRUaWNrIGlzIHVzZWQgcmVjdXJzaXZlbHlcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vY3Vqb2pzL3doZW4vaXNzdWVzLzQxMCBmb3IgZGV0YWlsc1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIHZlcnR4XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVZlcnR4VGltZXIoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR2ZXJ0eE5leHQobGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU11dGF0aW9uT2JzZXJ2ZXIoKSB7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgbGliJGVzNiRwcm9taXNlJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCk7XG4gICAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICAgIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIG5vZGUuZGF0YSA9IChpdGVyYXRpb25zID0gKytpdGVyYXRpb25zICUgMik7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIHdlYiB3b3JrZXJcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTWVzc2FnZUNoYW5uZWwoKSB7XG4gICAgICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2g7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlU2V0VGltZW91dCgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0VGltZW91dChsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gsIDEpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlID0gbmV3IEFycmF5KDEwMDApO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbjsgaSs9Mikge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbaV07XG4gICAgICAgIHZhciBhcmcgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbaSsxXTtcblxuICAgICAgICBjYWxsYmFjayhhcmcpO1xuXG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtpXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2krMV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW4gPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhdHRlbXB0VmVydHgoKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgciA9IHJlcXVpcmU7XG4gICAgICAgIHZhciB2ZXJ0eCA9IHIoJ3ZlcnR4Jyk7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR2ZXJ0eE5leHQgPSB2ZXJ0eC5ydW5Pbkxvb3AgfHwgdmVydHgucnVuT25Db250ZXh0O1xuICAgICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVZlcnR4VGltZXIoKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVNldFRpbWVvdXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2g7XG4gICAgLy8gRGVjaWRlIHdoYXQgYXN5bmMgbWV0aG9kIHRvIHVzZSB0byB0cmlnZ2VyaW5nIHByb2Nlc3Npbmcgb2YgcXVldWVkIGNhbGxiYWNrczpcbiAgICBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGlzTm9kZSkge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTmV4dFRpY2soKTtcbiAgICB9IGVsc2UgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTXV0YXRpb25PYnNlcnZlcigpO1xuICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGlzV29ya2VyKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VNZXNzYWdlQ2hhbm5lbCgpO1xuICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJXaW5kb3cgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXR0ZW1wdFZlcnR4KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVNldFRpbWVvdXQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKCkge31cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICAgPSB2b2lkIDA7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCA9IDE7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEICA9IDI7XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IgPSBuZXcgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHNlbGZGdWxmaWxsbWVudCgpIHtcbiAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRjYW5ub3RSZXR1cm5Pd24oKSB7XG4gICAgICByZXR1cm4gbmV3IFR5cGVFcnJvcignQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGdldFRoZW4ocHJvbWlzZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbjtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSwgdGhlbikge1xuICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGZ1bmN0aW9uKHByb21pc2UpIHtcbiAgICAgICAgdmFyIHNlYWxlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgZXJyb3IgPSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCR0cnlUaGVuKHRoZW4sIHRoZW5hYmxlLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBpZiAoc2VhbGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG5cbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSwgJ1NldHRsZTogJyArIChwcm9taXNlLl9sYWJlbCB8fCAnIHVua25vd24gcHJvbWlzZScpKTtcblxuICAgICAgICBpZiAoIXNlYWxlZCAmJiBlcnJvcikge1xuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUpIHtcbiAgICAgIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKSB7XG4gICAgICBpZiAobWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3RvciA9PT0gcHJvbWlzZS5jb25zdHJ1Y3Rvcikge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0aGVuID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZ2V0VGhlbihtYXliZVRoZW5hYmxlKTtcblxuICAgICAgICBpZiAodGhlbiA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoZW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0Z1bmN0aW9uKHRoZW4pKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUsIHRoZW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKSB7XG4gICAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHNlbGZGdWxmaWxsbWVudCgpKTtcbiAgICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJHV0aWxzJCRvYmplY3RPckZ1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2hSZWplY3Rpb24ocHJvbWlzZSkge1xuICAgICAgaWYgKHByb21pc2UuX29uZXJyb3IpIHtcbiAgICAgICAgcHJvbWlzZS5fb25lcnJvcihwcm9taXNlLl9yZXN1bHQpO1xuICAgICAgfVxuXG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykgeyByZXR1cm47IH1cblxuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gdmFsdWU7XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRDtcblxuICAgICAgaWYgKHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoLCBwcm9taXNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEO1xuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gcmVhc29uO1xuXG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgIHZhciBzdWJzY3JpYmVycyA9IHBhcmVudC5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgbGVuZ3RoID0gc3Vic2NyaWJlcnMubGVuZ3RoO1xuXG4gICAgICBwYXJlbnQuX29uZXJyb3IgPSBudWxsO1xuXG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGhdID0gY2hpbGQ7XG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGggKyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRURdID0gb25GdWxmaWxsbWVudDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEXSAgPSBvblJlamVjdGlvbjtcblxuICAgICAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2gsIHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcHVibGlzaChwcm9taXNlKSB7XG4gICAgICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgICAgIHZhciBzZXR0bGVkID0gcHJvbWlzZS5fc3RhdGU7XG5cbiAgICAgIGlmIChzdWJzY3JpYmVycy5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG5cbiAgICAgIHZhciBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCA9IHByb21pc2UuX3Jlc3VsdDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICBjaGlsZCA9IHN1YnNjcmliZXJzW2ldO1xuICAgICAgICBjYWxsYmFjayA9IHN1YnNjcmliZXJzW2kgKyBzZXR0bGVkXTtcblxuICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCkge1xuICAgICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUiA9IG5ldyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRFcnJvck9iamVjdCgpO1xuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SLmVycm9yID0gZTtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB2YXIgaGFzQ2FsbGJhY2sgPSBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24oY2FsbGJhY2spLFxuICAgICAgICAgIHZhbHVlLCBlcnJvciwgc3VjY2VlZGVkLCBmYWlsZWQ7XG5cbiAgICAgIGlmIChoYXNDYWxsYmFjaykge1xuICAgICAgICB2YWx1ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICAgICAgZmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICBlcnJvciA9IHZhbHVlLmVycm9yO1xuICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGNhbm5vdFJldHVybk93bigpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBkZXRhaWw7XG4gICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAvLyBub29wXG4gICAgICB9IGVsc2UgaWYgKGhhc0NhbGxiYWNrICYmIHN1Y2NlZWRlZCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoZmFpbGVkKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZShwcm9taXNlLCByZXNvbHZlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UodmFsdWUpe1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbiByZWplY3RQcm9taXNlKHJlYXNvbikge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IoQ29uc3RydWN0b3IsIGlucHV0KSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG5cbiAgICAgIGVudW1lcmF0b3IuX2luc3RhbmNlQ29uc3RydWN0b3IgPSBDb25zdHJ1Y3RvcjtcbiAgICAgIGVudW1lcmF0b3IucHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcblxuICAgICAgaWYgKGVudW1lcmF0b3IuX3ZhbGlkYXRlSW5wdXQoaW5wdXQpKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX2lucHV0ICAgICA9IGlucHV0O1xuICAgICAgICBlbnVtZXJhdG9yLmxlbmd0aCAgICAgPSBpbnB1dC5sZW5ndGg7XG4gICAgICAgIGVudW1lcmF0b3IuX3JlbWFpbmluZyA9IGlucHV0Lmxlbmd0aDtcblxuICAgICAgICBlbnVtZXJhdG9yLl9pbml0KCk7XG5cbiAgICAgICAgaWYgKGVudW1lcmF0b3IubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChlbnVtZXJhdG9yLnByb21pc2UsIGVudW1lcmF0b3IuX3Jlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW51bWVyYXRvci5sZW5ndGggPSBlbnVtZXJhdG9yLmxlbmd0aCB8fCAwO1xuICAgICAgICAgIGVudW1lcmF0b3IuX2VudW1lcmF0ZSgpO1xuICAgICAgICAgIGlmIChlbnVtZXJhdG9yLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwoZW51bWVyYXRvci5wcm9taXNlLCBlbnVtZXJhdG9yLl9yZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KGVudW1lcmF0b3IucHJvbWlzZSwgZW51bWVyYXRvci5fdmFsaWRhdGlvbkVycm9yKCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fdmFsaWRhdGVJbnB1dCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0FycmF5KGlucHV0KTtcbiAgICB9O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ0FycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheScpO1xuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3Jlc3VsdCA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XG4gICAgfTtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yO1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgICAgdmFyIGxlbmd0aCAgPSBlbnVtZXJhdG9yLmxlbmd0aDtcbiAgICAgIHZhciBwcm9taXNlID0gZW51bWVyYXRvci5wcm9taXNlO1xuICAgICAgdmFyIGlucHV0ICAgPSBlbnVtZXJhdG9yLl9pbnB1dDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBlbnVtZXJhdG9yLl9lYWNoRW50cnkoaW5wdXRbaV0sIGkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uKGVudHJ5LCBpKSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG4gICAgICB2YXIgYyA9IGVudW1lcmF0b3IuX2luc3RhbmNlQ29uc3RydWN0b3I7XG5cbiAgICAgIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZShlbnRyeSkpIHtcbiAgICAgICAgaWYgKGVudHJ5LmNvbnN0cnVjdG9yID09PSBjICYmIGVudHJ5Ll9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAgIGVudHJ5Ll9vbmVycm9yID0gbnVsbDtcbiAgICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQoZW50cnkuX3N0YXRlLCBpLCBlbnRyeS5fcmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnVtZXJhdG9yLl93aWxsU2V0dGxlQXQoYy5yZXNvbHZlKGVudHJ5KSwgaSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3JlbWFpbmluZy0tO1xuICAgICAgICBlbnVtZXJhdG9yLl9yZXN1bHRbaV0gPSBlbnRyeTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9zZXR0bGVkQXQgPSBmdW5jdGlvbihzdGF0ZSwgaSwgdmFsdWUpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcbiAgICAgIHZhciBwcm9taXNlID0gZW51bWVyYXRvci5wcm9taXNlO1xuXG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgZW51bWVyYXRvci5fcmVtYWluaW5nLS07XG5cbiAgICAgICAgaWYgKHN0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW51bWVyYXRvci5fcmVzdWx0W2ldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVudW1lcmF0b3IuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIGVudW1lcmF0b3IuX3Jlc3VsdCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fd2lsbFNldHRsZUF0ID0gZnVuY3Rpb24ocHJvbWlzZSwgaSkge1xuICAgICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuXG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocHJvbWlzZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRlVMRklMTEVELCBpLCB2YWx1ZSk7XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgZW51bWVyYXRvci5fc2V0dGxlZEF0KGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVELCBpLCByZWFzb24pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGFsbChlbnRyaWVzKSB7XG4gICAgICByZXR1cm4gbmV3IGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRkZWZhdWx0KHRoaXMsIGVudHJpZXMpLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGFsbDtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRyYWNlKGVudHJpZXMpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcblxuICAgICAgaWYgKCFsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzQXJyYXkoZW50cmllcykpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYW4gYXJyYXkgdG8gcmFjZS4nKSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGVuZ3RoID0gZW50cmllcy5sZW5ndGg7XG5cbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbG1lbnQodmFsdWUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0aW9uKHJlYXNvbikge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUoQ29uc3RydWN0b3IucmVzb2x2ZShlbnRyaWVzW2ldKSwgdW5kZWZpbmVkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmFjZSQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJhY2UkJHJhY2U7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkcmVzb2x2ZShvYmplY3QpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gICAgICBpZiAob2JqZWN0ICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdC5jb25zdHJ1Y3RvciA9PT0gQ29uc3RydWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgIH1cblxuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIG9iamVjdCk7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZXNvbHZlJCRyZXNvbHZlO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlamVjdCQkcmVqZWN0KHJlYXNvbikge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZWplY3QkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZWplY3QkJHJlamVjdDtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkY291bnRlciA9IDA7XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNSZXNvbHZlcigpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYSByZXNvbHZlciBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3InKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNOZXcoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlO1xuICAgIC8qKlxuICAgICAgUHJvbWlzZSBvYmplY3RzIHJlcHJlc2VudCB0aGUgZXZlbnR1YWwgcmVzdWx0IG9mIGFuIGFzeW5jaHJvbm91cyBvcGVyYXRpb24uIFRoZVxuICAgICAgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCwgd2hpY2hcbiAgICAgIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNlJ3MgZXZlbnR1YWwgdmFsdWUgb3IgdGhlIHJlYXNvblxuICAgICAgd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgICAgIFRlcm1pbm9sb2d5XG4gICAgICAtLS0tLS0tLS0tLVxuXG4gICAgICAtIGBwcm9taXNlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gd2l0aCBhIGB0aGVuYCBtZXRob2Qgd2hvc2UgYmVoYXZpb3IgY29uZm9ybXMgdG8gdGhpcyBzcGVjaWZpY2F0aW9uLlxuICAgICAgLSBgdGhlbmFibGVgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB0aGF0IGRlZmluZXMgYSBgdGhlbmAgbWV0aG9kLlxuICAgICAgLSBgdmFsdWVgIGlzIGFueSBsZWdhbCBKYXZhU2NyaXB0IHZhbHVlIChpbmNsdWRpbmcgdW5kZWZpbmVkLCBhIHRoZW5hYmxlLCBvciBhIHByb21pc2UpLlxuICAgICAgLSBgZXhjZXB0aW9uYCBpcyBhIHZhbHVlIHRoYXQgaXMgdGhyb3duIHVzaW5nIHRoZSB0aHJvdyBzdGF0ZW1lbnQuXG4gICAgICAtIGByZWFzb25gIGlzIGEgdmFsdWUgdGhhdCBpbmRpY2F0ZXMgd2h5IGEgcHJvbWlzZSB3YXMgcmVqZWN0ZWQuXG4gICAgICAtIGBzZXR0bGVkYCB0aGUgZmluYWwgcmVzdGluZyBzdGF0ZSBvZiBhIHByb21pc2UsIGZ1bGZpbGxlZCBvciByZWplY3RlZC5cblxuICAgICAgQSBwcm9taXNlIGNhbiBiZSBpbiBvbmUgb2YgdGhyZWUgc3RhdGVzOiBwZW5kaW5nLCBmdWxmaWxsZWQsIG9yIHJlamVjdGVkLlxuXG4gICAgICBQcm9taXNlcyB0aGF0IGFyZSBmdWxmaWxsZWQgaGF2ZSBhIGZ1bGZpbGxtZW50IHZhbHVlIGFuZCBhcmUgaW4gdGhlIGZ1bGZpbGxlZFxuICAgICAgc3RhdGUuICBQcm9taXNlcyB0aGF0IGFyZSByZWplY3RlZCBoYXZlIGEgcmVqZWN0aW9uIHJlYXNvbiBhbmQgYXJlIGluIHRoZVxuICAgICAgcmVqZWN0ZWQgc3RhdGUuICBBIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5ldmVyIGEgdGhlbmFibGUuXG5cbiAgICAgIFByb21pc2VzIGNhbiBhbHNvIGJlIHNhaWQgdG8gKnJlc29sdmUqIGEgdmFsdWUuICBJZiB0aGlzIHZhbHVlIGlzIGFsc28gYVxuICAgICAgcHJvbWlzZSwgdGhlbiB0aGUgb3JpZ2luYWwgcHJvbWlzZSdzIHNldHRsZWQgc3RhdGUgd2lsbCBtYXRjaCB0aGUgdmFsdWUnc1xuICAgICAgc2V0dGxlZCBzdGF0ZS4gIFNvIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgcmVqZWN0cyB3aWxsXG4gICAgICBpdHNlbGYgcmVqZWN0LCBhbmQgYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCBmdWxmaWxscyB3aWxsXG4gICAgICBpdHNlbGYgZnVsZmlsbC5cblxuXG4gICAgICBCYXNpYyBVc2FnZTpcbiAgICAgIC0tLS0tLS0tLS0tLVxuXG4gICAgICBgYGBqc1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgLy8gb24gc3VjY2Vzc1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcblxuICAgICAgICAvLyBvbiBmYWlsdXJlXG4gICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG5cbiAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAvLyBvbiBmdWxmaWxsbWVudFxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIC8vIG9uIHJlamVjdGlvblxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQWR2YW5jZWQgVXNhZ2U6XG4gICAgICAtLS0tLS0tLS0tLS0tLS1cblxuICAgICAgUHJvbWlzZXMgc2hpbmUgd2hlbiBhYnN0cmFjdGluZyBhd2F5IGFzeW5jaHJvbm91cyBpbnRlcmFjdGlvbnMgc3VjaCBhc1xuICAgICAgYFhNTEh0dHBSZXF1ZXN0YHMuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmdW5jdGlvbiBnZXRKU09OKHVybCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gaGFuZGxlcjtcbiAgICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHhoci5zZW5kKCk7XG5cbiAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gdGhpcy5ET05FKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdnZXRKU09OOiBgJyArIHVybCArICdgIGZhaWxlZCB3aXRoIHN0YXR1czogWycgKyB0aGlzLnN0YXR1cyArICddJykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGdldEpTT04oJy9wb3N0cy5qc29uJykudGhlbihmdW5jdGlvbihqc29uKSB7XG4gICAgICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgLy8gb24gcmVqZWN0aW9uXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBVbmxpa2UgY2FsbGJhY2tzLCBwcm9taXNlcyBhcmUgZ3JlYXQgY29tcG9zYWJsZSBwcmltaXRpdmVzLlxuXG4gICAgICBgYGBqc1xuICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICBnZXRKU09OKCcvcG9zdHMnKSxcbiAgICAgICAgZ2V0SlNPTignL2NvbW1lbnRzJylcbiAgICAgIF0pLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcbiAgICAgICAgdmFsdWVzWzBdIC8vID0+IHBvc3RzSlNPTlxuICAgICAgICB2YWx1ZXNbMV0gLy8gPT4gY29tbWVudHNKU09OXG5cbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBjbGFzcyBQcm9taXNlXG4gICAgICBAcGFyYW0ge2Z1bmN0aW9ufSByZXNvbHZlclxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQGNvbnN0cnVjdG9yXG4gICAgKi9cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZShyZXNvbHZlcikge1xuICAgICAgdGhpcy5faWQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkY291bnRlcisrO1xuICAgICAgdGhpcy5fc3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9yZXN1bHQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycyA9IFtdO1xuXG4gICAgICBpZiAobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCAhPT0gcmVzb2x2ZXIpIHtcbiAgICAgICAgaWYgKCFsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24ocmVzb2x2ZXIpKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJG5lZWRzUmVzb2x2ZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZSkpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNOZXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGluaXRpYWxpemVQcm9taXNlKHRoaXMsIHJlc29sdmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5hbGwgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmFjZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJhY2UkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmVzb2x2ZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmVqZWN0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0O1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLl9zZXRTY2hlZHVsZXIgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2V0U2NoZWR1bGVyO1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLl9zZXRBc2FwID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHNldEFzYXA7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UuX2FzYXAgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcDtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnByb3RvdHlwZSA9IHtcbiAgICAgIGNvbnN0cnVjdG9yOiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZSxcblxuICAgIC8qKlxuICAgICAgVGhlIHByaW1hcnkgd2F5IG9mIGludGVyYWN0aW5nIHdpdGggYSBwcm9taXNlIGlzIHRocm91Z2ggaXRzIGB0aGVuYCBtZXRob2QsXG4gICAgICB3aGljaCByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZSdzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZVxuICAgICAgcmVhc29uIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAvLyB1c2VyIGlzIGF2YWlsYWJsZVxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gdXNlciBpcyB1bmF2YWlsYWJsZSwgYW5kIHlvdSBhcmUgZ2l2ZW4gdGhlIHJlYXNvbiB3aHlcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIENoYWluaW5nXG4gICAgICAtLS0tLS0tLVxuXG4gICAgICBUaGUgcmV0dXJuIHZhbHVlIG9mIGB0aGVuYCBpcyBpdHNlbGYgYSBwcm9taXNlLiAgVGhpcyBzZWNvbmQsICdkb3duc3RyZWFtJ1xuICAgICAgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZpcnN0IHByb21pc2UncyBmdWxmaWxsbWVudFxuICAgICAgb3IgcmVqZWN0aW9uIGhhbmRsZXIsIG9yIHJlamVjdGVkIGlmIHRoZSBoYW5kbGVyIHRocm93cyBhbiBleGNlcHRpb24uXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIHVzZXIubmFtZTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0IG5hbWUnO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodXNlck5hbWUpIHtcbiAgICAgICAgLy8gSWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGB1c2VyTmFtZWAgd2lsbCBiZSB0aGUgdXNlcidzIG5hbWUsIG90aGVyd2lzZSBpdFxuICAgICAgICAvLyB3aWxsIGJlIGAnZGVmYXVsdCBuYW1lJ2BcbiAgICAgIH0pO1xuXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScpO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gaWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGByZWFzb25gIHdpbGwgYmUgJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jy5cbiAgICAgICAgLy8gSWYgYGZpbmRVc2VyYCByZWplY3RlZCwgYHJlYXNvbmAgd2lsbCBiZSAnYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScuXG4gICAgICB9KTtcbiAgICAgIGBgYFxuICAgICAgSWYgdGhlIGRvd25zdHJlYW0gcHJvbWlzZSBkb2VzIG5vdCBzcGVjaWZ5IGEgcmVqZWN0aW9uIGhhbmRsZXIsIHJlamVjdGlvbiByZWFzb25zIHdpbGwgYmUgcHJvcGFnYXRlZCBmdXJ0aGVyIGRvd25zdHJlYW0uXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFBlZGFnb2dpY2FsRXhjZXB0aW9uKCdVcHN0cmVhbSBlcnJvcicpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBUaGUgYFBlZGdhZ29jaWFsRXhjZXB0aW9uYCBpcyBwcm9wYWdhdGVkIGFsbCB0aGUgd2F5IGRvd24gdG8gaGVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQXNzaW1pbGF0aW9uXG4gICAgICAtLS0tLS0tLS0tLS1cblxuICAgICAgU29tZXRpbWVzIHRoZSB2YWx1ZSB5b3Ugd2FudCB0byBwcm9wYWdhdGUgdG8gYSBkb3duc3RyZWFtIHByb21pc2UgY2FuIG9ubHkgYmVcbiAgICAgIHJldHJpZXZlZCBhc3luY2hyb25vdXNseS4gVGhpcyBjYW4gYmUgYWNoaWV2ZWQgYnkgcmV0dXJuaW5nIGEgcHJvbWlzZSBpbiB0aGVcbiAgICAgIGZ1bGZpbGxtZW50IG9yIHJlamVjdGlvbiBoYW5kbGVyLiBUaGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgdGhlbiBiZSBwZW5kaW5nXG4gICAgICB1bnRpbCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBzZXR0bGVkLiBUaGlzIGlzIGNhbGxlZCAqYXNzaW1pbGF0aW9uKi5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgICAgICAvLyBUaGUgdXNlcidzIGNvbW1lbnRzIGFyZSBub3cgYXZhaWxhYmxlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBJZiB0aGUgYXNzaW1saWF0ZWQgcHJvbWlzZSByZWplY3RzLCB0aGVuIHRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCBhbHNvIHJlamVjdC5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIGZ1bGZpbGxzLCB3ZSdsbCBoYXZlIHRoZSB2YWx1ZSBoZXJlXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgcmVqZWN0cywgd2UnbGwgaGF2ZSB0aGUgcmVhc29uIGhlcmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFNpbXBsZSBFeGFtcGxlXG4gICAgICAtLS0tLS0tLS0tLS0tLVxuXG4gICAgICBTeW5jaHJvbm91cyBFeGFtcGxlXG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IGZpbmRSZXN1bHQoKTtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEVycmJhY2sgRXhhbXBsZVxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFJlc3VsdChmdW5jdGlvbihyZXN1bHQsIGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAvLyBmYWlsdXJlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIGZpbmRSZXN1bHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFkdmFuY2VkIEV4YW1wbGVcbiAgICAgIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFN5bmNocm9ub3VzIEV4YW1wbGVcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgdmFyIGF1dGhvciwgYm9va3M7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF1dGhvciA9IGZpbmRBdXRob3IoKTtcbiAgICAgICAgYm9va3MgID0gZmluZEJvb2tzQnlBdXRob3IoYXV0aG9yKTtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEVycmJhY2sgRXhhbXBsZVxuXG4gICAgICBgYGBqc1xuXG4gICAgICBmdW5jdGlvbiBmb3VuZEJvb2tzKGJvb2tzKSB7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZmFpbHVyZShyZWFzb24pIHtcblxuICAgICAgfVxuXG4gICAgICBmaW5kQXV0aG9yKGZ1bmN0aW9uKGF1dGhvciwgZXJyKXtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICAvLyBmYWlsdXJlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZpbmRCb29va3NCeUF1dGhvcihhdXRob3IsIGZ1bmN0aW9uKGJvb2tzLCBlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgZm91bmRCb29rcyhib29rcyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgIGZhaWx1cmUocmVhc29uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIGZpbmRBdXRob3IoKS5cbiAgICAgICAgdGhlbihmaW5kQm9va3NCeUF1dGhvcikuXG4gICAgICAgIHRoZW4oZnVuY3Rpb24oYm9va3Mpe1xuICAgICAgICAgIC8vIGZvdW5kIGJvb2tzXG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCB0aGVuXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZ1bGZpbGxlZFxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3RlZFxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQHJldHVybiB7UHJvbWlzZX1cbiAgICAqL1xuICAgICAgdGhlbjogZnVuY3Rpb24ob25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXM7XG4gICAgICAgIHZhciBzdGF0ZSA9IHBhcmVudC5fc3RhdGU7XG5cbiAgICAgICAgaWYgKHN0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRUQgJiYgIW9uRnVsZmlsbG1lbnQgfHwgc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEICYmICFvblJlamVjdGlvbikge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IHRoaXMuY29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICAgIHZhciByZXN1bHQgPSBwYXJlbnQuX3Jlc3VsdDtcblxuICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbc3RhdGUgLSAxXTtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc3RhdGUsIGNoaWxkLCBjYWxsYmFjaywgcmVzdWx0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgfSxcblxuICAgIC8qKlxuICAgICAgYGNhdGNoYCBpcyBzaW1wbHkgc3VnYXIgZm9yIGB0aGVuKHVuZGVmaW5lZCwgb25SZWplY3Rpb24pYCB3aGljaCBtYWtlcyBpdCB0aGUgc2FtZVxuICAgICAgYXMgdGhlIGNhdGNoIGJsb2NrIG9mIGEgdHJ5L2NhdGNoIHN0YXRlbWVudC5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGZpbmRBdXRob3IoKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZG4ndCBmaW5kIHRoYXQgYXV0aG9yJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIHN5bmNocm9ub3VzXG4gICAgICB0cnkge1xuICAgICAgICBmaW5kQXV0aG9yKCk7XG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfVxuXG4gICAgICAvLyBhc3luYyB3aXRoIHByb21pc2VzXG4gICAgICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgY2F0Y2hcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0aW9uXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0aW9uKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkcG9seWZpbGwoKSB7XG4gICAgICB2YXIgbG9jYWw7XG5cbiAgICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGxvY2FsID0gZ2xvYmFsO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBsb2NhbCA9IHNlbGY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGxvY2FsID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50Jyk7XG4gICAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgUCA9IGxvY2FsLlByb21pc2U7XG5cbiAgICAgIGlmIChQICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChQLnJlc29sdmUoKSkgPT09ICdbb2JqZWN0IFByb21pc2VdJyAmJiAhUC5jYXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbG9jYWwuUHJvbWlzZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0O1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRwb2x5ZmlsbDtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlID0ge1xuICAgICAgJ1Byb21pc2UnOiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkZGVmYXVsdCxcbiAgICAgICdwb2x5ZmlsbCc6IGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdFxuICAgIH07XG5cbiAgICAvKiBnbG9iYWwgZGVmaW5lOnRydWUgbW9kdWxlOnRydWUgd2luZG93OiB0cnVlICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSkge1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gbGliJGVzNiRwcm9taXNlJHVtZCQkRVM2UHJvbWlzZTsgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGVbJ2V4cG9ydHMnXSkge1xuICAgICAgbW9kdWxlWydleHBvcnRzJ10gPSBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzWydFUzZQcm9taXNlJ10gPSBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdCgpO1xufSkuY2FsbCh0aGlzKTtcblxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJjbGFzcyBBdXRvY29tcGxldGVQcm92aWRlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihzaGVsbCkge1xyXG4gICAgICAgIHRoaXMuc2hlbGwgPSBzaGVsbDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXCJ0ZXN0XCIsIFwid29vdFwiLCBcImhpXCJdO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeUluZGV4ID0gLTE7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRpc3Bvc2UoKSB7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGN5Y2xlKGZvcndhcmQpIHtcclxuICAgICAgICBpZiAoIWZvcndhcmQgJiYgdGhpcy5oaXN0b3J5SW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlzdG9yeUluZGV4LS07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhpc3RvcnlbdGhpcy5oaXN0b3J5SW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZm9yd2FyZCAmJiB0aGlzLmhpc3RvcnkubGVuZ3RoID4gdGhpcy5oaXN0b3J5SW5kZXggKyAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlzdG9yeUluZGV4Kys7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhpc3RvcnlbdGhpcy5oaXN0b3J5SW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXV0b2NvbXBsZXRlUHJvdmlkZXI7IiwiLyohXHJcbiAqIEBvdmVydmlldyAgICBjbWRyanMgLSBBIEphdmFTY3JpcHQgYmFzZWQgY29tbWFuZCBsaW5lIGludGVyZmFjZSBmb3Igd2ViIHBhZ2VzLlxyXG4gKiBAY29weXJpZ2h0ICAgQ29weXJpZ2h0IChjKSAyMDE1IEpvaG4gQ3J1aWtzaGFuayBcclxuICogQGxpY2Vuc2UgICAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXHJcbiAqIEB2ZXJzaW9uICAgICAxLjEuMC1hbHBoYVxyXG4qL1xyXG5cclxuaW1wb3J0IHByb21pc2UgZnJvbSAnZXM2LXByb21pc2UnO1xyXG5wcm9taXNlLnBvbHlmaWxsKCk7XHJcblxyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFNoZWxsIH0gZnJvbSAnLi9zaGVsbC5qcyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgT3ZlcmxheVNoZWxsIH0gZnJvbSAnLi9vdmVybGF5LXNoZWxsLmpzJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBIaXN0b3J5UHJvdmlkZXIgfSBmcm9tICcuL2hpc3RvcnktcHJvdmlkZXIuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEF1dG9jb21wbGV0ZVByb3ZpZGVyIH0gZnJvbSAnLi9hdXRvY29tcGxldGUtcHJvdmlkZXIuanMnO1xyXG5leHBvcnQgY29uc3QgdmVyc2lvbiA9ICcxLjEuMC1hbHBoYSc7IiwiY2xhc3MgSGlzdG9yeVByb3ZpZGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHNoZWxsKSB7XHJcbiAgICAgICAgdGhpcy5zaGVsbCA9IHNoZWxsO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIHRoaXMuaGlzdG9yeUluZGV4ID0gLTE7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fcHJlZXhlY3V0ZUhhbmRsZXIgPSAoY29tbWFuZCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmhpc3RvcnkudW5zaGlmdChjb21tYW5kKTtcclxuICAgICAgICAgICAgdGhpcy5oaXN0b3J5SW5kZXggPSAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zaGVsbC5vbigncHJlZXhlY3V0ZScsIHRoaXMuX3ByZWV4ZWN1dGVIYW5kbGVyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZGlzcG9zZSgpIHtcclxuICAgICAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5zaGVsbC5vZmYoJ3ByZWV4ZWN1dGUnLCB0aGlzLl9wcmVleGVjdXRlSGFuZGxlcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGN5Y2xlKGZvcndhcmQpIHtcclxuICAgICAgICBpZiAoZm9yd2FyZCAmJiB0aGlzLmhpc3RvcnlJbmRleCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5oaXN0b3J5SW5kZXgtLTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGlzdG9yeVt0aGlzLmhpc3RvcnlJbmRleF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZm9yd2FyZCAmJiB0aGlzLmhpc3RvcnkubGVuZ3RoID4gdGhpcy5oaXN0b3J5SW5kZXggKyAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlzdG9yeUluZGV4Kys7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhpc3RvcnlbdGhpcy5oaXN0b3J5SW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xlYXIoKSB7XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5ID0gW107XHJcbiAgICAgICAgdGhpcy5oaXN0b3J5SW5kZXggPSAtMTsgIFxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBIaXN0b3J5UHJvdmlkZXI7IiwiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCBTaGVsbCBmcm9tICcuL3NoZWxsLmpzJztcclxuXHJcbmNvbnN0IF9kZWZhdWx0T3B0aW9ucyA9IHtcclxuICAgIGF1dG9PcGVuOiBmYWxzZSxcclxuICAgIG9wZW5LZXk6IDE5MixcclxuICAgIGNsb3NlS2V5OiAyN1xyXG59O1xyXG5cclxubGV0IF9pbnN0YW5jZSA9IG51bGw7XHJcblxyXG5jbGFzcyBPdmVybGF5U2hlbGwgZXh0ZW5kcyBTaGVsbCB7XHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IG92ZXJsYXlOb2RlID0gbnVsbDtcclxuICAgICAgICBpZiAoX2luc3RhbmNlKSB7XHJcbiAgICAgICAgICAgIG92ZXJsYXlOb2RlID0gX2luc3RhbmNlLl9vdmVybGF5Tm9kZTtcclxuICAgICAgICAgICAgX2luc3RhbmNlLmRpc3Bvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCFvdmVybGF5Tm9kZSkge1xyXG4gICAgICAgICAgICBvdmVybGF5Tm9kZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoJzxkaXYgc3R5bGU9XCJkaXNwbGF5OiBub25lXCIgY2xhc3M9XCJjbWRyLW92ZXJsYXlcIj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVybGF5Tm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvcHRpb25zID0gdXRpbHMuZXh0ZW5kKHt9LCBfZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICBzdXBlcihvdmVybGF5Tm9kZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fb3ZlcmxheU5vZGUgPSBvdmVybGF5Tm9kZTtcclxuICAgICAgICB0aGlzLl9kb2N1bWVudEV2ZW50SGFuZGxlciA9IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgX2luc3RhbmNlID0gdGhpcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IGlzT3BlbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fb3ZlcmxheU5vZGUuc3R5bGUuZGlzcGxheSAhPT0gJ25vbmUnO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fZG9jdW1lbnRFdmVudEhhbmRsZXIgPSAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzT3BlbiAmJlxyXG4gICAgICAgICAgICAgICAgWydJTlBVVCcsICdURVhUQVJFQScsICdTRUxFQ1QnXS5pbmRleE9mKGV2ZW50LnRhcmdldC50YWdOYW1lKSA9PT0gLTEgJiZcclxuICAgICAgICAgICAgICAgICFldmVudC50YXJnZXQuaXNDb250ZW50RWRpdGFibGUgJiZcclxuICAgICAgICAgICAgICAgIGV2ZW50LmtleUNvZGUgPT0gdGhpcy5vcHRpb25zLm9wZW5LZXkpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmlzT3BlbiAmJiBldmVudC5rZXlDb2RlID09IHRoaXMub3B0aW9ucy5jbG9zZUtleSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2RvY3VtZW50RXZlbnRIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgc3VwZXIuaW5pdCgpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9PcGVuKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkaXNwb3NlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pbml0aWFsaXplZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fZG9jdW1lbnRFdmVudEhhbmRsZXIpO1xyXG5cclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcblxyXG4gICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuKCkge1xyXG4gICAgICAgIHRoaXMuX292ZXJsYXlOb2RlLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldFByb21wdEluZGVudCgpOyAgLy9oYWNrOiB1c2luZyAncHJpdmF0ZScgbWV0aG9kIGZyb20gYmFzZSBjbGFzcyB0byBmaXggaW5kZW50XHJcbiAgICAgICAgICAgIHRoaXMuZm9jdXMoKTtcclxuICAgICAgICB9LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSgpIHtcclxuICAgICAgICB0aGlzLl9vdmVybGF5Tm9kZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuYmx1cigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByZWRlZmluZSgpIHtcclxuICAgICAgICBzdXBlci5wcmVkZWZpbmUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5kZWZpbmUoWydDTE9TRScsICdFWElUJ10sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5zaGVsbC5jbG9zZSgpO1xyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ2xvc2VzIHRoZSBjb21tYW5kIHByb21wdCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE92ZXJsYXlTaGVsbDsiLCJpbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IEhpc3RvcnlQcm92aWRlciBmcm9tICcuL2hpc3RvcnktcHJvdmlkZXIuanMnO1xyXG5pbXBvcnQgQXV0b2NvbXBsZXRlUHJvdmlkZXIgZnJvbSAnLi9hdXRvY29tcGxldGUtcHJvdmlkZXIuanMnO1xyXG5cclxuY29uc3QgX2RlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgYXV0b0luaXQ6IHRydWUsXHJcbiAgICBlY2hvOiB0cnVlLFxyXG4gICAgZGVmYXVsdFByb21wdFByZWZpeDogJz4nLFxyXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiY21kci1zaGVsbFwiPjxkaXYgY2xhc3M9XCJvdXRwdXRcIj48L2Rpdj48ZGl2IGNsYXNzPVwiaW5wdXRcIj48c3BhbiBjbGFzcz1cInByZWZpeFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwicHJvbXB0XCIgc3BlbGxjaGVjaz1cImZhbHNlXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiIC8+PC9kaXY+PC9kaXY+JyxcclxuICAgIHByZWRlZmluZWRDb21tYW5kczogdHJ1ZSxcclxuICAgIGFiYnJldmlhdGVkQ29tbWFuZHM6IHRydWUgICAgXHJcbn07XHJcblxyXG5jb25zdCBfcHJvbXB0SW5kZW50UGFkZGluZyA9IHR5cGVvZiBJbnN0YWxsVHJpZ2dlciAhPT0gJ3VuZGVmaW5lZCc7IC8vIEZpcmVmb3ggLSBtaXNwbGFjZWQgY3Vyc29yIHdoZW4gdXNpbmcgJ3RleHQtaW5kZW50J1xyXG5cclxuY2xhc3MgU2hlbGwge1xyXG4gICAgY29uc3RydWN0b3IoY29udGFpbmVyTm9kZSwgb3B0aW9ucykge1xyXG4gICAgICAgIGlmICghY29udGFpbmVyTm9kZSB8fCAhdXRpbHMuaXNFbGVtZW50KGNvbnRhaW5lck5vZGUpKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdcImNvbnRhaW5lck5vZGVcIiBtdXN0IGJlIGFuIEhUTUxFbGVtZW50Lic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSB1dGlscy5leHRlbmQoe30sIF9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyTm9kZSA9IGNvbnRhaW5lck5vZGU7XHJcbiAgICAgICAgdGhpcy5fc2hlbGxOb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3ByZWZpeE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX291dHB1dE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX291dHB1dExpbmVOb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9kZWZpbml0aW9ucyA9IHt9O1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3F1ZXVlID0gW107XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0UHJlZml4ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pc0lucHV0SW5saW5lID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlVmFsdWUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnMgPSB7fTtcclxuICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlciA9IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuYXV0b0luaXQpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXQgaXNJbml0aWFsaXplZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNJbml0aWFsaXplZDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IG9wdGlvbnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGRlZmluaXRpb25zKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kZWZpbml0aW9ucztcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IHByb21wdFByZWZpeCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvbXB0UHJlZml4O1xyXG4gICAgfVxyXG4gICAgc2V0IHByb21wdFByZWZpeCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX3Byb21wdFByZWZpeCA9IHZhbHVlO1xyXG4gICAgICAgIGlmICghdGhpcy5faXNJbnB1dElubGluZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3NldFByb21wdEluZGVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IGhpc3RvcnlQcm92aWRlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faGlzdG9yeVByb3ZpZGVyO1xyXG4gICAgfVxyXG4gICAgc2V0IGhpc3RvcnlQcm92aWRlcih2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX2hpc3RvcnlQcm92aWRlciA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXQgYXV0b2NvbXBsZXRlUHJvdmlkZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyO1xyXG4gICAgfVxyXG4gICAgc2V0IGF1dG9jb21wbGV0ZVByb3ZpZGVyKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNJbml0aWFsaXplZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fc2hlbGxOb2RlID0gdXRpbHMuY3JlYXRlRWxlbWVudCh0aGlzLl9vcHRpb25zLnRlbXBsYXRlKTtcclxuXHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyTm9kZS5hcHBlbmRDaGlsZCh0aGlzLl9zaGVsbE5vZGUpO1xyXG5cclxuICAgICAgICB0aGlzLl9vdXRwdXROb2RlID0gdGhpcy5fc2hlbGxOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5vdXRwdXQnKTtcclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUgPSB0aGlzLl9zaGVsbE5vZGUucXVlcnlTZWxlY3RvcignLmlucHV0Jyk7XHJcbiAgICAgICAgdGhpcy5fcHJlZml4Tm9kZSA9IHRoaXMuX3NoZWxsTm9kZS5xdWVyeVNlbGVjdG9yKCcucHJlZml4Jyk7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZSA9IHRoaXMuX3NoZWxsTm9kZS5xdWVyeVNlbGVjdG9yKCcucHJvbXB0Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhldmVudC5rZXlDb2RlKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSAhPT0gOSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxMzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4ZWN1dGUodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM4OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9oaXN0b3J5Q3ljbGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0MDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlzdG9yeUN5Y2xlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVDeWNsZSghZXZlbnQuc2hpZnRLZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fY3VycmVudC5yZWFkTGluZSAmJiBldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkTGluZS5yZXNvbHZlKHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJyZW50ICYmIHRoaXMuX2N1cnJlbnQucmVhZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmNoYXJDb2RlICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkLmNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LmNoYXJDb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fY3VycmVudC5yZWFkLmNhcHR1cmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fY3VycmVudCAmJiB0aGlzLl9jdXJyZW50LnJlYWQgJiYgdGhpcy5fY3VycmVudC5yZWFkLmNoYXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZC5yZXNvbHZlKHRoaXMuX2N1cnJlbnQucmVhZC5jaGFyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ3Bhc3RlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGluZXMgPSB2YWx1ZS5zcGxpdCgvXFxyXFxufFxccnxcXG4vZyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGVuZ3RoID0gbGluZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaW5lc1tpXS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9xdWV1ZS5nZXQodGhpcykucHVzaChsaW5lc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnQgJiYgdGhpcy5fY3VycmVudC5yZWFkTGluZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lLnJlc29sdmUobGluZXNbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fY3VycmVudCAmJiB0aGlzLl9jdXJyZW50LnJlYWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkLnJlc29sdmUobGluZXNbMF1bMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQobGluZXNbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChfcHJvbXB0SW5kZW50UGFkZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcHJvbXB0LmNzcyh0aGlzLl9nZXRQcm9tcHRJbmRlbnQoKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fc2hlbGxOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgIT09IHRoaXMuX2lucHV0Tm9kZSAmJiAhdGhpcy5faW5wdXROb2RlLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkgJiZcclxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldCAhPT0gdGhpcy5fb3V0cHV0Tm9kZSAmJiAhdGhpcy5fb3V0cHV0Tm9kZS5jb250YWlucyhldmVudC50YXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMucHJlZGVmaW5lZENvbW1hbmRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJlZGVmaW5lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICghdGhpcy5faGlzdG9yeVByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hpc3RvcnlQcm92aWRlciA9IG5ldyBIaXN0b3J5UHJvdmlkZXIodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIgPSBuZXcgQXV0b2NvbXBsZXRlUHJvdmlkZXIodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3Byb21wdFByZWZpeCA9IHRoaXMuX29wdGlvbnMuZGVmYXVsdFByb21wdFByZWZpeDtcclxuXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVJbnB1dCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0luaXRpYWxpemVkKSByZXR1cm47XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyTm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9zaGVsbE5vZGUpO1xyXG4gICAgICAgIHRoaXMuX3NoZWxsTm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5faW5wdXROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9wcmVmaXhOb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9kZWZpbml0aW9ucyA9IHt9O1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3F1ZXVlID0gW107XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0UHJlZml4ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pc0lucHV0SW5saW5lID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVycyA9IHt9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLl9oaXN0b3J5UHJvdmlkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gZmFsc2U7ICAgICAgXHJcbiAgICB9XHJcbiAgICAgICAgXHJcbiAgICByZXNldCgpIHtcclxuICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICByZWFkKGNhbGxiYWNrLCBjYXB0dXJlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlSW5wdXQodHJ1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZCA9IHV0aWxzLmRlZmVyKCk7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkLnRoZW4oKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZCA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmICghY2FwdHVyZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2RlYWN0aXZhdGVJbnB1dCgpO1xyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sodmFsdWUsIHRoaXMuX2N1cnJlbnQpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWQoY2FsbGJhY2ssIGNhcHR1cmUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZmx1c2hJbnB1dCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkLmNhcHR1cmUgPSBjYXB0dXJlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fcXVldWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWQucmVzb2x2ZSh0aGlzLl9xdWV1ZS5zaGlmdCgpWzBdKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVhZExpbmUoY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2N1cnJlbnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVJbnB1dCh0cnVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkTGluZSA9IHV0aWxzLmRlZmVyKCk7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkTGluZS50aGVuKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl9kZWFjdGl2YXRlSW5wdXQoKTtcclxuICAgICAgICAgICAgdGhpcy5fZmx1c2hJbnB1dCgpO1xyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sodmFsdWUsIHRoaXMuX2N1cnJlbnQpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWRMaW5lKGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fcXVldWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lLnJlc29sdmUodGhpcy5fcXVldWUuc2hpZnQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdyaXRlKHZhbHVlLCBjc3NDbGFzcykge1xyXG4gICAgICAgIHZhbHVlID0gdmFsdWUgfHwgJyc7XHJcbiAgICAgICAgbGV0IG91dHB1dFZhbHVlID0gdXRpbHMuY3JlYXRlRWxlbWVudChgPHNwYW4gY2xhc3M9XCIke2Nzc0NsYXNzfVwiPiR7dmFsdWV9PC9zcGFuPmApO1xyXG4gICAgICAgIGlmICghdGhpcy5fb3V0cHV0TGluZU5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fb3V0cHV0TGluZU5vZGUgPSB1dGlscy5jcmVhdGVFbGVtZW50KCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICB0aGlzLl9vdXRwdXROb2RlLmFwcGVuZENoaWxkKHRoaXMuX291dHB1dExpbmVOb2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0TGluZU5vZGUuYXBwZW5kQ2hpbGQob3V0cHV0VmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHdyaXRlTGluZSh2YWx1ZSwgY3NzQ2xhc3MpIHtcclxuICAgICAgICB2YWx1ZSA9ICh2YWx1ZSB8fCAnJykgKyAnXFxuJztcclxuICAgICAgICB0aGlzLndyaXRlKHZhbHVlLCBjc3NDbGFzcyk7XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0TGluZU5vZGUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHdyaXRlUGFkKHZhbHVlLCBwYWRkaW5nLCBsZW5ndGgsIGNzc0NsYXNzKSB7XHJcbiAgICAgICAgdGhpcy53cml0ZSh1dGlscy5wYWQodmFsdWUsIHBhZGRpbmcsIGxlbmd0aCksIGNzc0NsYXNzKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGVhcigpIHtcclxuICAgICAgICB0aGlzLl9vdXRwdXROb2RlLmlubmVySFRNTCA9ICcnO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBmb2N1cygpIHtcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmZvY3VzKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGJsdXIoKSB7XHJcbiAgICAgICAgdXRpbHMuYmx1cih0aGlzLl9wcm9tcHROb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBleGVjdXRlKGNvbW1hbmQpIHtcclxuICAgICAgICBpZiAodGhpcy5fY3VycmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9xdWV1ZS5wdXNoKGNvbW1hbmQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGNvbW1hbmQgIT09ICdzdHJpbmcnIHx8IGNvbW1hbmQubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdJbnZhbGlkIGNvbW1hbmQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl90cmlnZ2VyKCdwcmVleGVjdXRlJywgY29tbWFuZCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCA9IGNvbW1hbmQ7XHJcbiAgICAgICAgdGhpcy5fZmx1c2hJbnB1dCghdGhpcy5fb3B0aW9ucy5lY2hvKTtcclxuICAgICAgICB0aGlzLl9kZWFjdGl2YXRlSW5wdXQoKTtcclxuXHJcbiAgICAgICAgY29tbWFuZCA9IGNvbW1hbmQudHJpbSgpO1xyXG5cclxuICAgICAgICBsZXQgcGFyc2VkID0gdGhpcy5fcGFyc2VDb21tYW5kKGNvbW1hbmQpO1xyXG5cclxuICAgICAgICBsZXQgZGVmaW5pdGlvbnMgPSB0aGlzLl9nZXREZWZpbml0aW9ucyhwYXJzZWQubmFtZSk7XHJcbiAgICAgICAgaWYgKCFkZWZpbml0aW9ucyB8fCBkZWZpbml0aW9ucy5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCdJbnZhbGlkIGNvbW1hbmQnLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgdGhpcy5fYWN0aXZhdGVJbnB1dCgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSBlbHNlIGlmIChkZWZpbml0aW9ucy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCdBbWJpZ3VvdXMgY29tbWFuZCcsICdlcnJvcicpO1xyXG4gICAgICAgICAgICB0aGlzLndyaXRlTGluZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZmluaXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlUGFkKGRlZmluaXRpb25zW2ldLm5hbWUsICcgJywgMTApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZUxpbmUoZGVmaW5pdGlvbnNbaV0uZGVzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2FjdGl2YXRlSW5wdXQoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGRlZmluaXRpb24gPSBkZWZpbml0aW9uc1swXTtcclxuXHJcbiAgICAgICAgdGhpcy5fY3VycmVudCA9IHtcclxuICAgICAgICAgICAgY29tbWFuZDogY29tbWFuZCxcclxuICAgICAgICAgICAgZGVmaW5pdGlvbjogZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgc2hlbGw6IHRoaXNcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBhcmdzID0gcGFyc2VkLmFyZ3M7XHJcbiAgICAgICAgaWYgKCFkZWZpbml0aW9uLnBhcnNlKSB7XHJcbiAgICAgICAgICAgIGFyZ3MgPSBbcGFyc2VkLmFyZ107XHJcbiAgICAgICAgfSAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl90cmlnZ2VyKCdleGVjdXRpbmcnLCB0aGlzLl9jdXJyZW50KTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdDtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBkZWZpbml0aW9uLmNhbGxiYWNrLmFwcGx5KHRoaXMuX2N1cnJlbnQsIGFyZ3MpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCdVbmhhbmRsZWQgZXhjZXB0aW9uLiBTZWUgYnJvd3NlciBjb25zb2xlIGxvZyBmb3IgZGV0YWlscy4nLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBQcm9taXNlLmFsbChbcmVzdWx0XSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdHJpZ2dlcignZXhlY3V0ZScsIHRoaXMuX2N1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3RpdmF0ZUlucHV0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fcXVldWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhlY3V0ZSh0aGlzLl9xdWV1ZS5zaGlmdCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZGVmaW5lKG5hbWVzLCBjYWxsYmFjaywgb3B0aW9ucykge1xyXG4gICAgICAgIGxldCBkZWZpbml0aW9ucyA9IHRoaXMuX2NyZWF0ZURlZmluaXRpb25zKG5hbWVzLCBjYWxsYmFjaywgb3B0aW9ucyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSBkZWZpbml0aW9ucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5fZGVmaW5pdGlvbnNbZGVmaW5pdGlvbnNbaV0ubmFtZV0gPSBkZWZpbml0aW9uc1tpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHByZWRlZmluZSgpIHtcclxuICAgICAgICB0aGlzLmRlZmluZShbJ0hFTFAnLCAnPyddLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hlbGwud3JpdGVMaW5lKCdUaGUgZm9sbG93aW5nIGNvbW1hbmRzIGFyZSBhdmFpbGFibGU6Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuc2hlbGwud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiB0aGlzLnNoZWxsLmRlZmluaXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGVmaW5pdGlvbiA9IHRoaXMuc2hlbGwuZGVmaW5pdGlvbnNba2V5XTtcclxuICAgICAgICAgICAgICAgIGlmICghIXV0aWxzLnVud3JhcChkZWZpbml0aW9uLmF2YWlsYWJsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNoZWxsLndyaXRlUGFkKGtleSwgJyAnLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVsbC53cml0ZUxpbmUoZGVmaW5pdGlvbi5kZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zaGVsbC53cml0ZUxpbmUoKTtcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0xpc3RzIHRoZSBhdmFpbGFibGUgY29tbWFuZHMnXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmRlZmluZSgnRUNITycsIGZ1bmN0aW9uIChhcmcpIHtcclxuICAgICAgICAgICAgbGV0IHRvZ2dsZSA9IGFyZy50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgICAgICBpZiAodG9nZ2xlID09PSAnT04nKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWxsLm9wdGlvbnMuZWNobyA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodG9nZ2xlID09PSAnT0ZGJykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaGVsbC5vcHRpb25zLmVjaG8gPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hlbGwud3JpdGVMaW5lKGFyZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc3BsYXlzIHByb3ZpZGVkIHRleHQgb3IgdG9nZ2xlcyBjb21tYW5kIGVjaG9pbmcnXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmRlZmluZShbJ0NMUyddLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hlbGwuY2xlYXIoKTtcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NsZWFycyB0aGUgY29tbWFuZCBwcm9tcHQnXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9uKGV2ZW50LCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcclxuICAgICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0ucHVzaChjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgb2ZmKGV2ZW50LCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XS5pbmRleE9mKGNhbGxiYWNrKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgX3RyaWdnZXIoZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdKSByZXR1cm47XHJcbiAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcclxuICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX2FjdGl2YXRlSW5wdXQoaW5saW5lKSB7XHJcbiAgICAgICAgaWYgKGlubGluZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fb3V0cHV0TGluZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUudGV4dENvbnRlbnQgPSB0aGlzLl9vdXRwdXRMaW5lTm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX291dHB1dE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fb3V0cHV0TGluZU5vZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb3V0cHV0TGluZU5vZGUgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2lzSW5wdXRJbmxpbmUgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUudGV4dENvbnRlbnQgPSB0aGlzLl9wcm9tcHRQcmVmaXg7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzSW5wdXRJbmxpbmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faW5wdXROb2RlLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLl9zZXRQcm9tcHRJbmRlbnQoKTtcclxuICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5mb2N1cygpO1xyXG4gICAgICAgICAgICB1dGlscy5zbW9vdGhTY3JvbGwodGhpcy5fc2hlbGxOb2RlLCB0aGlzLl9zaGVsbE5vZGUuc2Nyb2xsSGVpZ2h0LCAxMDAwKTtcclxuICAgICAgICB9LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBfZGVhY3RpdmF0ZUlucHV0KCkge1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuX2lucHV0Tm9kZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfVxyXG5cclxuICAgIF9mbHVzaElucHV0KHByZXZlbnRXcml0ZSkge1xyXG4gICAgICAgIGlmICghcHJldmVudFdyaXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGUodGhpcy5fcHJlZml4Tm9kZS50ZXh0Q29udGVudCk7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCA9ICcnO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBfaGlzdG9yeUN5Y2xlKGZvcndhcmQpIHtcclxuICAgICAgICBQcm9taXNlLmFsbChbdGhpcy5faGlzdG9yeVByb3ZpZGVyLmN5Y2xlKGZvcndhcmQpXSkudGhlbigodmFsdWVzKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBjb21tYW5kID0gdmFsdWVzWzBdO1xyXG4gICAgICAgICAgICBpZiAoY29tbWFuZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCA9IGNvbW1hbmQ7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5jdXJzb3JUb0VuZCh0aGlzLl9wcm9tcHROb2RlKTtcclxuICAgICAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQodGhpcy5fcHJvbXB0Tm9kZSwgJ2NoYW5nZScsIHRydWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBfYXV0b2NvbXBsZXRlQ3ljbGUoZm9yd2FyZCkge1xyXG4gICAgICAgIGxldCBpbnB1dCA9IHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgY29uc29sZS5sb2coaW5wdXQpO1xyXG4gICAgICAgIGxldCBjdXJzb3JQb3NpdGlvbiA9IHV0aWxzLmdldEN1cnNvclBvc2l0aW9uKHRoaXMuX3Byb21wdE5vZGUpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGN1cnNvclBvc2l0aW9uKTtcclxuICAgICAgICBsZXQgc3RhcnRJbmRleCA9IGlucHV0Lmxhc3RJbmRleE9mKCcgJykgKyAxO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHN0YXJ0SW5kZXgpO1xyXG4gICAgICAgIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4ICE9PSAtMSA/IHN0YXJ0SW5kZXggOiAwO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHN0YXJ0SW5kZXgpO1xyXG4gICAgICAgIGlmICh0aGlzLl9hdXRvY29tcGxldGVWYWx1ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgZW5kSW5kZXggPSBpbnB1dC5pbmRleE9mKCcgJywgc3RhcnRJbmRleCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVuZEluZGV4KTtcclxuICAgICAgICAgICAgZW5kSW5kZXggPSBlbmRJbmRleCAhPT0gLTEgPyBlbmRJbmRleCA6IGlucHV0Lmxlbmd0aDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZW5kSW5kZXgpO1xyXG4gICAgICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVWYWx1ZSA9IGlucHV0LnN1YnN0cmluZyhzdGFydEluZGV4LCBlbmRJbmRleCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuX2F1dG9jb21wbGV0ZVZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgUHJvbWlzZS5hbGwoW3RoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyLmN5Y2xlKGZvcndhcmQsIHRoaXMuX2F1dG9jb21wbGV0ZVZhbHVlKV0pLnRoZW4oKHZhbHVlcykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB2YWx1ZXNbMF07XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCA9IGlucHV0LnN1YnN0cmluZygwLCBzdGFydEluZGV4KSArIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCk7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5jdXJzb3JUb0VuZCh0aGlzLl9wcm9tcHROb2RlKTtcclxuICAgICAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQodGhpcy5fcHJvbXB0Tm9kZSwgJ2NoYW5nZScsIHRydWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBfYXV0b2NvbXBsZXRlUmVzZXQoKSB7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlVmFsdWUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIF9wYXJzZUNvbW1hbmQoY29tbWFuZCkge1xyXG4gICAgICAgIGxldCBleHAgPSAvW15cXHNcIl0rfFwiKFteXCJdKilcIi9naSxcclxuICAgICAgICAgICAgbmFtZSA9IG51bGwsXHJcbiAgICAgICAgICAgIGFyZyA9IG51bGwsXHJcbiAgICAgICAgICAgIGFyZ3MgPSBbXSxcclxuICAgICAgICAgICAgbWF0Y2ggPSBudWxsO1xyXG5cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIG1hdGNoID0gZXhwLmV4ZWMoY29tbWFuZCk7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gbWF0Y2hbMV0gPyBtYXRjaFsxXSA6IG1hdGNoWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoLmluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZyA9IGNvbW1hbmQuc3Vic3RyKHZhbHVlLmxlbmd0aCArIChtYXRjaFsxXSA/IDMgOiAxKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IHdoaWxlIChtYXRjaCAhPT0gbnVsbCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgICAgIGFyZzogYXJnLFxyXG4gICAgICAgICAgICBhcmdzOiBhcmdzXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBfY3JlYXRlRGVmaW5pdGlvbnMobmFtZXMsIGNhbGxiYWNrLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lcyAhPT0gJ3N0cmluZycgJiYgIUFycmF5LmlzQXJyYXkobmFtZXMpKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSBjYWxsYmFjaztcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBuYW1lcztcclxuICAgICAgICAgICAgbmFtZXMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSBjYWxsYmFjaztcclxuICAgICAgICAgICAgY2FsbGJhY2sgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lcyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgbmFtZXMgPSBbbmFtZXNdO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShuYW1lcykpIHtcclxuICAgICAgICAgICAgbmFtZXMgPSBuYW1lcy5maWx0ZXIoZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkobmFtZXMpIHx8XHJcbiAgICAgICAgICAgIG5hbWVzLmxlbmd0aCA9PT0gMCB8fFxyXG4gICAgICAgICAgICB0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgY29tbWFuZCBkZWZpbml0aW9uJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBkZWZpbml0aW9ucyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbCA9IG5hbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZGVmaW5pdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVzW2ldLnRvVXBwZXJDYXNlKCksXHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgICAgICBwYXJzZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGF2YWlsYWJsZTogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdXRpbHMuZXh0ZW5kKGRlZmluaXRpb24sIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgZGVmaW5pdGlvbnMucHVzaChkZWZpbml0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZpbml0aW9ucztcclxuICAgIH1cclxuXHJcbiAgICBfZ2V0RGVmaW5pdGlvbnMobmFtZSkge1xyXG4gICAgICAgIG5hbWUgPSBuYW1lLnRvVXBwZXJDYXNlKCk7XHJcblxyXG4gICAgICAgIGxldCBkZWZpbml0aW9uID0gdGhpcy5fZGVmaW5pdGlvbnNbbmFtZV07XHJcblxyXG4gICAgICAgIGlmIChkZWZpbml0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbZGVmaW5pdGlvbl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBkZWZpbml0aW9ucyA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLmFiYnJldmlhdGVkQ29tbWFuZHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGhpcy5fZGVmaW5pdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihuYW1lLCAwKSA9PT0gMCAmJiB1dGlscy51bndyYXAodGhpcy5fZGVmaW5pdGlvbnNba2V5XS5hdmFpbGFibGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmaW5pdGlvbnMucHVzaCh0aGlzLl9kZWZpbml0aW9uc1trZXldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmluaXRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIF9nZXRQcmVmaXhXaWR0aCgpIHtcclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLl9wcmVmaXhOb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gICAgICAgIGxldCB0ZXh0ID0gdGhpcy5fcHJlZml4Tm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICBsZXQgc3BhY2VQYWRkaW5nID0gdGV4dC5sZW5ndGggLSB0ZXh0LnRyaW0oKS5sZW5ndGg7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5fcHJlZml4Tm9kZS5fc3BhY2VXaWR0aCkge1xyXG4gICAgICAgICAgICBsZXQgZWxlbTEgPSB1dGlscy5jcmVhdGVFbGVtZW50KCc8c3BhbiBzdHlsZT1cInZpc2liaWxpdHk6IGhpZGRlblwiPnwgfDwvc3Bhbj4nKTtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5hcHBlbmRDaGlsZChlbGVtMSk7XHJcbiAgICAgICAgICAgIGxldCBlbGVtMiA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoJzxzcGFuIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuXCI+fHw8L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUuYXBwZW5kQ2hpbGQoZWxlbTIpO1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLl9zcGFjZVdpZHRoID0gZWxlbTEub2Zmc2V0V2lkdGggLSBlbGVtMi5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5yZW1vdmVDaGlsZChlbGVtMSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUucmVtb3ZlQ2hpbGQoZWxlbTIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2lkdGggKz0gc3BhY2VQYWRkaW5nICogdGhpcy5fcHJlZml4Tm9kZS5fc3BhY2VXaWR0aDtcclxuICAgICAgICByZXR1cm4gd2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgX3NldFByb21wdEluZGVudCgpIHtcclxuICAgICAgICBsZXQgcHJlZml4V2lkdGggPSB0aGlzLl9nZXRQcmVmaXhXaWR0aCgpICsgJ3B4JztcclxuICAgICAgICBpZiAoX3Byb21wdEluZGVudFBhZGRpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Byb21wdE5vZGUuc3R5bGUudGV4dEluZGVudCA9IHByZWZpeFdpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5zdHlsZS5wYWRkaW5nTGVmdCA9ICcnO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5zdHlsZS50ZXh0SW5kZW50ID0gJyc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnN0eWxlLnBhZGRpbmdMZWZ0ID0gcHJlZml4V2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb21wdE5vZGUuc3R5bGUudGV4dEluZGVudCA9IHByZWZpeFdpZHRoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2hlbGw7IiwiZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZChvdXQpIHtcclxuICAgIG91dCA9IG91dCB8fCB7fTtcclxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IG9iaiA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICBpZiAoIW9iaikgY29udGludWU7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIG9iaikge1xyXG4gICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICdvYmplY3QnKVxyXG4gICAgICAgICAgICAgICAgICAgIGV4dGVuZChvdXRba2V5XSwgb2JqW2tleV0pO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIG91dFtrZXldID0gb2JqW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRWxlbWVudChodG1sKSB7XHJcbiAgICBsZXQgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgd3JhcHBlci5pbm5lckhUTUwgPSBodG1sO1xyXG4gICAgcmV0dXJuIHdyYXBwZXIuZmlyc3RDaGlsZDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhZCh2YWx1ZSwgcGFkZGluZywgbGVuZ3RoKSB7XHJcbiAgICBsZXQgcmlnaHQgPSBsZW5ndGggPj0gMDtcclxuICAgIGxlbmd0aCA9IE1hdGguYWJzKGxlbmd0aCk7XHJcbiAgICB3aGlsZSAodmFsdWUubGVuZ3RoIDwgbGVuZ3RoKSB7XHJcbiAgICAgICAgdmFsdWUgPSByaWdodCA/IHZhbHVlICsgcGFkZGluZyA6IHBhZGRpbmcgKyB2YWx1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVud3JhcCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyA/IHZhbHVlKCkgOiB2YWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNtb290aFNjcm9sbChlbGVtZW50LCB0YXJnZXQsIGR1cmF0aW9uKSB7XHJcbiAgICB0YXJnZXQgPSBNYXRoLnJvdW5kKHRhcmdldCk7XHJcbiAgICBkdXJhdGlvbiA9IE1hdGgucm91bmQoZHVyYXRpb24pO1xyXG4gICAgaWYgKGR1cmF0aW9uIDwgMCkge1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChcIkludmFsaWQgZHVyYXRpb25cIik7XHJcbiAgICB9XHJcbiAgICBpZiAoZHVyYXRpb24gPT09IDApIHtcclxuICAgICAgICBlbGVtZW50LnNjcm9sbFRvcCA9IHRhcmdldDtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgZW5kVGltZSA9IHN0YXJ0VGltZSArIGR1cmF0aW9uO1xyXG5cclxuICAgIGxldCBzdGFydFRvcCA9IGVsZW1lbnQuc2Nyb2xsVG9wO1xyXG4gICAgbGV0IGRpc3RhbmNlID0gdGFyZ2V0IC0gc3RhcnRUb3A7XHJcblxyXG4gICAgbGV0IHNtb290aFN0ZXAgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCwgcG9pbnQpIHtcclxuICAgICAgICBpZiAocG9pbnQgPD0gc3RhcnQpIHsgcmV0dXJuIDA7IH1cclxuICAgICAgICBpZiAocG9pbnQgPj0gZW5kKSB7IHJldHVybiAxOyB9XHJcbiAgICAgICAgbGV0IHggPSAocG9pbnQgLSBzdGFydCkgLyAoZW5kIC0gc3RhcnQpO1xyXG4gICAgICAgIHJldHVybiB4ICogeCAqICgzIC0gMiAqIHgpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGxldCBwcmV2aW91c1RvcCA9IGVsZW1lbnQuc2Nyb2xsVG9wO1xyXG5cclxuICAgICAgICBsZXQgc2Nyb2xsRnJhbWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnNjcm9sbFRvcCAhPSBwcmV2aW91c1RvcCkge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KFwiaW50ZXJydXB0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICBsZXQgcG9pbnQgPSBzbW9vdGhTdGVwKHN0YXJ0VGltZSwgZW5kVGltZSwgbm93KTtcclxuICAgICAgICAgICAgbGV0IGZyYW1lVG9wID0gTWF0aC5yb3VuZChzdGFydFRvcCArIChkaXN0YW5jZSAqIHBvaW50KSk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsVG9wID0gZnJhbWVUb3A7XHJcblxyXG4gICAgICAgICAgICBpZiAobm93ID49IGVuZFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuc2Nyb2xsVG9wID09PSBwcmV2aW91c1RvcCAmJiBlbGVtZW50LnNjcm9sbFRvcCAhPT0gZnJhbWVUb3ApIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcmV2aW91c1RvcCA9IGVsZW1lbnQuc2Nyb2xsVG9wO1xyXG5cclxuICAgICAgICAgICAgc2V0VGltZW91dChzY3JvbGxGcmFtZSwgMCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dChzY3JvbGxGcmFtZSwgMCk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZmVyKCkge1xyXG4gICAgZnVuY3Rpb24gRGVmZXJyZWQoKSB7XHJcbiAgICAgICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xyXG4gICAgICAgICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy50aGVuID0gdGhpcy5wcm9taXNlLnRoZW4uYmluZCh0aGlzLnByb21pc2UpO1xyXG4gICAgICAgIHRoaXMuY2F0Y2ggPSB0aGlzLnByb21pc2UuY2F0Y2guYmluZCh0aGlzLnByb21pc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgRGVmZXJyZWQoKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGJsdXIoZWxlbWVudCA9IG51bGwpIHtcclxuICAgIGlmIChlbGVtZW50ICYmIGVsZW1lbnQgIT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHJldHVybjtcclxuICAgIGxldCB0ZW1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZW1wKTtcclxuICAgIHRlbXAuZm9jdXMoKTtcclxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGVtcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0VsZW1lbnQob2JqKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIEhUTUxFbGVtZW50ID09PSBcIm9iamVjdFwiID8gXHJcbiAgICAgICAgb2JqIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgOiBcclxuICAgICAgICBvYmogJiYgdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBvYmogIT09IG51bGwgJiYgb2JqLm5vZGVUeXBlID09PSAxICYmIHR5cGVvZiBvYmoubm9kZU5hbWUgPT09IFwic3RyaW5nXCI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjdXJzb3JUb0VuZChlbGVtZW50KSB7XHJcbiAgICBsZXQgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xyXG4gICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xyXG4gICAgcmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xyXG4gICAgbGV0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgIHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJzb3JQb3NpdGlvbihlbGVtZW50KSB7XHJcbiAgICBsZXQgcG9zID0gMDtcclxuICAgIGxldCBkb2MgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQgfHwgZWxlbWVudC5kb2N1bWVudDtcclxuICAgIGxldCB3aW4gPSBkb2MuZGVmYXVsdFZpZXcgfHwgZG9jLnBhcmVudFdpbmRvdztcclxuICAgIGxldCBzZWw7XHJcbiAgICBpZiAodHlwZW9mIHdpbi5nZXRTZWxlY3Rpb24gIT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHNlbCA9IHdpbi5nZXRTZWxlY3Rpb24oKTtcclxuICAgICAgICBpZiAoc2VsLnJhbmdlQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCByYW5nZSA9IHdpbi5nZXRTZWxlY3Rpb24oKS5nZXRSYW5nZUF0KDApO1xyXG4gICAgICAgICAgICBsZXQgcHJlQ3Vyc29yUmFuZ2UgPSByYW5nZS5jbG9uZVJhbmdlKCk7XHJcbiAgICAgICAgICAgIHByZUN1cnNvclJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbGVtZW50KTtcclxuICAgICAgICAgICAgcHJlQ3Vyc29yUmFuZ2Uuc2V0RW5kKHJhbmdlLmVuZENvbnRhaW5lciwgcmFuZ2UuZW5kT2Zmc2V0KTtcclxuICAgICAgICAgICAgcG9zID0gcHJlQ3Vyc29yUmFuZ2UudG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICgoc2VsID0gZG9jLnNlbGVjdGlvbikgJiYgc2VsLnR5cGUgIT0gXCJDb250cm9sXCIpIHtcclxuICAgICAgICBsZXQgdGV4dFJhbmdlID0gc2VsLmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgICAgbGV0IHByZUN1cnNvclRleHRSYW5nZSA9IGRvYy5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xyXG4gICAgICAgIHByZUN1cnNvclRleHRSYW5nZS5tb3ZlVG9FbGVtZW50VGV4dChlbGVtZW50KTtcclxuICAgICAgICBwcmVDdXJzb3JUZXh0UmFuZ2Uuc2V0RW5kUG9pbnQoXCJFbmRUb0VuZFwiLCB0ZXh0UmFuZ2UpO1xyXG4gICAgICAgIHBvcyA9IHByZUN1cnNvclRleHRSYW5nZS50ZXh0Lmxlbmd0aDtcclxuICAgIH1cclxuICAgIHJldHVybiBwb3M7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGVsZW1lbnQsIHR5cGUsIGNhbkJ1YmJsZSwgY2FuY2VsYWJsZSkge1xyXG4gICAgbGV0IGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKTtcclxuICAgIGV2ZW50LmluaXRFdmVudCh0eXBlLCBjYW5CdWJibGUsIGNhbmNlbGFibGUpO1xyXG4gICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxufSJdfQ==
