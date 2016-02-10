/* cmdrjs | version 1.1.12 | license MIT | (c) 2016 John Cruikshank | https://github.com/cmdrjs/cmdrjs */
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

var _commandParser = require('./command-parser.js');

Object.defineProperty(exports, 'CommandParser', {
  enumerable: true,
  get: function get() {
    return _commandParser.default;
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

var version = exports.version = '1.1.12';

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

            var deferred = utils.defer();

            this._current.read = utils.defer();
            this._current.read.then(function (value) {
                _this2._current.read = null;
                _this2._deactivateInput();
                if (!intercept) {
                    _this2._prefixNode.textContent += value;
                    _this2._promptNode.textContent = '';
                }

                var result = false;
                try {
                    result = callback(value, _this2._current);
                } catch (error) {
                    _this2.writeLine('Unhandled exception', 'error');
                    _this2.writeLine(error, 'error');
                    deferred.reject(error);
                }
                if (result === true) {
                    _this2.read(callback).then(deferred.resolve, deferred.reject);
                } else {
                    _this2._flushInput();
                    deferred.resolve();
                }
                deferred.resolve();
            });
            this._current.read.intercept = intercept;

            return deferred;
        }
    }, {
        key: 'readLine',
        value: function readLine(callback) {
            var _this3 = this;

            if (!this._current) return;

            this._activateInput(true);

            var deferred = utils.defer();

            this._current.readLine = utils.defer();
            this._current.readLine.then(function (value) {
                _this3._current.readLine = null;
                _this3._promptNode.textContent = value;
                _this3._deactivateInput();
                _this3._flushInput();
                var result = false;
                try {
                    result = callback(value, _this3._current);
                } catch (error) {
                    _this3.writeLine('Unhandled exception', 'error');
                    _this3.writeLine(error, 'error');
                    deferred.reject(error);
                }
                if (result === true) {
                    _this3.readLine(callback).then(deferred.resolve, deferred.reject);
                } else {
                    deferred.resolve();
                }
            });

            return deferred;
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
                var outputValue = '' + this._prefixNode.innerHTML + this._promptNode.innerHTML;
                if (outputValue) {
                    var outputValueNode = utils.createElement('<div>' + outputValue + '</div>');
                    this._outputNode.appendChild(outputValueNode);
                }
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