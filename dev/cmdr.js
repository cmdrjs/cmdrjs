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
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AutocompleteProvider = function () {
    function AutocompleteProvider() {
        _classCallCheck(this, AutocompleteProvider);

        this.lookups = [];

        this._context = null;
        this._index = -1;
        this._values = [];

        this._predefineLookups();
    }

    _createClass(AutocompleteProvider, [{
        key: 'bind',
        value: function bind(shell) {}
    }, {
        key: 'unbind',
        value: function unbind(shell) {}
    }, {
        key: 'getNextValue',
        value: function getNextValue(forward, context) {
            var _this = this;

            if (context !== this._context) {
                this._context = context;
                this._index = -1;
                this._values = this._lookupValues(context);
            }

            return Promise.all([this._values]).then(function (values) {
                values = values[0];

                var completeValues = values.filter(function (value) {
                    return context.incompleteValue === '' || value.toLowerCase().slice(0, context.incompleteValue.toLowerCase().length) === context.incompleteValue.toLowerCase();
                });

                if (completeValues.length === 0) {
                    return null;
                }

                if (_this._index >= completeValues.length) {
                    _this._index = -1;
                }

                if (forward && _this._index < completeValues.length - 1) {
                    _this._index++;
                } else if (forward && _this._index >= completeValues.length - 1) {
                    _this._index = 0;
                } else if (!forward && _this._index > 0) {
                    _this._index--;
                } else if (!forward && _this._index <= 0) {
                    _this._index = completeValues.length - 1;
                }

                return completeValues[_this._index];
            });
        }
    }, {
        key: '_lookupValues',
        value: function _lookupValues(context) {

            function resolveValues(values) {
                if (Array.isArray(values)) {
                    return values;
                }
                if (typeof values === 'function') {
                    return values(context);
                }
                return null;
            }

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.lookups[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var lookup = _step.value;

                    var results = resolveValues(lookup);
                    if (results) {
                        return results;
                    }
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

            return [];
        }
    }, {
        key: '_predefineLookups',
        value: function _predefineLookups() {

            function commandNameLookup(context) {
                if (context.precursorValue.trim() !== '') {
                    return null;
                }

                return Object.keys(context.shell.definitionProvider.definitions);
            }

            this.lookups.push(commandNameLookup);
        }
    }]);

    return AutocompleteProvider;
}();

exports.default = AutocompleteProvider;

},{}],4:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CancelToken = function () {
    function CancelToken() {
        _classCallCheck(this, CancelToken);

        this._isCancelRequested = false;
        this._cancelHandlers = [];
    }

    _createClass(CancelToken, [{
        key: "cancel",
        value: function cancel() {
            if (!this._isCancelRequested) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this._cancelHandlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var handler = _step.value;

                        try {
                            handler(this);
                        } catch (error) {
                            console.error(error);
                        }
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
            this._isCancelRequested = true;
        }
    }, {
        key: "uncancel",
        value: function uncancel() {
            this._isCancelRequested = false;
        }
    }, {
        key: "onCancel",
        value: function onCancel(handler) {
            if (this._isCancelRequested) {
                try {
                    handler(this);
                } catch (error) {
                    console.error(error);
                }
            }
            this._cancelHandlers.push(handler);
        }
    }, {
        key: "offCancel",
        value: function offCancel(handler) {
            var index = this._cancelHandlers.indexOf(handler);
            if (index > -1) {
                this._cancelHandlers.splice(index, 1);
            }
        }
    }, {
        key: "isCancelRequested",
        get: function get() {
            return this._isCancelRequested;
        }
    }]);

    return CancelToken;
}();

exports.default = CancelToken;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = exports.Definition = exports.DefinitionProvider = exports.AutocompleteProvider = exports.HistoryProvider = exports.CommandParser = exports.CommandHandler = exports.OverlayShell = exports.Shell = undefined;

var _shell = require('./shell.js');

Object.defineProperty(exports, 'Shell', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_shell).default;
  }
});

var _overlayShell = require('./overlay-shell.js');

Object.defineProperty(exports, 'OverlayShell', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_overlayShell).default;
  }
});

var _commandHandler = require('./command-handler.js');

Object.defineProperty(exports, 'CommandHandler', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_commandHandler).default;
  }
});

var _commandParser = require('./command-parser.js');

Object.defineProperty(exports, 'CommandParser', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_commandParser).default;
  }
});

var _historyProvider = require('./history-provider.js');

Object.defineProperty(exports, 'HistoryProvider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_historyProvider).default;
  }
});

var _autocompleteProvider = require('./autocomplete-provider.js');

Object.defineProperty(exports, 'AutocompleteProvider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_autocompleteProvider).default;
  }
});

var _definitionProvider = require('./definition-provider.js');

Object.defineProperty(exports, 'DefinitionProvider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_definitionProvider).default;
  }
});

var _definition = require('./definition.js');

Object.defineProperty(exports, 'Definition', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_definition).default;
  }
});

var _es6Promise = require('es6-promise');

var _es6Promise2 = _interopRequireDefault(_es6Promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_es6Promise2.default.polyfill();

var version = exports.version = '1.1.11';

},{"./autocomplete-provider.js":3,"./command-handler.js":6,"./command-parser.js":7,"./definition-provider.js":8,"./definition.js":9,"./history-provider.js":10,"./overlay-shell.js":11,"./shell.js":12,"es6-promise":1}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = require('./utils.js');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _defaultOptions = {
    contextExtensions: {}
};

var CommandHandler = function () {
    function CommandHandler(options) {
        _classCallCheck(this, CommandHandler);

        this.options = utils.extend({}, _defaultOptions, options);
    }

    _createClass(CommandHandler, [{
        key: 'executeCommand',
        value: function executeCommand(shell, command, cancelToken) {
            var parsed = shell.commandParser.parseCommand(command);

            var definitions = shell.definitionProvider.getDefinitions(parsed.name);
            if (!definitions || definitions.length < 1) {
                shell.writeLine('Invalid command', 'error');
                return false;
            } else if (definitions.length > 1) {
                shell.writeLine('Ambiguous command', 'error');
                shell.writeLine();
                for (var i = 0; i < definitions.length; i++) {
                    shell.writePad(definitions[i].name, 10);
                    shell.writeLine(definitions[i].description);
                }
                shell.writeLine();
                return false;
            }

            var definition = definitions[0];

            var context = {
                shell: shell,
                command: command,
                definition: definition,
                parsed: parsed,
                defer: utils.defer,
                cancelToken: cancelToken
            };

            utils.extend(context, this.options.contextExtensions);

            var args = parsed.args;

            if (definition.help && args.length > 0 && args[args.length - 1] === "/?") {
                if (typeof definition.help === 'string') {
                    shell.writeLine(definition.help);
                    return false;
                } else if (typeof definition.help === 'function') {
                    return definition.help.apply(context, args);
                }
            }

            return definition.main.apply(context, args);
        }
    }]);

    return CommandHandler;
}();

exports.default = CommandHandler;

},{"./utils.js":13}],7:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CommandParser = function () {
    function CommandParser() {
        _classCallCheck(this, CommandParser);
    }

    _createClass(CommandParser, [{
        key: "parseCommand",
        value: function parseCommand(command) {
            var exp = /[^\s"]+|"([^"]*)"/gi,
                name = null,
                argString = null,
                args = [],
                match = null;

            do {
                match = exp.exec(command);
                if (match !== null) {
                    var value = match[1] ? match[1] : match[0];
                    if (match.index === 0) {
                        name = value;
                        argString = command.substr(value.length + (match[1] ? 3 : 1));
                    } else {
                        args.push(value);
                    }
                }
            } while (match !== null);

            return {
                name: name,
                argString: argString,
                args: args
            };
        }
    }]);

    return CommandParser;
}();

exports.default = CommandParser;

},{}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var DefinitionProvider = function () {
    function DefinitionProvider(options) {
        var _this = this;

        _classCallCheck(this, DefinitionProvider);

        this.options = utils.extend({}, _defaultOptions, options);
        this.definitions = {};

        this.define = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            _this.addDefinition(new (Function.prototype.bind.apply(_definition2.default, [null].concat(args)))());
        };

        this._predefine();
    }

    _createClass(DefinitionProvider, [{
        key: 'bind',
        value: function bind(shell) {
            if (typeof shell.define === 'undefined') {
                shell.define = this.define;
            }
        }
    }, {
        key: 'unbind',
        value: function unbind(shell) {
            if (shell.define === this.define) {
                delete shell.define;
            }
        }
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
                this.define({
                    name: 'HELP',
                    main: function main() {
                        this.shell.writeLine('The following commands are available:');
                        this.shell.writeLine();
                        var availableDefinitions = Object.keys(provider.definitions).map(function (key) {
                            return provider.definitions[key];
                        }).filter(function (def) {
                            return def.available;
                        });
                        var length = availableDefinitions.slice().sort(function (a, b) {
                            return b.name.length - a.name.length;
                        })[0].name.length;
                        this.shell.writeTable(availableDefinitions, ['name:' + (length + 2).toString(), 'description:40']);
                        this.shell.writeLine();
                        this.shell.writeLine('* Pass "/?" into any command to display help for that command.');
                        if (provider.options.allowAbbreviations) {
                            this.shell.writeLine('* Command abbreviations are allowed (e.g. "H" for "HELP").');
                        }
                    },
                    description: 'Lists the available commands.'
                });
            }

            if (this.options.predefined.indexOf('ECHO') > -1) {
                this.define({
                    name: 'ECHO',
                    main: function main() {
                        var toggle = this.argString.toUpperCase();
                        if (toggle === 'ON') {
                            this.shell.echo = true;
                        } else if (toggle === 'OFF') {
                            this.shell.echo = false;
                        } else if (this.argString) {
                            this.shell.writeLine(this.argString);
                        } else {
                            this.shell.writeLine('ECHO is ' + (this.shell.echo ? 'on.' : 'off.'));
                        }
                    },
                    description: 'Displays messages, or toggles command echoing.',
                    usage: 'ECHO [ON | OFF]\nECHO [message]\n\nType ECHO without parameters to display the current echo setting.'
                });
            }

            if (this.options.predefined.indexOf('CLS') > -1) {
                this.define({
                    name: 'CLS',
                    main: function main() {
                        this.shell.clear();
                    },
                    description: 'Clears the command prompt.'
                });
            }
        }
    }]);

    return DefinitionProvider;
}();

exports.default = DefinitionProvider;

},{"./definition.js":9,"./utils.js":13}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = require('./utils.js');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Definition = function Definition(name, main, options) {
    _classCallCheck(this, Definition);

    if (typeof name !== 'string') {
        options = main;
        main = name;
        name = null;
    }
    if (typeof main !== 'function') {
        options = main;
        main = null;
    }

    this.name = name;
    this.main = main;
    this.description = null;
    this.usage = null;
    this.available = true;
    this.help = function () {
        if (this.definition.description) {
            this.shell.writeLine(this.definition.description);
        }
        if (this.definition.description && this.definition.usage) {
            this.shell.writeLine();
        }
        if (this.definition.usage) {
            this.shell.writeLine(this.definition.usage);
        }
    };

    utils.extend(this, options);

    if (typeof this.name !== 'string') throw '"name" must be a string.';
    if (typeof this.main !== 'function') throw '"main" must be a function.';

    this.name = this.name.toUpperCase();

    if (!this.usage) {
        this.usage = this.name;
    }
};

exports.default = Definition;

},{"./utils.js":13}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HistoryProvider = function () {
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
        key: 'bind',
        value: function bind(shell) {
            shell.on('preexecute', this._preexecuteHandler);
        }
    }, {
        key: 'unbind',
        value: function unbind(shell) {
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
}();

exports.default = HistoryProvider;

},{}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var OverlayShell = function (_Shell) {
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
            document.body.style.overflow = 'hidden';

            setTimeout(function () {
                _this3._fixPromptIndent(); //hack: using 'private' method from base class to fix indent
                _this3.focus();
            }, 0);
        }
    }, {
        key: 'close',
        value: function close() {
            this._overlayNode.style.display = 'none';
            document.body.style.overflow = '';
            this.blur();
        }
    }, {
        key: 'isOpen',
        get: function get() {
            return this._overlayNode.style.display !== 'none';
        }
    }]);

    return OverlayShell;
}(_shell2.default);

exports.default = OverlayShell;

},{"./shell.js":12,"./utils.js":13}],12:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var _commandHandler = require('./command-handler.js');

var _commandHandler2 = _interopRequireDefault(_commandHandler);

var _commandParser = require('./command-parser.js');

var _commandParser2 = _interopRequireDefault(_commandParser);

var _cancelToken = require('./cancel-token.js');

var _cancelToken2 = _interopRequireDefault(_cancelToken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _defaultOptions = {
    echo: true,
    promptPrefix: '>',
    template: '<div class="cmdr-shell"><div class="output"></div><div class="input"><span class="prefix"></span><div class="prompt" spellcheck="false" contenteditable="true" /></div></div>',
    theme: 'cmd',
    definitionProvider: null,
    historyProvider: null,
    autocompleteProvider: null,
    commandHandler: null,
    commandParser: null
};

var Shell = function () {
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
        this._autocompleteContext = null;
        this._eventHandlers = {};
        this._isInitialized = false;
        this._historyProvider = null;
        this._autocompleteProvider = null;
        this._definitionProvider = null;
        this._commandHandler = null;
        this._commandParser = null;

        this.init();
    }

    _createClass(Shell, [{
        key: 'init',
        value: function init() {
            var _this = this;

            if (this._isInitialized) return;

            this._shellNode = utils.createElement(this._options.template);

            this._shellNode.className += ' cmdr-shell--' + this._options.theme;

            this._containerNode.appendChild(this._shellNode);

            this._outputNode = this._shellNode.querySelector('.output');
            this._inputNode = this._shellNode.querySelector('.input');
            this._prefixNode = this._shellNode.querySelector('.prefix');
            this._promptNode = this._shellNode.querySelector('.prompt');

            this._promptNode.addEventListener('keydown', function (event) {
                if (!_this._current) {
                    if (event.keyCode !== 9 && !event.shiftKey) {
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
                } else {
                    if (event.ctrlKey && event.keyCode === 67) {
                        _this.cancel();
                    } else if (_this._current.readLine && event.keyCode === 13) {
                        _this._current.readLine.resolve(_this._promptNode.textContent);
                    }

                    if (!_this._current.read && !_this._current.readLine) {
                        event.preventDefault();
                        return false;
                    }
                }

                return true;
            });

            this._promptNode.addEventListener('keypress', function (event) {
                if (_this._current && _this._current.read) {
                    if (event.charCode !== 0) {
                        _this._current.read.resolve(String.fromCharCode(event.charCode));
                    }
                    event.preventDefault();
                    return false;
                }
                return true;
            });

            this._shellNode.addEventListener('click', function (event) {
                if (event.target !== _this._inputNode && !_this._inputNode.contains(event.target) && event.target !== _this._outputNode && !_this._outputNode.contains(event.target)) {
                    _this._promptNode.focus();
                }
            });

            this._promptPrefix = this._options.promptPrefix;

            this._echo = this._options.echo;

            this._definitionProvider = this._options.definitionProvider || new _definitionProvider2.default();
            this._definitionProvider.bind(this);

            this._historyProvider = this._options.historyProvider || new _historyProvider2.default();
            this._historyProvider.bind(this);

            this._autocompleteProvider = this._options.autocompleteProvider || new _autocompleteProvider2.default();
            this._autocompleteProvider.bind(this);

            this._commandHandler = this.options.commandHandler || new _commandHandler2.default();
            this._commandParser = this.options.commandParser || new _commandParser2.default();

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
            this._autocompleteContext = null;
            this._eventHandlers = {};

            if (this._historyProvider) {
                this._historyProvider.unbind(this);
                this._historyProvider = null;
            }
            if (this._autocompleteProvider) {
                this._autocompleteProvider.unbind(this);
                this._autocompleteProvider = null;
            }
            if (this._definitionProvider) {
                this._definitionProvider.unbind(this);
                this._definitionProvider = null;
            }

            this._commandHandler = null;
            this._commandParser = null;

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
        value: function read(callback, intercept) {
            var _this2 = this;

            if (!this._current) return;

            this._activateInput(true);

            this._current.read = utils.defer();
            this._current.read.then(function (value) {
                _this2._current.read = null;
                _this2._deactivateInput();
                if (!intercept) {
                    _this2._prefixNode.textContent += value;
                    _this2._promptNode.textContent = '';
                }
                if (callback(value, _this2._current) === true) {
                    _this2.read(callback, intercept);
                } else {
                    _this2._flushInput();
                }
            });
            this._current.read.intercept = intercept;
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
        }
    }, {
        key: 'write',
        value: function write(value, cssClass) {
            value = utils.encodeHtml(value || '');
            var outputValue = utils.createElement('<span>' + value + '</span>');
            if (cssClass) {
                outputValue.className = cssClass;
            }
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
        value: function writePad(value, length) {
            var char = arguments.length <= 2 || arguments[2] === undefined ? ' ' : arguments[2];
            var cssClass = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

            this.write(utils.pad(value, length, char), cssClass);
        }
    }, {
        key: 'writeTable',
        value: function writeTable(data, columns, showHeaders, cssClass) {
            var _this4 = this;

            columns = columns.map(function (value) {
                var values = value.split(':');
                return {
                    name: values[0],
                    padding: values.length > 1 ? values[1] : 10,
                    header: values.length > 2 ? values[2] : values[0]
                };
            });
            var writeCell = function writeCell(value, padding) {
                value = value || '';
                if (padding === '*') {
                    _this4.write(value, cssClass);
                } else {
                    _this4.writePad(value, parseInt(padding, 10), ' ', cssClass);
                }
            };
            if (showHeaders) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = columns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var col = _step.value;

                        writeCell(col.header, col.padding);
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

                this.writeLine();
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = columns[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var col = _step2.value;

                        writeCell(Array(col.header.length + 1).join('-'), col.padding);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                this.writeLine();
            }
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var row = _step3.value;
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = columns[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var col = _step4.value;

                            writeCell(row[col.name] ? row[col.name].toString() : '', col.padding);
                        }
                    } catch (err) {
                        _didIteratorError4 = true;
                        _iteratorError4 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                _iterator4.return();
                            }
                        } finally {
                            if (_didIteratorError4) {
                                throw _iteratorError4;
                            }
                        }
                    }

                    this.writeLine();
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
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
        key: 'on',
        value: function on(event, handler) {
            if (!this._eventHandlers[event]) {
                this._eventHandlers[event] = [];
            }
            this._eventHandlers[event].push(handler);
        }
    }, {
        key: 'off',
        value: function off(event, handler) {
            if (!this._eventHandlers[event]) {
                return;
            }
            var index = this._eventHandlers[event].indexOf(handler);
            if (index > -1) {
                this._eventHandlers[event].splice(index, 1);
            }
        }
    }, {
        key: 'execute',
        value: function execute(command) {
            var _this5 = this;

            var deferred = undefined;
            if ((typeof command === 'undefined' ? 'undefined' : _typeof(command)) === 'object') {
                deferred = command.deferred;
                command = command.text;
            } else if (typeof command === 'string' && command.length > 0) {
                deferred = utils.defer();

                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    args[_key - 1] = arguments[_key];
                }

                if (args) {
                    command = this._buildCommand(command, args);
                }
            } else {
                deferred = utils.defer();
                deferred.reject('Invalid command');
                return deferred;
            }

            if (this._current) {
                this._queue.push({
                    deferred: deferred,
                    text: command,
                    executeOnly: true
                });
                return deferred;
            }

            var commandText = command;
            command = command.trim();

            this._trigger('preexecute', command);

            this._promptNode.textContent = commandText;
            this._flushInput(!this._echo);
            this._deactivateInput();

            var cancelToken = new _cancelToken2.default();

            this._current = {
                command: command,
                cancelToken: cancelToken
            };

            var complete = function complete() {
                setTimeout(function () {
                    _this5._current = null;
                    if (_this5._outputNode.children.length > 0) {
                        _this5.writeLine();
                    }
                    _this5._activateInput();
                    if (_this5._queue.length > 0) {
                        _this5.execute(_this5._queue.shift());
                    }
                }, 0);
            };

            var result = undefined;
            try {
                result = this._commandHandler.executeCommand(this, command, cancelToken);
            } catch (error) {
                this.writeLine('Unhandled exception', 'error');
                this.writeLine(error, 'error');
                deferred.reject('Unhandled exception');
                complete();
                return deferred;
            }

            Promise.all([result]).then(function (values) {
                _this5._trigger('execute', {
                    command: command
                });
                try {
                    deferred.resolve(values[0]);
                } finally {
                    complete();
                }
            }, function (reason) {
                _this5._trigger('execute', {
                    command: command,
                    error: reason
                });
                try {
                    deferred.reject(reason);
                } finally {
                    complete();
                }
            });

            return deferred;
        }
    }, {
        key: 'cancel',
        value: function cancel() {
            if (!this._current) return;
            this._current.cancelToken.cancel();
        }
    }, {
        key: '_buildCommand',
        value: function _buildCommand(command, args) {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = args[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var arg = _step5.value;

                    if (typeof arg === 'string' && arg.indexOf(' ') > -1) {
                        command += ' "' + arg + '"';
                    } else {
                        command += ' ' + arg.toString();
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            return command;
        }
    }, {
        key: '_activateInput',
        value: function _activateInput(inline) {
            if (inline) {
                if (this._outputLineNode) {
                    this._prefixNode.innerHTML = this._outputLineNode.innerHTML;
                    this._outputNode.removeChild(this._outputLineNode);
                    this._outputLineNode = null;
                }
                this._isInputInline = true;
            } else {
                this._prefixNode.innerHTML = this._promptPrefix;
                this._isInputInline = false;
            }
            this._inputNode.style.display = '';
            this._promptNode.removeAttribute('disabled');
            this._fixPromptIndent();
            this._promptNode.focus();
            this._shellNode.scrollTop = this._shellNode.scrollHeight;
        }
    }, {
        key: '_deactivateInput',
        value: function _deactivateInput() {
            this._promptNode.style.textIndent = '';
            this._promptNode.setAttribute('disabled', 'disabled');
        }
    }, {
        key: '_flushInput',
        value: function _flushInput(preventWrite) {
            if (!preventWrite) {
                var outputValue = utils.createElement('<div>' + this._prefixNode.innerHTML + this._promptNode.innerHTML + '</div>');
                this._outputNode.appendChild(outputValue);
            }
            this._prefixNode.textContent = '';
            this._promptNode.textContent = '';
        }
    }, {
        key: '_trigger',
        value: function _trigger(event, data) {
            if (!this._eventHandlers[event]) return;
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = this._eventHandlers[event][Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var handler = _step6.value;

                    try {
                        handler(data);
                    } catch (error) {
                        console.error(error);
                    }
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }
        }
    }, {
        key: '_historyCycle',
        value: function _historyCycle(forward) {
            var _this6 = this;

            Promise.all([this._historyProvider.getNextValue(forward)]).then(function (values) {
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

            if (!this._autocompleteContext) {
                var inputValue = this._promptNode.textContent;
                inputValue = inputValue.replace(/\s$/, ' ');
                var cursorPosition = utils.getCursorPosition(this._promptNode);
                var startIndex = inputValue.lastIndexOf(' ', cursorPosition) + 1;
                startIndex = startIndex !== -1 ? startIndex : 0;
                var endIndex = inputValue.indexOf(' ', startIndex);
                endIndex = endIndex !== -1 ? endIndex : inputValue.length;
                var incompleteValue = inputValue.substring(startIndex, endIndex);
                var precursorValue = inputValue.substring(0, startIndex);
                var parsed = this.commandParser.parseCommand(precursorValue);
                this._autocompleteContext = {
                    shell: this,
                    incompleteValue: incompleteValue,
                    precursorValue: precursorValue,
                    parsed: parsed
                };
            }

            Promise.all([this._autocompleteProvider.getNextValue(forward, this._autocompleteContext)]).then(function (values) {
                var value = values[0];
                if (value) {
                    _this7._promptNode.textContent = _this7._autocompleteContext.precursorValue + value;
                    utils.cursorToEnd(_this7._promptNode);
                    utils.dispatchEvent(_this7._promptNode, 'change', true, false);
                }
            });
        }
    }, {
        key: '_autocompleteReset',
        value: function _autocompleteReset() {
            this._autocompleteContext = null;
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
                this._historyProvider.unbind(this);
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
                this._autocompleteProvider.unbind(this);
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
                this._definitionProvider.unbind(this);
            }
            this._definitionProvider = value;
        }
    }, {
        key: 'commandHandler',
        get: function get() {
            return this._commandHandler;
        },
        set: function set(value) {
            this._commandHandler = value;
        }
    }, {
        key: 'commandParser',
        get: function get() {
            return this._commandParser;
        },
        set: function set(value) {
            this._commandParser = value;
        }
    }]);

    return Shell;
}();

exports.default = Shell;

},{"./autocomplete-provider.js":3,"./cancel-token.js":4,"./command-handler.js":6,"./command-parser.js":7,"./definition-provider.js":8,"./history-provider.js":10,"./utils.js":13}],13:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extend = extend;
exports.pad = pad;
exports.encodeHtml = encodeHtml;
exports.unwrap = unwrap;
exports.defer = defer;
exports.isElement = isElement;
exports.createElement = createElement;
exports.dispatchEvent = dispatchEvent;
exports.blur = blur;
exports.cursorToEnd = cursorToEnd;
exports.getCursorPosition = getCursorPosition;
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

function pad(value, length, char) {
    var right = length >= 0;
    length = Math.abs(length);
    while (value.length < length) {
        value = right ? value + char : char + value;
    }
    return value;
}

function encodeHtml(value) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(value));
    return div.innerHTML;
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
    return (typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === "object" ? obj instanceof HTMLElement : obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string";
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

},{}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXM2LXByb21pc2UvZGlzdC9lczYtcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJzcmNcXGF1dG9jb21wbGV0ZS1wcm92aWRlci5qcyIsInNyY1xcY2FuY2VsLXRva2VuLmpzIiwic3JjXFxjbWRyLmpzIiwic3JjXFxjb21tYW5kLWhhbmRsZXIuanMiLCJzcmNcXGNvbW1hbmQtcGFyc2VyLmpzIiwic3JjXFxkZWZpbml0aW9uLXByb3ZpZGVyLmpzIiwic3JjXFxkZWZpbml0aW9uLmpzIiwic3JjXFxoaXN0b3J5LXByb3ZpZGVyLmpzIiwic3JjXFxvdmVybGF5LXNoZWxsLmpzIiwic3JjXFxzaGVsbC5qcyIsInNyY1xcdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3Y4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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UUFBZixHQUEwQixNQUExQixDQUxjO1NBQXhCO0tBRkosTUFTTyxJQUFJLENBQUMsTUFBTSxJQUFJLFNBQUosQ0FBUCxJQUF5QixJQUFJLElBQUosSUFBWSxTQUFaLEVBQXVCO0FBQ3ZELFlBQUksWUFBWSxJQUFJLFdBQUosRUFBWixDQURtRDtBQUV2RCxZQUFJLHFCQUFxQixJQUFJLElBQUosQ0FBUyxlQUFULEVBQXJCLENBRm1EO0FBR3ZELDJCQUFtQixpQkFBbkIsQ0FBcUMsT0FBckMsRUFIdUQ7QUFJdkQsMkJBQW1CLFdBQW5CLENBQStCLFVBQS9CLEVBQTJDLFNBQTNDLEVBSnVEO0FBS3ZELGNBQU0sbUJBQW1CLElBQW5CLENBQXdCLE1BQXhCLENBTGlEO0tBQXBEO0FBT1AsV0FBTyxHQUFQLENBckJ1QztDQUFwQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIEBvdmVydmlldyBlczYtcHJvbWlzZSAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzIChDb252ZXJzaW9uIHRvIEVTNiBBUEkgYnkgSmFrZSBBcmNoaWJhbGQpXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vamFrZWFyY2hpYmFsZC9lczYtcHJvbWlzZS9tYXN0ZXIvTElDRU5TRVxuICogQHZlcnNpb24gICAzLjAuMlxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nIHx8ICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeCAhPT0gbnVsbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0Z1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZSh4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnICYmIHggIT09IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzQXJyYXkgPSBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5O1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuID0gMDtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR2ZXJ0eE5leHQ7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRjdXN0b21TY2hlZHVsZXJGbjtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcCA9IGZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2xpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW5dID0gY2FsbGJhY2s7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiArIDFdID0gYXJnO1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiArPSAyO1xuICAgICAgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW4gPT09IDIpIHtcbiAgICAgICAgLy8gSWYgbGVuIGlzIDIsIHRoYXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHNjaGVkdWxlIGFuIGFzeW5jIGZsdXNoLlxuICAgICAgICAvLyBJZiBhZGRpdGlvbmFsIGNhbGxiYWNrcyBhcmUgcXVldWVkIGJlZm9yZSB0aGUgcXVldWUgaXMgZmx1c2hlZCwgdGhleVxuICAgICAgICAvLyB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGlzIGZsdXNoIHRoYXQgd2UgYXJlIHNjaGVkdWxpbmcuXG4gICAgICAgIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4pIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4obGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHNldFNjaGVkdWxlcihzY2hlZHVsZUZuKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkY3VzdG9tU2NoZWR1bGVyRm4gPSBzY2hlZHVsZUZuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzZXRBc2FwKGFzYXBGbikge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGFzYXAgPSBhc2FwRm47XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyV2luZG93ID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdyA6IHVuZGVmaW5lZDtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJHbG9iYWwgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3NlcldpbmRvdyB8fCB7fTtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3Nlckdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNOb2RlID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJztcblxuICAgIC8vIHRlc3QgZm9yIHdlYiB3b3JrZXIgYnV0IG5vdCBpbiBJRTEwXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRpc1dvcmtlciA9IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIHR5cGVvZiBpbXBvcnRTY3JpcHRzICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIE1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJztcblxuICAgIC8vIG5vZGVcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTmV4dFRpY2soKSB7XG4gICAgICAvLyBub2RlIHZlcnNpb24gMC4xMC54IGRpc3BsYXlzIGEgZGVwcmVjYXRpb24gd2FybmluZyB3aGVuIG5leHRUaWNrIGlzIHVzZWQgcmVjdXJzaXZlbHlcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vY3Vqb2pzL3doZW4vaXNzdWVzLzQxMCBmb3IgZGV0YWlsc1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIHZlcnR4XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVZlcnR4VGltZXIoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR2ZXJ0eE5leHQobGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU11dGF0aW9uT2JzZXJ2ZXIoKSB7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgbGliJGVzNiRwcm9taXNlJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCk7XG4gICAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICAgIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIG5vZGUuZGF0YSA9IChpdGVyYXRpb25zID0gKytpdGVyYXRpb25zICUgMik7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIHdlYiB3b3JrZXJcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTWVzc2FnZUNoYW5uZWwoKSB7XG4gICAgICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2g7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlU2V0VGltZW91dCgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0VGltZW91dChsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gsIDEpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlID0gbmV3IEFycmF5KDEwMDApO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbjsgaSs9Mikge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbaV07XG4gICAgICAgIHZhciBhcmcgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbaSsxXTtcblxuICAgICAgICBjYWxsYmFjayhhcmcpO1xuXG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtpXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2krMV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW4gPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhdHRlbXB0VmVydHgoKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgciA9IHJlcXVpcmU7XG4gICAgICAgIHZhciB2ZXJ0eCA9IHIoJ3ZlcnR4Jyk7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR2ZXJ0eE5leHQgPSB2ZXJ0eC5ydW5Pbkxvb3AgfHwgdmVydHgucnVuT25Db250ZXh0O1xuICAgICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVZlcnR4VGltZXIoKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVNldFRpbWVvdXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2g7XG4gICAgLy8gRGVjaWRlIHdoYXQgYXN5bmMgbWV0aG9kIHRvIHVzZSB0byB0cmlnZ2VyaW5nIHByb2Nlc3Npbmcgb2YgcXVldWVkIGNhbGxiYWNrczpcbiAgICBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGlzTm9kZSkge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTmV4dFRpY2soKTtcbiAgICB9IGVsc2UgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTXV0YXRpb25PYnNlcnZlcigpO1xuICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGlzV29ya2VyKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VNZXNzYWdlQ2hhbm5lbCgpO1xuICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJXaW5kb3cgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXR0ZW1wdFZlcnR4KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVNldFRpbWVvdXQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKCkge31cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICAgPSB2b2lkIDA7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCA9IDE7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEICA9IDI7XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IgPSBuZXcgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHNlbGZGdWxmaWxsbWVudCgpIHtcbiAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRjYW5ub3RSZXR1cm5Pd24oKSB7XG4gICAgICByZXR1cm4gbmV3IFR5cGVFcnJvcignQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGdldFRoZW4ocHJvbWlzZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbjtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSwgdGhlbikge1xuICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGZ1bmN0aW9uKHByb21pc2UpIHtcbiAgICAgICAgdmFyIHNlYWxlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgZXJyb3IgPSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCR0cnlUaGVuKHRoZW4sIHRoZW5hYmxlLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBpZiAoc2VhbGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG5cbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSwgJ1NldHRsZTogJyArIChwcm9taXNlLl9sYWJlbCB8fCAnIHVua25vd24gcHJvbWlzZScpKTtcblxuICAgICAgICBpZiAoIXNlYWxlZCAmJiBlcnJvcikge1xuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUpIHtcbiAgICAgIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKSB7XG4gICAgICBpZiAobWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3RvciA9PT0gcHJvbWlzZS5jb25zdHJ1Y3Rvcikge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0aGVuID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZ2V0VGhlbihtYXliZVRoZW5hYmxlKTtcblxuICAgICAgICBpZiAodGhlbiA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoZW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0Z1bmN0aW9uKHRoZW4pKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUsIHRoZW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKSB7XG4gICAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHNlbGZGdWxmaWxsbWVudCgpKTtcbiAgICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJHV0aWxzJCRvYmplY3RPckZ1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2hSZWplY3Rpb24ocHJvbWlzZSkge1xuICAgICAgaWYgKHByb21pc2UuX29uZXJyb3IpIHtcbiAgICAgICAgcHJvbWlzZS5fb25lcnJvcihwcm9taXNlLl9yZXN1bHQpO1xuICAgICAgfVxuXG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykgeyByZXR1cm47IH1cblxuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gdmFsdWU7XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRDtcblxuICAgICAgaWYgKHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoLCBwcm9taXNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEO1xuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gcmVhc29uO1xuXG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgIHZhciBzdWJzY3JpYmVycyA9IHBhcmVudC5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgbGVuZ3RoID0gc3Vic2NyaWJlcnMubGVuZ3RoO1xuXG4gICAgICBwYXJlbnQuX29uZXJyb3IgPSBudWxsO1xuXG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGhdID0gY2hpbGQ7XG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGggKyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRURdID0gb25GdWxmaWxsbWVudDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEXSAgPSBvblJlamVjdGlvbjtcblxuICAgICAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2gsIHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcHVibGlzaChwcm9taXNlKSB7XG4gICAgICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgICAgIHZhciBzZXR0bGVkID0gcHJvbWlzZS5fc3RhdGU7XG5cbiAgICAgIGlmIChzdWJzY3JpYmVycy5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG5cbiAgICAgIHZhciBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCA9IHByb21pc2UuX3Jlc3VsdDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICBjaGlsZCA9IHN1YnNjcmliZXJzW2ldO1xuICAgICAgICBjYWxsYmFjayA9IHN1YnNjcmliZXJzW2kgKyBzZXR0bGVkXTtcblxuICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCkge1xuICAgICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUiA9IG5ldyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRFcnJvck9iamVjdCgpO1xuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SLmVycm9yID0gZTtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB2YXIgaGFzQ2FsbGJhY2sgPSBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24oY2FsbGJhY2spLFxuICAgICAgICAgIHZhbHVlLCBlcnJvciwgc3VjY2VlZGVkLCBmYWlsZWQ7XG5cbiAgICAgIGlmIChoYXNDYWxsYmFjaykge1xuICAgICAgICB2YWx1ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICAgICAgZmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICBlcnJvciA9IHZhbHVlLmVycm9yO1xuICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGNhbm5vdFJldHVybk93bigpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBkZXRhaWw7XG4gICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAvLyBub29wXG4gICAgICB9IGVsc2UgaWYgKGhhc0NhbGxiYWNrICYmIHN1Y2NlZWRlZCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoZmFpbGVkKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZShwcm9taXNlLCByZXNvbHZlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UodmFsdWUpe1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbiByZWplY3RQcm9taXNlKHJlYXNvbikge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IoQ29uc3RydWN0b3IsIGlucHV0KSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG5cbiAgICAgIGVudW1lcmF0b3IuX2luc3RhbmNlQ29uc3RydWN0b3IgPSBDb25zdHJ1Y3RvcjtcbiAgICAgIGVudW1lcmF0b3IucHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcblxuICAgICAgaWYgKGVudW1lcmF0b3IuX3ZhbGlkYXRlSW5wdXQoaW5wdXQpKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX2lucHV0ICAgICA9IGlucHV0O1xuICAgICAgICBlbnVtZXJhdG9yLmxlbmd0aCAgICAgPSBpbnB1dC5sZW5ndGg7XG4gICAgICAgIGVudW1lcmF0b3IuX3JlbWFpbmluZyA9IGlucHV0Lmxlbmd0aDtcblxuICAgICAgICBlbnVtZXJhdG9yLl9pbml0KCk7XG5cbiAgICAgICAgaWYgKGVudW1lcmF0b3IubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChlbnVtZXJhdG9yLnByb21pc2UsIGVudW1lcmF0b3IuX3Jlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW51bWVyYXRvci5sZW5ndGggPSBlbnVtZXJhdG9yLmxlbmd0aCB8fCAwO1xuICAgICAgICAgIGVudW1lcmF0b3IuX2VudW1lcmF0ZSgpO1xuICAgICAgICAgIGlmIChlbnVtZXJhdG9yLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwoZW51bWVyYXRvci5wcm9taXNlLCBlbnVtZXJhdG9yLl9yZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KGVudW1lcmF0b3IucHJvbWlzZSwgZW51bWVyYXRvci5fdmFsaWRhdGlvbkVycm9yKCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fdmFsaWRhdGVJbnB1dCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0FycmF5KGlucHV0KTtcbiAgICB9O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ0FycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheScpO1xuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3Jlc3VsdCA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XG4gICAgfTtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yO1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgICAgdmFyIGxlbmd0aCAgPSBlbnVtZXJhdG9yLmxlbmd0aDtcbiAgICAgIHZhciBwcm9taXNlID0gZW51bWVyYXRvci5wcm9taXNlO1xuICAgICAgdmFyIGlucHV0ICAgPSBlbnVtZXJhdG9yLl9pbnB1dDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBlbnVtZXJhdG9yLl9lYWNoRW50cnkoaW5wdXRbaV0sIGkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uKGVudHJ5LCBpKSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG4gICAgICB2YXIgYyA9IGVudW1lcmF0b3IuX2luc3RhbmNlQ29uc3RydWN0b3I7XG5cbiAgICAgIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZShlbnRyeSkpIHtcbiAgICAgICAgaWYgKGVudHJ5LmNvbnN0cnVjdG9yID09PSBjICYmIGVudHJ5Ll9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAgIGVudHJ5Ll9vbmVycm9yID0gbnVsbDtcbiAgICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQoZW50cnkuX3N0YXRlLCBpLCBlbnRyeS5fcmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnVtZXJhdG9yLl93aWxsU2V0dGxlQXQoYy5yZXNvbHZlKGVudHJ5KSwgaSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3JlbWFpbmluZy0tO1xuICAgICAgICBlbnVtZXJhdG9yLl9yZXN1bHRbaV0gPSBlbnRyeTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9zZXR0bGVkQXQgPSBmdW5jdGlvbihzdGF0ZSwgaSwgdmFsdWUpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcbiAgICAgIHZhciBwcm9taXNlID0gZW51bWVyYXRvci5wcm9taXNlO1xuXG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgZW51bWVyYXRvci5fcmVtYWluaW5nLS07XG5cbiAgICAgICAgaWYgKHN0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW51bWVyYXRvci5fcmVzdWx0W2ldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVudW1lcmF0b3IuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIGVudW1lcmF0b3IuX3Jlc3VsdCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fd2lsbFNldHRsZUF0ID0gZnVuY3Rpb24ocHJvbWlzZSwgaSkge1xuICAgICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuXG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocHJvbWlzZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRlVMRklMTEVELCBpLCB2YWx1ZSk7XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgZW51bWVyYXRvci5fc2V0dGxlZEF0KGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVELCBpLCByZWFzb24pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGFsbChlbnRyaWVzKSB7XG4gICAgICByZXR1cm4gbmV3IGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRkZWZhdWx0KHRoaXMsIGVudHJpZXMpLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGFsbDtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRyYWNlKGVudHJpZXMpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcblxuICAgICAgaWYgKCFsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzQXJyYXkoZW50cmllcykpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYW4gYXJyYXkgdG8gcmFjZS4nKSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGVuZ3RoID0gZW50cmllcy5sZW5ndGg7XG5cbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbG1lbnQodmFsdWUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0aW9uKHJlYXNvbikge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IHByb21pc2UuX3N0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUoQ29uc3RydWN0b3IucmVzb2x2ZShlbnRyaWVzW2ldKSwgdW5kZWZpbmVkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmFjZSQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJhY2UkJHJhY2U7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkcmVzb2x2ZShvYmplY3QpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gICAgICBpZiAob2JqZWN0ICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdC5jb25zdHJ1Y3RvciA9PT0gQ29uc3RydWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgIH1cblxuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIG9iamVjdCk7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZXNvbHZlJCRyZXNvbHZlO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlamVjdCQkcmVqZWN0KHJlYXNvbikge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZWplY3QkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZWplY3QkJHJlamVjdDtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkY291bnRlciA9IDA7XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNSZXNvbHZlcigpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYSByZXNvbHZlciBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3InKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNOZXcoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlO1xuICAgIC8qKlxuICAgICAgUHJvbWlzZSBvYmplY3RzIHJlcHJlc2VudCB0aGUgZXZlbnR1YWwgcmVzdWx0IG9mIGFuIGFzeW5jaHJvbm91cyBvcGVyYXRpb24uIFRoZVxuICAgICAgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCwgd2hpY2hcbiAgICAgIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNlJ3MgZXZlbnR1YWwgdmFsdWUgb3IgdGhlIHJlYXNvblxuICAgICAgd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgICAgIFRlcm1pbm9sb2d5XG4gICAgICAtLS0tLS0tLS0tLVxuXG4gICAgICAtIGBwcm9taXNlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gd2l0aCBhIGB0aGVuYCBtZXRob2Qgd2hvc2UgYmVoYXZpb3IgY29uZm9ybXMgdG8gdGhpcyBzcGVjaWZpY2F0aW9uLlxuICAgICAgLSBgdGhlbmFibGVgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB0aGF0IGRlZmluZXMgYSBgdGhlbmAgbWV0aG9kLlxuICAgICAgLSBgdmFsdWVgIGlzIGFueSBsZWdhbCBKYXZhU2NyaXB0IHZhbHVlIChpbmNsdWRpbmcgdW5kZWZpbmVkLCBhIHRoZW5hYmxlLCBvciBhIHByb21pc2UpLlxuICAgICAgLSBgZXhjZXB0aW9uYCBpcyBhIHZhbHVlIHRoYXQgaXMgdGhyb3duIHVzaW5nIHRoZSB0aHJvdyBzdGF0ZW1lbnQuXG4gICAgICAtIGByZWFzb25gIGlzIGEgdmFsdWUgdGhhdCBpbmRpY2F0ZXMgd2h5IGEgcHJvbWlzZSB3YXMgcmVqZWN0ZWQuXG4gICAgICAtIGBzZXR0bGVkYCB0aGUgZmluYWwgcmVzdGluZyBzdGF0ZSBvZiBhIHByb21pc2UsIGZ1bGZpbGxlZCBvciByZWplY3RlZC5cblxuICAgICAgQSBwcm9taXNlIGNhbiBiZSBpbiBvbmUgb2YgdGhyZWUgc3RhdGVzOiBwZW5kaW5nLCBmdWxmaWxsZWQsIG9yIHJlamVjdGVkLlxuXG4gICAgICBQcm9taXNlcyB0aGF0IGFyZSBmdWxmaWxsZWQgaGF2ZSBhIGZ1bGZpbGxtZW50IHZhbHVlIGFuZCBhcmUgaW4gdGhlIGZ1bGZpbGxlZFxuICAgICAgc3RhdGUuICBQcm9taXNlcyB0aGF0IGFyZSByZWplY3RlZCBoYXZlIGEgcmVqZWN0aW9uIHJlYXNvbiBhbmQgYXJlIGluIHRoZVxuICAgICAgcmVqZWN0ZWQgc3RhdGUuICBBIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5ldmVyIGEgdGhlbmFibGUuXG5cbiAgICAgIFByb21pc2VzIGNhbiBhbHNvIGJlIHNhaWQgdG8gKnJlc29sdmUqIGEgdmFsdWUuICBJZiB0aGlzIHZhbHVlIGlzIGFsc28gYVxuICAgICAgcHJvbWlzZSwgdGhlbiB0aGUgb3JpZ2luYWwgcHJvbWlzZSdzIHNldHRsZWQgc3RhdGUgd2lsbCBtYXRjaCB0aGUgdmFsdWUnc1xuICAgICAgc2V0dGxlZCBzdGF0ZS4gIFNvIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgcmVqZWN0cyB3aWxsXG4gICAgICBpdHNlbGYgcmVqZWN0LCBhbmQgYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCBmdWxmaWxscyB3aWxsXG4gICAgICBpdHNlbGYgZnVsZmlsbC5cblxuXG4gICAgICBCYXNpYyBVc2FnZTpcbiAgICAgIC0tLS0tLS0tLS0tLVxuXG4gICAgICBgYGBqc1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgLy8gb24gc3VjY2Vzc1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcblxuICAgICAgICAvLyBvbiBmYWlsdXJlXG4gICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG5cbiAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAvLyBvbiBmdWxmaWxsbWVudFxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIC8vIG9uIHJlamVjdGlvblxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQWR2YW5jZWQgVXNhZ2U6XG4gICAgICAtLS0tLS0tLS0tLS0tLS1cblxuICAgICAgUHJvbWlzZXMgc2hpbmUgd2hlbiBhYnN0cmFjdGluZyBhd2F5IGFzeW5jaHJvbm91cyBpbnRlcmFjdGlvbnMgc3VjaCBhc1xuICAgICAgYFhNTEh0dHBSZXF1ZXN0YHMuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmdW5jdGlvbiBnZXRKU09OKHVybCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gaGFuZGxlcjtcbiAgICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHhoci5zZW5kKCk7XG5cbiAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gdGhpcy5ET05FKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdnZXRKU09OOiBgJyArIHVybCArICdgIGZhaWxlZCB3aXRoIHN0YXR1czogWycgKyB0aGlzLnN0YXR1cyArICddJykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGdldEpTT04oJy9wb3N0cy5qc29uJykudGhlbihmdW5jdGlvbihqc29uKSB7XG4gICAgICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgLy8gb24gcmVqZWN0aW9uXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBVbmxpa2UgY2FsbGJhY2tzLCBwcm9taXNlcyBhcmUgZ3JlYXQgY29tcG9zYWJsZSBwcmltaXRpdmVzLlxuXG4gICAgICBgYGBqc1xuICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICBnZXRKU09OKCcvcG9zdHMnKSxcbiAgICAgICAgZ2V0SlNPTignL2NvbW1lbnRzJylcbiAgICAgIF0pLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcbiAgICAgICAgdmFsdWVzWzBdIC8vID0+IHBvc3RzSlNPTlxuICAgICAgICB2YWx1ZXNbMV0gLy8gPT4gY29tbWVudHNKU09OXG5cbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBjbGFzcyBQcm9taXNlXG4gICAgICBAcGFyYW0ge2Z1bmN0aW9ufSByZXNvbHZlclxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQGNvbnN0cnVjdG9yXG4gICAgKi9cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZShyZXNvbHZlcikge1xuICAgICAgdGhpcy5faWQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkY291bnRlcisrO1xuICAgICAgdGhpcy5fc3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9yZXN1bHQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycyA9IFtdO1xuXG4gICAgICBpZiAobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCAhPT0gcmVzb2x2ZXIpIHtcbiAgICAgICAgaWYgKCFsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24ocmVzb2x2ZXIpKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJG5lZWRzUmVzb2x2ZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZSkpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNOZXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGluaXRpYWxpemVQcm9taXNlKHRoaXMsIHJlc29sdmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5hbGwgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmFjZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJhY2UkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmVzb2x2ZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmVqZWN0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0O1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLl9zZXRTY2hlZHVsZXIgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2V0U2NoZWR1bGVyO1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLl9zZXRBc2FwID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHNldEFzYXA7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UuX2FzYXAgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcDtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnByb3RvdHlwZSA9IHtcbiAgICAgIGNvbnN0cnVjdG9yOiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZSxcblxuICAgIC8qKlxuICAgICAgVGhlIHByaW1hcnkgd2F5IG9mIGludGVyYWN0aW5nIHdpdGggYSBwcm9taXNlIGlzIHRocm91Z2ggaXRzIGB0aGVuYCBtZXRob2QsXG4gICAgICB3aGljaCByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZSdzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZVxuICAgICAgcmVhc29uIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAvLyB1c2VyIGlzIGF2YWlsYWJsZVxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gdXNlciBpcyB1bmF2YWlsYWJsZSwgYW5kIHlvdSBhcmUgZ2l2ZW4gdGhlIHJlYXNvbiB3aHlcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIENoYWluaW5nXG4gICAgICAtLS0tLS0tLVxuXG4gICAgICBUaGUgcmV0dXJuIHZhbHVlIG9mIGB0aGVuYCBpcyBpdHNlbGYgYSBwcm9taXNlLiAgVGhpcyBzZWNvbmQsICdkb3duc3RyZWFtJ1xuICAgICAgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZpcnN0IHByb21pc2UncyBmdWxmaWxsbWVudFxuICAgICAgb3IgcmVqZWN0aW9uIGhhbmRsZXIsIG9yIHJlamVjdGVkIGlmIHRoZSBoYW5kbGVyIHRocm93cyBhbiBleGNlcHRpb24uXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIHVzZXIubmFtZTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0IG5hbWUnO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodXNlck5hbWUpIHtcbiAgICAgICAgLy8gSWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGB1c2VyTmFtZWAgd2lsbCBiZSB0aGUgdXNlcidzIG5hbWUsIG90aGVyd2lzZSBpdFxuICAgICAgICAvLyB3aWxsIGJlIGAnZGVmYXVsdCBuYW1lJ2BcbiAgICAgIH0pO1xuXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScpO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gaWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGByZWFzb25gIHdpbGwgYmUgJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jy5cbiAgICAgICAgLy8gSWYgYGZpbmRVc2VyYCByZWplY3RlZCwgYHJlYXNvbmAgd2lsbCBiZSAnYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScuXG4gICAgICB9KTtcbiAgICAgIGBgYFxuICAgICAgSWYgdGhlIGRvd25zdHJlYW0gcHJvbWlzZSBkb2VzIG5vdCBzcGVjaWZ5IGEgcmVqZWN0aW9uIGhhbmRsZXIsIHJlamVjdGlvbiByZWFzb25zIHdpbGwgYmUgcHJvcGFnYXRlZCBmdXJ0aGVyIGRvd25zdHJlYW0uXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFBlZGFnb2dpY2FsRXhjZXB0aW9uKCdVcHN0cmVhbSBlcnJvcicpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBUaGUgYFBlZGdhZ29jaWFsRXhjZXB0aW9uYCBpcyBwcm9wYWdhdGVkIGFsbCB0aGUgd2F5IGRvd24gdG8gaGVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQXNzaW1pbGF0aW9uXG4gICAgICAtLS0tLS0tLS0tLS1cblxuICAgICAgU29tZXRpbWVzIHRoZSB2YWx1ZSB5b3Ugd2FudCB0byBwcm9wYWdhdGUgdG8gYSBkb3duc3RyZWFtIHByb21pc2UgY2FuIG9ubHkgYmVcbiAgICAgIHJldHJpZXZlZCBhc3luY2hyb25vdXNseS4gVGhpcyBjYW4gYmUgYWNoaWV2ZWQgYnkgcmV0dXJuaW5nIGEgcHJvbWlzZSBpbiB0aGVcbiAgICAgIGZ1bGZpbGxtZW50IG9yIHJlamVjdGlvbiBoYW5kbGVyLiBUaGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgdGhlbiBiZSBwZW5kaW5nXG4gICAgICB1bnRpbCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBzZXR0bGVkLiBUaGlzIGlzIGNhbGxlZCAqYXNzaW1pbGF0aW9uKi5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgICAgICAvLyBUaGUgdXNlcidzIGNvbW1lbnRzIGFyZSBub3cgYXZhaWxhYmxlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBJZiB0aGUgYXNzaW1saWF0ZWQgcHJvbWlzZSByZWplY3RzLCB0aGVuIHRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCBhbHNvIHJlamVjdC5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIGZ1bGZpbGxzLCB3ZSdsbCBoYXZlIHRoZSB2YWx1ZSBoZXJlXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgcmVqZWN0cywgd2UnbGwgaGF2ZSB0aGUgcmVhc29uIGhlcmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFNpbXBsZSBFeGFtcGxlXG4gICAgICAtLS0tLS0tLS0tLS0tLVxuXG4gICAgICBTeW5jaHJvbm91cyBFeGFtcGxlXG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IGZpbmRSZXN1bHQoKTtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEVycmJhY2sgRXhhbXBsZVxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFJlc3VsdChmdW5jdGlvbihyZXN1bHQsIGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAvLyBmYWlsdXJlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIGZpbmRSZXN1bHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFkdmFuY2VkIEV4YW1wbGVcbiAgICAgIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFN5bmNocm9ub3VzIEV4YW1wbGVcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgdmFyIGF1dGhvciwgYm9va3M7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF1dGhvciA9IGZpbmRBdXRob3IoKTtcbiAgICAgICAgYm9va3MgID0gZmluZEJvb2tzQnlBdXRob3IoYXV0aG9yKTtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEVycmJhY2sgRXhhbXBsZVxuXG4gICAgICBgYGBqc1xuXG4gICAgICBmdW5jdGlvbiBmb3VuZEJvb2tzKGJvb2tzKSB7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZmFpbHVyZShyZWFzb24pIHtcblxuICAgICAgfVxuXG4gICAgICBmaW5kQXV0aG9yKGZ1bmN0aW9uKGF1dGhvciwgZXJyKXtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICAvLyBmYWlsdXJlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZpbmRCb29va3NCeUF1dGhvcihhdXRob3IsIGZ1bmN0aW9uKGJvb2tzLCBlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgZm91bmRCb29rcyhib29rcyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgIGZhaWx1cmUocmVhc29uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIGZpbmRBdXRob3IoKS5cbiAgICAgICAgdGhlbihmaW5kQm9va3NCeUF1dGhvcikuXG4gICAgICAgIHRoZW4oZnVuY3Rpb24oYm9va3Mpe1xuICAgICAgICAgIC8vIGZvdW5kIGJvb2tzXG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCB0aGVuXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZ1bGZpbGxlZFxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3RlZFxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQHJldHVybiB7UHJvbWlzZX1cbiAgICAqL1xuICAgICAgdGhlbjogZnVuY3Rpb24ob25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXM7XG4gICAgICAgIHZhciBzdGF0ZSA9IHBhcmVudC5fc3RhdGU7XG5cbiAgICAgICAgaWYgKHN0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRUQgJiYgIW9uRnVsZmlsbG1lbnQgfHwgc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEICYmICFvblJlamVjdGlvbikge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IHRoaXMuY29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICAgIHZhciByZXN1bHQgPSBwYXJlbnQuX3Jlc3VsdDtcblxuICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbc3RhdGUgLSAxXTtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc3RhdGUsIGNoaWxkLCBjYWxsYmFjaywgcmVzdWx0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgfSxcblxuICAgIC8qKlxuICAgICAgYGNhdGNoYCBpcyBzaW1wbHkgc3VnYXIgZm9yIGB0aGVuKHVuZGVmaW5lZCwgb25SZWplY3Rpb24pYCB3aGljaCBtYWtlcyBpdCB0aGUgc2FtZVxuICAgICAgYXMgdGhlIGNhdGNoIGJsb2NrIG9mIGEgdHJ5L2NhdGNoIHN0YXRlbWVudC5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGZpbmRBdXRob3IoKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZG4ndCBmaW5kIHRoYXQgYXV0aG9yJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIHN5bmNocm9ub3VzXG4gICAgICB0cnkge1xuICAgICAgICBmaW5kQXV0aG9yKCk7XG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfVxuXG4gICAgICAvLyBhc3luYyB3aXRoIHByb21pc2VzXG4gICAgICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgY2F0Y2hcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0aW9uXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0aW9uKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkcG9seWZpbGwoKSB7XG4gICAgICB2YXIgbG9jYWw7XG5cbiAgICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGxvY2FsID0gZ2xvYmFsO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBsb2NhbCA9IHNlbGY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGxvY2FsID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50Jyk7XG4gICAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgUCA9IGxvY2FsLlByb21pc2U7XG5cbiAgICAgIGlmIChQICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChQLnJlc29sdmUoKSkgPT09ICdbb2JqZWN0IFByb21pc2VdJyAmJiAhUC5jYXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbG9jYWwuUHJvbWlzZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0O1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRwb2x5ZmlsbDtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlID0ge1xuICAgICAgJ1Byb21pc2UnOiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkZGVmYXVsdCxcbiAgICAgICdwb2x5ZmlsbCc6IGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdFxuICAgIH07XG5cbiAgICAvKiBnbG9iYWwgZGVmaW5lOnRydWUgbW9kdWxlOnRydWUgd2luZG93OiB0cnVlICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSkge1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gbGliJGVzNiRwcm9taXNlJHVtZCQkRVM2UHJvbWlzZTsgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGVbJ2V4cG9ydHMnXSkge1xuICAgICAgbW9kdWxlWydleHBvcnRzJ10gPSBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzWydFUzZQcm9taXNlJ10gPSBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdCgpO1xufSkuY2FsbCh0aGlzKTtcblxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJjbGFzcyBBdXRvY29tcGxldGVQcm92aWRlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmxvb2t1cHMgPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9jb250ZXh0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pbmRleCA9IC0xO1xyXG4gICAgICAgIHRoaXMuX3ZhbHVlcyA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3ByZWRlZmluZUxvb2t1cHMoKTtcclxuICAgIH1cclxuICAgICAgICBcclxuICAgIGJpbmQoc2hlbGwpIHsgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVuYmluZChzaGVsbCkge1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXROZXh0VmFsdWUoZm9yd2FyZCwgY29udGV4dCkge1xyXG4gICAgICAgIGlmIChjb250ZXh0ICE9PSB0aGlzLl9jb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xyXG4gICAgICAgICAgICB0aGlzLl9pbmRleCA9IC0xOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLl92YWx1ZXMgPSB0aGlzLl9sb29rdXBWYWx1ZXMoY29udGV4dCk7IFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW3RoaXMuX3ZhbHVlc10pLnRoZW4oKHZhbHVlcykgPT4ge1xyXG4gICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXNbMF07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgY29tcGxldGVWYWx1ZXMgPSB2YWx1ZXMuZmlsdGVyKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQuaW5jb21wbGV0ZVZhbHVlID09PSAnJyB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnRvTG93ZXJDYXNlKCkuc2xpY2UoMCwgY29udGV4dC5pbmNvbXBsZXRlVmFsdWUudG9Mb3dlckNhc2UoKS5sZW5ndGgpID09PSBjb250ZXh0LmluY29tcGxldGVWYWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChjb21wbGV0ZVZhbHVlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodGhpcy5faW5kZXggPj0gY29tcGxldGVWYWx1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmRleCA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChmb3J3YXJkICYmIHRoaXMuX2luZGV4IDwgY29tcGxldGVWYWx1ZXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5kZXgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChmb3J3YXJkICYmIHRoaXMuX2luZGV4ID49IGNvbXBsZXRlVmFsdWVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghZm9yd2FyZCAmJiB0aGlzLl9pbmRleCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4LS07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIWZvcndhcmQgJiYgdGhpcy5faW5kZXggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5kZXggPSBjb21wbGV0ZVZhbHVlcy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gY29tcGxldGVWYWx1ZXNbdGhpcy5faW5kZXhdO1xyXG4gICAgICAgIH0pOyAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIF9sb29rdXBWYWx1ZXMoY29udGV4dCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZ1bmN0aW9uIHJlc29sdmVWYWx1ZXModmFsdWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlcykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWVzID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVzKGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgbG9va3VwIG9mIHRoaXMubG9va3VwcykgeyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgcmVzdWx0cyA9IHJlc29sdmVWYWx1ZXMobG9va3VwKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdHMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBfcHJlZGVmaW5lTG9va3VwcygpIHtcclxuICAgICAgICBcclxuICAgICAgICBmdW5jdGlvbiBjb21tYW5kTmFtZUxvb2t1cChjb250ZXh0KSB7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChjb250ZXh0LnByZWN1cnNvclZhbHVlLnRyaW0oKSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoY29udGV4dC5zaGVsbC5kZWZpbml0aW9uUHJvdmlkZXIuZGVmaW5pdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmxvb2t1cHMucHVzaChjb21tYW5kTmFtZUxvb2t1cCk7ICAgICAgICBcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXV0b2NvbXBsZXRlUHJvdmlkZXI7IiwiY2xhc3MgQ2FuY2VsVG9rZW4ge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5faXNDYW5jZWxSZXF1ZXN0ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9jYW5jZWxIYW5kbGVycyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBpc0NhbmNlbFJlcXVlc3RlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNDYW5jZWxSZXF1ZXN0ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgY2FuY2VsKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNDYW5jZWxSZXF1ZXN0ZWQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiB0aGlzLl9jYW5jZWxIYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pc0NhbmNlbFJlcXVlc3RlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVuY2FuY2VsKCkge1xyXG4gICAgICAgIHRoaXMuX2lzQ2FuY2VsUmVxdWVzdGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgb25DYW5jZWwoaGFuZGxlcikge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0NhbmNlbFJlcXVlc3RlZCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcih0aGlzKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2NhbmNlbEhhbmRsZXJzLnB1c2goaGFuZGxlcik7XHJcbiAgICB9XHJcblxyXG4gICAgb2ZmQ2FuY2VsKGhhbmRsZXIpIHtcclxuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLl9jYW5jZWxIYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpO1xyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhbmNlbEhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDYW5jZWxUb2tlbjsiLCJpbXBvcnQgcHJvbWlzZSBmcm9tICdlczYtcHJvbWlzZSc7XHJcbnByb21pc2UucG9seWZpbGwoKTtcclxuXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2hlbGwgfSBmcm9tICcuL3NoZWxsLmpzJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBPdmVybGF5U2hlbGwgfSBmcm9tICcuL292ZXJsYXktc2hlbGwuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbW1hbmRIYW5kbGVyIH0gZnJvbSAnLi9jb21tYW5kLWhhbmRsZXIuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbW1hbmRQYXJzZXIgfSBmcm9tICcuL2NvbW1hbmQtcGFyc2VyLmpzJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBIaXN0b3J5UHJvdmlkZXIgfSBmcm9tICcuL2hpc3RvcnktcHJvdmlkZXIuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEF1dG9jb21wbGV0ZVByb3ZpZGVyIH0gZnJvbSAnLi9hdXRvY29tcGxldGUtcHJvdmlkZXIuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIERlZmluaXRpb25Qcm92aWRlciB9IGZyb20gJy4vZGVmaW5pdGlvbi1wcm92aWRlci5qcyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgRGVmaW5pdGlvbiB9IGZyb20gJy4vZGVmaW5pdGlvbi5qcyc7XHJcbmV4cG9ydCBjb25zdCB2ZXJzaW9uID0gJzEuMS4xMSc7IiwiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy5qcyc7XHJcblxyXG5jb25zdCBfZGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICBjb250ZXh0RXh0ZW5zaW9uczoge31cclxufTtcclxuXHJcbmNsYXNzIENvbW1hbmRIYW5kbGVyIHtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykgeyAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gdXRpbHMuZXh0ZW5kKHt9LCBfZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAgZXhlY3V0ZUNvbW1hbmQoc2hlbGwsIGNvbW1hbmQsIGNhbmNlbFRva2VuKSB7IFxyXG4gICAgICAgIGxldCBwYXJzZWQgPSBzaGVsbC5jb21tYW5kUGFyc2VyLnBhcnNlQ29tbWFuZChjb21tYW5kKTtcclxuXHJcbiAgICAgICAgbGV0IGRlZmluaXRpb25zID0gc2hlbGwuZGVmaW5pdGlvblByb3ZpZGVyLmdldERlZmluaXRpb25zKHBhcnNlZC5uYW1lKTtcclxuICAgICAgICBpZiAoIWRlZmluaXRpb25zIHx8IGRlZmluaXRpb25zLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgc2hlbGwud3JpdGVMaW5lKCdJbnZhbGlkIGNvbW1hbmQnLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBzaGVsbC53cml0ZUxpbmUoJ0FtYmlndW91cyBjb21tYW5kJywgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgIHNoZWxsLndyaXRlTGluZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZmluaXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBzaGVsbC53cml0ZVBhZChkZWZpbml0aW9uc1tpXS5uYW1lLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBzaGVsbC53cml0ZUxpbmUoZGVmaW5pdGlvbnNbaV0uZGVzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNoZWxsLndyaXRlTGluZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZGVmaW5pdGlvbiA9IGRlZmluaXRpb25zWzBdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICBzaGVsbDogc2hlbGwsXHJcbiAgICAgICAgICAgIGNvbW1hbmQ6IGNvbW1hbmQsXHJcbiAgICAgICAgICAgIGRlZmluaXRpb246IGRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIHBhcnNlZDogcGFyc2VkLFxyXG4gICAgICAgICAgICBkZWZlcjogdXRpbHMuZGVmZXIsXHJcbiAgICAgICAgICAgIGNhbmNlbFRva2VuOiBjYW5jZWxUb2tlblxyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgdXRpbHMuZXh0ZW5kKGNvbnRleHQsIHRoaXMub3B0aW9ucy5jb250ZXh0RXh0ZW5zaW9ucyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGFyZ3MgPSBwYXJzZWQuYXJncztcclxuICAgICAgICBcclxuICAgICAgICBpZiAoZGVmaW5pdGlvbi5oZWxwICYmIGFyZ3MubGVuZ3RoID4gMCAmJiBhcmdzW2FyZ3MubGVuZ3RoLTFdID09PSBcIi8/XCIpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkZWZpbml0aW9uLmhlbHAgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBzaGVsbC53cml0ZUxpbmUoZGVmaW5pdGlvbi5oZWxwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5pdGlvbi5oZWxwID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmaW5pdGlvbi5oZWxwLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGVmaW5pdGlvbi5tYWluLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDb21tYW5kSGFuZGxlcjsiLCJjbGFzcyBDb21tYW5kUGFyc2VyIHtcclxuICAgIFxyXG4gICAgIHBhcnNlQ29tbWFuZChjb21tYW5kKSB7IFxyXG4gICAgICAgIGxldCBleHAgPSAvW15cXHNcIl0rfFwiKFteXCJdKilcIi9naSxcclxuICAgICAgICAgICAgbmFtZSA9IG51bGwsXHJcbiAgICAgICAgICAgIGFyZ1N0cmluZyA9IG51bGwsXHJcbiAgICAgICAgICAgIGFyZ3MgPSBbXSxcclxuICAgICAgICAgICAgbWF0Y2ggPSBudWxsO1xyXG5cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIG1hdGNoID0gZXhwLmV4ZWMoY29tbWFuZCk7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gbWF0Y2hbMV0gPyBtYXRjaFsxXSA6IG1hdGNoWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoLmluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZ1N0cmluZyA9IGNvbW1hbmQuc3Vic3RyKHZhbHVlLmxlbmd0aCArIChtYXRjaFsxXSA/IDMgOiAxKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IHdoaWxlIChtYXRjaCAhPT0gbnVsbCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgICAgIGFyZ1N0cmluZzogYXJnU3RyaW5nLFxyXG4gICAgICAgICAgICBhcmdzOiBhcmdzXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ29tbWFuZFBhcnNlcjsiLCJpbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IERlZmluaXRpb24gZnJvbSAnLi9kZWZpbml0aW9uLmpzJztcclxuXHJcbmNvbnN0IF9kZWZhdWx0T3B0aW9ucyA9IHtcclxuICAgIHByZWRlZmluZWQ6IFsnSEVMUCcsICdFQ0hPJywgJ0NMUyddLFxyXG4gICAgYWxsb3dBYmJyZXZpYXRpb25zOiB0cnVlXHJcbn07XHJcblxyXG5jbGFzcyBEZWZpbml0aW9uUHJvdmlkZXIge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHV0aWxzLmV4dGVuZCh7fSwgX2RlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzLmRlZmluaXRpb25zID0ge307XHJcblxyXG4gICAgICAgIHRoaXMuZGVmaW5lID0gKC4uLmFyZ3MpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hZGREZWZpbml0aW9uKG5ldyBEZWZpbml0aW9uKC4uLmFyZ3MpKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLl9wcmVkZWZpbmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBiaW5kKHNoZWxsKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzaGVsbC5kZWZpbmUgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHNoZWxsLmRlZmluZSA9IHRoaXMuZGVmaW5lO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1bmJpbmQoc2hlbGwpIHtcclxuICAgICAgICBpZiAoc2hlbGwuZGVmaW5lID09PSB0aGlzLmRlZmluZSkge1xyXG4gICAgICAgICAgICBkZWxldGUgc2hlbGwuZGVmaW5lO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXREZWZpbml0aW9ucyhuYW1lKSB7XHJcbiAgICAgICAgbmFtZSA9IG5hbWUudG9VcHBlckNhc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGRlZmluaXRpb24gPSB0aGlzLmRlZmluaXRpb25zW25hbWVdO1xyXG5cclxuICAgICAgICBpZiAoZGVmaW5pdGlvbikge1xyXG4gICAgICAgICAgICBpZiAoZGVmaW5pdGlvbi5hdmFpbGFibGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbZGVmaW5pdGlvbl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZGVmaW5pdGlvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGxvd0FiYnJldmlhdGlvbnMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMuZGVmaW5pdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihuYW1lLCAwKSA9PT0gMCAmJiB1dGlscy51bndyYXAodGhpcy5kZWZpbml0aW9uc1trZXldLmF2YWlsYWJsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9ucy5wdXNoKHRoaXMuZGVmaW5pdGlvbnNba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZpbml0aW9ucztcclxuICAgIH1cclxuXHJcbiAgICBhZGREZWZpbml0aW9uKGRlZmluaXRpb24pIHtcclxuICAgICAgICB0aGlzLmRlZmluaXRpb25zW2RlZmluaXRpb24ubmFtZV0gPSBkZWZpbml0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIF9wcmVkZWZpbmUoKSB7XHJcbiAgICAgICAgbGV0IHByb3ZpZGVyID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wcmVkZWZpbmVkLmluZGV4T2YoJ0hFTFAnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVmaW5lKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdIRUxQJyxcclxuICAgICAgICAgICAgICAgIG1haW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNoZWxsLndyaXRlTGluZSgnVGhlIGZvbGxvd2luZyBjb21tYW5kcyBhcmUgYXZhaWxhYmxlOicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hlbGwud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGF2YWlsYWJsZURlZmluaXRpb25zID0gT2JqZWN0LmtleXMocHJvdmlkZXIuZGVmaW5pdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGtleSkgPT4geyByZXR1cm4gcHJvdmlkZXIuZGVmaW5pdGlvbnNba2V5XTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoZGVmKSA9PiB7IHJldHVybiBkZWYuYXZhaWxhYmxlOyB9KTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoID0gYXZhaWxhYmxlRGVmaW5pdGlvbnMuc2xpY2UoKS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBiLm5hbWUubGVuZ3RoIC0gYS5uYW1lLmxlbmd0aDsgfSlbMF0ubmFtZS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVsbC53cml0ZVRhYmxlKGF2YWlsYWJsZURlZmluaXRpb25zLCBbJ25hbWU6JyArIChsZW5ndGggKyAyKS50b1N0cmluZygpLCAnZGVzY3JpcHRpb246NDAnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVsbC53cml0ZUxpbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNoZWxsLndyaXRlTGluZSgnKiBQYXNzIFwiLz9cIiBpbnRvIGFueSBjb21tYW5kIHRvIGRpc3BsYXkgaGVscCBmb3IgdGhhdCBjb21tYW5kLicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm92aWRlci5vcHRpb25zLmFsbG93QWJicmV2aWF0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNoZWxsLndyaXRlTGluZSgnKiBDb21tYW5kIGFiYnJldmlhdGlvbnMgYXJlIGFsbG93ZWQgKGUuZy4gXCJIXCIgZm9yIFwiSEVMUFwiKS4nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdMaXN0cyB0aGUgYXZhaWxhYmxlIGNvbW1hbmRzLidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnByZWRlZmluZWQuaW5kZXhPZignRUNITycpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5kZWZpbmUoe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0VDSE8nLFxyXG4gICAgICAgICAgICAgICAgbWFpbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0b2dnbGUgPSB0aGlzLmFyZ1N0cmluZy50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0b2dnbGUgPT09ICdPTicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVsbC5lY2hvID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRvZ2dsZSA9PT0gJ09GRicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVsbC5lY2hvID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFyZ1N0cmluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNoZWxsLndyaXRlTGluZSh0aGlzLmFyZ1N0cmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVsbC53cml0ZUxpbmUoJ0VDSE8gaXMgJyArICh0aGlzLnNoZWxsLmVjaG8gPyAnb24uJyA6ICdvZmYuJykpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc3BsYXlzIG1lc3NhZ2VzLCBvciB0b2dnbGVzIGNvbW1hbmQgZWNob2luZy4nLFxyXG4gICAgICAgICAgICAgICAgdXNhZ2U6ICdFQ0hPIFtPTiB8IE9GRl1cXG5FQ0hPIFttZXNzYWdlXVxcblxcblR5cGUgRUNITyB3aXRob3V0IHBhcmFtZXRlcnMgdG8gZGlzcGxheSB0aGUgY3VycmVudCBlY2hvIHNldHRpbmcuJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucHJlZGVmaW5lZC5pbmRleE9mKCdDTFMnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVmaW5lKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdDTFMnLFxyXG4gICAgICAgICAgICAgICAgbWFpbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hlbGwuY2xlYXIoKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NsZWFycyB0aGUgY29tbWFuZCBwcm9tcHQuJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IERlZmluaXRpb25Qcm92aWRlcjsiLCJpbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL3V0aWxzLmpzJztcclxuXHJcbmNsYXNzIERlZmluaXRpb24ge1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgbWFpbiwgb3B0aW9ucykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IG1haW47XHJcbiAgICAgICAgICAgIG1haW4gPSBuYW1lO1xyXG4gICAgICAgICAgICBuYW1lID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBtYWluICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSBtYWluO1xyXG4gICAgICAgICAgICBtYWluID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5tYWluID0gbWFpbjtcclxuICAgICAgICB0aGlzLmRlc2NyaXB0aW9uID0gbnVsbDtcclxuICAgICAgICB0aGlzLnVzYWdlID0gbnVsbDtcclxuICAgICAgICB0aGlzLmF2YWlsYWJsZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5oZWxwID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kZWZpbml0aW9uLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWxsLndyaXRlTGluZSh0aGlzLmRlZmluaXRpb24uZGVzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlZmluaXRpb24uZGVzY3JpcHRpb24gJiYgdGhpcy5kZWZpbml0aW9uLnVzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWxsLndyaXRlTGluZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlZmluaXRpb24udXNhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hlbGwud3JpdGVMaW5lKHRoaXMuZGVmaW5pdGlvbi51c2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB1dGlscy5leHRlbmQodGhpcywgb3B0aW9ucyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm5hbWUgIT09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICB0aHJvdyAnXCJuYW1lXCIgbXVzdCBiZSBhIHN0cmluZy4nO1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5tYWluICE9PSAnZnVuY3Rpb24nKVxyXG4gICAgICAgICAgICB0aHJvdyAnXCJtYWluXCIgbXVzdCBiZSBhIGZ1bmN0aW9uLic7XHJcblxyXG4gICAgICAgIHRoaXMubmFtZSA9IHRoaXMubmFtZS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICghdGhpcy51c2FnZSkge1xyXG4gICAgICAgICAgICB0aGlzLnVzYWdlID0gdGhpcy5uYW1lO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgRGVmaW5pdGlvbjtcclxuIiwiY2xhc3MgSGlzdG9yeVByb3ZpZGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudmFsdWVzID0gW107XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3ByZWV4ZWN1dGVIYW5kbGVyID0gKGNvbW1hbmQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXMudW5zaGlmdChjb21tYW5kKTtcclxuICAgICAgICAgICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGJpbmQoc2hlbGwpIHsgXHJcbiAgICAgICAgc2hlbGwub24oJ3ByZWV4ZWN1dGUnLCB0aGlzLl9wcmVleGVjdXRlSGFuZGxlcik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVuYmluZChzaGVsbCkge1xyXG4gICAgICAgIHNoZWxsLm9mZigncHJlZXhlY3V0ZScsIHRoaXMuX3ByZWV4ZWN1dGVIYW5kbGVyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0TmV4dFZhbHVlKGZvcndhcmQpIHtcclxuICAgICAgICBpZiAoZm9yd2FyZCAmJiB0aGlzLmluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmluZGV4LS07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlc1t0aGlzLmluZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFmb3J3YXJkICYmIHRoaXMudmFsdWVzLmxlbmd0aCA+IHRoaXMuaW5kZXggKyAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW3RoaXMuaW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgSGlzdG9yeVByb3ZpZGVyOyIsImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgU2hlbGwgZnJvbSAnLi9zaGVsbC5qcyc7XHJcblxyXG5jb25zdCBfZGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICBhdXRvT3BlbjogZmFsc2UsXHJcbiAgICBvcGVuS2V5OiAxOTIsXHJcbiAgICBjbG9zZUtleTogMjdcclxufTtcclxuXHJcbmNsYXNzIE92ZXJsYXlTaGVsbCBleHRlbmRzIFNoZWxsIHtcclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGxldCBvdmVybGF5Tm9kZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoJzxkaXYgc3R5bGU9XCJkaXNwbGF5OiBub25lXCIgY2xhc3M9XCJjbWRyLW92ZXJsYXlcIj48L2Rpdj4nKTtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG92ZXJsYXlOb2RlKTtcclxuXHJcbiAgICAgICAgb3B0aW9ucyA9IHV0aWxzLmV4dGVuZCh7fSwgX2RlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgc3VwZXIob3ZlcmxheU5vZGUsIG9wdGlvbnMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX292ZXJsYXlOb2RlID0gb3ZlcmxheU5vZGU7XHJcbiAgICAgICAgdGhpcy5fZG9jdW1lbnRFdmVudEhhbmRsZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXQgaXNPcGVuKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vdmVybGF5Tm9kZS5zdHlsZS5kaXNwbGF5ICE9PSAnbm9uZSc7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9kb2N1bWVudEV2ZW50SGFuZGxlciA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNPcGVuICYmXHJcbiAgICAgICAgICAgICAgICBbJ0lOUFVUJywgJ1RFWFRBUkVBJywgJ1NFTEVDVCddLmluZGV4T2YoZXZlbnQudGFyZ2V0LnRhZ05hbWUpID09PSAtMSAmJlxyXG4gICAgICAgICAgICAgICAgIWV2ZW50LnRhcmdldC5pc0NvbnRlbnRFZGl0YWJsZSAmJlxyXG4gICAgICAgICAgICAgICAgZXZlbnQua2V5Q29kZSA9PSB0aGlzLm9wdGlvbnMub3BlbktleSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNPcGVuICYmIGV2ZW50LmtleUNvZGUgPT0gdGhpcy5vcHRpb25zLmNsb3NlS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fZG9jdW1lbnRFdmVudEhhbmRsZXIpO1xyXG5cclxuICAgICAgICBzdXBlci5pbml0KCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b09wZW4pIHtcclxuICAgICAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSByZXR1cm47XHJcbiAgICBcclxuICAgICAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2RvY3VtZW50RXZlbnRIYW5kbGVyKTsgICAgXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLl9vdmVybGF5Tm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgb3BlbigpIHtcclxuICAgICAgICB0aGlzLl9vdmVybGF5Tm9kZS5zdHlsZS5kaXNwbGF5ID0gJyc7ICAgICAgICBcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9maXhQcm9tcHRJbmRlbnQoKTsgIC8vaGFjazogdXNpbmcgJ3ByaXZhdGUnIG1ldGhvZCBmcm9tIGJhc2UgY2xhc3MgdG8gZml4IGluZGVudFxyXG4gICAgICAgICAgICB0aGlzLmZvY3VzKCk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKSB7XHJcbiAgICAgICAgdGhpcy5fb3ZlcmxheU5vZGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XHJcbiAgICAgICAgdGhpcy5ibHVyKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE92ZXJsYXlTaGVsbDsiLCJpbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IEhpc3RvcnlQcm92aWRlciBmcm9tICcuL2hpc3RvcnktcHJvdmlkZXIuanMnO1xyXG5pbXBvcnQgQXV0b2NvbXBsZXRlUHJvdmlkZXIgZnJvbSAnLi9hdXRvY29tcGxldGUtcHJvdmlkZXIuanMnO1xyXG5pbXBvcnQgRGVmaW5pdGlvblByb3ZpZGVyIGZyb20gJy4vZGVmaW5pdGlvbi1wcm92aWRlci5qcyc7XHJcbmltcG9ydCBDb21tYW5kSGFuZGxlciBmcm9tICcuL2NvbW1hbmQtaGFuZGxlci5qcyc7XHJcbmltcG9ydCBDb21tYW5kUGFyc2VyIGZyb20gJy4vY29tbWFuZC1wYXJzZXIuanMnO1xyXG5pbXBvcnQgQ2FuY2VsVG9rZW4gZnJvbSAnLi9jYW5jZWwtdG9rZW4uanMnO1xyXG5cclxuY29uc3QgX2RlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgZWNobzogdHJ1ZSxcclxuICAgIHByb21wdFByZWZpeDogJz4nLFxyXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiY21kci1zaGVsbFwiPjxkaXYgY2xhc3M9XCJvdXRwdXRcIj48L2Rpdj48ZGl2IGNsYXNzPVwiaW5wdXRcIj48c3BhbiBjbGFzcz1cInByZWZpeFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwicHJvbXB0XCIgc3BlbGxjaGVjaz1cImZhbHNlXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiIC8+PC9kaXY+PC9kaXY+JyxcclxuICAgIHRoZW1lOiAnY21kJyxcclxuICAgIGRlZmluaXRpb25Qcm92aWRlcjogbnVsbCxcclxuICAgIGhpc3RvcnlQcm92aWRlcjogbnVsbCxcclxuICAgIGF1dG9jb21wbGV0ZVByb3ZpZGVyOiBudWxsLFxyXG4gICAgY29tbWFuZEhhbmRsZXI6IG51bGwsXHJcbiAgICBjb21tYW5kUGFyc2VyOiBudWxsXHJcbn07XHJcblxyXG5jbGFzcyBTaGVsbCB7XHJcbiAgICBjb25zdHJ1Y3Rvcihjb250YWluZXJOb2RlLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKCFjb250YWluZXJOb2RlIHx8ICF1dGlscy5pc0VsZW1lbnQoY29udGFpbmVyTm9kZSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgJ1wiY29udGFpbmVyTm9kZVwiIG11c3QgYmUgYW4gSFRNTEVsZW1lbnQuJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSB1dGlscy5leHRlbmQoe30sIF9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyTm9kZSA9IGNvbnRhaW5lck5vZGU7XHJcbiAgICAgICAgdGhpcy5fc2hlbGxOb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3ByZWZpeE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX291dHB1dE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX291dHB1dExpbmVOb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9lY2hvID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9xdWV1ZSA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdFByZWZpeCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5faXNJbnB1dElubGluZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZUNvbnRleHQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnMgPSB7fTtcclxuICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZGVmaW5pdGlvblByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9jb21tYW5kSGFuZGxlciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fY29tbWFuZFBhcnNlciA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBpc0luaXRpYWxpemVkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc0luaXRpYWxpemVkO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvcHRpb25zKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBwcm9tcHRQcmVmaXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb21wdFByZWZpeDtcclxuICAgIH1cclxuICAgIHNldCBwcm9tcHRQcmVmaXgodmFsdWUpIHtcclxuICAgICAgICB0aGlzLl9wcm9tcHRQcmVmaXggPSB2YWx1ZTtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzSW5wdXRJbmxpbmUpIHtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS50ZXh0Q29udGVudCA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl9maXhQcm9tcHRJbmRlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGVjaG8oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VjaG87XHJcbiAgICB9XHJcbiAgICBzZXQgZWNobyh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX2VjaG8gPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaGlzdG9yeVByb3ZpZGVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oaXN0b3J5UHJvdmlkZXI7XHJcbiAgICB9XHJcbiAgICBzZXQgaGlzdG9yeVByb3ZpZGVyKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hpc3RvcnlQcm92aWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9oaXN0b3J5UHJvdmlkZXIudW5iaW5kKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oaXN0b3J5UHJvdmlkZXIgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgYXV0b2NvbXBsZXRlUHJvdmlkZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyO1xyXG4gICAgfVxyXG4gICAgc2V0IGF1dG9jb21wbGV0ZVByb3ZpZGVyKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyLnVuYmluZCh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZGVmaW5pdGlvblByb3ZpZGVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kZWZpbml0aW9uUHJvdmlkZXI7XHJcbiAgICB9XHJcbiAgICBzZXQgZGVmaW5pdGlvblByb3ZpZGVyKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2RlZmluaXRpb25Qcm92aWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9kZWZpbml0aW9uUHJvdmlkZXIudW5iaW5kKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9kZWZpbml0aW9uUHJvdmlkZXIgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgY29tbWFuZEhhbmRsZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbW1hbmRIYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgc2V0IGNvbW1hbmRIYW5kbGVyKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fY29tbWFuZEhhbmRsZXIgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IGNvbW1hbmRQYXJzZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbW1hbmRQYXJzZXI7XHJcbiAgICB9XHJcbiAgICBzZXQgY29tbWFuZFBhcnNlcih2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX2NvbW1hbmRQYXJzZXIgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0luaXRpYWxpemVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX3NoZWxsTm9kZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQodGhpcy5fb3B0aW9ucy50ZW1wbGF0ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3NoZWxsTm9kZS5jbGFzc05hbWUgKz0gJyBjbWRyLXNoZWxsLS0nICsgdGhpcy5fb3B0aW9ucy50aGVtZTtcclxuXHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyTm9kZS5hcHBlbmRDaGlsZCh0aGlzLl9zaGVsbE5vZGUpO1xyXG5cclxuICAgICAgICB0aGlzLl9vdXRwdXROb2RlID0gdGhpcy5fc2hlbGxOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5vdXRwdXQnKTtcclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUgPSB0aGlzLl9zaGVsbE5vZGUucXVlcnlTZWxlY3RvcignLmlucHV0Jyk7XHJcbiAgICAgICAgdGhpcy5fcHJlZml4Tm9kZSA9IHRoaXMuX3NoZWxsTm9kZS5xdWVyeVNlbGVjdG9yKCcucHJlZml4Jyk7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZSA9IHRoaXMuX3NoZWxsTm9kZS5xdWVyeVNlbGVjdG9yKCcucHJvbXB0Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2N1cnJlbnQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlICE9PSA5ICYmICFldmVudC5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDEzOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhlY3V0ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzg6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2hpc3RvcnlDeWNsZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDQwOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9oaXN0b3J5Q3ljbGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZUN5Y2xlKCFldmVudC5zaGlmdEtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5ICYmIGV2ZW50LmtleUNvZGUgPT09IDY3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYW5jZWwoKTsgXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2N1cnJlbnQucmVhZExpbmUgJiYgZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lLnJlc29sdmUodGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCk7IFxyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50LnJlYWQgJiYgIXRoaXMuX2N1cnJlbnQucmVhZExpbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnQgJiYgdGhpcy5fY3VycmVudC5yZWFkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuY2hhckNvZGUgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWQucmVzb2x2ZShTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LmNoYXJDb2RlKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9zaGVsbE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCAhPT0gdGhpcy5faW5wdXROb2RlICYmICF0aGlzLl9pbnB1dE5vZGUuY29udGFpbnMoZXZlbnQudGFyZ2V0KSAmJlxyXG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0ICE9PSB0aGlzLl9vdXRwdXROb2RlICYmICF0aGlzLl9vdXRwdXROb2RlLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Byb21wdE5vZGUuZm9jdXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9tcHRQcmVmaXggPSB0aGlzLl9vcHRpb25zLnByb21wdFByZWZpeDtcclxuXHJcbiAgICAgICAgdGhpcy5fZWNobyA9IHRoaXMuX29wdGlvbnMuZWNobztcclxuXHJcbiAgICAgICAgdGhpcy5fZGVmaW5pdGlvblByb3ZpZGVyID0gdGhpcy5fb3B0aW9ucy5kZWZpbml0aW9uUHJvdmlkZXIgfHwgbmV3IERlZmluaXRpb25Qcm92aWRlcigpO1xyXG4gICAgICAgIHRoaXMuX2RlZmluaXRpb25Qcm92aWRlci5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLl9oaXN0b3J5UHJvdmlkZXIgPSB0aGlzLl9vcHRpb25zLmhpc3RvcnlQcm92aWRlciB8fCBuZXcgSGlzdG9yeVByb3ZpZGVyKCk7XHJcbiAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyID0gdGhpcy5fb3B0aW9ucy5hdXRvY29tcGxldGVQcm92aWRlciB8fCBuZXcgQXV0b2NvbXBsZXRlUHJvdmlkZXIoKTtcclxuICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlci5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLl9jb21tYW5kSGFuZGxlciA9IHRoaXMub3B0aW9ucy5jb21tYW5kSGFuZGxlciB8fCBuZXcgQ29tbWFuZEhhbmRsZXIoKTtcclxuICAgICAgICB0aGlzLl9jb21tYW5kUGFyc2VyID0gdGhpcy5vcHRpb25zLmNvbW1hbmRQYXJzZXIgfHwgbmV3IENvbW1hbmRQYXJzZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVJbnB1dCgpO1xyXG5cclxuICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBkaXNwb3NlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNJbml0aWFsaXplZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9jb250YWluZXJOb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3NoZWxsTm9kZSk7XHJcbiAgICAgICAgdGhpcy5fc2hlbGxOb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9vdXRwdXROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3ByZWZpeE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2VjaG8gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3F1ZXVlID0gW107XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0UHJlZml4ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pc0lucHV0SW5saW5lID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlQ29udGV4dCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVycyA9IHt9O1xyXG5cclxuICAgICAgICBpZiAodGhpcy5faGlzdG9yeVByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hpc3RvcnlQcm92aWRlci51bmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hpc3RvcnlQcm92aWRlciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlci51bmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2RlZmluaXRpb25Qcm92aWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9kZWZpbml0aW9uUHJvdmlkZXIudW5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLl9kZWZpbml0aW9uUHJvdmlkZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fY29tbWFuZEhhbmRsZXIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2NvbW1hbmRQYXJzZXIgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQoKSB7XHJcbiAgICAgICAgdGhpcy5kaXNwb3NlKCk7XHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVhZChjYWxsYmFjaywgaW50ZXJjZXB0KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlSW5wdXQodHJ1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZCA9IHV0aWxzLmRlZmVyKCk7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkLnRoZW4oKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZCA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlYWN0aXZhdGVJbnB1dCgpO1xyXG4gICAgICAgICAgICBpZiAoIWludGVyY2VwdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS50ZXh0Q29udGVudCArPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sodmFsdWUsIHRoaXMuX2N1cnJlbnQpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWQoY2FsbGJhY2ssIGludGVyY2VwdCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mbHVzaElucHV0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWQuaW50ZXJjZXB0ID0gaW50ZXJjZXB0O1xyXG4gICAgfVxyXG5cclxuICAgIHJlYWRMaW5lKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlSW5wdXQodHJ1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZExpbmUgPSB1dGlscy5kZWZlcigpO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZExpbmUudGhlbigodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkTGluZSA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5fZGVhY3RpdmF0ZUlucHV0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoSW5wdXQoKTtcclxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlLCB0aGlzLl9jdXJyZW50KSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkTGluZShjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB3cml0ZSh2YWx1ZSwgY3NzQ2xhc3MpIHtcclxuICAgICAgICB2YWx1ZSA9IHV0aWxzLmVuY29kZUh0bWwodmFsdWUgfHwgJycpO1xyXG4gICAgICAgIGxldCBvdXRwdXRWYWx1ZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoYDxzcGFuPiR7dmFsdWV9PC9zcGFuPmApO1xyXG4gICAgICAgIGlmIChjc3NDbGFzcykge1xyXG4gICAgICAgICAgICBvdXRwdXRWYWx1ZS5jbGFzc05hbWUgPSBjc3NDbGFzcztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9vdXRwdXRMaW5lTm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX291dHB1dE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5fb3V0cHV0TGluZU5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZS5hcHBlbmRDaGlsZChvdXRwdXRWYWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgd3JpdGVMaW5lKHZhbHVlLCBjc3NDbGFzcykge1xyXG4gICAgICAgIHZhbHVlID0gKHZhbHVlIHx8ICcnKSArICdcXG4nO1xyXG4gICAgICAgIHRoaXMud3JpdGUodmFsdWUsIGNzc0NsYXNzKTtcclxuICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgd3JpdGVQYWQodmFsdWUsIGxlbmd0aCwgY2hhciA9ICcgJywgY3NzQ2xhc3MgPSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy53cml0ZSh1dGlscy5wYWQodmFsdWUsIGxlbmd0aCwgY2hhciksIGNzc0NsYXNzKTtcclxuICAgIH1cclxuXHJcbiAgICB3cml0ZVRhYmxlKGRhdGEsIGNvbHVtbnMsIHNob3dIZWFkZXJzLCBjc3NDbGFzcykge1xyXG4gICAgICAgIGNvbHVtbnMgPSBjb2x1bW5zLm1hcCgodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlcyA9IHZhbHVlLnNwbGl0KCc6Jyk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiB2YWx1ZXNbMF0sXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiB2YWx1ZXMubGVuZ3RoID4gMSA/IHZhbHVlc1sxXSA6IDEwLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyOiB2YWx1ZXMubGVuZ3RoID4gMiA/IHZhbHVlc1syXSA6IHZhbHVlc1swXVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxldCB3cml0ZUNlbGwgPSAodmFsdWUsIHBhZGRpbmcpID0+IHtcclxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSB8fCAnJztcclxuICAgICAgICAgICAgaWYgKHBhZGRpbmcgPT09ICcqJykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZSh2YWx1ZSwgY3NzQ2xhc3MpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZVBhZCh2YWx1ZSwgcGFyc2VJbnQocGFkZGluZywgMTApLCAnICcsIGNzc0NsYXNzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHNob3dIZWFkZXJzKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbCBvZiBjb2x1bW5zKSB7XHJcbiAgICAgICAgICAgICAgICB3cml0ZUNlbGwoY29sLmhlYWRlciwgY29sLnBhZGRpbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbCBvZiBjb2x1bW5zKSB7XHJcbiAgICAgICAgICAgICAgICB3cml0ZUNlbGwoQXJyYXkoY29sLmhlYWRlci5sZW5ndGggKyAxKS5qb2luKCctJyksIGNvbC5wYWRkaW5nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLndyaXRlTGluZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCByb3cgb2YgZGF0YSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2wgb2YgY29sdW1ucykge1xyXG4gICAgICAgICAgICAgICAgd3JpdGVDZWxsKHJvd1tjb2wubmFtZV0gPyByb3dbY29sLm5hbWVdLnRvU3RyaW5nKCkgOiAnJywgY29sLnBhZGRpbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKCkge1xyXG4gICAgICAgIHRoaXMuX291dHB1dE5vZGUuaW5uZXJIVE1MID0gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgZm9jdXMoKSB7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5mb2N1cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGJsdXIoKSB7XHJcbiAgICAgICAgdXRpbHMuYmx1cih0aGlzLl9wcm9tcHROb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBvbihldmVudCwgaGFuZGxlcikge1xyXG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcclxuICAgICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0ucHVzaChoYW5kbGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBvZmYoZXZlbnQsIGhhbmRsZXIpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0uaW5kZXhPZihoYW5kbGVyKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleGVjdXRlKGNvbW1hbmQsIC4uLmFyZ3MpIHtcclxuICAgICAgICBsZXQgZGVmZXJyZWQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb21tYW5kID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICBkZWZlcnJlZCA9IGNvbW1hbmQuZGVmZXJyZWQ7XHJcbiAgICAgICAgICAgIGNvbW1hbmQgPSBjb21tYW5kLnRleHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBjb21tYW5kID09PSAnc3RyaW5nJyAmJiBjb21tYW5kLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQgPSB1dGlscy5kZWZlcigpO1xyXG4gICAgICAgICAgICBpZiAoYXJncykge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZCA9IHRoaXMuX2J1aWxkQ29tbWFuZChjb21tYW5kLCBhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQgPSB1dGlscy5kZWZlcigpO1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0ludmFsaWQgY29tbWFuZCcpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fY3VycmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9xdWV1ZS5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkOiBkZWZlcnJlZCxcclxuICAgICAgICAgICAgICAgIHRleHQ6IGNvbW1hbmQsXHJcbiAgICAgICAgICAgICAgICBleGVjdXRlT25seTogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvbW1hbmRUZXh0ID0gY29tbWFuZDtcclxuICAgICAgICBjb21tYW5kID0gY29tbWFuZC50cmltKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3RyaWdnZXIoJ3ByZWV4ZWN1dGUnLCBjb21tYW5kKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCA9IGNvbW1hbmRUZXh0O1xyXG4gICAgICAgIHRoaXMuX2ZsdXNoSW5wdXQoIXRoaXMuX2VjaG8pO1xyXG4gICAgICAgIHRoaXMuX2RlYWN0aXZhdGVJbnB1dCgpO1xyXG5cclxuICAgICAgICBsZXQgY2FuY2VsVG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oKTtcclxuXHJcbiAgICAgICAgdGhpcy5fY3VycmVudCA9IHtcclxuICAgICAgICAgICAgY29tbWFuZDogY29tbWFuZCxcclxuICAgICAgICAgICAgY2FuY2VsVG9rZW46IGNhbmNlbFRva2VuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNvbXBsZXRlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX291dHB1dE5vZGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3RpdmF0ZUlucHV0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fcXVldWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhlY3V0ZSh0aGlzLl9xdWV1ZS5zaGlmdCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdDtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9jb21tYW5kSGFuZGxlci5leGVjdXRlQ29tbWFuZCh0aGlzLCBjb21tYW5kLCBjYW5jZWxUb2tlbik7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgdGhpcy53cml0ZUxpbmUoJ1VuaGFuZGxlZCBleGNlcHRpb24nLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgdGhpcy53cml0ZUxpbmUoZXJyb3IsICdlcnJvcicpO1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ1VuaGFuZGxlZCBleGNlcHRpb24nKTtcclxuICAgICAgICAgICAgY29tcGxldGUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgUHJvbWlzZS5hbGwoW3Jlc3VsdF0pLnRoZW4oKHZhbHVlcykgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyKCdleGVjdXRlJywge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZDogY29tbWFuZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodmFsdWVzWzBdKTtcclxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAocmVhc29uKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ2V4ZWN1dGUnLCB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kOiBjb21tYW5kLFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6IHJlYXNvblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAgY29tcGxldGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgY2FuY2VsKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fY3VycmVudCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQuY2FuY2VsVG9rZW4uY2FuY2VsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgX2J1aWxkQ29tbWFuZChjb21tYW5kLCBhcmdzKSB7XHJcbiAgICAgICAgZm9yIChsZXQgYXJnIG9mIGFyZ3MpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnICYmIGFyZy5pbmRleE9mKCcgJykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZCArPSBgIFwiJHthcmd9XCJgO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZCArPSAnICcgKyBhcmcudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29tbWFuZDtcclxuICAgIH1cclxuXHJcbiAgICBfYWN0aXZhdGVJbnB1dChpbmxpbmUpIHtcclxuICAgICAgICBpZiAoaW5saW5lKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9vdXRwdXRMaW5lTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5pbm5lckhUTUwgPSB0aGlzLl9vdXRwdXRMaW5lTm9kZS5pbm5lckhUTUw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vdXRwdXROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX291dHB1dExpbmVOb2RlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX291dHB1dExpbmVOb2RlID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9pc0lucHV0SW5saW5lID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLmlubmVySFRNTCA9IHRoaXMuX3Byb21wdFByZWZpeDtcclxuICAgICAgICAgICAgdGhpcy5faXNJbnB1dElubGluZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUuc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgIHRoaXMuX2ZpeFByb21wdEluZGVudCgpO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuZm9jdXMoKTtcclxuICAgICAgICB0aGlzLl9zaGVsbE5vZGUuc2Nyb2xsVG9wID0gdGhpcy5fc2hlbGxOb2RlLnNjcm9sbEhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBfZGVhY3RpdmF0ZUlucHV0KCkge1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuc3R5bGUudGV4dEluZGVudCA9ICcnO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpOyAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgX2ZsdXNoSW5wdXQocHJldmVudFdyaXRlKSB7XHJcbiAgICAgICAgaWYgKCFwcmV2ZW50V3JpdGUpIHtcclxuICAgICAgICAgICAgbGV0IG91dHB1dFZhbHVlID0gdXRpbHMuY3JlYXRlRWxlbWVudChgPGRpdj4ke3RoaXMuX3ByZWZpeE5vZGUuaW5uZXJIVE1MfSR7dGhpcy5fcHJvbXB0Tm9kZS5pbm5lckhUTUx9PC9kaXY+YCk7XHJcbiAgICAgICAgICAgIHRoaXMuX291dHB1dE5vZGUuYXBwZW5kQ2hpbGQob3V0cHV0VmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCA9ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIF90cmlnZ2VyKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XSkgcmV0dXJuO1xyXG4gICAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIoZGF0YSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfaGlzdG9yeUN5Y2xlKGZvcndhcmQpIHtcclxuICAgICAgICBQcm9taXNlLmFsbChbdGhpcy5faGlzdG9yeVByb3ZpZGVyLmdldE5leHRWYWx1ZShmb3J3YXJkKV0pLnRoZW4oKHZhbHVlcykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgY29tbWFuZCA9IHZhbHVlc1swXTtcclxuICAgICAgICAgICAgaWYgKGNvbW1hbmQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQgPSBjb21tYW5kO1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuY3Vyc29yVG9FbmQodGhpcy5fcHJvbXB0Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KHRoaXMuX3Byb21wdE5vZGUsICdjaGFuZ2UnLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfYXV0b2NvbXBsZXRlQ3ljbGUoZm9yd2FyZCkgeyAgICAgICAgXHJcbiAgICAgICAgaWYgKCF0aGlzLl9hdXRvY29tcGxldGVDb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGxldCBpbnB1dFZhbHVlID0gdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgaW5wdXRWYWx1ZSA9IGlucHV0VmFsdWUucmVwbGFjZSgvXFxzJC8sICcgJyk7XHJcbiAgICAgICAgICAgIGxldCBjdXJzb3JQb3NpdGlvbiA9IHV0aWxzLmdldEN1cnNvclBvc2l0aW9uKHRoaXMuX3Byb21wdE5vZGUpO1xyXG4gICAgICAgICAgICBsZXQgc3RhcnRJbmRleCA9IGlucHV0VmFsdWUubGFzdEluZGV4T2YoJyAnLCBjdXJzb3JQb3NpdGlvbikgKyAxO1xyXG4gICAgICAgICAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCAhPT0gLTEgPyBzdGFydEluZGV4IDogMDtcclxuICAgICAgICAgICAgbGV0IGVuZEluZGV4ID0gaW5wdXRWYWx1ZS5pbmRleE9mKCcgJywgc3RhcnRJbmRleCk7XHJcbiAgICAgICAgICAgIGVuZEluZGV4ID0gZW5kSW5kZXggIT09IC0xID8gZW5kSW5kZXggOiBpbnB1dFZhbHVlLmxlbmd0aDtcclxuICAgICAgICAgICAgbGV0IGluY29tcGxldGVWYWx1ZSA9IGlucHV0VmFsdWUuc3Vic3RyaW5nKHN0YXJ0SW5kZXgsIGVuZEluZGV4KTtcclxuICAgICAgICAgICAgbGV0IHByZWN1cnNvclZhbHVlID0gaW5wdXRWYWx1ZS5zdWJzdHJpbmcoMCwgc3RhcnRJbmRleCk7XHJcbiAgICAgICAgICAgIGxldCBwYXJzZWQgPSB0aGlzLmNvbW1hbmRQYXJzZXIucGFyc2VDb21tYW5kKHByZWN1cnNvclZhbHVlKTtcclxuICAgICAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlQ29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIHNoZWxsOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgaW5jb21wbGV0ZVZhbHVlOiBpbmNvbXBsZXRlVmFsdWUsXHJcbiAgICAgICAgICAgICAgICBwcmVjdXJzb3JWYWx1ZTogcHJlY3Vyc29yVmFsdWUsICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgcGFyc2VkOiBwYXJzZWRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9ICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBQcm9taXNlLmFsbChbdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIuZ2V0TmV4dFZhbHVlKGZvcndhcmQsIHRoaXMuX2F1dG9jb21wbGV0ZUNvbnRleHQpXSkudGhlbigodmFsdWVzKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHZhbHVlc1swXTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gdGhpcy5fYXV0b2NvbXBsZXRlQ29udGV4dC5wcmVjdXJzb3JWYWx1ZSArIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuY3Vyc29yVG9FbmQodGhpcy5fcHJvbXB0Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KHRoaXMuX3Byb21wdE5vZGUsICdjaGFuZ2UnLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfYXV0b2NvbXBsZXRlUmVzZXQoKSB7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlQ29udGV4dCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgX2ZpeFByb21wdEluZGVudCgpIHtcclxuICAgICAgICBsZXQgcHJlZml4V2lkdGggPSB0aGlzLl9wcmVmaXhOb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gICAgICAgIGxldCB0ZXh0ID0gdGhpcy5fcHJlZml4Tm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICBsZXQgc3BhY2VQYWRkaW5nID0gdGV4dC5sZW5ndGggLSB0ZXh0LnRyaW0oKS5sZW5ndGg7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5fcHJlZml4Tm9kZS5fc3BhY2VXaWR0aCkge1xyXG4gICAgICAgICAgICBsZXQgZWxlbTEgPSB1dGlscy5jcmVhdGVFbGVtZW50KCc8c3BhbiBzdHlsZT1cInZpc2liaWxpdHk6IGhpZGRlblwiPnwgfDwvc3Bhbj4nKTtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5hcHBlbmRDaGlsZChlbGVtMSk7XHJcbiAgICAgICAgICAgIGxldCBlbGVtMiA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoJzxzcGFuIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuXCI+fHw8L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUuYXBwZW5kQ2hpbGQoZWxlbTIpO1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLl9zcGFjZVdpZHRoID0gZWxlbTEub2Zmc2V0V2lkdGggLSBlbGVtMi5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5yZW1vdmVDaGlsZChlbGVtMSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUucmVtb3ZlQ2hpbGQoZWxlbTIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJlZml4V2lkdGggKz0gc3BhY2VQYWRkaW5nICogdGhpcy5fcHJlZml4Tm9kZS5fc3BhY2VXaWR0aDtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5zdHlsZS50ZXh0SW5kZW50ID0gcHJlZml4V2lkdGggKyAncHgnO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTaGVsbDtcclxuIiwiLy9PYmplY3RcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQob3V0KSB7XHJcbiAgICBvdXQgPSBvdXQgfHwge307XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoIWFyZ3VtZW50c1tpXSlcclxuICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBhcmd1bWVudHNbaV0pIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1tpXS5oYXNPd25Qcm9wZXJ0eShrZXkpKVxyXG4gICAgICAgICAgICAgICAgb3V0W2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG91dDtcclxufVxyXG4gIFxyXG4vL1N0cmluZ1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhZCh2YWx1ZSwgbGVuZ3RoLCBjaGFyKSB7XHJcbiAgICBsZXQgcmlnaHQgPSBsZW5ndGggPj0gMDtcclxuICAgIGxlbmd0aCA9IE1hdGguYWJzKGxlbmd0aCk7XHJcbiAgICB3aGlsZSAodmFsdWUubGVuZ3RoIDwgbGVuZ3RoKSB7XHJcbiAgICAgICAgdmFsdWUgPSByaWdodCA/IHZhbHVlICsgY2hhciA6IGNoYXIgKyB2YWx1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUh0bWwodmFsdWUpIHtcclxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGRpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2YWx1ZSkpO1xyXG4gICAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XHJcbn1cclxuXHJcbi8vRnVuY3Rpb25cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1bndyYXAodmFsdWUpIHtcclxuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgPyB2YWx1ZSgpIDogdmFsdWU7XHJcbn1cclxuXHJcbi8vUHJvbWlzZVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZmVyKCkge1xyXG4gICAgZnVuY3Rpb24gRGVmZXJyZWQoKSB7XHJcbiAgICAgICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xyXG4gICAgICAgICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy50aGVuID0gdGhpcy5wcm9taXNlLnRoZW4uYmluZCh0aGlzLnByb21pc2UpO1xyXG4gICAgICAgIHRoaXMuY2F0Y2ggPSB0aGlzLnByb21pc2UuY2F0Y2guYmluZCh0aGlzLnByb21pc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgRGVmZXJyZWQoKTtcclxufVxyXG5cclxuLy9ET01cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0VsZW1lbnQob2JqKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIEhUTUxFbGVtZW50ID09PSBcIm9iamVjdFwiID9cclxuICAgICAgICBvYmogaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA6XHJcbiAgICAgICAgb2JqICYmIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgb2JqICE9PSBudWxsICYmIG9iai5ub2RlVHlwZSA9PT0gMSAmJiB0eXBlb2Ygb2JqLm5vZGVOYW1lID09PSBcInN0cmluZ1wiO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRWxlbWVudChodG1sKSB7XHJcbiAgICBsZXQgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgd3JhcHBlci5pbm5lckhUTUwgPSBodG1sO1xyXG4gICAgcmV0dXJuIHdyYXBwZXIuZmlyc3RDaGlsZDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZWxlbWVudCwgdHlwZSwgY2FuQnViYmxlLCBjYW5jZWxhYmxlKSB7XHJcbiAgICBsZXQgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnSFRNTEV2ZW50cycpO1xyXG4gICAgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIGNhbkJ1YmJsZSwgY2FuY2VsYWJsZSk7XHJcbiAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYmx1cihlbGVtZW50ID0gbnVsbCkge1xyXG4gICAgaWYgKGVsZW1lbnQgJiYgZWxlbWVudCAhPT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgcmV0dXJuO1xyXG4gICAgbGV0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRlbXApO1xyXG4gICAgdGVtcC5mb2N1cygpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0ZW1wKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGN1cnNvclRvRW5kKGVsZW1lbnQpIHtcclxuICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XHJcbiAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWxlbWVudCk7XHJcbiAgICByYW5nZS5jb2xsYXBzZShmYWxzZSk7XHJcbiAgICBsZXQgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xyXG4gICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnNvclBvc2l0aW9uKGVsZW1lbnQpIHtcclxuICAgIGxldCBwb3MgPSAwO1xyXG4gICAgbGV0IGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudCB8fCBlbGVtZW50LmRvY3VtZW50O1xyXG4gICAgbGV0IHdpbiA9IGRvYy5kZWZhdWx0VmlldyB8fCBkb2MucGFyZW50V2luZG93O1xyXG4gICAgbGV0IHNlbDtcclxuICAgIGlmICh0eXBlb2Ygd2luLmdldFNlbGVjdGlvbiAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgc2VsID0gd2luLmdldFNlbGVjdGlvbigpO1xyXG4gICAgICAgIGlmIChzZWwucmFuZ2VDb3VudCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IHJhbmdlID0gd2luLmdldFNlbGVjdGlvbigpLmdldFJhbmdlQXQoMCk7XHJcbiAgICAgICAgICAgIGxldCBwcmVDdXJzb3JSYW5nZSA9IHJhbmdlLmNsb25lUmFuZ2UoKTtcclxuICAgICAgICAgICAgcHJlQ3Vyc29yUmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBwcmVDdXJzb3JSYW5nZS5zZXRFbmQocmFuZ2UuZW5kQ29udGFpbmVyLCByYW5nZS5lbmRPZmZzZXQpO1xyXG4gICAgICAgICAgICBwb3MgPSBwcmVDdXJzb3JSYW5nZS50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKChzZWwgPSBkb2Muc2VsZWN0aW9uKSAmJiBzZWwudHlwZSAhPSBcIkNvbnRyb2xcIikge1xyXG4gICAgICAgIGxldCB0ZXh0UmFuZ2UgPSBzZWwuY3JlYXRlUmFuZ2UoKTtcclxuICAgICAgICBsZXQgcHJlQ3Vyc29yVGV4dFJhbmdlID0gZG9jLmJvZHkuY3JlYXRlVGV4dFJhbmdlKCk7XHJcbiAgICAgICAgcHJlQ3Vyc29yVGV4dFJhbmdlLm1vdmVUb0VsZW1lbnRUZXh0KGVsZW1lbnQpO1xyXG4gICAgICAgIHByZUN1cnNvclRleHRSYW5nZS5zZXRFbmRQb2ludChcIkVuZFRvRW5kXCIsIHRleHRSYW5nZSk7XHJcbiAgICAgICAgcG9zID0gcHJlQ3Vyc29yVGV4dFJhbmdlLnRleHQubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBvcztcclxufSJdfQ==
