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
    function AutocompleteProvider() {
        _classCallCheck(this, AutocompleteProvider);

        this.values = [];
        this.index = -1;
        this.incompleteValue = null;
    }

    _createClass(AutocompleteProvider, [{
        key: "attach",
        value: function attach(shell) {}
    }, {
        key: "detach",
        value: function detach(shell) {}
    }, {
        key: "getNextValue",
        value: function getNextValue(forward, incompleteValue) {
            if (incompleteValue !== this.incompleteValue) {
                this.index = -1;
            }
            this.incompleteValue = incompleteValue;

            var completeValues = this.values.filter(function (value) {
                return value.toLowerCase().slice(0, incompleteValue.toLowerCase()) === incompleteValue.toLowerCase();
            });

            if (completeValues.length === 0) {
                return null;
            }

            if (this.index >= completeValues.length) {
                this.index = -1;
            }

            if (forward && this.index < completeValues.length - 1) {
                this.index++;
            } else if (forward && this.index >= completeValues.length - 1) {
                this.index = 0;
            } else if (!forward && this.index > 0) {
                this.index--;
            } else if (!forward && this.index <= 0) {
                this.index = completeValues.length - 1;
            }

            return completeValues[this.index];
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
exports.version = exports.Definition = exports.DefinitionProvider = exports.AutocompleteProvider = exports.HistoryProvider = exports.OverlayShell = exports.Shell = undefined;

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

var _definitionProvider = require('./definition-provider.js');

Object.defineProperty(exports, 'DefinitionProvider', {
  enumerable: true,
  get: function get() {
    return _definitionProvider.default;
  }
});

var _definition = require('./definition.js');

Object.defineProperty(exports, 'Definition', {
  enumerable: true,
  get: function get() {
    return _definition.default;
  }
});

var _es6Promise = require('es6-promise');

var _es6Promise2 = _interopRequireDefault(_es6Promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_es6Promise2.default.polyfill();

var version = exports.version = '1.1.0-alpha';

},{"./autocomplete-provider.js":3,"./definition-provider.js":5,"./definition.js":6,"./history-provider.js":7,"./overlay-shell.js":8,"./shell.js":9,"es6-promise":1}],5:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = require('./utils.js');

var utils = _interopRequireWildcard(_utils);

var _definition = require('./definition.js');

var _definition2 = _interopRequireDefault(_definition);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _defaultOptions = {
    predefined: ['HELP', 'ECHO', 'CLS'],
    allowAbbreviations: true
};

var DefinitionProvider = (function () {
    function DefinitionProvider(options) {
        _classCallCheck(this, DefinitionProvider);

        this.options = utils.extend({}, _defaultOptions, options);
        this.shell = null;
        this.definitions = {};

        this._predefine();
    }

    _createClass(DefinitionProvider, [{
        key: 'attach',
        value: function attach(shell) {}
    }, {
        key: 'detach',
        value: function detach(shell) {}
    }, {
        key: 'getDefinitions',
        value: function getDefinitions(name) {
            name = name.toUpperCase();

            var definition = this.definitions[name];

            if (definition) {
                if (definition.available) {
                    return [definition];
                }
                return null;
            }

            var definitions = [];

            if (this.options.allowAbbreviations) {
                for (var key in this.definitions) {
                    if (key.indexOf(name, 0) === 0 && utils.unwrap(this.definitions[key].available)) {
                        definitions.push(this.definitions[key]);
                    }
                }
            }

            return definitions;
        }
    }, {
        key: 'addDefinition',
        value: function addDefinition(definition) {
            this.definitions[definition.name] = definition;
        }
    }, {
        key: '_predefine',
        value: function _predefine() {
            var provider = this;

            if (this.options.predefined.indexOf('HELP') > -1) {
                this.addDefinition(new _definition2.default('HELP', function () {
                    this.shell.writeLine('The following commands are available:');
                    this.shell.writeLine();
                    for (var key in provider.definitions) {
                        var definition = provider.definitions[key];
                        if (!!utils.unwrap(definition.available)) {
                            this.shell.writePad(key, ' ', 10);
                            this.shell.writeLine(definition.description);
                        }
                    }
                    this.shell.writeLine();
                }, {
                    description: 'Lists the available commands'
                }));
            }

            if (this.options.predefined.indexOf('ECHO') > -1) {
                this.addDefinition(new _definition2.default('ECHO', function (arg) {
                    var toggle = arg.toUpperCase();
                    if (toggle === 'ON') {
                        this.shell.echo = true;
                    } else if (toggle === 'OFF') {
                        this.shell.echo = false;
                    } else {
                        this.shell.writeLine(arg);
                    }
                }, {
                    parse: false,
                    description: 'Displays provided text or toggles command echoing'
                }));
            }

            if (this.options.predefined.indexOf('CLS') > -1) {
                this.addDefinition(new _definition2.default('CLS', function () {
                    this.shell.clear();
                }, {
                    description: 'Clears the command prompt'
                }));
            }
        }
    }]);

    return DefinitionProvider;
})();

exports.default = DefinitionProvider;

},{"./definition.js":6,"./utils.js":10}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = require('./utils.js');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Definition = function Definition(name, callback, options) {
    _classCallCheck(this, Definition);

    if (typeof name !== 'string') {
        options = callback;
        callback = name;
        name = null;
    }
    if (typeof callback !== 'function') {
        options = callback;
        callback = null;
    }

    this.name = name;
    this.callback = callback;
    this.description = null;
    this.parse = true;
    this.available = true;

    utils.extend(this, options);

    if (typeof this.name !== 'string') throw '"name" must be a string.';
    if (typeof this.callback !== 'function') throw '"callback" must be a function.';

    this.name = this.name.toUpperCase();
};

exports.default = Definition;

},{"./utils.js":10}],7:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HistoryProvider = (function () {
    function HistoryProvider() {
        var _this = this;

        _classCallCheck(this, HistoryProvider);

        this.values = [];
        this.index = -1;

        this._preexecuteHandler = function (command) {
            _this.values.unshift(command);
            _this.index = -1;
        };
    }

    _createClass(HistoryProvider, [{
        key: 'attach',
        value: function attach(shell) {
            shell.on('preexecute', this._preexecuteHandler);
        }
    }, {
        key: 'detach',
        value: function detach(shell) {
            shell.off('preexecute', this._preexecuteHandler);
        }
    }, {
        key: 'getNextValue',
        value: function getNextValue(forward) {
            if (forward && this.index > 0) {
                this.index--;
                return this.values[this.index];
            }
            if (!forward && this.values.length > this.index + 1) {
                this.index++;
                return this.values[this.index];
            }
            return null;
        }
    }]);

    return HistoryProvider;
})();

exports.default = HistoryProvider;

},{}],8:[function(require,module,exports){
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

var OverlayShell = (function (_Shell) {
    _inherits(OverlayShell, _Shell);

    function OverlayShell(options) {
        _classCallCheck(this, OverlayShell);

        var overlayNode = utils.createElement('<div style="display: none" class="cmdr-overlay"></div>');
        document.body.appendChild(overlayNode);

        options = utils.extend({}, _defaultOptions, options);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(OverlayShell).call(this, overlayNode, options));

        _this._overlayNode = overlayNode;
        _this._documentEventHandler = null;
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

            _get(Object.getPrototypeOf(OverlayShell.prototype), 'dispose', this).call(this);

            document.removeEventListener('keydown', this._documentEventHandler);
            document.body.removeChild(this._overlayNode);
        }
    }, {
        key: 'open',
        value: function open() {
            var _this3 = this;

            this._overlayNode.style.display = '';

            setTimeout(function () {
                _this3._fixPromptIndent(); //hack: using 'private' method from base class to fix indent
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
        key: 'isOpen',
        get: function get() {
            return this._overlayNode.style.display !== 'none';
        }
    }]);

    return OverlayShell;
})(_shell2.default);

exports.default = OverlayShell;

},{"./shell.js":9,"./utils.js":10}],9:[function(require,module,exports){
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

var _definitionProvider = require('./definition-provider.js');

var _definitionProvider2 = _interopRequireDefault(_definitionProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _defaultOptions = {
    echo: true,
    promptPrefix: '>',
    template: '<div class="cmdr-shell"><div class="output"></div><div class="input"><span class="prefix"></span><div class="prompt" spellcheck="false" contenteditable="true" /></div></div>',
    definitionProvider: null,
    historyProvider: null,
    autocompleteProvider: null
};

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
        this._echo = true;
        this._current = null;
        this._queue = [];
        this._promptPrefix = null;
        this._isInputInline = false;
        this._autocompleteValue = null;
        this._eventHandlers = {};
        this._isInitialized = false;
        this._historyProvider = null;
        this._autocompleteProvider = null;
        this._definitionProvider = null;

        this.init();
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

            this._promptNode.addEventListener('input', function () {});

            this._shellNode.addEventListener('click', function (event) {
                if (event.target !== _this._inputNode && !_this._inputNode.contains(event.target) && event.target !== _this._outputNode && !_this._outputNode.contains(event.target)) {
                    _this._promptNode.focus();
                }
            });

            this._promptPrefix = this._options.promptPrefix;

            this._echo = this._options.echo;

            this._definitionProvider = this._options.definitionProvider || new _definitionProvider2.default();
            this._definitionProvider.attach(this);

            this._historyProvider = this._options.historyProvider || new _historyProvider2.default();
            this._historyProvider.attach(this);

            this._autocompleteProvider = this._options.autocompleteProvider || new _autocompleteProvider2.default();
            this._autocompleteProvider.attach(this);

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
            this._echo = true;
            this._current = null;
            this._queue = [];
            this._promptPrefix = null;
            this._isInputInline = false;
            this._eventHandlers = {};

            if (this._historyProvider) {
                this._historyProvider.detach(this);
                this._historyProvider = null;
            }
            if (this._autocompleteProvider) {
                this._autocompleteProvider.detach(this);
                this._autocompleteProvider = null;
            }
            if (this._definitionProvider) {
                this._definitionProvider.detach(this);
                this._definitionProvider = null;
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
            this._flushInput(!this._echo);
            this._deactivateInput();

            command = command.trim();

            var parsed = this._parseCommand(command);

            var definitions = this._definitionProvider.getDefinitions(parsed.name);
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
            this._promptNode.setAttribute('disabled', false);
            this._fixPromptIndent();
            this._promptNode.focus();
            this._shellNode.scrollTop = this._shellNode.scrollHeight;
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
            var _this5 = this;

            Promise.all([this._historyProvider.getNextValue(forward)]).then(function (values) {
                var command = values[0];
                if (command) {
                    _this5._promptNode.textContent = command;
                    utils.cursorToEnd(_this5._promptNode);
                    utils.dispatchEvent(_this5._promptNode, 'change', true, false);
                }
            });
        }
    }, {
        key: '_autocompleteCycle',
        value: function _autocompleteCycle(forward) {
            var _this6 = this;

            var input = this._promptNode.textContent;
            input = input.replace(/\s$/, ' '); //fixing end whitespace
            var cursorPosition = utils.getCursorPosition(this._promptNode);
            var startIndex = input.lastIndexOf(' ', cursorPosition) + 1;
            startIndex = startIndex !== -1 ? startIndex : 0;
            if (this._autocompleteValue === null) {
                var endIndex = input.indexOf(' ', startIndex);
                endIndex = endIndex !== -1 ? endIndex : input.length;
                this._autocompleteValue = input.substring(startIndex, endIndex);
            }
            Promise.all([this._autocompleteProvider.getNextValue(forward, this._autocompleteValue)]).then(function (values) {
                var value = values[0];
                if (value) {
                    _this6._promptNode.textContent = input.substring(0, startIndex) + value;
                    utils.cursorToEnd(_this6._promptNode);
                    utils.dispatchEvent(_this6._promptNode, 'change', true, false);
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
        key: '_fixPromptIndent',
        value: function _fixPromptIndent() {
            var prefixWidth = this._prefixNode.getBoundingClientRect().width;
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

            prefixWidth += spacePadding * this._prefixNode._spaceWidth;

            this._promptNode.style.textIndent = prefixWidth + 'px';
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
        key: 'promptPrefix',
        get: function get() {
            return this._promptPrefix;
        },
        set: function set(value) {
            this._promptPrefix = value;
            if (!this._isInputInline) {
                this._prefixNode.textContent = value;
                this._fixPromptIndent();
            }
        }
    }, {
        key: 'echo',
        get: function get() {
            return this._echo;
        },
        set: function set(value) {
            this._echo = value;
        }
    }, {
        key: 'historyProvider',
        get: function get() {
            return this._historyProvider;
        },
        set: function set(value) {
            if (this._historyProvider) {
                this._historyProvider.dispose();
            }
            this._historyProvider = value;
        }
    }, {
        key: 'autocompleteProvider',
        get: function get() {
            return this._autocompleteProvider;
        },
        set: function set(value) {
            if (this._autocompleteProvider) {
                this._autocompleteProvider.dispose();
            }
            this._autocompleteProvider = value;
        }
    }, {
        key: 'definitionProvider',
        get: function get() {
            return this._definitionProvider;
        },
        set: function set(value) {
            if (this._definitionProvider) {
                this._definitionProvider.dispose();
            }
            this._definitionProvider = value;
        }
    }]);

    return Shell;
})();

exports.default = Shell;

},{"./autocomplete-provider.js":3,"./definition-provider.js":5,"./history-provider.js":7,"./utils.js":10}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extend = extend;
exports.pad = pad;
exports.unwrap = unwrap;
exports.defer = defer;
exports.isElement = isElement;
exports.createElement = createElement;
exports.dispatchEvent = dispatchEvent;
exports.blur = blur;
exports.cursorToEnd = cursorToEnd;
exports.getCursorPosition = getCursorPosition;

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

//Object

function extend(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
        if (!arguments[i]) continue;

        for (var key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key)) out[key] = arguments[i][key];
        }
    }

    return out;
}

//String

function pad(value, padding, length) {
    var right = length >= 0;
    length = Math.abs(length);
    while (value.length < length) {
        value = right ? value + padding : padding + value;
    }
    return value;
}

//Function

function unwrap(value) {
    return typeof value === 'function' ? value() : value;
}

//Promise

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

//DOM

function isElement(obj) {
    return (typeof HTMLElement === "undefined" ? "undefined" : _typeof(HTMLElement)) === "object" ? obj instanceof HTMLElement : obj && (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string";
}

function createElement(html) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.firstChild;
}

function dispatchEvent(element, type, canBubble, cancelable) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent(type, canBubble, cancelable);
    element.dispatchEvent(event);
}

function blur() {
    var element = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    if (element && element !== document.activeElement) return;
    var temp = document.createElement("input");
    document.body.appendChild(temp);
    temp.focus();
    document.body.removeChild(temp);
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

},{}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXM2LXByb21pc2UvZGlzdC9lczYtcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJzcmNcXGF1dG9jb21wbGV0ZS1wcm92aWRlci5qcyIsInNyY1xcY21kci5qcyIsInNyY1xcZGVmaW5pdGlvbi1wcm92aWRlci5qcyIsInNyY1xcZGVmaW5pdGlvbi5qcyIsInNyY1xcaGlzdG9yeS1wcm92aWRlci5qcyIsInNyY1xcb3ZlcmxheS1zaGVsbC5qcyIsInNyY1xcc2hlbGwuanMiLCJzcmNcXHV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2OEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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O0FBQzlDLFFBQUksR0FBRyxZQUFBLENBQUM7QUFDUixRQUFJLE9BQU8sR0FBRyxDQUFDLFlBQVksSUFBSSxXQUFXLEVBQUU7QUFDeEMsV0FBRyxHQUFHLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUN6QixZQUFJLEdBQUcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFO0FBQ3BCLGdCQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDLGdCQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDeEMsMEJBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzQywwQkFBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMzRCxlQUFHLEdBQUcsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQztTQUMxQztLQUNKLE1BQU0sSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFBLElBQUssR0FBRyxDQUFDLElBQUksSUFBSSxTQUFTLEVBQUU7QUFDdkQsWUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2xDLFlBQUksa0JBQWtCLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUNwRCwwQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QywwQkFBa0IsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3RELFdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3hDO0FBQ0QsV0FBTyxHQUFHLENBQUM7Q0FDZCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIEBvdmVydmlldyBlczYtcHJvbWlzZSAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzIChDb252ZXJzaW9uIHRvIEVTNiBBUEkgYnkgSmFrZSBBcmNoaWJhbGQpXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vamFrZWFyY2hpYmFsZC9lczYtcHJvbWlzZS9tYXN0ZXIvTElDRU5TRVxuICogQHZlcnNpb24gICAzLjAuMlxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nIHx8ICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeCAhPT0gbnVsbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0Z1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZSh4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnICYmIHggIT09IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzQXJyYXkgPSBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5O1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuID0gMDtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR2ZXJ0eE5leHQ7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRjdXN0b21TY2hlZHVsZXJGbjtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcCA9IGZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2xpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW5dID0gY2FsbGJhY2s7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiArIDFdID0gYXJnO1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiArPSAyO1xuICAgICAgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW4gPT09IDIpIHtcbiAgICAgICAgLy8gSWYgbGVuIGlzIDIsIHRoYXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHNjaGVkdWxlIGFuIGFzeW5jIGZsdXNoLlxuICAgICAgICAvLyBJZiBhZGRpdGlvbmFsIGNhbGxiYWNrcyBhcmUgcXVldWVkIGJlZm9yZSB0aGUgcXVldWUgaXMgZmx1c2hlZCwgdGhleVxuICAgICAgICAvLyB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGlzIGZsdXNoIHRoYXQgd2UgYXJlIHNjaGVkdWxpbmcuXG4gICAgICAgIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4pIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4obGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHNldFNjaGVkdWxlcihzY2hlZHVsZUZuKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4gPSBzY2hlZHVsZUZuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzZXRBc2FwKGFzYXBGbikge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGFzYXAgPSBhc2FwRm47XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyV2luZG93ID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHVuZGVmaW5lZDtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJHbG9iYWwgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3NlcldpbmRvdyB8fCB7fTtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3Nlckdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNOb2RlID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJztcblxuICAgIC8vIHRlc3QgZm9yIHdlYiB3b3JrZXIgYnV0IG5vdCBpbiBJRTEwXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRpc1dvcmtlciA9IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIHR5cGVvZiBpbXBvcnRTY3JpcHRzICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJztcblxuICAgIC8vIG5vZGVcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTmV4dFRpY2soKSB7XG4gICAgICAvLyBub2RlIHZlcnNpb24gMC4xMC54IGRpc3BsYXlzIGEgZGVwcmVjYXRpb24gd2FybmluZyB3aGVuIG5leHRUaWNrIGlzIHVzZWQgcmVjdXJzaXZlbHlcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vY3Vqb2pzL3doZW4vaXNzdWVzLzQxMCBmb3IgZGV0YWlsc1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIHZlcnR4XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVZlcnR4VGltZXIoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR2ZXJ0eE5leHQobGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU11dGF0aW9uT2JzZXJ2ZXIoKSB7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgbGliJGVzNiRwcm9taXNlJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCk7XG4gICAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICAgIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIG5vZGUuZGF0YSA9IChpdGVyYXRpb25zID0gKytpdGVyYXRpb25zICUgMik7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIHdlYiB3b3JrZXJcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTWVzc2FnZUNoYW5uZWwoKSB7XG4gICAgICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2g7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlU2V0VGltZW91dCgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0VGltZW91dChsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gsIDEpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlID0gbmV3IEFycmF5KDEwMDApO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbjsgaSs9Mikge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbaV07XG4gICAgICAgIHZhciBhcmcgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbaSsxXTtcblxuICAgICAgICBjYWxsYmFjayhhcmcpO1xuXG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtpXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2krMV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW4gPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhdHRlbXB0VmVydHgoKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgciA9IHJlcXVpcmU7XG4gICAgICAgIHZhciB2ZXJ0eCA9IHIoJ3ZlcnR4Jyk7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR2ZXJ0eE5leHQgPSB2ZXJ0eC5ydW5Pbkxvb3AgfHwgdmVydHgucnVuT25Db250ZXh0O1xuICAgICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVZlcnR4VGltZXIoKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVNldFRpbWVvdXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2g7XG4gICAgLy8gRGVjaWRlIHdoYXQgYXN5bmMgbWV0aG9kIHRvIHVzZSB0byB0cmlnZ2VyaW5nIHByb2Nlc3Npbmcgb2YgcXVldWVkIGNhbGxiYWNrczpcbiAgICBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGlzTm9kZSkge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTmV4dFRpY2soKTtcbiAgICB9IGVsc2UgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTXV0YXRpb25PYnNlcnZlcigpO1xuICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGlzV29ya2VyKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VNZXNzYWdlQ2hhbm5lbCgpO1xuICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJXaW5kb3cgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXR0ZW1wdFZlcnR4KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVNldFRpbWVvdXQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKCkge31cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICAgPSB2b2lkIDA7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCA9IDE7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEICA9IDI7XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IgPSBuZXcgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHNlbGZGdWxmaWxsbWVudCgpIHtcbiAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRjYW5ub3RSZXR1cm5Pd24oKSB7XG4gICAgICByZXR1cm4gbmV3IFR5cGVFcnJvcignQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGdldFRoZW4ocHJvbWlzZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbjtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSwgdGhlbikge1xuICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGZ1bmN0aW9uKHByb21pc2UpIHtcbiAgICAgICAgdmFyIHNlYWxlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgZXJyb3IgPSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCR0cnlUaGVuKHRoZW4sIHRoZW5hYmxlLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBpZiAoc2VhbGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG5cbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSwgJ1NldHRsZTogJyArIChwcm9taXNlLl9sYWJlbCB8fCAnIHVua25vd24gcHJvbWlzZScpKTtcblxuICAgICAgICBpZiAoIXNlYWxlZCAmJiBlcnJvcikge1xuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUpIHtcbiAgICAgIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKSB7XG4gICAgICBpZiAobWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3RvciA9PT0gcHJvbWlzZS5jb25zdHJ1Y3Rvcikge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0aGVuID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZ2V0VGhlbihtYXliZVRoZW5hYmxlKTtcblxuICAgICAgICBpZiAodGhlbiA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoZW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0Z1bmN0aW9uKHRoZW4pKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUsIHRoZW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKSB7XG4gICAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHNlbGZGdWxmaWxsbWVudCgpKTtcbiAgICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJHV0aWxzJCRvYmplY3RPckZ1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2hSZWplY3Rpb24ocHJvbWlzZSkge1xuICAgICAgaWYgKHByb21pc2UuX29uZXJyb3IpIHtcbiAgICAgICAgcHJvbWlzZS5fb25lcnJvcihwcm9taXNlLl9yZXN1bHQpO1xuICAgICAgfVxuXG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykgeyByZXR1cm47IH1cblxuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gdmFsdWU7XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRDtcblxuICAgICAgaWYgKHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoLCBwcm9taXNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEO1xuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gcmVhc29uO1xuXG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgIHZhciBzdWJzY3JpYmVycyA9IHBhcmVudC5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgbGVuZ3RoID0gc3Vic2NyaWJlcnMubGVuZ3RoO1xuXG4gICAgICBwYXJlbnQuX29uZXJyb3IgPSBudWxsO1xuXG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGhdID0gY2hpbGQ7XG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGggKyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRURdID0gb25GdWxmaWxsbWVudDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEXSAgPSBvblJlamVjdGlvbjtcblxuICAgICAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2gsIHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcHVibGlzaChwcm9taXNlKSB7XG4gICAgICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgICAgIHZhciBzZXR0bGVkID0gcHJvbWlzZS5fc3RhdGU7XG5cbiAgICAgIGlmIChzdWJzY3JpYmVycy5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG5cbiAgICAgIHZhciBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCA9IHByb21pc2UuX3Jlc3VsdDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICBjaGlsZCA9IHN1YnNjcmliZXJzW2ldO1xuICAgICAgICBjYWxsYmFjayA9IHN1YnNjcmliZXJzW2kgKyBzZXR0bGVkXTtcblxuICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCkge1xuICAgICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUiA9IG5ldyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRFcnJvck9iamVjdCgpO1xuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SLmVycm9yID0gZTtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB2YXIgaGFzQ2FsbGJhY2sgPSBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24oY2FsbGJhY2spLFxuICAgICAgICAgIHZhbHVlLCBlcnJvciwgc3VjY2VlZGVkLCBmYWlsZWQ7XG5cbiAgICAgIGlmIChoYXNDYWxsYmFjaykge1xuICAgICAgICB2YWx1ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICAgICAgZmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICBlcnJvciA9IHZhbHVlLmVycm9yO1xuICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGNhbm5vdFJldHVybk93bigpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBkZXRhaWw7XG4gICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAvLyBub29wXG4gICAgICB9IGVsc2UgaWYgKGhhc0NhbGxiYWNrICYmIHN1Y2NlZWRlZCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoZmFpbGVkKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZShwcm9taXNlLCByZXNvbHZlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UodmFsdWUpe1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbiByZWplY3RQcm9taXNlKHJlYXNvbikge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IoQ29uc3RydWN0b3IsIGlucHV0KSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG5cbiAgICAgIGVudW1lcmF0b3IuX2luc3RhbmNlQ29uc3RydWN0b3IgPSBDb25zdHJ1Y3RvcjtcbiAgICAgIGVudW1lcmF0b3IucHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcblxuICAgICAgaWYgKGVudW1lcmF0b3IuX3ZhbGlkYXRlSW5wdXQoaW5wdXQpKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX2lucHV0ICAgICA9IGlucHV0O1xuICAgICAgICBlbnVtZXJhdG9yLmxlbmd0aCAgICAgPSBpbnB1dC5sZW5ndGg7XG4gICAgICAgIGVudW1lcmF0b3IuX3JlbWFpbmluZyA9IGlucHV0Lmxlbmd0aDtcblxuICAgICAgICBlbnVtZXJhdG9yLl9pbml0KCk7XG5cbiAgICAgICAgaWYgKGVudW1lcmF0b3IubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChlbnVtZXJhdG9yLnByb21pc2UsIGVudW1lcmF0b3IuX3Jlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW51bWVyYXRvci5sZW5ndGggPSBlbnVtZXJhdG9yLmxlbmd0aCB8fCAwO1xuICAgICAgICAgIGVudW1lcmF0b3IuX2VudW1lcmF0ZSgpO1xuICAgICAgICAgIGlmIChlbnVtZXJhdG9yLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwoZW51bWVyYXRvci5wcm9taXNlLCBlbnVtZXJhdG9yLl9yZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KGVudW1lcmF0b3IucHJvbWlzZSwgZW51bWVyYXRvci5fdmFsaWRhdGlvbkVycm9yKCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fdmFsaWRhdGVJbnB1dCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0FycmF5KGlucHV0KTtcbiAgICB9O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ0FycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheScpO1xuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3Jlc3VsdCA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XG4gICAgfTtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yO1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgICAgdmFyIGxlbmd0aCAgPSBlbnVtZXJhdG9yLmxlbmd0aDtcbiAgICAgIHZhciBwcm9taXNlID0gZW51bWVyYXRvci5wcm9taXNlO1xuICAgICAgdmFyIGlucHV0ICAgPSBlbnVtZXJhdG9yLl9pbnB1dDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBlbnVtZXJhdG9yLl9lYWNoRW50cnkoaW5wdXRbaV0sIGkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uKGVudHJ5LCBpKSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG4gICAgICB2YXIgYyA9IGVudW1lcmF0b3IuX2luc3RhbmNlQ29uc3RydWN0b3I7XG5cbiAgICAgIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZShlbnRyeSkpIHtcbiAgICAgICAgaWYgKGVudHJ5LmNvbnN0cnVjdG9yID09PSBjICYmIGVudHJ5Ll9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAgIGVudHJ5Ll9vbmVycm9yID0gbnVsbDtcbiAgICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQoZW50cnkuX3N0YXRlLCBpLCBlbnRyeS5fcmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnVtZXJhdG9yLl93aWxsU2V0dGxlQXQoYy5yZXNvbHZlKGVudHJ5KSwgaSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3JlbWFpbmluZy0tO1xuICAgICAgICBlbnVtZXJhdG9yLl9yZXN1bHRbaV0gPSBlbnRyeTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9zZXR0bGVkQXQgPSBmdW5jdGlvbihzdGF0ZSwgaSwgdmFsdWUpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcbiAgICAgIHZhciBwcm9taXNlID0gZW51bWVyYXRvci5wcm9taXNlO1xuXG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgZW51bWVyYXRvci5fcmVtYWluaW5nLS07XG5cbiAgICAgICAgaWYgKHN0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW51bWVyYXRvci5fcmVzdWx0W2ldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVudW1lcmF0b3IuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIGVudW1lcmF0b3IuX3Jlc3VsdCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fd2lsbFNldHRsZUF0ID0gZnVuY3Rpb24ocHJvbWlzZSwgaSkge1xuICAgICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuXG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocHJvbWlzZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRlVMRklMTEVELCBpLCB2YWx1ZSk7XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgZW51bWVyYXRvci5fc2V0dGxlZEF0KGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVELCBpLCByZWFzb24pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGFsbChlbnRyaWVzKSB7XG4gICAgICByZXR1cm4gbmV3IGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRkZWZhdWx0KHRoaXMsIGVudHJpZXMpLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGFsbDtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRyYWNlKGVudHJpZXMpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcblxuICAgICAgaWYgKCFsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzQXJyYXkoZW50cmllcykpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYW4gYXJyYXkgdG8gcmFjZS4nKSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGVuZ3RoID0gZW50cmllcy5sZW5ndGg7XG5cbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbG1lbnQodmFsdWUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0aW9uKHJlYXNvbikge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUoQ29uc3RydWN0b3IucmVzb2x2ZShlbnRyaWVzW2ldKSwgdW5kZWZpbmVkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmFjZSQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJhY2UkJHJhY2U7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkcmVzb2x2ZShvYmplY3QpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gICAgICBpZiAob2JqZWN0ICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdC5jb25zdHJ1Y3RvciA9PT0gQ29uc3RydWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgIH1cblxuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIG9iamVjdCk7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZXNvbHZlJCRyZXNvbHZlO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlamVjdCQkcmVqZWN0KHJlYXNvbikge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZWplY3QkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZWplY3QkJHJlamVjdDtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkY291bnRlciA9IDA7XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNSZXNvbHZlcigpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYSByZXNvbHZlciBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3InKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNOZXcoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlO1xuICAgIC8qKlxuICAgICAgUHJvbWlzZSBvYmplY3RzIHJlcHJlc2VudCB0aGUgZXZlbnR1YWwgcmVzdWx0IG9mIGFuIGFzeW5jaHJvbm91cyBvcGVyYXRpb24uIFRoZVxuICAgICAgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCwgd2hpY2hcbiAgICAgIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNlJ3MgZXZlbnR1YWwgdmFsdWUgb3IgdGhlIHJlYXNvblxuICAgICAgd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgICAgIFRlcm1pbm9sb2d5XG4gICAgICAtLS0tLS0tLS0tLVxuXG4gICAgICAtIGBwcm9taXNlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gd2l0aCBhIGB0aGVuYCBtZXRob2Qgd2hvc2UgYmVoYXZpb3IgY29uZm9ybXMgdG8gdGhpcyBzcGVjaWZpY2F0aW9uLlxuICAgICAgLSBgdGhlbmFibGVgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB0aGF0IGRlZmluZXMgYSBgdGhlbmAgbWV0aG9kLlxuICAgICAgLSBgdmFsdWVgIGlzIGFueSBsZWdhbCBKYXZhU2NyaXB0IHZhbHVlIChpbmNsdWRpbmcgdW5kZWZpbmVkLCBhIHRoZW5hYmxlLCBvciBhIHByb21pc2UpLlxuICAgICAgLSBgZXhjZXB0aW9uYCBpcyBhIHZhbHVlIHRoYXQgaXMgdGhyb3duIHVzaW5nIHRoZSB0aHJvdyBzdGF0ZW1lbnQuXG4gICAgICAtIGByZWFzb25gIGlzIGEgdmFsdWUgdGhhdCBpbmRpY2F0ZXMgd2h5IGEgcHJvbWlzZSB3YXMgcmVqZWN0ZWQuXG4gICAgICAtIGBzZXR0bGVkYCB0aGUgZmluYWwgcmVzdGluZyBzdGF0ZSBvZiBhIHByb21pc2UsIGZ1bGZpbGxlZCBvciByZWplY3RlZC5cblxuICAgICAgQSBwcm9taXNlIGNhbiBiZSBpbiBvbmUgb2YgdGhyZWUgc3RhdGVzOiBwZW5kaW5nLCBmdWxmaWxsZWQsIG9yIHJlamVjdGVkLlxuXG4gICAgICBQcm9taXNlcyB0aGF0IGFyZSBmdWxmaWxsZWQgaGF2ZSBhIGZ1bGZpbGxtZW50IHZhbHVlIGFuZCBhcmUgaW4gdGhlIGZ1bGZpbGxlZFxuICAgICAgc3RhdGUuICBQcm9taXNlcyB0aGF0IGFyZSByZWplY3RlZCBoYXZlIGEgcmVqZWN0aW9uIHJlYXNvbiBhbmQgYXJlIGluIHRoZVxuICAgICAgcmVqZWN0ZWQgc3RhdGUuICBBIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5ldmVyIGEgdGhlbmFibGUuXG5cbiAgICAgIFByb21pc2VzIGNhbiBhbHNvIGJlIHNhaWQgdG8gKnJlc29sdmUqIGEgdmFsdWUuICBJZiB0aGlzIHZhbHVlIGlzIGFsc28gYVxuICAgICAgcHJvbWlzZSwgdGhlbiB0aGUgb3JpZ2luYWwgcHJvbWlzZSdzIHNldHRsZWQgc3RhdGUgd2lsbCBtYXRjaCB0aGUgdmFsdWUnc1xuICAgICAgc2V0dGxlZCBzdGF0ZS4gIFNvIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgcmVqZWN0cyB3aWxsXG4gICAgICBpdHNlbGYgcmVqZWN0LCBhbmQgYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCBmdWxmaWxscyB3aWxsXG4gICAgICBpdHNlbGYgZnVsZmlsbC5cblxuXG4gICAgICBCYXNpYyBVc2FnZTpcbiAgICAgIC0tLS0tLS0tLS0tLVxuXG4gICAgICBgYGBqc1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgLy8gb24gc3VjY2Vzc1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcblxuICAgICAgICAvLyBvbiBmYWlsdXJlXG4gICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG5cbiAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAvLyBvbiBmdWxmaWxsbWVudFxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIC8vIG9uIHJlamVjdGlvblxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQWR2YW5jZWQgVXNhZ2U6XG4gICAgICAtLS0tLS0tLS0tLS0tLS1cblxuICAgICAgUHJvbWlzZXMgc2hpbmUgd2hlbiBhYnN0cmFjdGluZyBhd2F5IGFzeW5jaHJvbm91cyBpbnRlcmFjdGlvbnMgc3VjaCBhc1xuICAgICAgYFhNTEh0dHBSZXF1ZXN0YHMuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmdW5jdGlvbiBnZXRKU09OKHVybCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gaGFuZGxlcjtcbiAgICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHhoci5zZW5kKCk7XG5cbiAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gdGhpcy5ET05FKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdnZXRKU09OOiBgJyArIHVybCArICdgIGZhaWxlZCB3aXRoIHN0YXR1czogWycgKyB0aGlzLnN0YXR1cyArICddJykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGdldEpTT04oJy9wb3N0cy5qc29uJykudGhlbihmdW5jdGlvbihqc29uKSB7XG4gICAgICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgLy8gb24gcmVqZWN0aW9uXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBVbmxpa2UgY2FsbGJhY2tzLCBwcm9taXNlcyBhcmUgZ3JlYXQgY29tcG9zYWJsZSBwcmltaXRpdmVzLlxuXG4gICAgICBgYGBqc1xuICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICBnZXRKU09OKCcvcG9zdHMnKSxcbiAgICAgICAgZ2V0SlNPTignL2NvbW1lbnRzJylcbiAgICAgIF0pLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcbiAgICAgICAgdmFsdWVzWzBdIC8vID0+IHBvc3RzSlNPTlxuICAgICAgICB2YWx1ZXNbMV0gLy8gPT4gY29tbWVudHNKU09OXG5cbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBjbGFzcyBQcm9taXNlXG4gICAgICBAcGFyYW0ge2Z1bmN0aW9ufSByZXNvbHZlclxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQGNvbnN0cnVjdG9yXG4gICAgKi9cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZShyZXNvbHZlcikge1xuICAgICAgdGhpcy5faWQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkY291bnRlcisrO1xuICAgICAgdGhpcy5fc3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9yZXN1bHQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycyA9IFtdO1xuXG4gICAgICBpZiAobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCAhPT0gcmVzb2x2ZXIpIHtcbiAgICAgICAgaWYgKCFsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24ocmVzb2x2ZXIpKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJG5lZWRzUmVzb2x2ZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZSkpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNOZXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGluaXRpYWxpemVQcm9taXNlKHRoaXMsIHJlc29sdmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5hbGwgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmFjZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJhY2UkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmVzb2x2ZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmVqZWN0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0O1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLl9zZXRTY2hlZHVsZXIgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2V0U2NoZWR1bGVyO1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLl9zZXRBc2FwID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHNldEFzYXA7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UuX2FzYXAgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcDtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnByb3RvdHlwZSA9IHtcbiAgICAgIGNvbnN0cnVjdG9yOiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZSxcblxuICAgIC8qKlxuICAgICAgVGhlIHByaW1hcnkgd2F5IG9mIGludGVyYWN0aW5nIHdpdGggYSBwcm9taXNlIGlzIHRocm91Z2ggaXRzIGB0aGVuYCBtZXRob2QsXG4gICAgICB3aGljaCByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZSdzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZVxuICAgICAgcmVhc29uIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAvLyB1c2VyIGlzIGF2YWlsYWJsZVxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gdXNlciBpcyB1bmF2YWlsYWJsZSwgYW5kIHlvdSBhcmUgZ2l2ZW4gdGhlIHJlYXNvbiB3aHlcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIENoYWluaW5nXG4gICAgICAtLS0tLS0tLVxuXG4gICAgICBUaGUgcmV0dXJuIHZhbHVlIG9mIGB0aGVuYCBpcyBpdHNlbGYgYSBwcm9taXNlLiAgVGhpcyBzZWNvbmQsICdkb3duc3RyZWFtJ1xuICAgICAgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZpcnN0IHByb21pc2UncyBmdWxmaWxsbWVudFxuICAgICAgb3IgcmVqZWN0aW9uIGhhbmRsZXIsIG9yIHJlamVjdGVkIGlmIHRoZSBoYW5kbGVyIHRocm93cyBhbiBleGNlcHRpb24uXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIHVzZXIubmFtZTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0IG5hbWUnO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodXNlck5hbWUpIHtcbiAgICAgICAgLy8gSWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGB1c2VyTmFtZWAgd2lsbCBiZSB0aGUgdXNlcidzIG5hbWUsIG90aGVyd2lzZSBpdFxuICAgICAgICAvLyB3aWxsIGJlIGAnZGVmYXVsdCBuYW1lJ2BcbiAgICAgIH0pO1xuXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScpO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gaWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGByZWFzb25gIHdpbGwgYmUgJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jy5cbiAgICAgICAgLy8gSWYgYGZpbmRVc2VyYCByZWplY3RlZCwgYHJlYXNvbmAgd2lsbCBiZSAnYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScuXG4gICAgICB9KTtcbiAgICAgIGBgYFxuICAgICAgSWYgdGhlIGRvd25zdHJlYW0gcHJvbWlzZSBkb2VzIG5vdCBzcGVjaWZ5IGEgcmVqZWN0aW9uIGhhbmRsZXIsIHJlamVjdGlvbiByZWFzb25zIHdpbGwgYmUgcHJvcGFnYXRlZCBmdXJ0aGVyIGRvd25zdHJlYW0uXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFBlZGFnb2dpY2FsRXhjZXB0aW9uKCdVcHN0cmVhbSBlcnJvcicpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBUaGUgYFBlZGdhZ29jaWFsRXhjZXB0aW9uYCBpcyBwcm9wYWdhdGVkIGFsbCB0aGUgd2F5IGRvd24gdG8gaGVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQXNzaW1pbGF0aW9uXG4gICAgICAtLS0tLS0tLS0tLS1cblxuICAgICAgU29tZXRpbWVzIHRoZSB2YWx1ZSB5b3Ugd2FudCB0byBwcm9wYWdhdGUgdG8gYSBkb3duc3RyZWFtIHByb21pc2UgY2FuIG9ubHkgYmVcbiAgICAgIHJldHJpZXZlZCBhc3luY2hyb25vdXNseS4gVGhpcyBjYW4gYmUgYWNoaWV2ZWQgYnkgcmV0dXJuaW5nIGEgcHJvbWlzZSBpbiB0aGVcbiAgICAgIGZ1bGZpbGxtZW50IG9yIHJlamVjdGlvbiBoYW5kbGVyLiBUaGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgdGhlbiBiZSBwZW5kaW5nXG4gICAgICB1bnRpbCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBzZXR0bGVkLiBUaGlzIGlzIGNhbGxlZCAqYXNzaW1pbGF0aW9uKi5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgICAgICAvLyBUaGUgdXNlcidzIGNvbW1lbnRzIGFyZSBub3cgYXZhaWxhYmxlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBJZiB0aGUgYXNzaW1saWF0ZWQgcHJvbWlzZSByZWplY3RzLCB0aGVuIHRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCBhbHNvIHJlamVjdC5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIGZ1bGZpbGxzLCB3ZSdsbCBoYXZlIHRoZSB2YWx1ZSBoZXJlXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgcmVqZWN0cywgd2UnbGwgaGF2ZSB0aGUgcmVhc29uIGhlcmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFNpbXBsZSBFeGFtcGxlXG4gICAgICAtLS0tLS0tLS0tLS0tLVxuXG4gICAgICBTeW5jaHJvbm91cyBFeGFtcGxlXG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IGZpbmRSZXN1bHQoKTtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEVycmJhY2sgRXhhbXBsZVxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFJlc3VsdChmdW5jdGlvbihyZXN1bHQsIGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAvLyBmYWlsdXJlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIGZpbmRSZXN1bHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFkdmFuY2VkIEV4YW1wbGVcbiAgICAgIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFN5bmNocm9ub3VzIEV4YW1wbGVcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgdmFyIGF1dGhvciwgYm9va3M7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF1dGhvciA9IGZpbmRBdXRob3IoKTtcbiAgICAgICAgYm9va3MgID0gZmluZEJvb2tzQnlBdXRob3IoYXV0aG9yKTtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEVycmJhY2sgRXhhbXBsZVxuXG4gICAgICBgYGBqc1xuXG4gICAgICBmdW5jdGlvbiBmb3VuZEJvb2tzKGJvb2tzKSB7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZmFpbHVyZShyZWFzb24pIHtcblxuICAgICAgfVxuXG4gICAgICBmaW5kQXV0aG9yKGZ1bmN0aW9uKGF1dGhvciwgZXJyKXtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICAvLyBmYWlsdXJlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZpbmRCb29va3NCeUF1dGhvcihhdXRob3IsIGZ1bmN0aW9uKGJvb2tzLCBlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgZm91bmRCb29rcyhib29rcyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgIGZhaWx1cmUocmVhc29uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIGZpbmRBdXRob3IoKS5cbiAgICAgICAgdGhlbihmaW5kQm9va3NCeUF1dGhvcikuXG4gICAgICAgIHRoZW4oZnVuY3Rpb24oYm9va3Mpe1xuICAgICAgICAgIC8vIGZvdW5kIGJvb2tzXG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCB0aGVuXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZ1bGZpbGxlZFxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3RlZFxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQHJldHVybiB7UHJvbWlzZX1cbiAgICAqL1xuICAgICAgdGhlbjogZnVuY3Rpb24ob25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXM7XG4gICAgICAgIHZhciBzdGF0ZSA9IHBhcmVudC5fc3RhdGU7XG5cbiAgICAgICAgaWYgKHN0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRUQgJiYgIW9uRnVsZmlsbG1lbnQgfHwgc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEICYmICFvblJlamVjdGlvbikge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IHRoaXMuY29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICAgIHZhciByZXN1bHQgPSBwYXJlbnQuX3Jlc3VsdDtcblxuICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbc3RhdGUgLSAxXTtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc3RhdGUsIGNoaWxkLCBjYWxsYmFjaywgcmVzdWx0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgfSxcblxuICAgIC8qKlxuICAgICAgYGNhdGNoYCBpcyBzaW1wbHkgc3VnYXIgZm9yIGB0aGVuKHVuZGVmaW5lZCwgb25SZWplY3Rpb24pYCB3aGljaCBtYWtlcyBpdCB0aGUgc2FtZVxuICAgICAgYXMgdGhlIGNhdGNoIGJsb2NrIG9mIGEgdHJ5L2NhdGNoIHN0YXRlbWVudC5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGZpbmRBdXRob3IoKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZG4ndCBmaW5kIHRoYXQgYXV0aG9yJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIHN5bmNocm9ub3VzXG4gICAgICB0cnkge1xuICAgICAgICBmaW5kQXV0aG9yKCk7XG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfVxuXG4gICAgICAvLyBhc3luYyB3aXRoIHByb21pc2VzXG4gICAgICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgY2F0Y2hcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0aW9uXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0aW9uKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkcG9seWZpbGwoKSB7XG4gICAgICB2YXIgbG9jYWw7XG5cbiAgICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGxvY2FsID0gZ2xvYmFsO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBsb2NhbCA9IHNlbGY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGxvY2FsID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50Jyk7XG4gICAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgUCA9IGxvY2FsLlByb21pc2U7XG5cbiAgICAgIGlmIChQICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChQLnJlc29sdmUoKSkgPT09ICdbb2JqZWN0IFByb21pc2VdJyAmJiAhUC5jYXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbG9jYWwuUHJvbWlzZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0O1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRwb2x5ZmlsbDtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlID0ge1xuICAgICAgJ1Byb21pc2UnOiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkZGVmYXVsdCxcbiAgICAgICdwb2x5ZmlsbCc6IGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdFxuICAgIH07XG5cbiAgICAvKiBnbG9iYWwgZGVmaW5lOnRydWUgbW9kdWxlOnRydWUgd2luZG93OiB0cnVlICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSkge1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gbGliJGVzNiRwcm9taXNlJHVtZCQkRVM2UHJvbWlzZTsgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGVbJ2V4cG9ydHMnXSkge1xuICAgICAgbW9kdWxlWydleHBvcnRzJ10gPSBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzWydFUzZQcm9taXNlJ10gPSBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdCgpO1xufSkuY2FsbCh0aGlzKTtcblxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJjbGFzcyBBdXRvY29tcGxldGVQcm92aWRlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnZhbHVlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICAgICAgICB0aGlzLmluY29tcGxldGVWYWx1ZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgICAgICAgXHJcbiAgICBhdHRhY2goc2hlbGwpIHsgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRldGFjaChzaGVsbCkge1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXROZXh0VmFsdWUoZm9yd2FyZCwgaW5jb21wbGV0ZVZhbHVlKSB7XHJcbiAgICAgICAgaWYgKGluY29tcGxldGVWYWx1ZSAhPT0gdGhpcy5pbmNvbXBsZXRlVmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmluY29tcGxldGVWYWx1ZSA9IGluY29tcGxldGVWYWx1ZTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgY29tcGxldGVWYWx1ZXMgPSB0aGlzLnZhbHVlcy5maWx0ZXIoKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpLnNsaWNlKDAsIGluY29tcGxldGVWYWx1ZS50b0xvd2VyQ2FzZSgpKSA9PT0gaW5jb21wbGV0ZVZhbHVlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGNvbXBsZXRlVmFsdWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuaW5kZXggPj0gY29tcGxldGVWYWx1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICBpZiAoZm9yd2FyZCAmJiB0aGlzLmluZGV4IDwgY29tcGxldGVWYWx1ZXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmluZGV4Kys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGZvcndhcmQgJiYgdGhpcy5pbmRleCA+PSBjb21wbGV0ZVZhbHVlcy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghZm9yd2FyZCAmJiB0aGlzLmluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmluZGV4LS07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFmb3J3YXJkICYmIHRoaXMuaW5kZXggPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmluZGV4ID0gY29tcGxldGVWYWx1ZXMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGNvbXBsZXRlVmFsdWVzW3RoaXMuaW5kZXhdO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBdXRvY29tcGxldGVQcm92aWRlcjsiLCJpbXBvcnQgcHJvbWlzZSBmcm9tICdlczYtcHJvbWlzZSc7XHJcbnByb21pc2UucG9seWZpbGwoKTtcclxuXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2hlbGwgfSBmcm9tICcuL3NoZWxsLmpzJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBPdmVybGF5U2hlbGwgfSBmcm9tICcuL292ZXJsYXktc2hlbGwuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEhpc3RvcnlQcm92aWRlciB9IGZyb20gJy4vaGlzdG9yeS1wcm92aWRlci5qcyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQXV0b2NvbXBsZXRlUHJvdmlkZXIgfSBmcm9tICcuL2F1dG9jb21wbGV0ZS1wcm92aWRlci5qcyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgRGVmaW5pdGlvblByb3ZpZGVyIH0gZnJvbSAnLi9kZWZpbml0aW9uLXByb3ZpZGVyLmpzJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBEZWZpbml0aW9uIH0gZnJvbSAnLi9kZWZpbml0aW9uLmpzJztcclxuZXhwb3J0IGNvbnN0IHZlcnNpb24gPSAnMS4xLjAtYWxwaGEnOyIsImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgRGVmaW5pdGlvbiBmcm9tICcuL2RlZmluaXRpb24uanMnO1xyXG5cclxuY29uc3QgX2RlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgcHJlZGVmaW5lZDogWydIRUxQJywgJ0VDSE8nLCAnQ0xTJ10sXHJcbiAgICBhbGxvd0FiYnJldmlhdGlvbnM6IHRydWUgICAgXHJcbn07XHJcblxyXG5jbGFzcyBEZWZpbml0aW9uUHJvdmlkZXIge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykgeyBcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB1dGlscy5leHRlbmQoe30sIF9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5zaGVsbCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5kZWZpbml0aW9ucyA9IHt9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3ByZWRlZmluZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBhdHRhY2goc2hlbGwpIHsgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRldGFjaChzaGVsbCkge1xyXG4gICAgfVxyXG4gICAgICAgXHJcbiAgICBnZXREZWZpbml0aW9ucyhuYW1lKSB7XHJcbiAgICAgICAgbmFtZSA9IG5hbWUudG9VcHBlckNhc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGRlZmluaXRpb24gPSB0aGlzLmRlZmluaXRpb25zW25hbWVdO1xyXG5cclxuICAgICAgICBpZiAoZGVmaW5pdGlvbikge1xyXG4gICAgICAgICAgICBpZiAoZGVmaW5pdGlvbi5hdmFpbGFibGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbZGVmaW5pdGlvbl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBkZWZpbml0aW9ucyA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWxsb3dBYmJyZXZpYXRpb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMuZGVmaW5pdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihuYW1lLCAwKSA9PT0gMCAmJiB1dGlscy51bndyYXAodGhpcy5kZWZpbml0aW9uc1trZXldLmF2YWlsYWJsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9ucy5wdXNoKHRoaXMuZGVmaW5pdGlvbnNba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZpbml0aW9ucztcclxuICAgIH1cclxuICAgIFxyXG4gICAgYWRkRGVmaW5pdGlvbihkZWZpbml0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5kZWZpbml0aW9uc1tkZWZpbml0aW9uLm5hbWVdID0gZGVmaW5pdGlvbjtcclxuICAgIH1cclxuICAgICAgICBcclxuICAgIF9wcmVkZWZpbmUoKSB7ICAgICAgICBcclxuICAgICAgICBsZXQgcHJvdmlkZXIgPSB0aGlzO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucHJlZGVmaW5lZC5pbmRleE9mKCdIRUxQJykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZERlZmluaXRpb24obmV3IERlZmluaXRpb24oJ0hFTFAnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWxsLndyaXRlTGluZSgnVGhlIGZvbGxvd2luZyBjb21tYW5kcyBhcmUgYXZhaWxhYmxlOicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaGVsbC53cml0ZUxpbmUoKTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBwcm92aWRlci5kZWZpbml0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZpbml0aW9uID0gcHJvdmlkZXIuZGVmaW5pdGlvbnNba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISF1dGlscy51bndyYXAoZGVmaW5pdGlvbi5hdmFpbGFibGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hlbGwud3JpdGVQYWQoa2V5LCAnICcsIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVsbC53cml0ZUxpbmUoZGVmaW5pdGlvbi5kZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zaGVsbC53cml0ZUxpbmUoKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTGlzdHMgdGhlIGF2YWlsYWJsZSBjb21tYW5kcydcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucHJlZGVmaW5lZC5pbmRleE9mKCdFQ0hPJykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZERlZmluaXRpb24obmV3IERlZmluaXRpb24oJ0VDSE8nLCBmdW5jdGlvbiAoYXJnKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG9nZ2xlID0gYXJnLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodG9nZ2xlID09PSAnT04nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVsbC5lY2hvID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodG9nZ2xlID09PSAnT0ZGJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hlbGwuZWNobyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNoZWxsLndyaXRlTGluZShhcmcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2U6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzcGxheXMgcHJvdmlkZWQgdGV4dCBvciB0b2dnbGVzIGNvbW1hbmQgZWNob2luZydcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnByZWRlZmluZWQuaW5kZXhPZignQ0xTJykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZERlZmluaXRpb24obmV3IERlZmluaXRpb24oJ0NMUycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hlbGwuY2xlYXIoKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXJzIHRoZSBjb21tYW5kIHByb21wdCdcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9ICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEZWZpbml0aW9uUHJvdmlkZXI7IiwiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy5qcyc7XHJcblxyXG5jbGFzcyBEZWZpbml0aW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBvcHRpb25zID0gY2FsbGJhY2s7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gbmFtZTtcclxuICAgICAgICAgICAgbmFtZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IGNhbGxiYWNrO1xyXG4gICAgICAgICAgICBjYWxsYmFjayA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMucGFyc2UgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlID0gdHJ1ZTtcclxuICAgICAgICBcclxuICAgICAgICB1dGlscy5leHRlbmQodGhpcywgb3B0aW9ucyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm5hbWUgIT09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICB0aHJvdyAnXCJuYW1lXCIgbXVzdCBiZSBhIHN0cmluZy4nO1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5jYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJylcclxuICAgICAgICAgICAgdGhyb3cgJ1wiY2FsbGJhY2tcIiBtdXN0IGJlIGEgZnVuY3Rpb24uJztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy5uYW1lID0gdGhpcy5uYW1lLnRvVXBwZXJDYXNlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IERlZmluaXRpb247IiwiY2xhc3MgSGlzdG9yeVByb3ZpZGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudmFsdWVzID0gW107XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3ByZWV4ZWN1dGVIYW5kbGVyID0gKGNvbW1hbmQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXMudW5zaGlmdChjb21tYW5kKTtcclxuICAgICAgICAgICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGF0dGFjaChzaGVsbCkgeyBcclxuICAgICAgICBzaGVsbC5vbigncHJlZXhlY3V0ZScsIHRoaXMuX3ByZWV4ZWN1dGVIYW5kbGVyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZGV0YWNoKHNoZWxsKSB7XHJcbiAgICAgICAgc2hlbGwub2ZmKCdwcmVleGVjdXRlJywgdGhpcy5fcHJlZXhlY3V0ZUhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXROZXh0VmFsdWUoZm9yd2FyZCkge1xyXG4gICAgICAgIGlmIChmb3J3YXJkICYmIHRoaXMuaW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXgtLTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW3RoaXMuaW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWZvcndhcmQgJiYgdGhpcy52YWx1ZXMubGVuZ3RoID4gdGhpcy5pbmRleCArIDEpIHtcclxuICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZXNbdGhpcy5pbmRleF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBIaXN0b3J5UHJvdmlkZXI7IiwiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCBTaGVsbCBmcm9tICcuL3NoZWxsLmpzJztcclxuXHJcbmNvbnN0IF9kZWZhdWx0T3B0aW9ucyA9IHtcclxuICAgIGF1dG9PcGVuOiBmYWxzZSxcclxuICAgIG9wZW5LZXk6IDE5MixcclxuICAgIGNsb3NlS2V5OiAyN1xyXG59O1xyXG5cclxuY2xhc3MgT3ZlcmxheVNoZWxsIGV4dGVuZHMgU2hlbGwge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgbGV0IG92ZXJsYXlOb2RlID0gdXRpbHMuY3JlYXRlRWxlbWVudCgnPGRpdiBzdHlsZT1cImRpc3BsYXk6IG5vbmVcIiBjbGFzcz1cImNtZHItb3ZlcmxheVwiPjwvZGl2PicpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3ZlcmxheU5vZGUpO1xyXG5cclxuICAgICAgICBvcHRpb25zID0gdXRpbHMuZXh0ZW5kKHt9LCBfZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICBzdXBlcihvdmVybGF5Tm9kZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fb3ZlcmxheU5vZGUgPSBvdmVybGF5Tm9kZTtcclxuICAgICAgICB0aGlzLl9kb2N1bWVudEV2ZW50SGFuZGxlciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBpc09wZW4oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX292ZXJsYXlOb2RlLnN0eWxlLmRpc3BsYXkgIT09ICdub25lJztcclxuICAgIH1cclxuXHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2RvY3VtZW50RXZlbnRIYW5kbGVyID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc09wZW4gJiZcclxuICAgICAgICAgICAgICAgIFsnSU5QVVQnLCAnVEVYVEFSRUEnLCAnU0VMRUNUJ10uaW5kZXhPZihldmVudC50YXJnZXQudGFnTmFtZSkgPT09IC0xICYmXHJcbiAgICAgICAgICAgICAgICAhZXZlbnQudGFyZ2V0LmlzQ29udGVudEVkaXRhYmxlICYmXHJcbiAgICAgICAgICAgICAgICBldmVudC5rZXlDb2RlID09IHRoaXMub3B0aW9ucy5vcGVuS2V5KSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc09wZW4gJiYgZXZlbnQua2V5Q29kZSA9PSB0aGlzLm9wdGlvbnMuY2xvc2VLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9kb2N1bWVudEV2ZW50SGFuZGxlcik7XHJcblxyXG4gICAgICAgIHN1cGVyLmluaXQoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvT3Blbikge1xyXG4gICAgICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcG9zZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHJldHVybjtcclxuICAgIFxyXG4gICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICAgICAgICBcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fZG9jdW1lbnRFdmVudEhhbmRsZXIpOyAgICBcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRoaXMuX292ZXJsYXlOb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuKCkge1xyXG4gICAgICAgIHRoaXMuX292ZXJsYXlOb2RlLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpeFByb21wdEluZGVudCgpOyAgLy9oYWNrOiB1c2luZyAncHJpdmF0ZScgbWV0aG9kIGZyb20gYmFzZSBjbGFzcyB0byBmaXggaW5kZW50XHJcbiAgICAgICAgICAgIHRoaXMuZm9jdXMoKTtcclxuICAgICAgICB9LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSgpIHtcclxuICAgICAgICB0aGlzLl9vdmVybGF5Tm9kZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuYmx1cigpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBPdmVybGF5U2hlbGw7IiwiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCBIaXN0b3J5UHJvdmlkZXIgZnJvbSAnLi9oaXN0b3J5LXByb3ZpZGVyLmpzJztcclxuaW1wb3J0IEF1dG9jb21wbGV0ZVByb3ZpZGVyIGZyb20gJy4vYXV0b2NvbXBsZXRlLXByb3ZpZGVyLmpzJztcclxuaW1wb3J0IERlZmluaXRpb25Qcm92aWRlciBmcm9tICcuL2RlZmluaXRpb24tcHJvdmlkZXIuanMnO1xyXG5cclxuY29uc3QgX2RlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgZWNobzogdHJ1ZSxcclxuICAgIHByb21wdFByZWZpeDogJz4nLFxyXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiY21kci1zaGVsbFwiPjxkaXYgY2xhc3M9XCJvdXRwdXRcIj48L2Rpdj48ZGl2IGNsYXNzPVwiaW5wdXRcIj48c3BhbiBjbGFzcz1cInByZWZpeFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwicHJvbXB0XCIgc3BlbGxjaGVjaz1cImZhbHNlXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiIC8+PC9kaXY+PC9kaXY+JyxcclxuICAgIGRlZmluaXRpb25Qcm92aWRlcjogbnVsbCxcclxuICAgIGhpc3RvcnlQcm92aWRlcjogbnVsbCxcclxuICAgIGF1dG9jb21wbGV0ZVByb3ZpZGVyOiBudWxsXHJcbn07XHJcblxyXG5jbGFzcyBTaGVsbCB7XHJcbiAgICBjb25zdHJ1Y3Rvcihjb250YWluZXJOb2RlLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKCFjb250YWluZXJOb2RlIHx8ICF1dGlscy5pc0VsZW1lbnQoY29udGFpbmVyTm9kZSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgJ1wiY29udGFpbmVyTm9kZVwiIG11c3QgYmUgYW4gSFRNTEVsZW1lbnQuJztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IHV0aWxzLmV4dGVuZCh7fSwgX2RlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJOb2RlID0gY29udGFpbmVyTm9kZTtcclxuICAgICAgICB0aGlzLl9zaGVsbE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2lucHV0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcHJlZml4Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0TGluZU5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2VjaG8gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3F1ZXVlID0gW107XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0UHJlZml4ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pc0lucHV0SW5saW5lID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlVmFsdWUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnMgPSB7fTtcclxuICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gZmFsc2U7ICAgICAgICBcclxuICAgICAgICB0aGlzLl9oaXN0b3J5UHJvdmlkZXIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9kZWZpbml0aW9uUHJvdmlkZXIgPSBudWxsO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXQgaXNJbml0aWFsaXplZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNJbml0aWFsaXplZDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IG9wdGlvbnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBwcm9tcHRQcmVmaXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb21wdFByZWZpeDtcclxuICAgIH1cclxuICAgIHNldCBwcm9tcHRQcmVmaXgodmFsdWUpIHtcclxuICAgICAgICB0aGlzLl9wcm9tcHRQcmVmaXggPSB2YWx1ZTtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzSW5wdXRJbmxpbmUpIHtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS50ZXh0Q29udGVudCA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl9maXhQcm9tcHRJbmRlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBlY2hvKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9lY2hvO1xyXG4gICAgfVxyXG4gICAgc2V0IGVjaG8odmFsdWUpIHtcclxuICAgICAgICB0aGlzLl9lY2hvID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBoaXN0b3J5UHJvdmlkZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hpc3RvcnlQcm92aWRlcjtcclxuICAgIH1cclxuICAgIHNldCBoaXN0b3J5UHJvdmlkZXIodmFsdWUpIHtcclxuICAgICAgICBpZiAodGhpcy5faGlzdG9yeVByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hpc3RvcnlQcm92aWRlci5kaXNwb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2hpc3RvcnlQcm92aWRlciA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXQgYXV0b2NvbXBsZXRlUHJvdmlkZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyO1xyXG4gICAgfVxyXG4gICAgc2V0IGF1dG9jb21wbGV0ZVByb3ZpZGVyKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyLmRpc3Bvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IGRlZmluaXRpb25Qcm92aWRlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGVmaW5pdGlvblByb3ZpZGVyO1xyXG4gICAgfVxyXG4gICAgc2V0IGRlZmluaXRpb25Qcm92aWRlcih2YWx1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9kZWZpbml0aW9uUHJvdmlkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGVmaW5pdGlvblByb3ZpZGVyLmRpc3Bvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZGVmaW5pdGlvblByb3ZpZGVyID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzSW5pdGlhbGl6ZWQpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3NoZWxsTm9kZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQodGhpcy5fb3B0aW9ucy50ZW1wbGF0ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lck5vZGUuYXBwZW5kQ2hpbGQodGhpcy5fc2hlbGxOb2RlKTtcclxuXHJcbiAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZSA9IHRoaXMuX3NoZWxsTm9kZS5xdWVyeVNlbGVjdG9yKCcub3V0cHV0Jyk7XHJcbiAgICAgICAgdGhpcy5faW5wdXROb2RlID0gdGhpcy5fc2hlbGxOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5pbnB1dCcpO1xyXG4gICAgICAgIHRoaXMuX3ByZWZpeE5vZGUgPSB0aGlzLl9zaGVsbE5vZGUucXVlcnlTZWxlY3RvcignLnByZWZpeCcpO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUgPSB0aGlzLl9zaGVsbE5vZGUucXVlcnlTZWxlY3RvcignLnByb21wdCcpO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSAhPT0gOSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxMzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4ZWN1dGUodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM4OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9oaXN0b3J5Q3ljbGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0MDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlzdG9yeUN5Y2xlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVDeWNsZSghZXZlbnQuc2hpZnRLZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fY3VycmVudC5yZWFkTGluZSAmJiBldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkTGluZS5yZXNvbHZlKHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJyZW50ICYmIHRoaXMuX2N1cnJlbnQucmVhZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmNoYXJDb2RlICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkLmNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LmNoYXJDb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fY3VycmVudC5yZWFkLmNhcHR1cmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fY3VycmVudCAmJiB0aGlzLl9jdXJyZW50LnJlYWQgJiYgdGhpcy5fY3VycmVudC5yZWFkLmNoYXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZC5yZXNvbHZlKHRoaXMuX2N1cnJlbnQucmVhZC5jaGFyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ3Bhc3RlJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGluZXMgPSB2YWx1ZS5zcGxpdCgvXFxyXFxufFxccnxcXG4vZyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGVuZ3RoID0gbGluZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaW5lc1tpXS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9xdWV1ZS5nZXQodGhpcykucHVzaChsaW5lc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnQgJiYgdGhpcy5fY3VycmVudC5yZWFkTGluZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lLnJlc29sdmUobGluZXNbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fY3VycmVudCAmJiB0aGlzLl9jdXJyZW50LnJlYWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkLnJlc29sdmUobGluZXNbMF1bMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQobGluZXNbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsICgpID0+IHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fc2hlbGxOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgIT09IHRoaXMuX2lucHV0Tm9kZSAmJiAhdGhpcy5faW5wdXROb2RlLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkgJiZcclxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldCAhPT0gdGhpcy5fb3V0cHV0Tm9kZSAmJiAhdGhpcy5fb3V0cHV0Tm9kZS5jb250YWlucyhldmVudC50YXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3Byb21wdFByZWZpeCA9IHRoaXMuX29wdGlvbnMucHJvbXB0UHJlZml4O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX2VjaG8gPSB0aGlzLl9vcHRpb25zLmVjaG87XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fZGVmaW5pdGlvblByb3ZpZGVyID0gdGhpcy5fb3B0aW9ucy5kZWZpbml0aW9uUHJvdmlkZXIgfHwgbmV3IERlZmluaXRpb25Qcm92aWRlcigpO1xyXG4gICAgICAgIHRoaXMuX2RlZmluaXRpb25Qcm92aWRlci5hdHRhY2godGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyID0gdGhpcy5fb3B0aW9ucy5oaXN0b3J5UHJvdmlkZXIgfHwgbmV3IEhpc3RvcnlQcm92aWRlcigpO1xyXG4gICAgICAgIHRoaXMuX2hpc3RvcnlQcm92aWRlci5hdHRhY2godGhpcyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIgPSB0aGlzLl9vcHRpb25zLmF1dG9jb21wbGV0ZVByb3ZpZGVyIHx8IG5ldyBBdXRvY29tcGxldGVQcm92aWRlcigpO1xyXG4gICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyLmF0dGFjaCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVJbnB1dCgpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcG9zZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzSW5pdGlhbGl6ZWQpIHJldHVybjtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9jb250YWluZXJOb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3NoZWxsTm9kZSk7XHJcbiAgICAgICAgdGhpcy5fc2hlbGxOb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9vdXRwdXROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3ByZWZpeE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2VjaG8gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3F1ZXVlID0gW107XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0UHJlZml4ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pc0lucHV0SW5saW5lID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVycyA9IHt9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLl9oaXN0b3J5UHJvdmlkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyLmRldGFjaCh0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyLmRldGFjaCh0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fZGVmaW5pdGlvblByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlZmluaXRpb25Qcm92aWRlci5kZXRhY2godGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlZmluaXRpb25Qcm92aWRlciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSBmYWxzZTsgICAgICBcclxuICAgIH1cclxuICAgICAgICBcclxuICAgIHJlc2V0KCkge1xyXG4gICAgICAgIHRoaXMuZGlzcG9zZSgpO1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlYWQoY2FsbGJhY2ssIGNhcHR1cmUpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2N1cnJlbnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVJbnB1dCh0cnVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkID0gdXRpbHMuZGVmZXIoKTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWQudGhlbigodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkID0gbnVsbDtcclxuICAgICAgICAgICAgaWYgKCFjYXB0dXJlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fZGVhY3RpdmF0ZUlucHV0KCk7XHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwgdGhpcy5fY3VycmVudCkgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZChjYWxsYmFjaywgY2FwdHVyZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mbHVzaElucHV0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWQuY2FwdHVyZSA9IGNhcHR1cmU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZC5yZXNvbHZlKHRoaXMuX3F1ZXVlLnNoaWZ0KClbMF0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZWFkTGluZShjYWxsYmFjaykge1xyXG4gICAgICAgIGlmICghdGhpcy5fY3VycmVudCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9hY3RpdmF0ZUlucHV0KHRydWUpO1xyXG5cclxuICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lID0gdXRpbHMuZGVmZXIoKTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lLnRoZW4oKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZExpbmUgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlYWN0aXZhdGVJbnB1dCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9mbHVzaElucHV0KCk7XHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwgdGhpcy5fY3VycmVudCkgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZExpbmUoY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZExpbmUucmVzb2x2ZSh0aGlzLl9xdWV1ZS5zaGlmdCgpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd3JpdGUodmFsdWUsIGNzc0NsYXNzKSB7XHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSB8fCAnJztcclxuICAgICAgICBsZXQgb3V0cHV0VmFsdWUgPSB1dGlscy5jcmVhdGVFbGVtZW50KGA8c3BhbiBjbGFzcz1cIiR7Y3NzQ2xhc3N9XCI+JHt2YWx1ZX08L3NwYW4+YCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9vdXRwdXRMaW5lTm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX291dHB1dE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5fb3V0cHV0TGluZU5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZS5hcHBlbmRDaGlsZChvdXRwdXRWYWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgd3JpdGVMaW5lKHZhbHVlLCBjc3NDbGFzcykge1xyXG4gICAgICAgIHZhbHVlID0gKHZhbHVlIHx8ICcnKSArICdcXG4nO1xyXG4gICAgICAgIHRoaXMud3JpdGUodmFsdWUsIGNzc0NsYXNzKTtcclxuICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgd3JpdGVQYWQodmFsdWUsIHBhZGRpbmcsIGxlbmd0aCwgY3NzQ2xhc3MpIHtcclxuICAgICAgICB0aGlzLndyaXRlKHV0aWxzLnBhZCh2YWx1ZSwgcGFkZGluZywgbGVuZ3RoKSwgY3NzQ2xhc3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKCkge1xyXG4gICAgICAgIHRoaXMuX291dHB1dE5vZGUuaW5uZXJIVE1MID0gJyc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZvY3VzKCkge1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuZm9jdXMoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgYmx1cigpIHtcclxuICAgICAgICB1dGlscy5ibHVyKHRoaXMuX3Byb21wdE5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGV4ZWN1dGUoY29tbWFuZCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3F1ZXVlLnB1c2goY29tbWFuZCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgY29tbWFuZCAhPT0gJ3N0cmluZycgfHwgY29tbWFuZC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgY29tbWFuZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3RyaWdnZXIoJ3ByZWV4ZWN1dGUnLCBjb21tYW5kKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gY29tbWFuZDtcclxuICAgICAgICB0aGlzLl9mbHVzaElucHV0KCF0aGlzLl9lY2hvKTtcclxuICAgICAgICB0aGlzLl9kZWFjdGl2YXRlSW5wdXQoKTtcclxuXHJcbiAgICAgICAgY29tbWFuZCA9IGNvbW1hbmQudHJpbSgpO1xyXG5cclxuICAgICAgICBsZXQgcGFyc2VkID0gdGhpcy5fcGFyc2VDb21tYW5kKGNvbW1hbmQpO1xyXG5cclxuICAgICAgICBsZXQgZGVmaW5pdGlvbnMgPSB0aGlzLl9kZWZpbml0aW9uUHJvdmlkZXIuZ2V0RGVmaW5pdGlvbnMocGFyc2VkLm5hbWUpO1xyXG4gICAgICAgIGlmICghZGVmaW5pdGlvbnMgfHwgZGVmaW5pdGlvbnMubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLndyaXRlTGluZSgnSW52YWxpZCBjb21tYW5kJywgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2FjdGl2YXRlSW5wdXQoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICB0aGlzLndyaXRlTGluZSgnQW1iaWd1b3VzIGNvbW1hbmQnLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgdGhpcy53cml0ZUxpbmUoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWZpbml0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZVBhZChkZWZpbml0aW9uc1tpXS5uYW1lLCAnICcsIDEwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKGRlZmluaXRpb25zW2ldLmRlc2NyaXB0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLndyaXRlTGluZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9hY3RpdmF0ZUlucHV0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBkZWZpbml0aW9uID0gZGVmaW5pdGlvbnNbMF07XHJcblxyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmQ6IGNvbW1hbmQsXHJcbiAgICAgICAgICAgIGRlZmluaXRpb246IGRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIHNoZWxsOiB0aGlzXHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgYXJncyA9IHBhcnNlZC5hcmdzO1xyXG4gICAgICAgIGlmICghZGVmaW5pdGlvbi5wYXJzZSkge1xyXG4gICAgICAgICAgICBhcmdzID0gW3BhcnNlZC5hcmddO1xyXG4gICAgICAgIH0gICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fdHJpZ2dlcignZXhlY3V0aW5nJywgdGhpcy5fY3VycmVudCk7XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQ7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gZGVmaW5pdGlvbi5jYWxsYmFjay5hcHBseSh0aGlzLl9jdXJyZW50LCBhcmdzKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICB0aGlzLndyaXRlTGluZSgnVW5oYW5kbGVkIGV4Y2VwdGlvbi4gU2VlIGJyb3dzZXIgY29uc29sZSBsb2cgZm9yIGRldGFpbHMuJywgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgUHJvbWlzZS5hbGwoW3Jlc3VsdF0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ2V4ZWN1dGUnLCB0aGlzLl9jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aXZhdGVJbnB1dCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3F1ZXVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4ZWN1dGUodGhpcy5fcXVldWUuc2hpZnQoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9uKGV2ZW50LCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcclxuICAgICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0ucHVzaChjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgb2ZmKGV2ZW50LCBjYWxsYmFjaykge1xyXG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XS5pbmRleE9mKGNhbGxiYWNrKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgX3RyaWdnZXIoZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdKSByZXR1cm47XHJcbiAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcclxuICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX2FjdGl2YXRlSW5wdXQoaW5saW5lKSB7XHJcbiAgICAgICAgaWYgKGlubGluZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fb3V0cHV0TGluZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUudGV4dENvbnRlbnQgPSB0aGlzLl9vdXRwdXRMaW5lTm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX291dHB1dE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fb3V0cHV0TGluZU5vZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb3V0cHV0TGluZU5vZGUgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2lzSW5wdXRJbmxpbmUgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUudGV4dENvbnRlbnQgPSB0aGlzLl9wcm9tcHRQcmVmaXg7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzSW5wdXRJbmxpbmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faW5wdXROb2RlLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCBmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5fZml4UHJvbXB0SW5kZW50KCk7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5mb2N1cygpO1xyXG4gICAgICAgIHRoaXMuX3NoZWxsTm9kZS5zY3JvbGxUb3AgPSB0aGlzLl9zaGVsbE5vZGUuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIF9kZWFjdGl2YXRlSW5wdXQoKSB7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5faW5wdXROb2RlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9XHJcblxyXG4gICAgX2ZsdXNoSW5wdXQocHJldmVudFdyaXRlKSB7XHJcbiAgICAgICAgaWYgKCFwcmV2ZW50V3JpdGUpIHtcclxuICAgICAgICAgICAgdGhpcy53cml0ZSh0aGlzLl9wcmVmaXhOb2RlLnRleHRDb250ZW50KTtcclxuICAgICAgICAgICAgdGhpcy53cml0ZUxpbmUodGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3ByZWZpeE5vZGUudGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIF9oaXN0b3J5Q3ljbGUoZm9yd2FyZCkge1xyXG4gICAgICAgIFByb21pc2UuYWxsKFt0aGlzLl9oaXN0b3J5UHJvdmlkZXIuZ2V0TmV4dFZhbHVlKGZvcndhcmQpXSkudGhlbigodmFsdWVzKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBjb21tYW5kID0gdmFsdWVzWzBdO1xyXG4gICAgICAgICAgICBpZiAoY29tbWFuZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCA9IGNvbW1hbmQ7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5jdXJzb3JUb0VuZCh0aGlzLl9wcm9tcHROb2RlKTtcclxuICAgICAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQodGhpcy5fcHJvbXB0Tm9kZSwgJ2NoYW5nZScsIHRydWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBfYXV0b2NvbXBsZXRlQ3ljbGUoZm9yd2FyZCkge1xyXG4gICAgICAgIGxldCBpbnB1dCA9IHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9cXHMkLywgJyAnKTsgLy9maXhpbmcgZW5kIHdoaXRlc3BhY2VcclxuICAgICAgICBsZXQgY3Vyc29yUG9zaXRpb24gPSB1dGlscy5nZXRDdXJzb3JQb3NpdGlvbih0aGlzLl9wcm9tcHROb2RlKTtcclxuICAgICAgICBsZXQgc3RhcnRJbmRleCA9IGlucHV0Lmxhc3RJbmRleE9mKCcgJywgY3Vyc29yUG9zaXRpb24pICsgMTtcclxuICAgICAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCAhPT0gLTEgPyBzdGFydEluZGV4IDogMDtcclxuICAgICAgICBpZiAodGhpcy5fYXV0b2NvbXBsZXRlVmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IGVuZEluZGV4ID0gaW5wdXQuaW5kZXhPZignICcsIHN0YXJ0SW5kZXgpO1xyXG4gICAgICAgICAgICBlbmRJbmRleCA9IGVuZEluZGV4ICE9PSAtMSA/IGVuZEluZGV4IDogaW5wdXQubGVuZ3RoO1xyXG4gICAgICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVWYWx1ZSA9IGlucHV0LnN1YnN0cmluZyhzdGFydEluZGV4LCBlbmRJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFByb21pc2UuYWxsKFt0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlci5nZXROZXh0VmFsdWUoZm9yd2FyZCwgdGhpcy5fYXV0b2NvbXBsZXRlVmFsdWUpXSkudGhlbigodmFsdWVzKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHZhbHVlc1swXTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gaW5wdXQuc3Vic3RyaW5nKDAsIHN0YXJ0SW5kZXgpICsgdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5jdXJzb3JUb0VuZCh0aGlzLl9wcm9tcHROb2RlKTtcclxuICAgICAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQodGhpcy5fcHJvbXB0Tm9kZSwgJ2NoYW5nZScsIHRydWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBfYXV0b2NvbXBsZXRlUmVzZXQoKSB7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlVmFsdWUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIF9wYXJzZUNvbW1hbmQoY29tbWFuZCkge1xyXG4gICAgICAgIGxldCBleHAgPSAvW15cXHNcIl0rfFwiKFteXCJdKilcIi9naSxcclxuICAgICAgICAgICAgbmFtZSA9IG51bGwsXHJcbiAgICAgICAgICAgIGFyZyA9IG51bGwsXHJcbiAgICAgICAgICAgIGFyZ3MgPSBbXSxcclxuICAgICAgICAgICAgbWF0Y2ggPSBudWxsO1xyXG5cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIG1hdGNoID0gZXhwLmV4ZWMoY29tbWFuZCk7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gbWF0Y2hbMV0gPyBtYXRjaFsxXSA6IG1hdGNoWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoLmluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZyA9IGNvbW1hbmQuc3Vic3RyKHZhbHVlLmxlbmd0aCArIChtYXRjaFsxXSA/IDMgOiAxKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IHdoaWxlIChtYXRjaCAhPT0gbnVsbCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgICAgIGFyZzogYXJnLFxyXG4gICAgICAgICAgICBhcmdzOiBhcmdzXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBfZml4UHJvbXB0SW5kZW50KCkge1xyXG4gICAgICAgIGxldCBwcmVmaXhXaWR0aCA9IHRoaXMuX3ByZWZpeE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XHJcbiAgICAgICAgbGV0IHRleHQgPSB0aGlzLl9wcmVmaXhOb2RlLnRleHRDb250ZW50O1xyXG4gICAgICAgIGxldCBzcGFjZVBhZGRpbmcgPSB0ZXh0Lmxlbmd0aCAtIHRleHQudHJpbSgpLmxlbmd0aDtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9wcmVmaXhOb2RlLl9zcGFjZVdpZHRoKSB7XHJcbiAgICAgICAgICAgIGxldCBlbGVtMSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoJzxzcGFuIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuXCI+fCB8PC9zcGFuPicpO1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLmFwcGVuZENoaWxkKGVsZW0xKTtcclxuICAgICAgICAgICAgbGV0IGVsZW0yID0gdXRpbHMuY3JlYXRlRWxlbWVudCgnPHNwYW4gc3R5bGU9XCJ2aXNpYmlsaXR5OiBoaWRkZW5cIj58fDwvc3Bhbj4nKTtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5hcHBlbmRDaGlsZChlbGVtMik7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUuX3NwYWNlV2lkdGggPSBlbGVtMS5vZmZzZXRXaWR0aCAtIGVsZW0yLm9mZnNldFdpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLnJlbW92ZUNoaWxkKGVsZW0xKTtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5yZW1vdmVDaGlsZChlbGVtMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmVmaXhXaWR0aCArPSBzcGFjZVBhZGRpbmcgKiB0aGlzLl9wcmVmaXhOb2RlLl9zcGFjZVdpZHRoO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuc3R5bGUudGV4dEluZGVudCA9IHByZWZpeFdpZHRoICsgJ3B4JztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2hlbGw7XHJcbiIsIi8vT2JqZWN0XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKG91dCkge1xyXG4gICAgb3V0ID0gb3V0IHx8IHt9O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHNbaV0pXHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gYXJndW1lbnRzW2ldKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSlcclxuICAgICAgICAgICAgICAgIG91dFtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvdXQ7XHJcbn1cclxuICBcclxuLy9TdHJpbmdcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwYWQodmFsdWUsIHBhZGRpbmcsIGxlbmd0aCkge1xyXG4gICAgbGV0IHJpZ2h0ID0gbGVuZ3RoID49IDA7XHJcbiAgICBsZW5ndGggPSBNYXRoLmFicyhsZW5ndGgpO1xyXG4gICAgd2hpbGUgKHZhbHVlLmxlbmd0aCA8IGxlbmd0aCkge1xyXG4gICAgICAgIHZhbHVlID0gcmlnaHQgPyB2YWx1ZSArIHBhZGRpbmcgOiBwYWRkaW5nICsgdmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuXHJcbi8vRnVuY3Rpb25cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1bndyYXAodmFsdWUpIHtcclxuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgPyB2YWx1ZSgpIDogdmFsdWU7XHJcbn1cclxuXHJcbi8vUHJvbWlzZVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZmVyKCkge1xyXG4gICAgZnVuY3Rpb24gRGVmZXJyZWQoKSB7XHJcbiAgICAgICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xyXG4gICAgICAgICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy50aGVuID0gdGhpcy5wcm9taXNlLnRoZW4uYmluZCh0aGlzLnByb21pc2UpO1xyXG4gICAgICAgIHRoaXMuY2F0Y2ggPSB0aGlzLnByb21pc2UuY2F0Y2guYmluZCh0aGlzLnByb21pc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgRGVmZXJyZWQoKTtcclxufVxyXG5cclxuLy9ET01cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0VsZW1lbnQob2JqKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIEhUTUxFbGVtZW50ID09PSBcIm9iamVjdFwiID9cclxuICAgICAgICBvYmogaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA6XHJcbiAgICAgICAgb2JqICYmIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgb2JqICE9PSBudWxsICYmIG9iai5ub2RlVHlwZSA9PT0gMSAmJiB0eXBlb2Ygb2JqLm5vZGVOYW1lID09PSBcInN0cmluZ1wiO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRWxlbWVudChodG1sKSB7XHJcbiAgICBsZXQgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgd3JhcHBlci5pbm5lckhUTUwgPSBodG1sO1xyXG4gICAgcmV0dXJuIHdyYXBwZXIuZmlyc3RDaGlsZDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZWxlbWVudCwgdHlwZSwgY2FuQnViYmxlLCBjYW5jZWxhYmxlKSB7XHJcbiAgICBsZXQgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnSFRNTEV2ZW50cycpO1xyXG4gICAgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIGNhbkJ1YmJsZSwgY2FuY2VsYWJsZSk7XHJcbiAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYmx1cihlbGVtZW50ID0gbnVsbCkge1xyXG4gICAgaWYgKGVsZW1lbnQgJiYgZWxlbWVudCAhPT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgcmV0dXJuO1xyXG4gICAgbGV0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRlbXApO1xyXG4gICAgdGVtcC5mb2N1cygpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0ZW1wKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGN1cnNvclRvRW5kKGVsZW1lbnQpIHtcclxuICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XHJcbiAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWxlbWVudCk7XHJcbiAgICByYW5nZS5jb2xsYXBzZShmYWxzZSk7XHJcbiAgICBsZXQgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xyXG4gICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnNvclBvc2l0aW9uKGVsZW1lbnQpIHtcclxuICAgIGxldCBwb3MgPSAwO1xyXG4gICAgbGV0IGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudCB8fCBlbGVtZW50LmRvY3VtZW50O1xyXG4gICAgbGV0IHdpbiA9IGRvYy5kZWZhdWx0VmlldyB8fCBkb2MucGFyZW50V2luZG93O1xyXG4gICAgbGV0IHNlbDtcclxuICAgIGlmICh0eXBlb2Ygd2luLmdldFNlbGVjdGlvbiAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgc2VsID0gd2luLmdldFNlbGVjdGlvbigpO1xyXG4gICAgICAgIGlmIChzZWwucmFuZ2VDb3VudCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IHJhbmdlID0gd2luLmdldFNlbGVjdGlvbigpLmdldFJhbmdlQXQoMCk7XHJcbiAgICAgICAgICAgIGxldCBwcmVDdXJzb3JSYW5nZSA9IHJhbmdlLmNsb25lUmFuZ2UoKTtcclxuICAgICAgICAgICAgcHJlQ3Vyc29yUmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBwcmVDdXJzb3JSYW5nZS5zZXRFbmQocmFuZ2UuZW5kQ29udGFpbmVyLCByYW5nZS5lbmRPZmZzZXQpO1xyXG4gICAgICAgICAgICBwb3MgPSBwcmVDdXJzb3JSYW5nZS50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKChzZWwgPSBkb2Muc2VsZWN0aW9uKSAmJiBzZWwudHlwZSAhPSBcIkNvbnRyb2xcIikge1xyXG4gICAgICAgIGxldCB0ZXh0UmFuZ2UgPSBzZWwuY3JlYXRlUmFuZ2UoKTtcclxuICAgICAgICBsZXQgcHJlQ3Vyc29yVGV4dFJhbmdlID0gZG9jLmJvZHkuY3JlYXRlVGV4dFJhbmdlKCk7XHJcbiAgICAgICAgcHJlQ3Vyc29yVGV4dFJhbmdlLm1vdmVUb0VsZW1lbnRUZXh0KGVsZW1lbnQpO1xyXG4gICAgICAgIHByZUN1cnNvclRleHRSYW5nZS5zZXRFbmRQb2ludChcIkVuZFRvRW5kXCIsIHRleHRSYW5nZSk7XHJcbiAgICAgICAgcG9zID0gcHJlQ3Vyc29yVGV4dFJhbmdlLnRleHQubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBvcztcclxufSJdfQ==
