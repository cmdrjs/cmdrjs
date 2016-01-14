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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AutocompleteProvider = function () {
    function AutocompleteProvider() {
        _classCallCheck(this, AutocompleteProvider);

        this.values = [];
        this.index = -1;
        this.incompleteValue = null;
    }

    _createClass(AutocompleteProvider, [{
        key: "bind",
        value: function bind(shell) {}
    }, {
        key: "unbind",
        value: function unbind(shell) {}
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
}();

exports.default = AutocompleteProvider;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.version = exports.Definition = exports.DefinitionProvider = exports.AutocompleteProvider = exports.HistoryProvider = exports.CommandHandler = exports.OverlayShell = exports.Shell = undefined;

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

var _commandHandler = require('./command-handler.js');

Object.defineProperty(exports, 'CommandHandler', {
  enumerable: true,
  get: function get() {
    return _commandHandler.default;
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

var version = exports.version = '1.1.5';

},{"./autocomplete-provider.js":3,"./command-handler.js":5,"./definition-provider.js":6,"./definition.js":7,"./history-provider.js":8,"./overlay-shell.js":9,"./shell.js":10,"es6-promise":1}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = require('./utils.js');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CommandHandler = function () {
    function CommandHandler() {
        _classCallCheck(this, CommandHandler);
    }

    _createClass(CommandHandler, [{
        key: 'executeCommand',
        value: function executeCommand(shell, command) {
            var parsed = this._parseCommand(command);

            var definitions = shell.definitionProvider.getDefinitions(parsed.name);
            if (!definitions || definitions.length < 1) {
                shell.writeLine('Invalid command', 'error');
                return false;
            } else if (definitions.length > 1) {
                shell.writeLine('Ambiguous command', 'error');
                shell.writeLine();
                for (var i = 0; i < definitions.length; i++) {
                    shell.writePad(definitions[i].name, ' ', 10);
                    shell.writeLine(definitions[i].description);
                }
                shell.writeLine();
                return false;
            }

            var definition = definitions[0];

            var thisArg = {
                shell: shell,
                command: command,
                definition: definition,
                args: parsed.args,
                argString: parsed.argString,
                defer: utils.defer
            };

            var args = parsed.args;

            return definition.callback.apply(thisArg, args);
        }
    }, {
        key: '_parseCommand',
        value: function _parseCommand(command) {
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

    return CommandHandler;
}();

exports.default = CommandHandler;

},{"./utils.js":11}],6:[function(require,module,exports){
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
        this.shell = null;
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
                this.addDefinition(new _definition2.default('ECHO', function () {
                    var toggle = this.argString.toUpperCase();
                    if (toggle === 'ON') {
                        this.shell.echo = true;
                    } else if (toggle === 'OFF') {
                        this.shell.echo = false;
                    } else {
                        this.shell.writeLine(this.argString);
                    }
                }, {
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
}();

exports.default = DefinitionProvider;

},{"./definition.js":7,"./utils.js":11}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _utils = require('./utils.js');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Definition = function () {
    function Definition(name, callback, options) {
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
        this.available = true;

        utils.extend(this, options);

        if (typeof this.name !== 'string') throw '"name" must be a string.';
        if (typeof this.callback !== 'function') throw '"callback" must be a function.';

        this.name = this.name.toUpperCase();
    }

    _createClass(Definition, null, [{
        key: 'create',
        value: function create(name, callback, options) {
            return new Definition(name, callback, options);
        }
    }]);

    return Definition;
}();

exports.default = Definition;

},{"./utils.js":11}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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
}(_shell2.default);

exports.default = OverlayShell;

},{"./shell.js":10,"./utils.js":11}],10:[function(require,module,exports){
'use strict';

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
    commandHandler: null
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
        this._autocompleteValue = null;
        this._eventHandlers = {};
        this._isInitialized = false;
        this._historyProvider = null;
        this._autocompleteProvider = null;
        this._definitionProvider = null;
        this._commandHandler = null;

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
            this._definitionProvider.bind(this);

            this._historyProvider = this._options.historyProvider || new _historyProvider2.default();
            this._historyProvider.bind(this);

            this._autocompleteProvider = this._options.autocompleteProvider || new _autocompleteProvider2.default();
            this._autocompleteProvider.bind(this);

            this._commandHandler = this.options.commandHandler || new _commandHandler2.default();

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

            this._current = {
                command: command
            };

            var result = undefined;
            try {
                result = this._commandHandler.executeCommand(this, command);
            } catch (error) {
                this.writeLine('Unhandled exception. See browser console log for details.', 'error');
                console.error(error);
            }

            Promise.all([result]).then(function () {
                setTimeout(function () {
                    _this4._trigger('execute', command);
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
            this._promptNode.setAttribute('disabled', 'disabled');
            this._inputNode.style.display = 'none';
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
    }]);

    return Shell;
}();

exports.default = Shell;

},{"./autocomplete-provider.js":3,"./command-handler.js":5,"./definition-provider.js":6,"./history-provider.js":8,"./utils.js":11}],11:[function(require,module,exports){
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

function pad(value, padding, length) {
    var right = length >= 0;
    length = Math.abs(length);
    while (value.length < length) {
        value = right ? value + padding : padding + value;
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

},{}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXM2LXByb21pc2UvZGlzdC9lczYtcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJzcmNcXGF1dG9jb21wbGV0ZS1wcm92aWRlci5qcyIsInNyY1xcY21kci5qcyIsInNyY1xcY29tbWFuZC1oYW5kbGVyLmpzIiwic3JjXFxkZWZpbml0aW9uLXByb3ZpZGVyLmpzIiwic3JjXFxkZWZpbml0aW9uLmpzIiwic3JjXFxoaXN0b3J5LXByb3ZpZGVyLmpzIiwic3JjXFxvdmVybGF5LXNoZWxsLmpzIiwic3JjXFxzaGVsbC5qcyIsInNyY1xcdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3Y4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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LGVBQWUsRUFBRSxDQUFDO0FBQ3BELDBCQUFrQixDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLDBCQUFrQixDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDdEQsV0FBRyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDeEM7QUFDRCxXQUFPLEdBQUcsQ0FBQztDQUNkIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIVxuICogQG92ZXJ2aWV3IGVzNi1wcm9taXNlIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTQgWWVodWRhIEthdHosIFRvbSBEYWxlLCBTdGVmYW4gUGVubmVyIGFuZCBjb250cmlidXRvcnMgKENvbnZlcnNpb24gdG8gRVM2IEFQSSBieSBKYWtlIEFyY2hpYmFsZClcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9qYWtlYXJjaGliYWxkL2VzNi1wcm9taXNlL21hc3Rlci9MSUNFTlNFXG4gKiBAdmVyc2lvbiAgIDMuMC4yXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkb2JqZWN0T3JGdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbicgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9PSBudWxsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNNYXliZVRoZW5hYmxlKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeCAhPT0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHV0aWxzJCRfaXNBcnJheTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkpIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXkgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHgpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGliJGVzNiRwcm9taXNlJHV0aWxzJCRfaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNBcnJheSA9IGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXk7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW4gPSAwO1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkdG9TdHJpbmcgPSB7fS50b1N0cmluZztcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHZlcnR4TmV4dDtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGN1c3RvbVNjaGVkdWxlckZuO1xuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwID0gZnVuY3Rpb24gYXNhcChjYWxsYmFjaywgYXJnKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbl0gPSBjYWxsYmFjaztcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuICsgMV0gPSBhcmc7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuICs9IDI7XG4gICAgICBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiA9PT0gMikge1xuICAgICAgICAvLyBJZiBsZW4gaXMgMiwgdGhhdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gc2NoZWR1bGUgYW4gYXN5bmMgZmx1c2guXG4gICAgICAgIC8vIElmIGFkZGl0aW9uYWwgY2FsbGJhY2tzIGFyZSBxdWV1ZWQgYmVmb3JlIHRoZSBxdWV1ZSBpcyBmbHVzaGVkLCB0aGV5XG4gICAgICAgIC8vIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoaXMgZmx1c2ggdGhhdCB3ZSBhcmUgc2NoZWR1bGluZy5cbiAgICAgICAgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRjdXN0b21TY2hlZHVsZXJGbikge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRjdXN0b21TY2hlZHVsZXJGbihsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2V0U2NoZWR1bGVyKHNjaGVkdWxlRm4pIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRjdXN0b21TY2hlZHVsZXJGbiA9IHNjaGVkdWxlRm47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHNldEFzYXAoYXNhcEZuKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcCA9IGFzYXBGbjtcbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJXaW5kb3cgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpID8gd2luZG93IDogdW5kZWZpbmVkO1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3Nlckdsb2JhbCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyV2luZG93IHx8IHt9O1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3Nlckdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyR2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRpc05vZGUgPSB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYge30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nO1xuXG4gICAgLy8gdGVzdCBmb3Igd2ViIHdvcmtlciBidXQgbm90IGluIElFMTBcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGlzV29ya2VyID0gdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIGltcG9ydFNjcmlwdHMgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnO1xuXG4gICAgLy8gbm9kZVxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VOZXh0VGljaygpIHtcbiAgICAgIC8vIG5vZGUgdmVyc2lvbiAwLjEwLnggZGlzcGxheXMgYSBkZXByZWNhdGlvbiB3YXJuaW5nIHdoZW4gbmV4dFRpY2sgaXMgdXNlZCByZWN1cnNpdmVseVxuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jdWpvanMvd2hlbi9pc3N1ZXMvNDEwIGZvciBkZXRhaWxzXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2sobGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gdmVydHhcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlVmVydHhUaW1lcigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHZlcnR4TmV4dChsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBsaWIkZXM2JHByb21pc2UkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIobGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbm9kZS5kYXRhID0gKGl0ZXJhdGlvbnMgPSArK2l0ZXJhdGlvbnMgJSAyKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gd2ViIHdvcmtlclxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VNZXNzYWdlQ2hhbm5lbCgpIHtcbiAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaDtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VTZXRUaW1lb3V0KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZXRUaW1lb3V0KGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCwgMSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWUgPSBuZXcgQXJyYXkoMTAwMCk7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuOyBpKz0yKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtpXTtcbiAgICAgICAgdmFyIGFyZyA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtpKzFdO1xuXG4gICAgICAgIGNhbGxiYWNrKGFyZyk7XG5cbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2ldID0gdW5kZWZpbmVkO1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbaSsxXSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiA9IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJGF0dGVtcHRWZXJ0eCgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciByID0gcmVxdWlyZTtcbiAgICAgICAgdmFyIHZlcnR4ID0gcigndmVydHgnKTtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHZlcnR4TmV4dCA9IHZlcnR4LnJ1bk9uTG9vcCB8fCB2ZXJ0eC5ydW5PbkNvbnRleHQ7XG4gICAgICAgIHJldHVybiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlVmVydHhUaW1lcigpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlU2V0VGltZW91dCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaDtcbiAgICAvLyBEZWNpZGUgd2hhdCBhc3luYyBtZXRob2QgdG8gdXNlIHRvIHRyaWdnZXJpbmcgcHJvY2Vzc2luZyBvZiBxdWV1ZWQgY2FsbGJhY2tzOlxuICAgIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNOb2RlKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VOZXh0VGljaygpO1xuICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VNdXRhdGlvbk9ic2VydmVyKCk7XG4gICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNXb3JrZXIpIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU1lc3NhZ2VDaGFubmVsKCk7XG4gICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3NlcldpbmRvdyA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhdHRlbXB0VmVydHgoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlU2V0VGltZW91dCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3AoKSB7fVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcgICA9IHZvaWQgMDtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRlVMRklMTEVEID0gMTtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQgID0gMjtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUiA9IG5ldyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRFcnJvck9iamVjdCgpO1xuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkc2VsZkZ1bGZpbGxtZW50KCkge1xuICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJZb3UgY2Fubm90IHJlc29sdmUgYSBwcm9taXNlIHdpdGggaXRzZWxmXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGNhbm5vdFJldHVybk93bigpIHtcbiAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKCdBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZ2V0VGhlbihwcm9taXNlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuO1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUi5lcnJvciA9IGVycm9yO1xuICAgICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkdHJ5VGhlbih0aGVuLCB2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcik7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIHRoZW5hYmxlLCB0aGVuKSB7XG4gICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGFzYXAoZnVuY3Rpb24ocHJvbWlzZSkge1xuICAgICAgICB2YXIgc2VhbGVkID0gZmFsc2U7XG4gICAgICAgIHZhciBlcnJvciA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdGhlbmFibGUsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKHNlYWxlZCkgeyByZXR1cm47IH1cbiAgICAgICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgICAgIGlmICh0aGVuYWJsZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcblxuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9LCAnU2V0dGxlOiAnICsgKHByb21pc2UuX2xhYmVsIHx8ICcgdW5rbm93biBwcm9taXNlJykpO1xuXG4gICAgICAgIGlmICghc2VhbGVkICYmIGVycm9yKSB7XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9LCBwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSkge1xuICAgICAgaWYgKHRoZW5hYmxlLl9zdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRlVMRklMTEVEKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gICAgICB9IGVsc2UgaWYgKHRoZW5hYmxlLl9zdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHRoZW5hYmxlLCB1bmRlZmluZWQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVNYXliZVRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUpIHtcbiAgICAgIGlmIChtYXliZVRoZW5hYmxlLmNvbnN0cnVjdG9yID09PSBwcm9taXNlLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHRoZW4gPSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRnZXRUaGVuKG1heWJlVGhlbmFibGUpO1xuXG4gICAgICAgIGlmICh0aGVuID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUikge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUi5lcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhlbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24odGhlbikpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkc2VsZkZ1bGZpbGxtZW50KCkpO1xuICAgICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcHVibGlzaFJlamVjdGlvbihwcm9taXNlKSB7XG4gICAgICBpZiAocHJvbWlzZS5fb25lcnJvcikge1xuICAgICAgICBwcm9taXNlLl9vbmVycm9yKHByb21pc2UuX3Jlc3VsdCk7XG4gICAgICB9XG5cbiAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2gocHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSkge1xuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HKSB7IHJldHVybjsgfVxuXG4gICAgICBwcm9taXNlLl9yZXN1bHQgPSB2YWx1ZTtcbiAgICAgIHByb21pc2UuX3N0YXRlID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRlVMRklMTEVEO1xuXG4gICAgICBpZiAocHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2gsIHByb21pc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykgeyByZXR1cm47IH1cbiAgICAgIHByb21pc2UuX3N0YXRlID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQ7XG4gICAgICBwcm9taXNlLl9yZXN1bHQgPSByZWFzb247XG5cbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2hSZWplY3Rpb24sIHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgdmFyIHN1YnNjcmliZXJzID0gcGFyZW50Ll9zdWJzY3JpYmVycztcbiAgICAgIHZhciBsZW5ndGggPSBzdWJzY3JpYmVycy5sZW5ndGg7XG5cbiAgICAgIHBhcmVudC5fb25lcnJvciA9IG51bGw7XG5cbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aF0gPSBjaGlsZDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRF0gPSBvbkZ1bGZpbGxtZW50O1xuICAgICAgc3Vic2NyaWJlcnNbbGVuZ3RoICsgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURURdICA9IG9uUmVqZWN0aW9uO1xuXG4gICAgICBpZiAobGVuZ3RoID09PSAwICYmIHBhcmVudC5fc3RhdGUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGFzYXAobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcHVibGlzaCwgcGFyZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpIHtcbiAgICAgIHZhciBzdWJzY3JpYmVycyA9IHByb21pc2UuX3N1YnNjcmliZXJzO1xuICAgICAgdmFyIHNldHRsZWQgPSBwcm9taXNlLl9zdGF0ZTtcblxuICAgICAgaWYgKHN1YnNjcmliZXJzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm47IH1cblxuICAgICAgdmFyIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsID0gcHJvbWlzZS5fcmVzdWx0O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YnNjcmliZXJzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgIGNoaWxkID0gc3Vic2NyaWJlcnNbaV07XG4gICAgICAgIGNhbGxiYWNrID0gc3Vic2NyaWJlcnNbaSArIHNldHRsZWRdO1xuXG4gICAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHNldHRsZWQsIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYWxsYmFjayhkZXRhaWwpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCA9IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKSB7XG4gICAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SID0gbmV3IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCk7XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCR0cnlDYXRjaChjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IuZXJyb3IgPSBlO1xuICAgICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHNldHRsZWQsIHByb21pc2UsIGNhbGxiYWNrLCBkZXRhaWwpIHtcbiAgICAgIHZhciBoYXNDYWxsYmFjayA9IGxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNGdW5jdGlvbihjYWxsYmFjayksXG4gICAgICAgICAgdmFsdWUsIGVycm9yLCBzdWNjZWVkZWQsIGZhaWxlZDtcblxuICAgICAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgICAgIHZhbHVlID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCk7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IpIHtcbiAgICAgICAgICBmYWlsZWQgPSB0cnVlO1xuICAgICAgICAgIGVycm9yID0gdmFsdWUuZXJyb3I7XG4gICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkY2Fubm90UmV0dXJuT3duKCkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGRldGFpbDtcbiAgICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgIC8vIG5vb3BcbiAgICAgIH0gZWxzZSBpZiAoaGFzQ2FsbGJhY2sgJiYgc3VjY2VlZGVkKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChmYWlsZWQpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRlVMRklMTEVEKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChzZXR0bGVkID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGluaXRpYWxpemVQcm9taXNlKHByb21pc2UsIHJlc29sdmVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXNvbHZlcihmdW5jdGlvbiByZXNvbHZlUHJvbWlzZSh2YWx1ZSl7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIHJlamVjdFByb21pc2UocmVhc29uKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvcihDb25zdHJ1Y3RvciwgaW5wdXQpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgICAgZW51bWVyYXRvci5faW5zdGFuY2VDb25zdHJ1Y3RvciA9IENvbnN0cnVjdG9yO1xuICAgICAgZW51bWVyYXRvci5wcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3ApO1xuXG4gICAgICBpZiAoZW51bWVyYXRvci5fdmFsaWRhdGVJbnB1dChpbnB1dCkpIHtcbiAgICAgICAgZW51bWVyYXRvci5faW5wdXQgICAgID0gaW5wdXQ7XG4gICAgICAgIGVudW1lcmF0b3IubGVuZ3RoICAgICA9IGlucHV0Lmxlbmd0aDtcbiAgICAgICAgZW51bWVyYXRvci5fcmVtYWluaW5nID0gaW5wdXQubGVuZ3RoO1xuXG4gICAgICAgIGVudW1lcmF0b3IuX2luaXQoKTtcblxuICAgICAgICBpZiAoZW51bWVyYXRvci5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKGVudW1lcmF0b3IucHJvbWlzZSwgZW51bWVyYXRvci5fcmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnVtZXJhdG9yLmxlbmd0aCA9IGVudW1lcmF0b3IubGVuZ3RoIHx8IDA7XG4gICAgICAgICAgZW51bWVyYXRvci5fZW51bWVyYXRlKCk7XG4gICAgICAgICAgaWYgKGVudW1lcmF0b3IuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChlbnVtZXJhdG9yLnByb21pc2UsIGVudW1lcmF0b3IuX3Jlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QoZW51bWVyYXRvci5wcm9taXNlLCBlbnVtZXJhdG9yLl92YWxpZGF0aW9uRXJyb3IoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl92YWxpZGF0ZUlucHV0ID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgIHJldHVybiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzQXJyYXkoaW5wdXQpO1xuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3ZhbGlkYXRpb25FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignQXJyYXkgTWV0aG9kcyBtdXN0IGJlIHByb3ZpZGVkIGFuIEFycmF5Jyk7XG4gICAgfTtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcbiAgICB9O1xuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3I7XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2VudW1lcmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuXG4gICAgICB2YXIgbGVuZ3RoICA9IGVudW1lcmF0b3IubGVuZ3RoO1xuICAgICAgdmFyIHByb21pc2UgPSBlbnVtZXJhdG9yLnByb21pc2U7XG4gICAgICB2YXIgaW5wdXQgICA9IGVudW1lcmF0b3IuX2lucHV0O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgcHJvbWlzZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX2VhY2hFbnRyeShpbnB1dFtpXSwgaSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fZWFjaEVudHJ5ID0gZnVuY3Rpb24oZW50cnksIGkpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcbiAgICAgIHZhciBjID0gZW51bWVyYXRvci5faW5zdGFuY2VDb25zdHJ1Y3RvcjtcblxuICAgICAgaWYgKGxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNNYXliZVRoZW5hYmxlKGVudHJ5KSkge1xuICAgICAgICBpZiAoZW50cnkuY29uc3RydWN0b3IgPT09IGMgJiYgZW50cnkuX3N0YXRlICE9PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgICAgZW50cnkuX29uZXJyb3IgPSBudWxsO1xuICAgICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdChlbnRyeS5fc3RhdGUsIGksIGVudHJ5Ll9yZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudW1lcmF0b3IuX3dpbGxTZXR0bGVBdChjLnJlc29sdmUoZW50cnkpLCBpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW51bWVyYXRvci5fcmVtYWluaW5nLS07XG4gICAgICAgIGVudW1lcmF0b3IuX3Jlc3VsdFtpXSA9IGVudHJ5O1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3NldHRsZWRBdCA9IGZ1bmN0aW9uKHN0YXRlLCBpLCB2YWx1ZSkge1xuICAgICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuICAgICAgdmFyIHByb21pc2UgPSBlbnVtZXJhdG9yLnByb21pc2U7XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICBlbnVtZXJhdG9yLl9yZW1haW5pbmctLTtcblxuICAgICAgICBpZiAoc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnVtZXJhdG9yLl9yZXN1bHRbaV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZW51bWVyYXRvci5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgZW51bWVyYXRvci5fcmVzdWx0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl93aWxsU2V0dGxlQXQgPSBmdW5jdGlvbihwcm9taXNlLCBpKSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG5cbiAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZShwcm9taXNlLCB1bmRlZmluZWQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRUQsIGksIHZhbHVlKTtcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQsIGksIHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJGFsbCQkYWxsKGVudHJpZXMpIHtcbiAgICAgIHJldHVybiBuZXcgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJGRlZmF1bHQodGhpcywgZW50cmllcykucHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJGFsbCQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJGFsbCQkYWxsO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJhY2UkJHJhY2UoZW50cmllcykge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3ApO1xuXG4gICAgICBpZiAoIWxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNBcnJheShlbnRyaWVzKSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byByYWNlLicpKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBsZW5ndGggPSBlbnRyaWVzLmxlbmd0aDtcblxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsbWVudCh2YWx1ZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25SZWplY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgcHJvbWlzZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZShDb25zdHJ1Y3Rvci5yZXNvbHZlKGVudHJpZXNbaV0pLCB1bmRlZmluZWQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmFjZSQkcmFjZTtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZXNvbHZlJCRyZXNvbHZlKG9iamVjdCkge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgICAgIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0LmNvbnN0cnVjdG9yID09PSBDb25zdHJ1Y3Rvcikge1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgb2JqZWN0KTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJHJlc29sdmU7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVqZWN0JCRyZWplY3QocmVhc29uKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3ApO1xuICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlamVjdCQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlamVjdCQkcmVqZWN0O1xuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRjb3VudGVyID0gMDtcblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc1Jlc29sdmVyKCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhIHJlc29sdmVyIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgcHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc05ldygpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdQcm9taXNlJzogUGxlYXNlIHVzZSB0aGUgJ25ldycgb3BlcmF0b3IsIHRoaXMgb2JqZWN0IGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBjYWxsZWQgYXMgYSBmdW5jdGlvbi5cIik7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2U7XG4gICAgLyoqXG4gICAgICBQcm9taXNlIG9iamVjdHMgcmVwcmVzZW50IHRoZSBldmVudHVhbCByZXN1bHQgb2YgYW4gYXN5bmNocm9ub3VzIG9wZXJhdGlvbi4gVGhlXG4gICAgICBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLCB3aGljaFxuICAgICAgcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGUgcmVhc29uXG4gICAgICB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICAgICAgVGVybWlub2xvZ3lcbiAgICAgIC0tLS0tLS0tLS0tXG5cbiAgICAgIC0gYHByb21pc2VgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB3aXRoIGEgYHRoZW5gIG1ldGhvZCB3aG9zZSBiZWhhdmlvciBjb25mb3JtcyB0byB0aGlzIHNwZWNpZmljYXRpb24uXG4gICAgICAtIGB0aGVuYWJsZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBhIGB0aGVuYCBtZXRob2QuXG4gICAgICAtIGB2YWx1ZWAgaXMgYW55IGxlZ2FsIEphdmFTY3JpcHQgdmFsdWUgKGluY2x1ZGluZyB1bmRlZmluZWQsIGEgdGhlbmFibGUsIG9yIGEgcHJvbWlzZSkuXG4gICAgICAtIGBleGNlcHRpb25gIGlzIGEgdmFsdWUgdGhhdCBpcyB0aHJvd24gdXNpbmcgdGhlIHRocm93IHN0YXRlbWVudC5cbiAgICAgIC0gYHJlYXNvbmAgaXMgYSB2YWx1ZSB0aGF0IGluZGljYXRlcyB3aHkgYSBwcm9taXNlIHdhcyByZWplY3RlZC5cbiAgICAgIC0gYHNldHRsZWRgIHRoZSBmaW5hbCByZXN0aW5nIHN0YXRlIG9mIGEgcHJvbWlzZSwgZnVsZmlsbGVkIG9yIHJlamVjdGVkLlxuXG4gICAgICBBIHByb21pc2UgY2FuIGJlIGluIG9uZSBvZiB0aHJlZSBzdGF0ZXM6IHBlbmRpbmcsIGZ1bGZpbGxlZCwgb3IgcmVqZWN0ZWQuXG5cbiAgICAgIFByb21pc2VzIHRoYXQgYXJlIGZ1bGZpbGxlZCBoYXZlIGEgZnVsZmlsbG1lbnQgdmFsdWUgYW5kIGFyZSBpbiB0aGUgZnVsZmlsbGVkXG4gICAgICBzdGF0ZS4gIFByb21pc2VzIHRoYXQgYXJlIHJlamVjdGVkIGhhdmUgYSByZWplY3Rpb24gcmVhc29uIGFuZCBhcmUgaW4gdGhlXG4gICAgICByZWplY3RlZCBzdGF0ZS4gIEEgZnVsZmlsbG1lbnQgdmFsdWUgaXMgbmV2ZXIgYSB0aGVuYWJsZS5cblxuICAgICAgUHJvbWlzZXMgY2FuIGFsc28gYmUgc2FpZCB0byAqcmVzb2x2ZSogYSB2YWx1ZS4gIElmIHRoaXMgdmFsdWUgaXMgYWxzbyBhXG4gICAgICBwcm9taXNlLCB0aGVuIHRoZSBvcmlnaW5hbCBwcm9taXNlJ3Mgc2V0dGxlZCBzdGF0ZSB3aWxsIG1hdGNoIHRoZSB2YWx1ZSdzXG4gICAgICBzZXR0bGVkIHN0YXRlLiAgU28gYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCByZWplY3RzIHdpbGxcbiAgICAgIGl0c2VsZiByZWplY3QsIGFuZCBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIHdpbGxcbiAgICAgIGl0c2VsZiBmdWxmaWxsLlxuXG5cbiAgICAgIEJhc2ljIFVzYWdlOlxuICAgICAgLS0tLS0tLS0tLS0tXG5cbiAgICAgIGBgYGpzXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAvLyBvbiBzdWNjZXNzXG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuXG4gICAgICAgIC8vIG9uIGZhaWx1cmVcbiAgICAgICAgcmVqZWN0KHJlYXNvbik7XG4gICAgICB9KTtcblxuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgLy8gb24gcmVqZWN0aW9uXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBZHZhbmNlZCBVc2FnZTpcbiAgICAgIC0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICBQcm9taXNlcyBzaGluZSB3aGVuIGFic3RyYWN0aW5nIGF3YXkgYXN5bmNocm9ub3VzIGludGVyYWN0aW9ucyBzdWNoIGFzXG4gICAgICBgWE1MSHR0cFJlcXVlc3Rgcy5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGdldEpTT04odXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBoYW5kbGVyO1xuICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgeGhyLnNlbmQoKTtcblxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSB0aGlzLkRPTkUpIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2dldEpTT046IGAnICsgdXJsICsgJ2AgZmFpbGVkIHdpdGggc3RhdHVzOiBbJyArIHRoaXMuc3RhdHVzICsgJ10nKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZ2V0SlNPTignL3Bvc3RzLmpzb24nKS50aGVuKGZ1bmN0aW9uKGpzb24pIHtcbiAgICAgICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAvLyBvbiByZWplY3Rpb25cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFVubGlrZSBjYWxsYmFja3MsIHByb21pc2VzIGFyZSBncmVhdCBjb21wb3NhYmxlIHByaW1pdGl2ZXMuXG5cbiAgICAgIGBgYGpzXG4gICAgICBQcm9taXNlLmFsbChbXG4gICAgICAgIGdldEpTT04oJy9wb3N0cycpLFxuICAgICAgICBnZXRKU09OKCcvY29tbWVudHMnKVxuICAgICAgXSkudGhlbihmdW5jdGlvbih2YWx1ZXMpe1xuICAgICAgICB2YWx1ZXNbMF0gLy8gPT4gcG9zdHNKU09OXG4gICAgICAgIHZhbHVlc1sxXSAvLyA9PiBjb21tZW50c0pTT05cblxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQGNsYXNzIFByb21pc2VcbiAgICAgIEBwYXJhbSB7ZnVuY3Rpb259IHJlc29sdmVyXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAY29uc3RydWN0b3JcbiAgICAqL1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlKHJlc29sdmVyKSB7XG4gICAgICB0aGlzLl9pZCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRjb3VudGVyKys7XG4gICAgICB0aGlzLl9zdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX3Jlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzID0gW107XG5cbiAgICAgIGlmIChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wICE9PSByZXNvbHZlcikge1xuICAgICAgICBpZiAoIWxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNGdW5jdGlvbihyZXNvbHZlcikpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNSZXNvbHZlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlKSkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc05ldygpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaW5pdGlhbGl6ZVByb21pc2UodGhpcywgcmVzb2x2ZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLmFsbCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJGFsbCQkZGVmYXVsdDtcbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5yYWNlID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmFjZSQkZGVmYXVsdDtcbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5yZXNvbHZlID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdDtcbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5yZWplY3QgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZWplY3QkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UuX3NldFNjaGVkdWxlciA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzZXRTY2hlZHVsZXI7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UuX3NldEFzYXAgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2V0QXNhcDtcbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5fYXNhcCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwO1xuXG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucHJvdG90eXBlID0ge1xuICAgICAgY29uc3RydWN0b3I6IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLFxuXG4gICAgLyoqXG4gICAgICBUaGUgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCxcbiAgICAgIHdoaWNoIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNlJ3MgZXZlbnR1YWwgdmFsdWUgb3IgdGhlXG4gICAgICByZWFzb24gd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgIC8vIHVzZXIgaXMgYXZhaWxhYmxlXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyB1c2VyIGlzIHVuYXZhaWxhYmxlLCBhbmQgeW91IGFyZSBnaXZlbiB0aGUgcmVhc29uIHdoeVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQ2hhaW5pbmdcbiAgICAgIC0tLS0tLS0tXG5cbiAgICAgIFRoZSByZXR1cm4gdmFsdWUgb2YgYHRoZW5gIGlzIGl0c2VsZiBhIHByb21pc2UuICBUaGlzIHNlY29uZCwgJ2Rvd25zdHJlYW0nXG4gICAgICBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZmlyc3QgcHJvbWlzZSdzIGZ1bGZpbGxtZW50XG4gICAgICBvciByZWplY3Rpb24gaGFuZGxlciwgb3IgcmVqZWN0ZWQgaWYgdGhlIGhhbmRsZXIgdGhyb3dzIGFuIGV4Y2VwdGlvbi5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gdXNlci5uYW1lO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICByZXR1cm4gJ2RlZmF1bHQgbmFtZSc7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh1c2VyTmFtZSkge1xuICAgICAgICAvLyBJZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHVzZXJOYW1lYCB3aWxsIGJlIHRoZSB1c2VyJ3MgbmFtZSwgb3RoZXJ3aXNlIGl0XG4gICAgICAgIC8vIHdpbGwgYmUgYCdkZWZhdWx0IG5hbWUnYFxuICAgICAgfSk7XG5cbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jyk7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBpZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHJlYXNvbmAgd2lsbCBiZSAnRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknLlxuICAgICAgICAvLyBJZiBgZmluZFVzZXJgIHJlamVjdGVkLCBgcmVhc29uYCB3aWxsIGJlICdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jy5cbiAgICAgIH0pO1xuICAgICAgYGBgXG4gICAgICBJZiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIGRvZXMgbm90IHNwZWNpZnkgYSByZWplY3Rpb24gaGFuZGxlciwgcmVqZWN0aW9uIHJlYXNvbnMgd2lsbCBiZSBwcm9wYWdhdGVkIGZ1cnRoZXIgZG93bnN0cmVhbS5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICB0aHJvdyBuZXcgUGVkYWdvZ2ljYWxFeGNlcHRpb24oJ1Vwc3RyZWFtIGVycm9yJyk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIFRoZSBgUGVkZ2Fnb2NpYWxFeGNlcHRpb25gIGlzIHByb3BhZ2F0ZWQgYWxsIHRoZSB3YXkgZG93biB0byBoZXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBc3NpbWlsYXRpb25cbiAgICAgIC0tLS0tLS0tLS0tLVxuXG4gICAgICBTb21ldGltZXMgdGhlIHZhbHVlIHlvdSB3YW50IHRvIHByb3BhZ2F0ZSB0byBhIGRvd25zdHJlYW0gcHJvbWlzZSBjYW4gb25seSBiZVxuICAgICAgcmV0cmlldmVkIGFzeW5jaHJvbm91c2x5LiBUaGlzIGNhbiBiZSBhY2hpZXZlZCBieSByZXR1cm5pbmcgYSBwcm9taXNlIGluIHRoZVxuICAgICAgZnVsZmlsbG1lbnQgb3IgcmVqZWN0aW9uIGhhbmRsZXIuIFRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCB0aGVuIGJlIHBlbmRpbmdcbiAgICAgIHVudGlsIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIHNldHRsZWQuIFRoaXMgaXMgY2FsbGVkICphc3NpbWlsYXRpb24qLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgICAgIC8vIFRoZSB1c2VyJ3MgY29tbWVudHMgYXJlIG5vdyBhdmFpbGFibGVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIElmIHRoZSBhc3NpbWxpYXRlZCBwcm9taXNlIHJlamVjdHMsIHRoZW4gdGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIGFsc28gcmVqZWN0LlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgZnVsZmlsbHMsIHdlJ2xsIGhhdmUgdGhlIHZhbHVlIGhlcmVcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCByZWplY3RzLCB3ZSdsbCBoYXZlIHRoZSByZWFzb24gaGVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgU2ltcGxlIEV4YW1wbGVcbiAgICAgIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFN5bmNocm9ub3VzIEV4YW1wbGVcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gZmluZFJlc3VsdCgpO1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9XG4gICAgICBgYGBcblxuICAgICAgRXJyYmFjayBFeGFtcGxlXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kUmVzdWx0KGZ1bmN0aW9uKHJlc3VsdCwgZXJyKXtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIC8vIGZhaWx1cmVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBzdWNjZXNzXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFByb21pc2UgRXhhbXBsZTtcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgZmluZFJlc3VsdCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQWR2YW5jZWQgRXhhbXBsZVxuICAgICAgLS0tLS0tLS0tLS0tLS1cblxuICAgICAgU3luY2hyb25vdXMgRXhhbXBsZVxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgYXV0aG9yLCBib29rcztcblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXV0aG9yID0gZmluZEF1dGhvcigpO1xuICAgICAgICBib29rcyAgPSBmaW5kQm9va3NCeUF1dGhvcihhdXRob3IpO1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9XG4gICAgICBgYGBcblxuICAgICAgRXJyYmFjayBFeGFtcGxlXG5cbiAgICAgIGBgYGpzXG5cbiAgICAgIGZ1bmN0aW9uIGZvdW5kQm9va3MoYm9va3MpIHtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBmYWlsdXJlKHJlYXNvbikge1xuXG4gICAgICB9XG5cbiAgICAgIGZpbmRBdXRob3IoZnVuY3Rpb24oYXV0aG9yLCBlcnIpe1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgIC8vIGZhaWx1cmVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZmluZEJvb29rc0J5QXV0aG9yKGF1dGhvciwgZnVuY3Rpb24oYm9va3MsIGVycikge1xuICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBmb3VuZEJvb2tzKGJvb2tzKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgZmFpbHVyZShyZWFzb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBzdWNjZXNzXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFByb21pc2UgRXhhbXBsZTtcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgZmluZEF1dGhvcigpLlxuICAgICAgICB0aGVuKGZpbmRCb29rc0J5QXV0aG9yKS5cbiAgICAgICAgdGhlbihmdW5jdGlvbihib29rcyl7XG4gICAgICAgICAgLy8gZm91bmQgYm9va3NcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAbWV0aG9kIHRoZW5cbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uRnVsZmlsbGVkXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGVkXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICB0aGVuOiBmdW5jdGlvbihvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcztcbiAgICAgICAgdmFyIHN0YXRlID0gcGFyZW50Ll9zdGF0ZTtcblxuICAgICAgICBpZiAoc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCAmJiAhb25GdWxmaWxsbWVudCB8fCBzdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQgJiYgIW9uUmVqZWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHBhcmVudC5fcmVzdWx0O1xuXG4gICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50c1tzdGF0ZSAtIDFdO1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzdGF0ZSwgY2hpbGQsIGNhbGxiYWNrLCByZXN1bHQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICB9LFxuXG4gICAgLyoqXG4gICAgICBgY2F0Y2hgIGlzIHNpbXBseSBzdWdhciBmb3IgYHRoZW4odW5kZWZpbmVkLCBvblJlamVjdGlvbilgIHdoaWNoIG1ha2VzIGl0IHRoZSBzYW1lXG4gICAgICBhcyB0aGUgY2F0Y2ggYmxvY2sgb2YgYSB0cnkvY2F0Y2ggc3RhdGVtZW50LlxuXG4gICAgICBgYGBqc1xuICAgICAgZnVuY3Rpb24gZmluZEF1dGhvcigpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkbid0IGZpbmQgdGhhdCBhdXRob3InKTtcbiAgICAgIH1cblxuICAgICAgLy8gc3luY2hyb25vdXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGZpbmRBdXRob3IoKTtcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9XG5cbiAgICAgIC8vIGFzeW5jIHdpdGggcHJvbWlzZXNcbiAgICAgIGZpbmRBdXRob3IoKS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCBjYXRjaFxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3Rpb25cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgICdjYXRjaCc6IGZ1bmN0aW9uKG9uUmVqZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3Rpb24pO1xuICAgICAgfVxuICAgIH07XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRwb2x5ZmlsbCgpIHtcbiAgICAgIHZhciBsb2NhbDtcblxuICAgICAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgbG9jYWwgPSBnbG9iYWw7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGxvY2FsID0gc2VsZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgbG9jYWwgPSBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwb2x5ZmlsbCBmYWlsZWQgYmVjYXVzZSBnbG9iYWwgb2JqZWN0IGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgZW52aXJvbm1lbnQnKTtcbiAgICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBQID0gbG9jYWwuUHJvbWlzZTtcblxuICAgICAgaWYgKFAgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKFAucmVzb2x2ZSgpKSA9PT0gJ1tvYmplY3QgUHJvbWlzZV0nICYmICFQLmNhc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsb2NhbC5Qcm9taXNlID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkJGRlZmF1bHQ7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcG9seWZpbGwkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcG9seWZpbGwkJHBvbHlmaWxsO1xuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSR1bWQkJEVTNlByb21pc2UgPSB7XG4gICAgICAnUHJvbWlzZSc6IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0LFxuICAgICAgJ3BvbHlmaWxsJzogbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRkZWZhdWx0XG4gICAgfTtcblxuICAgIC8qIGdsb2JhbCBkZWZpbmU6dHJ1ZSBtb2R1bGU6dHJ1ZSB3aW5kb3c6IHRydWUgKi9cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmVbJ2FtZCddKSB7XG4gICAgICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlOyB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZVsnZXhwb3J0cyddKSB7XG4gICAgICBtb2R1bGVbJ2V4cG9ydHMnXSA9IGxpYiRlczYkcHJvbWlzZSR1bWQkJEVTNlByb21pc2U7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXNbJ0VTNlByb21pc2UnXSA9IGxpYiRlczYkcHJvbWlzZSR1bWQkJEVTNlByb21pc2U7XG4gICAgfVxuXG4gICAgbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRkZWZhdWx0KCk7XG59KS5jYWxsKHRoaXMpO1xuXG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImNsYXNzIEF1dG9jb21wbGV0ZVByb3ZpZGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudmFsdWVzID0gW107XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgICAgIHRoaXMuaW5jb21wbGV0ZVZhbHVlID0gbnVsbDtcclxuICAgIH1cclxuICAgICAgICBcclxuICAgIGJpbmQoc2hlbGwpIHsgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVuYmluZChzaGVsbCkge1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXROZXh0VmFsdWUoZm9yd2FyZCwgaW5jb21wbGV0ZVZhbHVlKSB7XHJcbiAgICAgICAgaWYgKGluY29tcGxldGVWYWx1ZSAhPT0gdGhpcy5pbmNvbXBsZXRlVmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmluY29tcGxldGVWYWx1ZSA9IGluY29tcGxldGVWYWx1ZTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgY29tcGxldGVWYWx1ZXMgPSB0aGlzLnZhbHVlcy5maWx0ZXIoKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpLnNsaWNlKDAsIGluY29tcGxldGVWYWx1ZS50b0xvd2VyQ2FzZSgpKSA9PT0gaW5jb21wbGV0ZVZhbHVlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGNvbXBsZXRlVmFsdWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuaW5kZXggPj0gY29tcGxldGVWYWx1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICBpZiAoZm9yd2FyZCAmJiB0aGlzLmluZGV4IDwgY29tcGxldGVWYWx1ZXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmluZGV4Kys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGZvcndhcmQgJiYgdGhpcy5pbmRleCA+PSBjb21wbGV0ZVZhbHVlcy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICghZm9yd2FyZCAmJiB0aGlzLmluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmluZGV4LS07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFmb3J3YXJkICYmIHRoaXMuaW5kZXggPD0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmluZGV4ID0gY29tcGxldGVWYWx1ZXMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGNvbXBsZXRlVmFsdWVzW3RoaXMuaW5kZXhdO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBdXRvY29tcGxldGVQcm92aWRlcjsiLCJpbXBvcnQgcHJvbWlzZSBmcm9tICdlczYtcHJvbWlzZSc7XHJcbnByb21pc2UucG9seWZpbGwoKTtcclxuXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2hlbGwgfSBmcm9tICcuL3NoZWxsLmpzJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBPdmVybGF5U2hlbGwgfSBmcm9tICcuL292ZXJsYXktc2hlbGwuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbW1hbmRIYW5kbGVyIH0gZnJvbSAnLi9jb21tYW5kLWhhbmRsZXIuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEhpc3RvcnlQcm92aWRlciB9IGZyb20gJy4vaGlzdG9yeS1wcm92aWRlci5qcyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQXV0b2NvbXBsZXRlUHJvdmlkZXIgfSBmcm9tICcuL2F1dG9jb21wbGV0ZS1wcm92aWRlci5qcyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgRGVmaW5pdGlvblByb3ZpZGVyIH0gZnJvbSAnLi9kZWZpbml0aW9uLXByb3ZpZGVyLmpzJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBEZWZpbml0aW9uIH0gZnJvbSAnLi9kZWZpbml0aW9uLmpzJztcclxuZXhwb3J0IGNvbnN0IHZlcnNpb24gPSAnMS4xLjUnOyIsImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xyXG5cclxuY2xhc3MgQ29tbWFuZEhhbmRsZXIge1xyXG4gICAgXHJcbiAgICAgZXhlY3V0ZUNvbW1hbmQoc2hlbGwsIGNvbW1hbmQpIHsgXHJcbiAgICAgICAgbGV0IHBhcnNlZCA9IHRoaXMuX3BhcnNlQ29tbWFuZChjb21tYW5kKTtcclxuXHJcbiAgICAgICAgbGV0IGRlZmluaXRpb25zID0gc2hlbGwuZGVmaW5pdGlvblByb3ZpZGVyLmdldERlZmluaXRpb25zKHBhcnNlZC5uYW1lKTtcclxuICAgICAgICBpZiAoIWRlZmluaXRpb25zIHx8IGRlZmluaXRpb25zLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgc2hlbGwud3JpdGVMaW5lKCdJbnZhbGlkIGNvbW1hbmQnLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBzaGVsbC53cml0ZUxpbmUoJ0FtYmlndW91cyBjb21tYW5kJywgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgIHNoZWxsLndyaXRlTGluZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlZmluaXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBzaGVsbC53cml0ZVBhZChkZWZpbml0aW9uc1tpXS5uYW1lLCAnICcsIDEwKTtcclxuICAgICAgICAgICAgICAgIHNoZWxsLndyaXRlTGluZShkZWZpbml0aW9uc1tpXS5kZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2hlbGwud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBkZWZpbml0aW9uID0gZGVmaW5pdGlvbnNbMF07XHJcblxyXG4gICAgICAgIGxldCB0aGlzQXJnID0ge1xyXG4gICAgICAgICAgICBzaGVsbDogc2hlbGwsXHJcbiAgICAgICAgICAgIGNvbW1hbmQ6IGNvbW1hbmQsXHJcbiAgICAgICAgICAgIGRlZmluaXRpb246IGRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIGFyZ3M6IHBhcnNlZC5hcmdzLFxyXG4gICAgICAgICAgICBhcmdTdHJpbmc6IHBhcnNlZC5hcmdTdHJpbmcsXHJcbiAgICAgICAgICAgIGRlZmVyOiB1dGlscy5kZWZlclxyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGFyZ3MgPSBwYXJzZWQuYXJncztcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGVmaW5pdGlvbi5jYWxsYmFjay5hcHBseSh0aGlzQXJnLCBhcmdzKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgX3BhcnNlQ29tbWFuZChjb21tYW5kKSB7XHJcbiAgICAgICAgbGV0IGV4cCA9IC9bXlxcc1wiXSt8XCIoW15cIl0qKVwiL2dpLFxyXG4gICAgICAgICAgICBuYW1lID0gbnVsbCxcclxuICAgICAgICAgICAgYXJnU3RyaW5nID0gbnVsbCxcclxuICAgICAgICAgICAgYXJncyA9IFtdLFxyXG4gICAgICAgICAgICBtYXRjaCA9IG51bGw7XHJcblxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgbWF0Y2ggPSBleHAuZXhlYyhjb21tYW5kKTtcclxuICAgICAgICAgICAgaWYgKG1hdGNoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBtYXRjaFsxXSA/IG1hdGNoWzFdIDogbWF0Y2hbMF07XHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2guaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnU3RyaW5nID0gY29tbWFuZC5zdWJzdHIodmFsdWUubGVuZ3RoICsgKG1hdGNoWzFdID8gMyA6IDEpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gd2hpbGUgKG1hdGNoICE9PSBudWxsKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgICAgYXJnU3RyaW5nOiBhcmdTdHJpbmcsXHJcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3NcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDb21tYW5kSGFuZGxlcjsiLCJpbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IERlZmluaXRpb24gZnJvbSAnLi9kZWZpbml0aW9uLmpzJztcclxuXHJcbmNvbnN0IF9kZWZhdWx0T3B0aW9ucyA9IHtcclxuICAgIHByZWRlZmluZWQ6IFsnSEVMUCcsICdFQ0hPJywgJ0NMUyddLFxyXG4gICAgYWxsb3dBYmJyZXZpYXRpb25zOiB0cnVlICAgIFxyXG59O1xyXG5cclxuY2xhc3MgRGVmaW5pdGlvblByb3ZpZGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHsgXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gdXRpbHMuZXh0ZW5kKHt9LCBfZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuc2hlbGwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZGVmaW5pdGlvbnMgPSB7fTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRlZmluZSA9ICguLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkRGVmaW5pdGlvbihuZXcgRGVmaW5pdGlvbiguLi5hcmdzKSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9wcmVkZWZpbmUoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgYmluZChzaGVsbCkge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygc2hlbGwuZGVmaW5lID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBzaGVsbC5kZWZpbmUgPSB0aGlzLmRlZmluZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVuYmluZChzaGVsbCkge1xyXG4gICAgICAgIGlmIChzaGVsbC5kZWZpbmUgPT09IHRoaXMuZGVmaW5lKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBzaGVsbC5kZWZpbmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgICAgXHJcbiAgICBnZXREZWZpbml0aW9ucyhuYW1lKSB7XHJcbiAgICAgICAgbmFtZSA9IG5hbWUudG9VcHBlckNhc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGRlZmluaXRpb24gPSB0aGlzLmRlZmluaXRpb25zW25hbWVdO1xyXG5cclxuICAgICAgICBpZiAoZGVmaW5pdGlvbikge1xyXG4gICAgICAgICAgICBpZiAoZGVmaW5pdGlvbi5hdmFpbGFibGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbZGVmaW5pdGlvbl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBkZWZpbml0aW9ucyA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWxsb3dBYmJyZXZpYXRpb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMuZGVmaW5pdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihuYW1lLCAwKSA9PT0gMCAmJiB1dGlscy51bndyYXAodGhpcy5kZWZpbml0aW9uc1trZXldLmF2YWlsYWJsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9ucy5wdXNoKHRoaXMuZGVmaW5pdGlvbnNba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZpbml0aW9ucztcclxuICAgIH1cclxuICAgIFxyXG4gICAgYWRkRGVmaW5pdGlvbihkZWZpbml0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5kZWZpbml0aW9uc1tkZWZpbml0aW9uLm5hbWVdID0gZGVmaW5pdGlvbjtcclxuICAgIH1cclxuICAgICAgICBcclxuICAgIF9wcmVkZWZpbmUoKSB7ICAgICAgICBcclxuICAgICAgICBsZXQgcHJvdmlkZXIgPSB0aGlzO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucHJlZGVmaW5lZC5pbmRleE9mKCdIRUxQJykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZERlZmluaXRpb24obmV3IERlZmluaXRpb24oJ0hFTFAnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNoZWxsLndyaXRlTGluZSgnVGhlIGZvbGxvd2luZyBjb21tYW5kcyBhcmUgYXZhaWxhYmxlOicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaGVsbC53cml0ZUxpbmUoKTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBwcm92aWRlci5kZWZpbml0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWZpbml0aW9uID0gcHJvdmlkZXIuZGVmaW5pdGlvbnNba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISF1dGlscy51bndyYXAoZGVmaW5pdGlvbi5hdmFpbGFibGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hlbGwud3JpdGVQYWQoa2V5LCAnICcsIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVsbC53cml0ZUxpbmUoZGVmaW5pdGlvbi5kZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zaGVsbC53cml0ZUxpbmUoKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTGlzdHMgdGhlIGF2YWlsYWJsZSBjb21tYW5kcydcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucHJlZGVmaW5lZC5pbmRleE9mKCdFQ0hPJykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZERlZmluaXRpb24obmV3IERlZmluaXRpb24oJ0VDSE8nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG9nZ2xlID0gdGhpcy5hcmdTdHJpbmcudG9VcHBlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgIGlmICh0b2dnbGUgPT09ICdPTicpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNoZWxsLmVjaG8gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0b2dnbGUgPT09ICdPRkYnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGVsbC5lY2hvID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hlbGwud3JpdGVMaW5lKHRoaXMuYXJnU3RyaW5nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzcGxheXMgcHJvdmlkZWQgdGV4dCBvciB0b2dnbGVzIGNvbW1hbmQgZWNob2luZydcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnByZWRlZmluZWQuaW5kZXhPZignQ0xTJykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZERlZmluaXRpb24obmV3IERlZmluaXRpb24oJ0NMUycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hlbGwuY2xlYXIoKTtcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXJzIHRoZSBjb21tYW5kIHByb21wdCdcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9ICAgIFxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEZWZpbml0aW9uUHJvdmlkZXI7IiwiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy5qcyc7XHJcblxyXG5jbGFzcyBEZWZpbml0aW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBvcHRpb25zID0gY2FsbGJhY2s7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrID0gbmFtZTtcclxuICAgICAgICAgICAgbmFtZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IGNhbGxiYWNrO1xyXG4gICAgICAgICAgICBjYWxsYmFjayA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlID0gdHJ1ZTtcclxuICAgICAgICBcclxuICAgICAgICB1dGlscy5leHRlbmQodGhpcywgb3B0aW9ucyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm5hbWUgIT09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICB0aHJvdyAnXCJuYW1lXCIgbXVzdCBiZSBhIHN0cmluZy4nO1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5jYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJylcclxuICAgICAgICAgICAgdGhyb3cgJ1wiY2FsbGJhY2tcIiBtdXN0IGJlIGEgZnVuY3Rpb24uJztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgdGhpcy5uYW1lID0gdGhpcy5uYW1lLnRvVXBwZXJDYXNlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0YXRpYyBjcmVhdGUobmFtZSwgY2FsbGJhY2ssIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gbmV3IERlZmluaXRpb24obmFtZSwgY2FsbGJhY2ssIG9wdGlvbnMpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBEZWZpbml0aW9uO1xyXG4iLCJjbGFzcyBIaXN0b3J5UHJvdmlkZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBbXTtcclxuICAgICAgICB0aGlzLmluZGV4ID0gLTE7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fcHJlZXhlY3V0ZUhhbmRsZXIgPSAoY29tbWFuZCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlcy51bnNoaWZ0KGNvbW1hbmQpO1xyXG4gICAgICAgICAgICB0aGlzLmluZGV4ID0gLTE7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgYmluZChzaGVsbCkgeyBcclxuICAgICAgICBzaGVsbC5vbigncHJlZXhlY3V0ZScsIHRoaXMuX3ByZWV4ZWN1dGVIYW5kbGVyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdW5iaW5kKHNoZWxsKSB7XHJcbiAgICAgICAgc2hlbGwub2ZmKCdwcmVleGVjdXRlJywgdGhpcy5fcHJlZXhlY3V0ZUhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXROZXh0VmFsdWUoZm9yd2FyZCkge1xyXG4gICAgICAgIGlmIChmb3J3YXJkICYmIHRoaXMuaW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXgtLTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW3RoaXMuaW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWZvcndhcmQgJiYgdGhpcy52YWx1ZXMubGVuZ3RoID4gdGhpcy5pbmRleCArIDEpIHtcclxuICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZXNbdGhpcy5pbmRleF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBIaXN0b3J5UHJvdmlkZXI7IiwiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCBTaGVsbCBmcm9tICcuL3NoZWxsLmpzJztcclxuXHJcbmNvbnN0IF9kZWZhdWx0T3B0aW9ucyA9IHtcclxuICAgIGF1dG9PcGVuOiBmYWxzZSxcclxuICAgIG9wZW5LZXk6IDE5MixcclxuICAgIGNsb3NlS2V5OiAyN1xyXG59O1xyXG5cclxuY2xhc3MgT3ZlcmxheVNoZWxsIGV4dGVuZHMgU2hlbGwge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgbGV0IG92ZXJsYXlOb2RlID0gdXRpbHMuY3JlYXRlRWxlbWVudCgnPGRpdiBzdHlsZT1cImRpc3BsYXk6IG5vbmVcIiBjbGFzcz1cImNtZHItb3ZlcmxheVwiPjwvZGl2PicpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3ZlcmxheU5vZGUpO1xyXG5cclxuICAgICAgICBvcHRpb25zID0gdXRpbHMuZXh0ZW5kKHt9LCBfZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICBzdXBlcihvdmVybGF5Tm9kZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fb3ZlcmxheU5vZGUgPSBvdmVybGF5Tm9kZTtcclxuICAgICAgICB0aGlzLl9kb2N1bWVudEV2ZW50SGFuZGxlciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBpc09wZW4oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX292ZXJsYXlOb2RlLnN0eWxlLmRpc3BsYXkgIT09ICdub25lJztcclxuICAgIH1cclxuXHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2RvY3VtZW50RXZlbnRIYW5kbGVyID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc09wZW4gJiZcclxuICAgICAgICAgICAgICAgIFsnSU5QVVQnLCAnVEVYVEFSRUEnLCAnU0VMRUNUJ10uaW5kZXhPZihldmVudC50YXJnZXQudGFnTmFtZSkgPT09IC0xICYmXHJcbiAgICAgICAgICAgICAgICAhZXZlbnQudGFyZ2V0LmlzQ29udGVudEVkaXRhYmxlICYmXHJcbiAgICAgICAgICAgICAgICBldmVudC5rZXlDb2RlID09IHRoaXMub3B0aW9ucy5vcGVuS2V5KSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc09wZW4gJiYgZXZlbnQua2V5Q29kZSA9PSB0aGlzLm9wdGlvbnMuY2xvc2VLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9kb2N1bWVudEV2ZW50SGFuZGxlcik7XHJcblxyXG4gICAgICAgIHN1cGVyLmluaXQoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvT3Blbikge1xyXG4gICAgICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcG9zZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHJldHVybjtcclxuICAgIFxyXG4gICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICAgICAgICBcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fZG9jdW1lbnRFdmVudEhhbmRsZXIpOyAgICBcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRoaXMuX292ZXJsYXlOb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuKCkge1xyXG4gICAgICAgIHRoaXMuX292ZXJsYXlOb2RlLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpeFByb21wdEluZGVudCgpOyAgLy9oYWNrOiB1c2luZyAncHJpdmF0ZScgbWV0aG9kIGZyb20gYmFzZSBjbGFzcyB0byBmaXggaW5kZW50XHJcbiAgICAgICAgICAgIHRoaXMuZm9jdXMoKTtcclxuICAgICAgICB9LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSgpIHtcclxuICAgICAgICB0aGlzLl9vdmVybGF5Tm9kZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuYmx1cigpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBPdmVybGF5U2hlbGw7IiwiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCBIaXN0b3J5UHJvdmlkZXIgZnJvbSAnLi9oaXN0b3J5LXByb3ZpZGVyLmpzJztcclxuaW1wb3J0IEF1dG9jb21wbGV0ZVByb3ZpZGVyIGZyb20gJy4vYXV0b2NvbXBsZXRlLXByb3ZpZGVyLmpzJztcclxuaW1wb3J0IERlZmluaXRpb25Qcm92aWRlciBmcm9tICcuL2RlZmluaXRpb24tcHJvdmlkZXIuanMnO1xyXG5pbXBvcnQgQ29tbWFuZEhhbmRsZXIgZnJvbSAnLi9jb21tYW5kLWhhbmRsZXIuanMnO1xyXG5cclxuY29uc3QgX2RlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgZWNobzogdHJ1ZSxcclxuICAgIHByb21wdFByZWZpeDogJz4nLFxyXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiY21kci1zaGVsbFwiPjxkaXYgY2xhc3M9XCJvdXRwdXRcIj48L2Rpdj48ZGl2IGNsYXNzPVwiaW5wdXRcIj48c3BhbiBjbGFzcz1cInByZWZpeFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwicHJvbXB0XCIgc3BlbGxjaGVjaz1cImZhbHNlXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiIC8+PC9kaXY+PC9kaXY+JyxcclxuICAgIHRoZW1lOiAnY21kJyxcclxuICAgIGRlZmluaXRpb25Qcm92aWRlcjogbnVsbCxcclxuICAgIGhpc3RvcnlQcm92aWRlcjogbnVsbCxcclxuICAgIGF1dG9jb21wbGV0ZVByb3ZpZGVyOiBudWxsLFxyXG4gICAgY29tbWFuZEhhbmRsZXI6IG51bGxcclxufTtcclxuXHJcbmNsYXNzIFNoZWxsIHtcclxuICAgIGNvbnN0cnVjdG9yKGNvbnRhaW5lck5vZGUsIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAoIWNvbnRhaW5lck5vZGUgfHwgIXV0aWxzLmlzRWxlbWVudChjb250YWluZXJOb2RlKSkge1xyXG4gICAgICAgICAgICB0aHJvdyAnXCJjb250YWluZXJOb2RlXCIgbXVzdCBiZSBhbiBIVE1MRWxlbWVudC4nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IHV0aWxzLmV4dGVuZCh7fSwgX2RlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJOb2RlID0gY29udGFpbmVyTm9kZTtcclxuICAgICAgICB0aGlzLl9zaGVsbE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2lucHV0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcHJlZml4Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0TGluZU5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2VjaG8gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3F1ZXVlID0gW107XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0UHJlZml4ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pc0lucHV0SW5saW5lID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlVmFsdWUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnMgPSB7fTtcclxuICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZGVmaW5pdGlvblByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9jb21tYW5kSGFuZGxlciA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBpc0luaXRpYWxpemVkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc0luaXRpYWxpemVkO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvcHRpb25zKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBwcm9tcHRQcmVmaXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb21wdFByZWZpeDtcclxuICAgIH1cclxuICAgIHNldCBwcm9tcHRQcmVmaXgodmFsdWUpIHtcclxuICAgICAgICB0aGlzLl9wcm9tcHRQcmVmaXggPSB2YWx1ZTtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzSW5wdXRJbmxpbmUpIHtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS50ZXh0Q29udGVudCA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl9maXhQcm9tcHRJbmRlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGVjaG8oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VjaG87XHJcbiAgICB9XHJcbiAgICBzZXQgZWNobyh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX2VjaG8gPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaGlzdG9yeVByb3ZpZGVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oaXN0b3J5UHJvdmlkZXI7XHJcbiAgICB9XHJcbiAgICBzZXQgaGlzdG9yeVByb3ZpZGVyKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hpc3RvcnlQcm92aWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9oaXN0b3J5UHJvdmlkZXIudW5iaW5kKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oaXN0b3J5UHJvdmlkZXIgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgYXV0b2NvbXBsZXRlUHJvdmlkZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyO1xyXG4gICAgfVxyXG4gICAgc2V0IGF1dG9jb21wbGV0ZVByb3ZpZGVyKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyLnVuYmluZCh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZGVmaW5pdGlvblByb3ZpZGVyKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kZWZpbml0aW9uUHJvdmlkZXI7XHJcbiAgICB9XHJcbiAgICBzZXQgZGVmaW5pdGlvblByb3ZpZGVyKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2RlZmluaXRpb25Qcm92aWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9kZWZpbml0aW9uUHJvdmlkZXIudW5iaW5kKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9kZWZpbml0aW9uUHJvdmlkZXIgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgY29tbWFuZEhhbmRsZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbW1hbmRIYW5kbGVyO1xyXG4gICAgfVxyXG4gICAgc2V0IGNvbW1hbmRIYW5kbGVyKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fY29tbWFuZEhhbmRsZXIgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0luaXRpYWxpemVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX3NoZWxsTm9kZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQodGhpcy5fb3B0aW9ucy50ZW1wbGF0ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3NoZWxsTm9kZS5jbGFzc05hbWUgKz0gJyBjbWRyLXNoZWxsLS0nICsgdGhpcy5fb3B0aW9ucy50aGVtZTtcclxuXHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyTm9kZS5hcHBlbmRDaGlsZCh0aGlzLl9zaGVsbE5vZGUpO1xyXG5cclxuICAgICAgICB0aGlzLl9vdXRwdXROb2RlID0gdGhpcy5fc2hlbGxOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5vdXRwdXQnKTtcclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUgPSB0aGlzLl9zaGVsbE5vZGUucXVlcnlTZWxlY3RvcignLmlucHV0Jyk7XHJcbiAgICAgICAgdGhpcy5fcHJlZml4Tm9kZSA9IHRoaXMuX3NoZWxsTm9kZS5xdWVyeVNlbGVjdG9yKCcucHJlZml4Jyk7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZSA9IHRoaXMuX3NoZWxsTm9kZS5xdWVyeVNlbGVjdG9yKCcucHJvbXB0Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2N1cnJlbnQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlICE9PSA5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTM6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leGVjdXRlKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzODpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlzdG9yeUN5Y2xlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2hpc3RvcnlDeWNsZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgOTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlQ3ljbGUoIWV2ZW50LnNoaWZ0S2V5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2N1cnJlbnQucmVhZExpbmUgJiYgZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZExpbmUucmVzb2x2ZSh0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fY3VycmVudCAmJiB0aGlzLl9jdXJyZW50LnJlYWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5jaGFyQ29kZSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZC5jaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC5jaGFyQ29kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnQucmVhZC5jYXB0dXJlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnQgJiYgdGhpcy5fY3VycmVudC5yZWFkICYmIHRoaXMuX2N1cnJlbnQucmVhZC5jaGFyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWQucmVzb2x2ZSh0aGlzLl9jdXJyZW50LnJlYWQuY2hhcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdwYXN0ZScsICgpID0+IHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVzID0gdmFsdWUuc3BsaXQoL1xcclxcbnxcXHJ8XFxuL2cpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxlbmd0aCA9IGxpbmVzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIGlmIChsZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGluZXNbaV0ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcXVldWUuZ2V0KHRoaXMpLnB1c2gobGluZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jdXJyZW50ICYmIHRoaXMuX2N1cnJlbnQucmVhZExpbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkTGluZS5yZXNvbHZlKGxpbmVzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2N1cnJlbnQgJiYgdGhpcy5fY3VycmVudC5yZWFkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZC5yZXNvbHZlKGxpbmVzWzBdWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50KGxpbmVzWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fc2hlbGxOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgIT09IHRoaXMuX2lucHV0Tm9kZSAmJiAhdGhpcy5faW5wdXROb2RlLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkgJiZcclxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldCAhPT0gdGhpcy5fb3V0cHV0Tm9kZSAmJiAhdGhpcy5fb3V0cHV0Tm9kZS5jb250YWlucyhldmVudC50YXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0UHJlZml4ID0gdGhpcy5fb3B0aW9ucy5wcm9tcHRQcmVmaXg7XHJcblxyXG4gICAgICAgIHRoaXMuX2VjaG8gPSB0aGlzLl9vcHRpb25zLmVjaG87XHJcblxyXG4gICAgICAgIHRoaXMuX2RlZmluaXRpb25Qcm92aWRlciA9IHRoaXMuX29wdGlvbnMuZGVmaW5pdGlvblByb3ZpZGVyIHx8IG5ldyBEZWZpbml0aW9uUHJvdmlkZXIoKTtcclxuICAgICAgICB0aGlzLl9kZWZpbml0aW9uUHJvdmlkZXIuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyID0gdGhpcy5fb3B0aW9ucy5oaXN0b3J5UHJvdmlkZXIgfHwgbmV3IEhpc3RvcnlQcm92aWRlcigpO1xyXG4gICAgICAgIHRoaXMuX2hpc3RvcnlQcm92aWRlci5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlciA9IHRoaXMuX29wdGlvbnMuYXV0b2NvbXBsZXRlUHJvdmlkZXIgfHwgbmV3IEF1dG9jb21wbGV0ZVByb3ZpZGVyKCk7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIuYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5fY29tbWFuZEhhbmRsZXIgPSB0aGlzLm9wdGlvbnMuY29tbWFuZEhhbmRsZXIgfHwgbmV3IENvbW1hbmRIYW5kbGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlSW5wdXQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcG9zZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzSW5pdGlhbGl6ZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyTm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9zaGVsbE5vZGUpO1xyXG4gICAgICAgIHRoaXMuX3NoZWxsTm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5faW5wdXROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9wcmVmaXhOb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9lY2hvID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9xdWV1ZSA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdFByZWZpeCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5faXNJbnB1dElubGluZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2hpc3RvcnlQcm92aWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9oaXN0b3J5UHJvdmlkZXIudW5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLl9oaXN0b3J5UHJvdmlkZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIudW5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9kZWZpbml0aW9uUHJvdmlkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fZGVmaW5pdGlvblByb3ZpZGVyLnVuYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5fZGVmaW5pdGlvblByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2NvbW1hbmRIYW5kbGVyID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5faXNJbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0KCkge1xyXG4gICAgICAgIHRoaXMuZGlzcG9zZSgpO1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlYWQoY2FsbGJhY2ssIGNhcHR1cmUpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2N1cnJlbnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVJbnB1dCh0cnVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkID0gdXRpbHMuZGVmZXIoKTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWQudGhlbigodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkID0gbnVsbDtcclxuICAgICAgICAgICAgaWYgKCFjYXB0dXJlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fZGVhY3RpdmF0ZUlucHV0KCk7XHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwgdGhpcy5fY3VycmVudCkgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZChjYWxsYmFjaywgY2FwdHVyZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mbHVzaElucHV0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWQuY2FwdHVyZSA9IGNhcHR1cmU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZC5yZXNvbHZlKHRoaXMuX3F1ZXVlLnNoaWZ0KClbMF0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZWFkTGluZShjYWxsYmFjaykge1xyXG4gICAgICAgIGlmICghdGhpcy5fY3VycmVudCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9hY3RpdmF0ZUlucHV0KHRydWUpO1xyXG5cclxuICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lID0gdXRpbHMuZGVmZXIoKTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lLnRoZW4oKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZExpbmUgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlYWN0aXZhdGVJbnB1dCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9mbHVzaElucHV0KCk7XHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwgdGhpcy5fY3VycmVudCkgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZExpbmUoY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZExpbmUucmVzb2x2ZSh0aGlzLl9xdWV1ZS5zaGlmdCgpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgd3JpdGUodmFsdWUsIGNzc0NsYXNzKSB7XHJcbiAgICAgICAgdmFsdWUgPSB1dGlscy5lbmNvZGVIdG1sKHZhbHVlIHx8ICcnKTtcclxuICAgICAgICBsZXQgb3V0cHV0VmFsdWUgPSB1dGlscy5jcmVhdGVFbGVtZW50KGA8c3Bhbj4ke3ZhbHVlfTwvc3Bhbj5gKTtcclxuICAgICAgICBpZiAoY3NzQ2xhc3MpIHtcclxuICAgICAgICAgICAgb3V0cHV0VmFsdWUuY2xhc3NOYW1lID0gY3NzQ2xhc3M7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5fb3V0cHV0TGluZU5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fb3V0cHV0TGluZU5vZGUgPSB1dGlscy5jcmVhdGVFbGVtZW50KCc8ZGl2PjwvZGl2PicpO1xyXG4gICAgICAgICAgICB0aGlzLl9vdXRwdXROb2RlLmFwcGVuZENoaWxkKHRoaXMuX291dHB1dExpbmVOb2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0TGluZU5vZGUuYXBwZW5kQ2hpbGQob3V0cHV0VmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHdyaXRlTGluZSh2YWx1ZSwgY3NzQ2xhc3MpIHtcclxuICAgICAgICB2YWx1ZSA9ICh2YWx1ZSB8fCAnJykgKyAnXFxuJztcclxuICAgICAgICB0aGlzLndyaXRlKHZhbHVlLCBjc3NDbGFzcyk7XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0TGluZU5vZGUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHdyaXRlUGFkKHZhbHVlLCBwYWRkaW5nLCBsZW5ndGgsIGNzc0NsYXNzKSB7XHJcbiAgICAgICAgdGhpcy53cml0ZSh1dGlscy5wYWQodmFsdWUsIHBhZGRpbmcsIGxlbmd0aCksIGNzc0NsYXNzKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGVhcigpIHtcclxuICAgICAgICB0aGlzLl9vdXRwdXROb2RlLmlubmVySFRNTCA9ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGZvY3VzKCkge1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuZm9jdXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBibHVyKCkge1xyXG4gICAgICAgIHV0aWxzLmJsdXIodGhpcy5fcHJvbXB0Tm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhlY3V0ZShjb21tYW5kKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fcXVldWUucHVzaChjb21tYW5kKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb21tYW5kICE9PSAnc3RyaW5nJyB8fCBjb21tYW5kLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyAnSW52YWxpZCBjb21tYW5kJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX3RyaWdnZXIoJ3ByZWV4ZWN1dGUnLCBjb21tYW5kKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCA9IGNvbW1hbmQ7XHJcbiAgICAgICAgdGhpcy5fZmx1c2hJbnB1dCghdGhpcy5fZWNobyk7XHJcbiAgICAgICAgdGhpcy5fZGVhY3RpdmF0ZUlucHV0KCk7XHJcblxyXG4gICAgICAgIGNvbW1hbmQgPSBjb21tYW5kLnRyaW0oKTtcclxuXHJcbiAgICAgICAgdGhpcy5fY3VycmVudCA9IHtcclxuICAgICAgICAgICAgY29tbWFuZDogY29tbWFuZFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQ7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fY29tbWFuZEhhbmRsZXIuZXhlY3V0ZUNvbW1hbmQodGhpcywgY29tbWFuZCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgdGhpcy53cml0ZUxpbmUoJ1VuaGFuZGxlZCBleGNlcHRpb24uIFNlZSBicm93c2VyIGNvbnNvbGUgbG9nIGZvciBkZXRhaWxzLicsICdlcnJvcicpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFByb21pc2UuYWxsKFtyZXN1bHRdKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl90cmlnZ2VyKCdleGVjdXRlJywgY29tbWFuZCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FjdGl2YXRlSW5wdXQoKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leGVjdXRlKHRoaXMuX3F1ZXVlLnNoaWZ0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBvbihldmVudCwgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdLnB1c2goY2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIG9mZihldmVudCwgY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0uaW5kZXhPZihjYWxsYmFjayk7XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0uc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX3RyaWdnZXIoZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdKSByZXR1cm47XHJcbiAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcclxuICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX2FjdGl2YXRlSW5wdXQoaW5saW5lKSB7XHJcbiAgICAgICAgaWYgKGlubGluZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fb3V0cHV0TGluZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUuaW5uZXJIVE1MID0gdGhpcy5fb3V0cHV0TGluZU5vZGUuaW5uZXJIVE1MO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9vdXRwdXRMaW5lTm9kZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5faXNJbnB1dElubGluZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5pbm5lckhUTUwgPSB0aGlzLl9wcm9tcHRQcmVmaXg7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzSW5wdXRJbmxpbmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faW5wdXROb2RlLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcclxuICAgICAgICB0aGlzLl9maXhQcm9tcHRJbmRlbnQoKTtcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmZvY3VzKCk7XHJcbiAgICAgICAgdGhpcy5fc2hlbGxOb2RlLnNjcm9sbFRvcCA9IHRoaXMuX3NoZWxsTm9kZS5zY3JvbGxIZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgX2RlYWN0aXZhdGVJbnB1dCgpIHtcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH1cclxuXHJcbiAgICBfZmx1c2hJbnB1dChwcmV2ZW50V3JpdGUpIHtcclxuICAgICAgICBpZiAoIXByZXZlbnRXcml0ZSkge1xyXG4gICAgICAgICAgICBsZXQgb3V0cHV0VmFsdWUgPSB1dGlscy5jcmVhdGVFbGVtZW50KGA8ZGl2PiR7dGhpcy5fcHJlZml4Tm9kZS5pbm5lckhUTUx9JHt0aGlzLl9wcm9tcHROb2RlLmlubmVySFRNTH08L2Rpdj5gKTtcclxuICAgICAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZS5hcHBlbmRDaGlsZChvdXRwdXRWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3ByZWZpeE5vZGUudGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgX2hpc3RvcnlDeWNsZShmb3J3YXJkKSB7XHJcbiAgICAgICAgUHJvbWlzZS5hbGwoW3RoaXMuX2hpc3RvcnlQcm92aWRlci5nZXROZXh0VmFsdWUoZm9yd2FyZCldKS50aGVuKCh2YWx1ZXMpID0+IHtcclxuICAgICAgICAgICAgbGV0IGNvbW1hbmQgPSB2YWx1ZXNbMF07XHJcbiAgICAgICAgICAgIGlmIChjb21tYW5kKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gY29tbWFuZDtcclxuICAgICAgICAgICAgICAgIHV0aWxzLmN1cnNvclRvRW5kKHRoaXMuX3Byb21wdE5vZGUpO1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuZGlzcGF0Y2hFdmVudCh0aGlzLl9wcm9tcHROb2RlLCAnY2hhbmdlJywgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgX2F1dG9jb21wbGV0ZUN5Y2xlKGZvcndhcmQpIHtcclxuICAgICAgICBsZXQgaW5wdXQgPSB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50O1xyXG4gICAgICAgIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvXFxzJC8sICcgJyk7IC8vZml4aW5nIGVuZCB3aGl0ZXNwYWNlXHJcbiAgICAgICAgbGV0IGN1cnNvclBvc2l0aW9uID0gdXRpbHMuZ2V0Q3Vyc29yUG9zaXRpb24odGhpcy5fcHJvbXB0Tm9kZSk7XHJcbiAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSBpbnB1dC5sYXN0SW5kZXhPZignICcsIGN1cnNvclBvc2l0aW9uKSArIDE7XHJcbiAgICAgICAgc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXggIT09IC0xID8gc3RhcnRJbmRleCA6IDA7XHJcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9jb21wbGV0ZVZhbHVlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCBlbmRJbmRleCA9IGlucHV0LmluZGV4T2YoJyAnLCBzdGFydEluZGV4KTtcclxuICAgICAgICAgICAgZW5kSW5kZXggPSBlbmRJbmRleCAhPT0gLTEgPyBlbmRJbmRleCA6IGlucHV0Lmxlbmd0aDtcclxuICAgICAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlVmFsdWUgPSBpbnB1dC5zdWJzdHJpbmcoc3RhcnRJbmRleCwgZW5kSW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBQcm9taXNlLmFsbChbdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIuZ2V0TmV4dFZhbHVlKGZvcndhcmQsIHRoaXMuX2F1dG9jb21wbGV0ZVZhbHVlKV0pLnRoZW4oKHZhbHVlcykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB2YWx1ZXNbMF07XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCA9IGlucHV0LnN1YnN0cmluZygwLCBzdGFydEluZGV4KSArIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuY3Vyc29yVG9FbmQodGhpcy5fcHJvbXB0Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KHRoaXMuX3Byb21wdE5vZGUsICdjaGFuZ2UnLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfYXV0b2NvbXBsZXRlUmVzZXQoKSB7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlVmFsdWUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIF9maXhQcm9tcHRJbmRlbnQoKSB7XHJcbiAgICAgICAgbGV0IHByZWZpeFdpZHRoID0gdGhpcy5fcHJlZml4Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuICAgICAgICBsZXQgdGV4dCA9IHRoaXMuX3ByZWZpeE5vZGUudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgbGV0IHNwYWNlUGFkZGluZyA9IHRleHQubGVuZ3RoIC0gdGV4dC50cmltKCkubGVuZ3RoO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuX3ByZWZpeE5vZGUuX3NwYWNlV2lkdGgpIHtcclxuICAgICAgICAgICAgbGV0IGVsZW0xID0gdXRpbHMuY3JlYXRlRWxlbWVudCgnPHNwYW4gc3R5bGU9XCJ2aXNpYmlsaXR5OiBoaWRkZW5cIj58IHw8L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUuYXBwZW5kQ2hpbGQoZWxlbTEpO1xyXG4gICAgICAgICAgICBsZXQgZWxlbTIgPSB1dGlscy5jcmVhdGVFbGVtZW50KCc8c3BhbiBzdHlsZT1cInZpc2liaWxpdHk6IGhpZGRlblwiPnx8PC9zcGFuPicpO1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLmFwcGVuZENoaWxkKGVsZW0yKTtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5fc3BhY2VXaWR0aCA9IGVsZW0xLm9mZnNldFdpZHRoIC0gZWxlbTIub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUucmVtb3ZlQ2hpbGQoZWxlbTEpO1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLnJlbW92ZUNoaWxkKGVsZW0yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByZWZpeFdpZHRoICs9IHNwYWNlUGFkZGluZyAqIHRoaXMuX3ByZWZpeE5vZGUuX3NwYWNlV2lkdGg7XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuc3R5bGUudGV4dEluZGVudCA9IHByZWZpeFdpZHRoICsgJ3B4JztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2hlbGw7XHJcbiIsIi8vT2JqZWN0XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKG91dCkge1xyXG4gICAgb3V0ID0gb3V0IHx8IHt9O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHNbaV0pXHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gYXJndW1lbnRzW2ldKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSlcclxuICAgICAgICAgICAgICAgIG91dFtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvdXQ7XHJcbn1cclxuICBcclxuLy9TdHJpbmdcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwYWQodmFsdWUsIHBhZGRpbmcsIGxlbmd0aCkge1xyXG4gICAgbGV0IHJpZ2h0ID0gbGVuZ3RoID49IDA7XHJcbiAgICBsZW5ndGggPSBNYXRoLmFicyhsZW5ndGgpO1xyXG4gICAgd2hpbGUgKHZhbHVlLmxlbmd0aCA8IGxlbmd0aCkge1xyXG4gICAgICAgIHZhbHVlID0gcmlnaHQgPyB2YWx1ZSArIHBhZGRpbmcgOiBwYWRkaW5nICsgdmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVIdG1sKHZhbHVlKSB7XHJcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmFsdWUpKTtcclxuICAgIHJldHVybiBkaXYuaW5uZXJIVE1MO1xyXG59XHJcblxyXG4vL0Z1bmN0aW9uXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdW53cmFwKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nID8gdmFsdWUoKSA6IHZhbHVlO1xyXG59XHJcblxyXG4vL1Byb21pc2VcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZlcigpIHtcclxuICAgIGZ1bmN0aW9uIERlZmVycmVkKCkge1xyXG4gICAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcclxuICAgICAgICAgICAgdGhpcy5yZWplY3QgPSByZWplY3Q7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMudGhlbiA9IHRoaXMucHJvbWlzZS50aGVuLmJpbmQodGhpcy5wcm9taXNlKTtcclxuICAgICAgICB0aGlzLmNhdGNoID0gdGhpcy5wcm9taXNlLmNhdGNoLmJpbmQodGhpcy5wcm9taXNlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IERlZmVycmVkKCk7XHJcbn1cclxuXHJcbi8vRE9NXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNFbGVtZW50KG9iaikge1xyXG4gICAgcmV0dXJuIHR5cGVvZiBIVE1MRWxlbWVudCA9PT0gXCJvYmplY3RcIiA/XHJcbiAgICAgICAgb2JqIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgOlxyXG4gICAgICAgIG9iaiAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiBvYmoubm9kZVR5cGUgPT09IDEgJiYgdHlwZW9mIG9iai5ub2RlTmFtZSA9PT0gXCJzdHJpbmdcIjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoaHRtbCkge1xyXG4gICAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIHdyYXBwZXIuaW5uZXJIVE1MID0gaHRtbDtcclxuICAgIHJldHVybiB3cmFwcGVyLmZpcnN0Q2hpbGQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGVsZW1lbnQsIHR5cGUsIGNhbkJ1YmJsZSwgY2FuY2VsYWJsZSkge1xyXG4gICAgbGV0IGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKTtcclxuICAgIGV2ZW50LmluaXRFdmVudCh0eXBlLCBjYW5CdWJibGUsIGNhbmNlbGFibGUpO1xyXG4gICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGJsdXIoZWxlbWVudCA9IG51bGwpIHtcclxuICAgIGlmIChlbGVtZW50ICYmIGVsZW1lbnQgIT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHJldHVybjtcclxuICAgIGxldCB0ZW1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZW1wKTtcclxuICAgIHRlbXAuZm9jdXMoKTtcclxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGVtcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjdXJzb3JUb0VuZChlbGVtZW50KSB7XHJcbiAgICBsZXQgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xyXG4gICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xyXG4gICAgcmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xyXG4gICAgbGV0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgIHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJzb3JQb3NpdGlvbihlbGVtZW50KSB7XHJcbiAgICBsZXQgcG9zID0gMDtcclxuICAgIGxldCBkb2MgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQgfHwgZWxlbWVudC5kb2N1bWVudDtcclxuICAgIGxldCB3aW4gPSBkb2MuZGVmYXVsdFZpZXcgfHwgZG9jLnBhcmVudFdpbmRvdztcclxuICAgIGxldCBzZWw7XHJcbiAgICBpZiAodHlwZW9mIHdpbi5nZXRTZWxlY3Rpb24gIT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHNlbCA9IHdpbi5nZXRTZWxlY3Rpb24oKTtcclxuICAgICAgICBpZiAoc2VsLnJhbmdlQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCByYW5nZSA9IHdpbi5nZXRTZWxlY3Rpb24oKS5nZXRSYW5nZUF0KDApO1xyXG4gICAgICAgICAgICBsZXQgcHJlQ3Vyc29yUmFuZ2UgPSByYW5nZS5jbG9uZVJhbmdlKCk7XHJcbiAgICAgICAgICAgIHByZUN1cnNvclJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbGVtZW50KTtcclxuICAgICAgICAgICAgcHJlQ3Vyc29yUmFuZ2Uuc2V0RW5kKHJhbmdlLmVuZENvbnRhaW5lciwgcmFuZ2UuZW5kT2Zmc2V0KTtcclxuICAgICAgICAgICAgcG9zID0gcHJlQ3Vyc29yUmFuZ2UudG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICgoc2VsID0gZG9jLnNlbGVjdGlvbikgJiYgc2VsLnR5cGUgIT0gXCJDb250cm9sXCIpIHtcclxuICAgICAgICBsZXQgdGV4dFJhbmdlID0gc2VsLmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgICAgbGV0IHByZUN1cnNvclRleHRSYW5nZSA9IGRvYy5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xyXG4gICAgICAgIHByZUN1cnNvclRleHRSYW5nZS5tb3ZlVG9FbGVtZW50VGV4dChlbGVtZW50KTtcclxuICAgICAgICBwcmVDdXJzb3JUZXh0UmFuZ2Uuc2V0RW5kUG9pbnQoXCJFbmRUb0VuZFwiLCB0ZXh0UmFuZ2UpO1xyXG4gICAgICAgIHBvcyA9IHByZUN1cnNvclRleHRSYW5nZS50ZXh0Lmxlbmd0aDtcclxuICAgIH1cclxuICAgIHJldHVybiBwb3M7XHJcbn0iXX0=
