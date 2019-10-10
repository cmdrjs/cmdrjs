/* cmdrjs | version 2.0.0-beta.2 | license MIT | (c) 2019 John Cruikshank | https://github.com/cmdrjs/cmdrjs */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cmdr = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var utils = _interopRequireWildcard(require("./utils.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var AutocompleteProvider =
/*#__PURE__*/
function () {
  function AutocompleteProvider() {
    _classCallCheck(this, AutocompleteProvider);

    this.lookups = [];
    this._context = null;
    this._index = -1;
    this._values = [];

    this._predefineLookups();
  }

  _createClass(AutocompleteProvider, [{
    key: "activate",
    value: function activate(terminal) {}
  }, {
    key: "deactivate",
    value: function deactivate(terminal) {}
  }, {
    key: "getNextValue",
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
    key: "_lookupValues",
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
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
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
    key: "_predefineLookups",
    value: function _predefineLookups() {
      function commandNameLookup(context) {
        if (context.precursorValue.trim() !== '') {
          return null;
        }

        var commands = context.terminal.shell.getCommands();
        var names = utils.arrayFrom(commands, function (c) {
          return c.name;
        });
        return names;
      }

      this.lookups.push(commandNameLookup);
    }
  }]);

  return AutocompleteProvider;
}();

var _default = AutocompleteProvider;
exports["default"] = _default;

},{"./utils.js":11}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CancelToken =
/*#__PURE__*/
function () {
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
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
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

var _default = CancelToken;
exports["default"] = _default;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Terminal", {
  enumerable: true,
  get: function get() {
    return _terminal["default"];
  }
});
Object.defineProperty(exports, "OverlayTerminal", {
  enumerable: true,
  get: function get() {
    return _overlayTerminal["default"];
  }
});
Object.defineProperty(exports, "ShellBase", {
  enumerable: true,
  get: function get() {
    return _shellBase["default"];
  }
});
Object.defineProperty(exports, "Shell", {
  enumerable: true,
  get: function get() {
    return _shell["default"];
  }
});
Object.defineProperty(exports, "HistoryProvider", {
  enumerable: true,
  get: function get() {
    return _historyProvider["default"];
  }
});
Object.defineProperty(exports, "AutocompleteProvider", {
  enumerable: true,
  get: function get() {
    return _autocompleteProvider["default"];
  }
});
Object.defineProperty(exports, "Command", {
  enumerable: true,
  get: function get() {
    return _command["default"];
  }
});
Object.defineProperty(exports, "Plugin", {
  enumerable: true,
  get: function get() {
    return _plugin["default"];
  }
});
exports.version = void 0;

var _terminal = _interopRequireDefault(require("./terminal.js"));

var _overlayTerminal = _interopRequireDefault(require("./overlay-terminal.js"));

var _shellBase = _interopRequireDefault(require("./shell-base.js"));

var _shell = _interopRequireDefault(require("./shell.js"));

var _historyProvider = _interopRequireDefault(require("./history-provider.js"));

var _autocompleteProvider = _interopRequireDefault(require("./autocomplete-provider.js"));

var _command = _interopRequireDefault(require("./command.js"));

var _plugin = _interopRequireDefault(require("./plugin.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var version = '2.0.0';
exports.version = version;

},{"./autocomplete-provider.js":1,"./command.js":4,"./history-provider.js":5,"./overlay-terminal.js":6,"./plugin.js":7,"./shell-base.js":8,"./shell.js":9,"./terminal.js":10}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var utils = _interopRequireWildcard(require("./utils.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Command = function Command(name, main, options) {
  _classCallCheck(this, Command);

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
      this.terminal.writeLine(this.definition.description);
    }

    if (this.definition.description && this.definition.usage) {
      this.terminal.writeLine();
    }

    if (this.definition.usage) {
      this.terminal.writeLine(this.definition.usage);
    }
  };

  utils.extend(this, options);

  this.main = this.main || function () {};

  if (typeof this.name !== 'string') throw '"name" must be a string.';
  if (typeof this.main !== 'function') throw '"main" must be a function.';
  this.name = this.name.toUpperCase();

  if (!this.usage) {
    this.usage = this.name;
  }
};

var _default = Command;
exports["default"] = _default;

},{"./utils.js":11}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var HistoryProvider =
/*#__PURE__*/
function () {
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
    key: "activate",
    value: function activate(terminal) {
      terminal.on('preexecute', this._preexecuteHandler);
    }
  }, {
    key: "deactivate",
    value: function deactivate(terminal) {
      terminal.off('preexecute', this._preexecuteHandler);
    }
  }, {
    key: "getNextValue",
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

var _default = HistoryProvider;
exports["default"] = _default;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var utils = _interopRequireWildcard(require("./utils.js"));

var _terminal = _interopRequireDefault(require("./terminal.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _defaultOptions = {
  autoOpen: false,
  openKey: 192,
  closeKey: 27
};

var OverlayTerminal =
/*#__PURE__*/
function (_Terminal) {
  _inherits(OverlayTerminal, _Terminal);

  function OverlayTerminal(options) {
    var _this;

    _classCallCheck(this, OverlayTerminal);

    var overlayNode = utils.createElement('<div style="display: none" class="cmdr-overlay"></div>');
    document.body.appendChild(overlayNode);
    options = utils.extend({}, _defaultOptions, options);
    _this = _possibleConstructorReturn(this, _getPrototypeOf(OverlayTerminal).call(this, overlayNode, options));
    _this._overlayNode = overlayNode;
    _this._documentEventHandler = null;
    return _this;
  }

  _createClass(OverlayTerminal, [{
    key: "init",
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

      _get(_getPrototypeOf(OverlayTerminal.prototype), "init", this).call(this);

      if (this.options.autoOpen) {
        this.open();
      }
    }
  }, {
    key: "dispose",
    value: function dispose() {
      if (!this.initialized) return;

      _get(_getPrototypeOf(OverlayTerminal.prototype), "dispose", this).call(this);

      document.removeEventListener('keydown', this._documentEventHandler);
      document.body.removeChild(this._overlayNode);
    }
  }, {
    key: "open",
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
    key: "close",
    value: function close() {
      this._overlayNode.style.display = 'none';
      document.body.style.overflow = '';
      this.blur();
    }
  }, {
    key: "isOpen",
    get: function get() {
      return this._overlayNode.style.display !== 'none';
    }
  }]);

  return OverlayTerminal;
}(_terminal["default"]);

var _default = OverlayTerminal;
exports["default"] = _default;

},{"./terminal.js":10,"./utils.js":11}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Plugin =
/*#__PURE__*/
function () {
  function Plugin() {
    _classCallCheck(this, Plugin);
  }

  _createClass(Plugin, [{
    key: "activate",
    value: function activate(terminal) {}
  }, {
    key: "deactivate",
    value: function deactivate(terminal) {}
  }]);

  return Plugin;
}();

var _default = Plugin;
exports["default"] = _default;

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ShellBase =
/*#__PURE__*/
function () {
  function ShellBase() {
    _classCallCheck(this, ShellBase);
  }

  _createClass(ShellBase, [{
    key: "executeCommand",
    value: function executeCommand(terminal, commandLine, cancelToken) {}
  }, {
    key: "getCommands",
    value: function getCommands(name) {
      return [];
    }
  }, {
    key: "parseCommandLine",
    value: function parseCommandLine(commandLine, parseName) {
      var exp = /[^\s"]+|"([^"]*)"/gi,
          name = null,
          argString = null,
          args = [],
          match = null;

      do {
        match = exp.exec(commandLine);

        if (match !== null) {
          if (parseName) {
            var value = match[1] ? match[1] : match[0];

            if (match.index === 0) {
              name = value;
              argString = commandLine.substr(value.length + (match[1] ? 3 : 1));
            } else {
              args.push(value);
            }
          } else {
            args.push(match[0]);
          }
        }
      } while (match !== null);

      if (parseName) {
        return {
          name: name,
          argString: argString,
          args: args
        };
      } else {
        return args;
      }
    }
  }]);

  return ShellBase;
}();

var _default = ShellBase;
exports["default"] = _default;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var utils = _interopRequireWildcard(require("./utils.js"));

var _shellBase = _interopRequireDefault(require("./shell-base.js"));

var _command = _interopRequireDefault(require("./command.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _defaultOptions = {
  contextExtensions: {},
  builtInCommands: ['HELP', 'ECHO', 'CLS'],
  allowAbbreviations: true
};

var Shell =
/*#__PURE__*/
function (_ShellBase) {
  _inherits(Shell, _ShellBase);

  function Shell(options) {
    var _this;

    _classCallCheck(this, Shell);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Shell).call(this));
    _this.options = utils.extend({}, _defaultOptions, options);
    _this.commands = {};

    _this._addBuiltInCommands();

    return _this;
  }

  _createClass(Shell, [{
    key: "executeCommand",
    value: function executeCommand(terminal, commandLine, cancelToken) {
      var parsed = this.parseCommandLine(commandLine, true);
      var commands = this.getCommands(parsed.name);

      if (!commands || commands.length < 1) {
        terminal.writeLine('Invalid command', 'error');
        return false;
      } else if (commands.length > 1) {
        terminal.writeLine('Ambiguous command', 'error');
        terminal.writeLine();

        for (var i = 0; i < commands.length; i++) {
          terminal.writePad(commands[i].name, 10);
          terminal.writeLine(commands[i].description);
        }

        terminal.writeLine();
        return false;
      }

      var command = commands[0];
      var context = {
        terminal: terminal,
        commandLine: commandLine,
        command: command,
        parsed: parsed,
        defer: utils.defer,
        cancelToken: cancelToken
      };
      utils.extend(context, this.options.contextExtensions);
      var args = parsed.args;

      if (command.help && args.length > 0 && args[args.length - 1] === "/?") {
        if (typeof command.help === 'string') {
          terminal.writeLine(command.help);
          return false;
        } else if (typeof command.help === 'function') {
          return command.help.apply(context, args);
        }
      }

      return command.main.apply(context, args);
    }
  }, {
    key: "getCommands",
    value: function getCommands(name) {
      var commands = [];

      if (name) {
        name = name.toUpperCase();
        var command = this.commands[name];

        if (command) {
          if (command.available) {
            return [command];
          }

          return null;
        }

        if (this.options.allowAbbreviations) {
          for (var key in this.commands) {
            if (key.indexOf(name, 0) === 0 && utils.unwrap(this.commands[key].available)) {
              commands.push(this.commands[key]);
            }
          }
        }
      } else {
        for (var _key in this.commands) {
          commands.push(this.commands[_key]);
        }
      }

      return commands;
    }
  }, {
    key: "addCommand",
    value: function addCommand(command) {
      if (!(command instanceof _command["default"])) {
        command = _construct(_command["default"], Array.prototype.slice.call(arguments));
      }

      this.commands[command.name] = command;
    }
  }, {
    key: "_addBuiltInCommands",
    value: function _addBuiltInCommands() {
      var provider = this;

      if (this.options.builtInCommands.indexOf('HELP') > -1) {
        this.addCommand({
          name: 'HELP',
          main: function main() {
            this.terminal.writeLine('The following commands are available:');
            this.terminal.writeLine();
            var availableCommands = Object.keys(provider.commands).map(function (key) {
              return provider.commands[key];
            }).filter(function (def) {
              return def.available;
            });
            var length = availableCommands.slice().sort(function (a, b) {
              return b.name.length - a.name.length;
            })[0].name.length;
            this.terminal.writeTable(availableCommands, ['name:' + (length + 2).toString(), 'description:40']);
            this.terminal.writeLine();
            this.terminal.writeLine('* Pass "/?" into any command to display help for that command.');

            if (provider.options.allowAbbreviations) {
              this.terminal.writeLine('* Command abbreviations are allowed (e.g. "H" for "HELP").');
            }
          },
          description: 'Lists the available commands.'
        });
      }

      if (this.options.builtInCommands.indexOf('ECHO') > -1) {
        this.addCommand({
          name: 'ECHO',
          main: function main() {
            var toggle = this.argString.toUpperCase();

            if (toggle === 'ON') {
              this.terminal.echo = true;
            } else if (toggle === 'OFF') {
              this.terminal.echo = false;
            } else if (this.argString) {
              this.terminal.writeLine(this.argString);
            } else {
              this.terminal.writeLine('ECHO is ' + (this.terminal.echo ? 'on.' : 'off.'));
            }
          },
          description: 'Displays messages, or toggles command echoing.',
          usage: 'ECHO [ON | OFF]\nECHO [message]\n\nType ECHO without parameters to display the current echo setting.'
        });
      }

      if (this.options.builtInCommands.indexOf('CLS') > -1) {
        this.addCommand({
          name: 'CLS',
          main: function main() {
            this.terminal.clear();
          },
          description: 'Clears the command prompt.'
        });
      }
    }
  }]);

  return Shell;
}(_shellBase["default"]);

var _default = Shell;
exports["default"] = _default;

},{"./command.js":4,"./shell-base.js":8,"./utils.js":11}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var utils = _interopRequireWildcard(require("./utils.js"));

var _historyProvider = _interopRequireDefault(require("./history-provider.js"));

var _autocompleteProvider = _interopRequireDefault(require("./autocomplete-provider.js"));

var _shell = _interopRequireDefault(require("./shell.js"));

var _cancelToken = _interopRequireDefault(require("./cancel-token.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _defaultOptions = {
  echo: true,
  promptPrefix: '>',
  template: '<div class="cmdr-terminal"><div class="output"></div><div class="input"><span class="prefix"></span><div class="prompt" spellcheck="false" contenteditable="true" /></div></div>',
  theme: 'cmd',
  historyProvider: null,
  autocompleteProvider: null,
  shell: null,
  plugins: []
};

var Terminal =
/*#__PURE__*/
function () {
  function Terminal(containerNode, options) {
    _classCallCheck(this, Terminal);

    if (!containerNode || !utils.isElement(containerNode)) {
      throw '"containerNode" must be an HTMLElement.';
    }

    this._options = utils.extend({}, _defaultOptions, options);
    this._containerNode = containerNode;
    this._terminalNode = null;
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
    this._shell = null;
    this._plugins = [];
    this.init();
  }

  _createClass(Terminal, [{
    key: "init",
    value: function init() {
      var _this = this;

      if (this._isInitialized) return;
      this._terminalNode = utils.createElement(this._options.template);
      this._terminalNode.className += ' cmdr-terminal--' + this._options.theme;

      this._containerNode.appendChild(this._terminalNode);

      this._outputNode = this._terminalNode.querySelector('.output');
      this._inputNode = this._terminalNode.querySelector('.input');
      this._prefixNode = this._terminalNode.querySelector('.prefix');
      this._promptNode = this._terminalNode.querySelector('.prompt');

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

      this._terminalNode.addEventListener('click', function (event) {
        if (event.target !== _this._inputNode && !_this._inputNode.contains(event.target) && event.target !== _this._outputNode && !_this._outputNode.contains(event.target)) {
          _this._promptNode.focus();
        }
      });

      this._promptPrefix = this._options.promptPrefix;
      this._echo = this._options.echo;
      this._shell = this.options.shell || new _shell["default"]();
      this._historyProvider = this._options.historyProvider || new _historyProvider["default"]();

      this._historyProvider.activate(this);

      this._autocompleteProvider = this._options.autocompleteProvider || new _autocompleteProvider["default"]();

      this._autocompleteProvider.activate(this);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._options.plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var plugin = _step.value;

          this._plugins.push(plugin);

          plugin.activate(this);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this._activateInput();

      this._isInitialized = true;
    }
  }, {
    key: "dispose",
    value: function dispose() {
      if (!this._isInitialized) return;

      this._containerNode.removeChild(this._terminalNode);

      this._terminalNode = null;
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
      this._shell = null;

      if (this._historyProvider) {
        this._historyProvider.deactivate(this);

        this._historyProvider = null;
      }

      if (this._autocompleteProvider) {
        this._autocompleteProvider.deactivate(this);

        this._autocompleteProvider = null;
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._plugins[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var plugin = _step2.value;
          plugin.deactivate(this);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      this._plugins = [];
      this._isInitialized = false;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.dispose();
      this.init();
    }
  }, {
    key: "read",
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
    key: "readLine",
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
    key: "write",
    value: function write(value, style) {
      value = utils.encodeHtml(value || '');
      var outputValue = utils.createElement("<span>".concat(value, "</span>"));

      if (typeof style === 'string') {
        outputValue.className = style;
      } else {
        outputValue.style = style;
      }

      if (!this._outputLineNode) {
        this._outputLineNode = utils.createElement('<div></div>');

        this._outputNode.appendChild(this._outputLineNode);
      }

      this._outputLineNode.appendChild(outputValue);
    }
  }, {
    key: "writeLine",
    value: function writeLine(value, style) {
      value = (value || '') + '\n';
      this.write(value, style);
      this._outputLineNode = null;
    }
  }, {
    key: "writePad",
    value: function writePad(value, length) {
      var _char = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ' ';

      var cssClass = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      this.write(utils.pad(value, length, _char), cssClass);
    }
  }, {
    key: "writeTable",
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
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = columns[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var col = _step3.value;
            writeCell(col.header, col.padding);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        this.writeLine();
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = columns[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _col = _step4.value;
            writeCell(Array(_col.header.length + 1).join('-'), _col.padding);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        this.writeLine();
      }

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = data[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var row = _step5.value;
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = columns[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var _col2 = _step6.value;
              writeCell(row[_col2.name] ? row[_col2.name].toString() : '', _col2.padding);
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
                _iterator6["return"]();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }

          this.writeLine();
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
            _iterator5["return"]();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this._outputNode.innerHTML = '';
    }
  }, {
    key: "clearLine",
    value: function clearLine() {
      if (this._outputNode.lastChild) {
        this._outputNode.removeChild(this._outputNode.lastChild);
      }
    }
  }, {
    key: "focus",
    value: function focus() {
      this._promptNode.focus();
    }
  }, {
    key: "blur",
    value: function blur() {
      utils.blur(this._promptNode);
    }
  }, {
    key: "on",
    value: function on(event, handler) {
      if (!this._eventHandlers[event]) {
        this._eventHandlers[event] = [];
      }

      this._eventHandlers[event].push(handler);
    }
  }, {
    key: "off",
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
    key: "execute",
    value: function execute(commandLine) {
      var _this5 = this;

      var deferred;

      if (_typeof(commandLine) === 'object') {
        deferred = commandLine.deferred;
        commandLine = commandLine.text;
      } else if (typeof commandLine === 'string' && commandLine.length > 0) {
        deferred = utils.defer();

        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        if (args) {
          commandLine = this._buildCommand(commandLine, args);
        }
      } else {
        deferred = utils.defer();
        deferred.reject('Invalid command');
        return deferred;
      }

      if (this._current) {
        this._queue.push({
          deferred: deferred,
          text: commandLine,
          executeOnly: true
        });

        return deferred;
      }

      var commandText = commandLine;
      commandLine = commandLine.trim();

      this._trigger('preexecute', commandLine);

      this._promptNode.textContent = commandText;

      this._flushInput(!this._echo);

      this._deactivateInput();

      var cancelToken = new _cancelToken["default"]();
      this._current = {
        commandLine: commandLine,
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

      var result;

      try {
        result = this._shell.executeCommand(this, commandLine, cancelToken);
      } catch (error) {
        this.writeLine('Unhandled exception', 'error');
        this.writeLine(error, 'error');
        deferred.reject('Unhandled exception');
        complete();
        return deferred;
      }

      Promise.all([result]).then(function (values) {
        _this5._trigger('execute', {
          commandLine: commandLine
        });

        try {
          deferred.resolve(values[0]);
        } finally {
          complete();
        }
      }, function (reason) {
        _this5._trigger('execute', {
          commandLine: commandLine,
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
    key: "cancel",
    value: function cancel() {
      if (!this._current) return;

      this._current.cancelToken.cancel();
    }
  }, {
    key: "_buildCommand",
    value: function _buildCommand(commandLine, args) {
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = args[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var arg = _step7.value;

          if (typeof arg === 'string' && arg.indexOf(' ') > -1) {
            commandLine += " \"".concat(arg, "\"");
          } else {
            commandLine += ' ' + arg.toString();
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
            _iterator7["return"]();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      return commandLine;
    }
  }, {
    key: "_activateInput",
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

      this._terminalNode.scrollTop = this._terminalNode.scrollHeight;
    }
  }, {
    key: "_deactivateInput",
    value: function _deactivateInput() {
      this._promptNode.style.textIndent = '';

      this._promptNode.setAttribute('disabled', 'disabled');
    }
  }, {
    key: "_flushInput",
    value: function _flushInput(preventWrite) {
      if (!preventWrite) {
        var outputValue = "".concat(this._prefixNode.innerHTML).concat(this._promptNode.innerHTML);

        if (outputValue) {
          var outputValueNode = utils.createElement("<div>".concat(outputValue, "</div>"));

          this._outputNode.appendChild(outputValueNode);
        }
      }

      this._prefixNode.textContent = '';
      this._promptNode.textContent = '';
    }
  }, {
    key: "_trigger",
    value: function _trigger(event, data) {
      if (!this._eventHandlers[event]) return;
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this._eventHandlers[event][Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var handler = _step8.value;

          try {
            handler(data);
          } catch (error) {
            console.error(error);
          }
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
            _iterator8["return"]();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }
    }
  }, {
    key: "_historyCycle",
    value: function _historyCycle(forward) {
      var _this6 = this;

      Promise.all([this._historyProvider.getNextValue(forward)]).then(function (values) {
        var commandLine = values[0];

        if (commandLine) {
          _this6._promptNode.textContent = commandLine;
          utils.cursorToEnd(_this6._promptNode);
          utils.dispatchEvent(_this6._promptNode, 'change', true, false);
        }
      });
    }
  }, {
    key: "_autocompleteCycle",
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
        var parsed = this.shell.parseCommandLine(precursorValue);
        this._autocompleteContext = {
          terminal: this,
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
    key: "_autocompleteReset",
    value: function _autocompleteReset() {
      this._autocompleteContext = null;
    }
  }, {
    key: "_fixPromptIndent",
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
    key: "isInitialized",
    get: function get() {
      return this._isInitialized;
    }
  }, {
    key: "options",
    get: function get() {
      return this._options;
    }
  }, {
    key: "promptPrefix",
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
    key: "echo",
    get: function get() {
      return this._echo;
    },
    set: function set(value) {
      this._echo = value;
    }
  }, {
    key: "shell",
    get: function get() {
      return this._shell;
    }
  }, {
    key: "historyProvider",
    get: function get() {
      return this._historyProvider;
    }
  }, {
    key: "autocompleteProvider",
    get: function get() {
      return this._autocompleteProvider;
    }
  }, {
    key: "plugins",
    get: function get() {
      return Object.freeze(this._plugins);
    }
  }]);

  return Terminal;
}();

var _default = Terminal;
exports["default"] = _default;

},{"./autocomplete-provider.js":1,"./cancel-token.js":2,"./history-provider.js":5,"./shell.js":9,"./utils.js":11}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extend = extend;
exports.arrayFrom = arrayFrom;
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

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
} //Array


function arrayFrom(arrayLike
/*, mapFn, thisArg */
) {
  var toStr = Object.prototype.toString;

  var isCallable = function isCallable(fn) {
    return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
  };

  var toInteger = function toInteger(value) {
    var number = Number(value);

    if (isNaN(number)) {
      return 0;
    }

    if (number === 0 || !isFinite(number)) {
      return number;
    }

    return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
  };

  var maxSafeInteger = Math.pow(2, 53) - 1;

  var toLength = function toLength(value) {
    var len = toInteger(value);
    return Math.min(Math.max(len, 0), maxSafeInteger);
  };

  var C = this;
  var items = Object(arrayLike);

  if (arrayLike == null) {
    throw new TypeError('arrayFrom requires an array-like object - not null or undefined');
  }

  var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
  var T;

  if (typeof mapFn !== 'undefined') {
    if (!isCallable(mapFn)) {
      throw new TypeError('arrayFrom: when provided, the second argument must be a function');
    }

    if (arguments.length > 2) {
      T = arguments[2];
    }
  }

  var len = toLength(items.length);
  var A = isCallable(C) ? Object(new C(len)) : new Array(len);
  var k = 0;
  var kValue;

  while (k < len) {
    kValue = items[k];

    if (mapFn) {
      A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
    } else {
      A[k] = kValue;
    }

    k += 1;
  }

  A.length = len;
  return A;
} //String


function pad(value, length, _char) {
  var right = length >= 0;
  length = Math.abs(length);

  while (value.length < length) {
    value = right ? value + _char : _char + value;
  }

  return value;
}

function encodeHtml(value) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(value));
  return div.innerHTML;
} //Function


function unwrap(value) {
  return typeof value === 'function' ? value() : value;
} //Promise


function defer() {
  function Deferred() {
    var _this = this;

    this.promise = new Promise(function (resolve, reject) {
      _this.resolve = resolve;
      _this.reject = reject;
    });
    this.then = this.promise.then.bind(this.promise);
    this["catch"] = this.promise["catch"].bind(this.promise);
  }

  return new Deferred();
} //DOM


function isElement(obj) {
  return (typeof HTMLElement === "undefined" ? "undefined" : _typeof(HTMLElement)) === "object" ? obj instanceof HTMLElement : obj && _typeof(obj) === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string";
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
  var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
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
  var sel;

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

},{}]},{},[3])(3)
});
