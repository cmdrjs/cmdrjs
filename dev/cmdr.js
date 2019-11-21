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
  template: '<div class="cmdr-terminal"><div class="output"></div><div class="input"><span class="prefix"></span><textarea class="prompt" spellcheck="false"></textarea></div></div>',
  theme: 'cmd',
  autoScroll: true,
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
              var value = _this._promptNode.value;

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
            _this._current.readLine.resolve(_this._promptNode.value);
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

      this._promptNode.addEventListener('input', function (event) {
        _this._fixPromptHeight();
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
          _this2._promptNode.value = '';

          _this2._fixPromptHeight();
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
        _this3._promptNode.value = value;

        _this3._fixPromptHeight();

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
    value: function write(value, style, raw) {
      value = value || '';
      value = raw ? value : utils.encodeHtml(value);
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

      if (this._options.autoScroll) {
        this._terminalNode.scrollTop = this._terminalNode.scrollHeight;
      }
    }
  }, {
    key: "writeLine",
    value: function writeLine(value, style, raw) {
      value = (value || '') + '\n';
      this.write(value, style, raw);
      this._outputLineNode = null;
    }
  }, {
    key: "writePad",
    value: function writePad(value, length) {
      var _char = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ' ';

      var style = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var raw = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      this.write(utils.pad(value, length, _char), style, raw);
    }
  }, {
    key: "writeTable",
    value: function writeTable(data, columns, showHeaders, style, raw) {
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
          _this4.write(value, style, raw);
        } else {
          _this4.writePad(value, parseInt(padding, 10), ' ', style, raw);
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

      this._promptNode.value = commandText;

      this._fixPromptHeight();

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
        var outputValue = "".concat(this._prefixNode.innerHTML).concat(this._promptNode.value);

        if (outputValue) {
          var outputValueNode = utils.createElement("<div>".concat(outputValue, "</div>"));

          this._outputNode.appendChild(outputValueNode);
        }
      }

      this._prefixNode.textContent = '';
      this._promptNode.value = '';

      this._fixPromptHeight();
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
          _this6._promptNode.value = commandLine;

          _this6._fixPromptHeight();

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
        var inputValue = this._promptNode.value;
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
          _this7._promptNode.value = _this7._autocompleteContext.precursorValue + value;

          _this7._fixPromptHeight();

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
    key: "_fixPromptHeight",
    value: function _fixPromptHeight() {
      this._promptNode.style.height = 'auto';
      this._promptNode.style.height = this._promptNode.scrollHeight + 'px';
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXV0b2NvbXBsZXRlLXByb3ZpZGVyLmpzIiwic3JjL2NhbmNlbC10b2tlbi5qcyIsInNyYy9jbWRyLmpzIiwic3JjL2NvbW1hbmQuanMiLCJzcmMvaGlzdG9yeS1wcm92aWRlci5qcyIsInNyYy9vdmVybGF5LXRlcm1pbmFsLmpzIiwic3JjL3BsdWdpbi5qcyIsInNyYy9zaGVsbC1iYXNlLmpzIiwic3JjL3NoZWxsLmpzIiwic3JjL3Rlcm1pbmFsLmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQ0FBOzs7Ozs7Ozs7Ozs7SUFFTSxvQjs7O0FBQ0Ysa0NBQWM7QUFBQTs7QUFDVixTQUFLLE9BQUwsR0FBZSxFQUFmO0FBRUEsU0FBSyxRQUFMLEdBQWdCLElBQWhCO0FBQ0EsU0FBSyxNQUFMLEdBQWMsQ0FBQyxDQUFmO0FBQ0EsU0FBSyxPQUFMLEdBQWUsRUFBZjs7QUFFQSxTQUFLLGlCQUFMO0FBQ0g7Ozs7NkJBRVEsUSxFQUFVLENBQ2xCOzs7K0JBRVUsUSxFQUFVLENBQ3BCOzs7aUNBRVksTyxFQUFTLE8sRUFBUztBQUFBOztBQUMzQixVQUFJLE9BQU8sS0FBSyxLQUFLLFFBQXJCLEVBQStCO0FBQzNCLGFBQUssUUFBTCxHQUFnQixPQUFoQjtBQUNBLGFBQUssTUFBTCxHQUFjLENBQUMsQ0FBZjtBQUNBLGFBQUssT0FBTCxHQUFlLEtBQUssYUFBTCxDQUFtQixPQUFuQixDQUFmO0FBQ0g7O0FBRUQsYUFBTyxPQUFPLENBQUMsR0FBUixDQUFZLENBQUMsS0FBSyxPQUFOLENBQVosRUFBNEIsSUFBNUIsQ0FBaUMsVUFBQyxNQUFELEVBQVk7QUFDaEQsUUFBQSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUQsQ0FBZjtBQUVBLFlBQUksY0FBYyxHQUFHLE1BQU0sQ0FBQyxNQUFQLENBQWMsVUFBQyxLQUFELEVBQVc7QUFDMUMsaUJB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QUMsUUFBZixHQUEwQixNQUFoQztBQUNIO0FBQ0osR0FURCxNQVNPLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVgsS0FBeUIsR0FBRyxDQUFDLElBQUosSUFBWSxTQUF6QyxFQUFvRDtBQUN2RCxRQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsV0FBSixFQUFoQjtBQUNBLFFBQUksa0JBQWtCLEdBQUcsR0FBRyxDQUFDLElBQUosQ0FBUyxlQUFULEVBQXpCO0FBQ0EsSUFBQSxrQkFBa0IsQ0FBQyxpQkFBbkIsQ0FBcUMsT0FBckM7QUFDQSxJQUFBLGtCQUFrQixDQUFDLFdBQW5CLENBQStCLFVBQS9CLEVBQTJDLFNBQTNDO0FBQ0EsSUFBQSxHQUFHLEdBQUcsa0JBQWtCLENBQUMsSUFBbkIsQ0FBd0IsTUFBOUI7QUFDSDs7QUFDRCxTQUFPLEdBQVA7QUFDSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xyXG5cclxuY2xhc3MgQXV0b2NvbXBsZXRlUHJvdmlkZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5sb29rdXBzID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fY29udGV4dCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5faW5kZXggPSAtMTtcclxuICAgICAgICB0aGlzLl92YWx1ZXMgPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9wcmVkZWZpbmVMb29rdXBzKCk7XHJcbiAgICB9XHJcbiAgICAgICAgXHJcbiAgICBhY3RpdmF0ZSh0ZXJtaW5hbCkgeyBcclxuICAgIH1cclxuICAgIFxyXG4gICAgZGVhY3RpdmF0ZSh0ZXJtaW5hbCkge1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXROZXh0VmFsdWUoZm9yd2FyZCwgY29udGV4dCkge1xyXG4gICAgICAgIGlmIChjb250ZXh0ICE9PSB0aGlzLl9jb250ZXh0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xyXG4gICAgICAgICAgICB0aGlzLl9pbmRleCA9IC0xOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLl92YWx1ZXMgPSB0aGlzLl9sb29rdXBWYWx1ZXMoY29udGV4dCk7IFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW3RoaXMuX3ZhbHVlc10pLnRoZW4oKHZhbHVlcykgPT4ge1xyXG4gICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXNbMF07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgY29tcGxldGVWYWx1ZXMgPSB2YWx1ZXMuZmlsdGVyKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQuaW5jb21wbGV0ZVZhbHVlID09PSAnJyB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnRvTG93ZXJDYXNlKCkuc2xpY2UoMCwgY29udGV4dC5pbmNvbXBsZXRlVmFsdWUudG9Mb3dlckNhc2UoKS5sZW5ndGgpID09PSBjb250ZXh0LmluY29tcGxldGVWYWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChjb21wbGV0ZVZhbHVlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodGhpcy5faW5kZXggPj0gY29tcGxldGVWYWx1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmRleCA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChmb3J3YXJkICYmIHRoaXMuX2luZGV4IDwgY29tcGxldGVWYWx1ZXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5kZXgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChmb3J3YXJkICYmIHRoaXMuX2luZGV4ID49IGNvbXBsZXRlVmFsdWVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghZm9yd2FyZCAmJiB0aGlzLl9pbmRleCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4LS07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIWZvcndhcmQgJiYgdGhpcy5faW5kZXggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5kZXggPSBjb21wbGV0ZVZhbHVlcy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gY29tcGxldGVWYWx1ZXNbdGhpcy5faW5kZXhdO1xyXG4gICAgICAgIH0pOyAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIF9sb29rdXBWYWx1ZXMoY29udGV4dCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZ1bmN0aW9uIHJlc29sdmVWYWx1ZXModmFsdWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlcykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZXM7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWVzID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVzKGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgbG9va3VwIG9mIHRoaXMubG9va3VwcykgeyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgcmVzdWx0cyA9IHJlc29sdmVWYWx1ZXMobG9va3VwKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdHMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgICAgICAgICB9ICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBfcHJlZGVmaW5lTG9va3VwcygpIHtcclxuICAgICAgICBcclxuICAgICAgICBmdW5jdGlvbiBjb21tYW5kTmFtZUxvb2t1cChjb250ZXh0KSB7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChjb250ZXh0LnByZWN1cnNvclZhbHVlLnRyaW0oKSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBjb21tYW5kcyA9IGNvbnRleHQudGVybWluYWwuc2hlbGwuZ2V0Q29tbWFuZHMoKTsgICAgICAgICAgICBcclxuICAgICAgICAgICAgdmFyIG5hbWVzID0gdXRpbHMuYXJyYXlGcm9tKGNvbW1hbmRzLCBjID0+IGMubmFtZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBuYW1lcztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5sb29rdXBzLnB1c2goY29tbWFuZE5hbWVMb29rdXApOyAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEF1dG9jb21wbGV0ZVByb3ZpZGVyOyIsImNsYXNzIENhbmNlbFRva2VuIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX2lzQ2FuY2VsUmVxdWVzdGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fY2FuY2VsSGFuZGxlcnMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNDYW5jZWxSZXF1ZXN0ZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzQ2FuY2VsUmVxdWVzdGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbmNlbCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzQ2FuY2VsUmVxdWVzdGVkKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgdGhpcy5fY2FuY2VsSGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcih0aGlzKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faXNDYW5jZWxSZXF1ZXN0ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1bmNhbmNlbCgpIHtcclxuICAgICAgICB0aGlzLl9pc0NhbmNlbFJlcXVlc3RlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIG9uQ2FuY2VsKGhhbmRsZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNDYW5jZWxSZXF1ZXN0ZWQpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIodGhpcyk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jYW5jZWxIYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIG9mZkNhbmNlbChoYW5kbGVyKSB7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5fY2FuY2VsSGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9jYW5jZWxIYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2FuY2VsVG9rZW47IiwiXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVGVybWluYWwgfSBmcm9tICcuL3Rlcm1pbmFsLmpzJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBPdmVybGF5VGVybWluYWwgfSBmcm9tICcuL292ZXJsYXktdGVybWluYWwuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFNoZWxsQmFzZSB9IGZyb20gJy4vc2hlbGwtYmFzZS5qcyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2hlbGwgfSBmcm9tICcuL3NoZWxsLmpzJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBIaXN0b3J5UHJvdmlkZXIgfSBmcm9tICcuL2hpc3RvcnktcHJvdmlkZXIuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEF1dG9jb21wbGV0ZVByb3ZpZGVyIH0gZnJvbSAnLi9hdXRvY29tcGxldGUtcHJvdmlkZXIuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbW1hbmQgfSBmcm9tICcuL2NvbW1hbmQuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFBsdWdpbiB9IGZyb20gJy4vcGx1Z2luLmpzJztcclxuZXhwb3J0IGNvbnN0IHZlcnNpb24gPSAnMi4wLjAnOyIsImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xyXG5cclxuY2xhc3MgQ29tbWFuZCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBtYWluLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBvcHRpb25zID0gbWFpbjtcclxuICAgICAgICAgICAgbWFpbiA9IG5hbWU7XHJcbiAgICAgICAgICAgIG5hbWUgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG1haW4gIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IG1haW47XHJcbiAgICAgICAgICAgIG1haW4gPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLm1haW4gPSBtYWluO1xyXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMudXNhZ2UgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmhlbHAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlZmluaXRpb24uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwud3JpdGVMaW5lKHRoaXMuZGVmaW5pdGlvbi5kZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGVmaW5pdGlvbi5kZXNjcmlwdGlvbiAmJiB0aGlzLmRlZmluaXRpb24udXNhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGVmaW5pdGlvbi51c2FnZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUodGhpcy5kZWZpbml0aW9uLnVzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHV0aWxzLmV4dGVuZCh0aGlzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdGhpcy5tYWluID0gdGhpcy5tYWluIHx8ICgoKT0+e30pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5uYW1lICE9PSAnc3RyaW5nJylcclxuICAgICAgICAgICAgdGhyb3cgJ1wibmFtZVwiIG11c3QgYmUgYSBzdHJpbmcuJztcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMubWFpbiAhPT0gJ2Z1bmN0aW9uJylcclxuICAgICAgICAgICAgdGhyb3cgJ1wibWFpblwiIG11c3QgYmUgYSBmdW5jdGlvbi4nO1xyXG5cclxuICAgICAgICB0aGlzLm5hbWUgPSB0aGlzLm5hbWUudG9VcHBlckNhc2UoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoIXRoaXMudXNhZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy51c2FnZSA9IHRoaXMubmFtZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvbW1hbmQ7XHJcbiIsImNsYXNzIEhpc3RvcnlQcm92aWRlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnZhbHVlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9wcmVleGVjdXRlSGFuZGxlciA9IChjb21tYW5kKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWVzLnVuc2hpZnQoY29tbWFuZCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBhY3RpdmF0ZSh0ZXJtaW5hbCkgeyBcclxuICAgICAgICB0ZXJtaW5hbC5vbigncHJlZXhlY3V0ZScsIHRoaXMuX3ByZWV4ZWN1dGVIYW5kbGVyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZGVhY3RpdmF0ZSh0ZXJtaW5hbCkge1xyXG4gICAgICAgIHRlcm1pbmFsLm9mZigncHJlZXhlY3V0ZScsIHRoaXMuX3ByZWV4ZWN1dGVIYW5kbGVyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0TmV4dFZhbHVlKGZvcndhcmQpIHtcclxuICAgICAgICBpZiAoZm9yd2FyZCAmJiB0aGlzLmluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmluZGV4LS07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlc1t0aGlzLmluZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFmb3J3YXJkICYmIHRoaXMudmFsdWVzLmxlbmd0aCA+IHRoaXMuaW5kZXggKyAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW3RoaXMuaW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgSGlzdG9yeVByb3ZpZGVyOyIsImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgVGVybWluYWwgZnJvbSAnLi90ZXJtaW5hbC5qcyc7XHJcblxyXG5jb25zdCBfZGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICBhdXRvT3BlbjogZmFsc2UsXHJcbiAgICBvcGVuS2V5OiAxOTIsXHJcbiAgICBjbG9zZUtleTogMjdcclxufTtcclxuXHJcbmNsYXNzIE92ZXJsYXlUZXJtaW5hbCBleHRlbmRzIFRlcm1pbmFsIHtcclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGxldCBvdmVybGF5Tm9kZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoJzxkaXYgc3R5bGU9XCJkaXNwbGF5OiBub25lXCIgY2xhc3M9XCJjbWRyLW92ZXJsYXlcIj48L2Rpdj4nKTtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG92ZXJsYXlOb2RlKTtcclxuXHJcbiAgICAgICAgb3B0aW9ucyA9IHV0aWxzLmV4dGVuZCh7fSwgX2RlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgc3VwZXIob3ZlcmxheU5vZGUsIG9wdGlvbnMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX292ZXJsYXlOb2RlID0gb3ZlcmxheU5vZGU7XHJcbiAgICAgICAgdGhpcy5fZG9jdW1lbnRFdmVudEhhbmRsZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXQgaXNPcGVuKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vdmVybGF5Tm9kZS5zdHlsZS5kaXNwbGF5ICE9PSAnbm9uZSc7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9kb2N1bWVudEV2ZW50SGFuZGxlciA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNPcGVuICYmXHJcbiAgICAgICAgICAgICAgICBbJ0lOUFVUJywgJ1RFWFRBUkVBJywgJ1NFTEVDVCddLmluZGV4T2YoZXZlbnQudGFyZ2V0LnRhZ05hbWUpID09PSAtMSAmJlxyXG4gICAgICAgICAgICAgICAgIWV2ZW50LnRhcmdldC5pc0NvbnRlbnRFZGl0YWJsZSAmJlxyXG4gICAgICAgICAgICAgICAgZXZlbnQua2V5Q29kZSA9PSB0aGlzLm9wdGlvbnMub3BlbktleSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNPcGVuICYmIGV2ZW50LmtleUNvZGUgPT0gdGhpcy5vcHRpb25zLmNsb3NlS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fZG9jdW1lbnRFdmVudEhhbmRsZXIpO1xyXG5cclxuICAgICAgICBzdXBlci5pbml0KCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b09wZW4pIHtcclxuICAgICAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSByZXR1cm47XHJcbiAgICBcclxuICAgICAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2RvY3VtZW50RXZlbnRIYW5kbGVyKTsgICAgXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLl9vdmVybGF5Tm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgb3BlbigpIHtcclxuICAgICAgICB0aGlzLl9vdmVybGF5Tm9kZS5zdHlsZS5kaXNwbGF5ID0gJyc7ICAgICAgICBcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9maXhQcm9tcHRJbmRlbnQoKTsgIC8vaGFjazogdXNpbmcgJ3ByaXZhdGUnIG1ldGhvZCBmcm9tIGJhc2UgY2xhc3MgdG8gZml4IGluZGVudFxyXG4gICAgICAgICAgICB0aGlzLmZvY3VzKCk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKSB7XHJcbiAgICAgICAgdGhpcy5fb3ZlcmxheU5vZGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XHJcbiAgICAgICAgdGhpcy5ibHVyKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE92ZXJsYXlUZXJtaW5hbDsiLCJjbGFzcyBQbHVnaW4ge1xyXG4gICAgYWN0aXZhdGUodGVybWluYWwpIHtcclxuICAgIH1cclxuXHJcbiAgICBkZWFjdGl2YXRlKHRlcm1pbmFsKSB7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBsdWdpbjsiLCJjbGFzcyBTaGVsbEJhc2Uge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBleGVjdXRlQ29tbWFuZCh0ZXJtaW5hbCwgY29tbWFuZExpbmUsIGNhbmNlbFRva2VuKSB7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29tbWFuZHMobmFtZSkge1xyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuXHJcbiAgICBwYXJzZUNvbW1hbmRMaW5lKGNvbW1hbmRMaW5lLCBwYXJzZU5hbWUpIHsgXHJcbiAgICAgICAgbGV0IGV4cCA9IC9bXlxcc1wiXSt8XCIoW15cIl0qKVwiL2dpLFxyXG4gICAgICAgICAgICBuYW1lID0gbnVsbCxcclxuICAgICAgICAgICAgYXJnU3RyaW5nID0gbnVsbCxcclxuICAgICAgICAgICAgYXJncyA9IFtdLFxyXG4gICAgICAgICAgICBtYXRjaCA9IG51bGw7XHJcblxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgbWF0Y2ggPSBleHAuZXhlYyhjb21tYW5kTGluZSk7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IG1hdGNoWzFdID8gbWF0Y2hbMV0gOiBtYXRjaFswXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2guaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdTdHJpbmcgPSBjb21tYW5kTGluZS5zdWJzdHIodmFsdWUubGVuZ3RoICsgKG1hdGNoWzFdID8gMyA6IDEpKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKG1hdGNoWzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gd2hpbGUgKG1hdGNoICE9PSBudWxsKTtcclxuXHJcbiAgICAgICAgaWYgKHBhcnNlTmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgICAgICAgIGFyZ1N0cmluZzogYXJnU3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhcmdzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2hlbGxCYXNlOyIsImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgU2hlbGxCYXNlIGZyb20gJy4vc2hlbGwtYmFzZS5qcyc7XHJcbmltcG9ydCBDb21tYW5kIGZyb20gJy4vY29tbWFuZC5qcyc7XHJcblxyXG5jb25zdCBfZGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICBjb250ZXh0RXh0ZW5zaW9uczoge30sXHJcbiAgICBidWlsdEluQ29tbWFuZHM6IFsnSEVMUCcsICdFQ0hPJywgJ0NMUyddLFxyXG4gICAgYWxsb3dBYmJyZXZpYXRpb25zOiB0cnVlXHJcbn07XHJcblxyXG5jbGFzcyBTaGVsbCBleHRlbmRzIFNoZWxsQmFzZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gdXRpbHMuZXh0ZW5kKHt9LCBfZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSB7fTtcclxuXHJcbiAgICAgICAgdGhpcy5fYWRkQnVpbHRJbkNvbW1hbmRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhlY3V0ZUNvbW1hbmQodGVybWluYWwsIGNvbW1hbmRMaW5lLCBjYW5jZWxUb2tlbikge1xyXG4gICAgICAgIGxldCBwYXJzZWQgPSB0aGlzLnBhcnNlQ29tbWFuZExpbmUoY29tbWFuZExpbmUsIHRydWUpO1xyXG4gICAgICAgIGxldCBjb21tYW5kcyA9IHRoaXMuZ2V0Q29tbWFuZHMocGFyc2VkLm5hbWUpO1xyXG4gICAgICAgIGlmICghY29tbWFuZHMgfHwgY29tbWFuZHMubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICB0ZXJtaW5hbC53cml0ZUxpbmUoJ0ludmFsaWQgY29tbWFuZCcsICdlcnJvcicpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb21tYW5kcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRlcm1pbmFsLndyaXRlTGluZSgnQW1iaWd1b3VzIGNvbW1hbmQnLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgdGVybWluYWwud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tbWFuZHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRlcm1pbmFsLndyaXRlUGFkKGNvbW1hbmRzW2ldLm5hbWUsIDEwKTtcclxuICAgICAgICAgICAgICAgIHRlcm1pbmFsLndyaXRlTGluZShjb21tYW5kc1tpXS5kZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVybWluYWwud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjb21tYW5kID0gY29tbWFuZHNbMF07XHJcblxyXG4gICAgICAgIGxldCBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICB0ZXJtaW5hbDogdGVybWluYWwsXHJcbiAgICAgICAgICAgIGNvbW1hbmRMaW5lOiBjb21tYW5kTGluZSxcclxuICAgICAgICAgICAgY29tbWFuZDogY29tbWFuZCxcclxuICAgICAgICAgICAgcGFyc2VkOiBwYXJzZWQsXHJcbiAgICAgICAgICAgIGRlZmVyOiB1dGlscy5kZWZlcixcclxuICAgICAgICAgICAgY2FuY2VsVG9rZW46IGNhbmNlbFRva2VuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdXRpbHMuZXh0ZW5kKGNvbnRleHQsIHRoaXMub3B0aW9ucy5jb250ZXh0RXh0ZW5zaW9ucyk7XHJcblxyXG4gICAgICAgIGxldCBhcmdzID0gcGFyc2VkLmFyZ3M7XHJcblxyXG4gICAgICAgIGlmIChjb21tYW5kLmhlbHAgJiYgYXJncy5sZW5ndGggPiAwICYmIGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gXCIvP1wiKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29tbWFuZC5oZWxwID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgdGVybWluYWwud3JpdGVMaW5lKGNvbW1hbmQuaGVscCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbW1hbmQuaGVscCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1hbmQuaGVscC5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbW1hbmQubWFpbi5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb21tYW5kcyhuYW1lKSB7XHJcbiAgICAgICAgbGV0IGNvbW1hbmRzID0gW107XHJcblxyXG4gICAgICAgIGlmIChuYW1lKSB7XHJcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnRvVXBwZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29tbWFuZCA9IHRoaXMuY29tbWFuZHNbbmFtZV07XHJcblxyXG4gICAgICAgICAgICBpZiAoY29tbWFuZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbW1hbmQuYXZhaWxhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtjb21tYW5kXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGxvd0FiYnJldmlhdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiB0aGlzLmNvbW1hbmRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleS5pbmRleE9mKG5hbWUsIDApID09PSAwICYmIHV0aWxzLnVud3JhcCh0aGlzLmNvbW1hbmRzW2tleV0uYXZhaWxhYmxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kcy5wdXNoKHRoaXMuY29tbWFuZHNba2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMuY29tbWFuZHMpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRzLnB1c2godGhpcy5jb21tYW5kc1trZXldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbW1hbmRzO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZENvbW1hbmQoY29tbWFuZCkge1xyXG4gICAgICAgIGlmICghKGNvbW1hbmQgaW5zdGFuY2VvZiBDb21tYW5kKSkge1xyXG4gICAgICAgICAgICBjb21tYW5kID0gbmV3IENvbW1hbmQoLi4uYXJndW1lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jb21tYW5kc1tjb21tYW5kLm5hbWVdID0gY29tbWFuZDtcclxuICAgIH1cclxuXHJcbiAgICBfYWRkQnVpbHRJbkNvbW1hbmRzKCkge1xyXG4gICAgICAgIGxldCBwcm92aWRlciA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYnVpbHRJbkNvbW1hbmRzLmluZGV4T2YoJ0hFTFAnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnSEVMUCcsXHJcbiAgICAgICAgICAgICAgICBtYWluOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUoJ1RoZSBmb2xsb3dpbmcgY29tbWFuZHMgYXJlIGF2YWlsYWJsZTonKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRlcm1pbmFsLndyaXRlTGluZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhdmFpbGFibGVDb21tYW5kcyA9IE9iamVjdC5rZXlzKHByb3ZpZGVyLmNvbW1hbmRzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKChrZXkpID0+IHsgcmV0dXJuIHByb3ZpZGVyLmNvbW1hbmRzW2tleV07IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGRlZikgPT4geyByZXR1cm4gZGVmLmF2YWlsYWJsZTsgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxlbmd0aCA9IGF2YWlsYWJsZUNvbW1hbmRzLnNsaWNlKCkuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYi5uYW1lLmxlbmd0aCAtIGEubmFtZS5sZW5ndGg7IH0pWzBdLm5hbWUubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwud3JpdGVUYWJsZShhdmFpbGFibGVDb21tYW5kcywgWyduYW1lOicgKyAobGVuZ3RoICsgMikudG9TdHJpbmcoKSwgJ2Rlc2NyaXB0aW9uOjQwJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUoJyogUGFzcyBcIi8/XCIgaW50byBhbnkgY29tbWFuZCB0byBkaXNwbGF5IGhlbHAgZm9yIHRoYXQgY29tbWFuZC4nKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvdmlkZXIub3B0aW9ucy5hbGxvd0FiYnJldmlhdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUoJyogQ29tbWFuZCBhYmJyZXZpYXRpb25zIGFyZSBhbGxvd2VkIChlLmcuIFwiSFwiIGZvciBcIkhFTFBcIikuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTGlzdHMgdGhlIGF2YWlsYWJsZSBjb21tYW5kcy4nXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5idWlsdEluQ29tbWFuZHMuaW5kZXhPZignRUNITycpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdFQ0hPJyxcclxuICAgICAgICAgICAgICAgIG1haW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG9nZ2xlID0gdGhpcy5hcmdTdHJpbmcudG9VcHBlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodG9nZ2xlID09PSAnT04nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwuZWNobyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0b2dnbGUgPT09ICdPRkYnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwuZWNobyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5hcmdTdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUodGhpcy5hcmdTdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwud3JpdGVMaW5lKCdFQ0hPIGlzICcgKyAodGhpcy50ZXJtaW5hbC5lY2hvID8gJ29uLicgOiAnb2ZmLicpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdEaXNwbGF5cyBtZXNzYWdlcywgb3IgdG9nZ2xlcyBjb21tYW5kIGVjaG9pbmcuJyxcclxuICAgICAgICAgICAgICAgIHVzYWdlOiAnRUNITyBbT04gfCBPRkZdXFxuRUNITyBbbWVzc2FnZV1cXG5cXG5UeXBlIEVDSE8gd2l0aG91dCBwYXJhbWV0ZXJzIHRvIGRpc3BsYXkgdGhlIGN1cnJlbnQgZWNobyBzZXR0aW5nLidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJ1aWx0SW5Db21tYW5kcy5pbmRleE9mKCdDTFMnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnQ0xTJyxcclxuICAgICAgICAgICAgICAgIG1haW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRlcm1pbmFsLmNsZWFyKCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDbGVhcnMgdGhlIGNvbW1hbmQgcHJvbXB0LidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTaGVsbDsiLCJpbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IEhpc3RvcnlQcm92aWRlciBmcm9tICcuL2hpc3RvcnktcHJvdmlkZXIuanMnO1xyXG5pbXBvcnQgQXV0b2NvbXBsZXRlUHJvdmlkZXIgZnJvbSAnLi9hdXRvY29tcGxldGUtcHJvdmlkZXIuanMnO1xyXG5pbXBvcnQgU2hlbGwgZnJvbSAnLi9zaGVsbC5qcyc7XHJcbmltcG9ydCBDYW5jZWxUb2tlbiBmcm9tICcuL2NhbmNlbC10b2tlbi5qcyc7XHJcblxyXG5jb25zdCBfZGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICBlY2hvOiB0cnVlLFxyXG4gICAgcHJvbXB0UHJlZml4OiAnPicsXHJcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJjbWRyLXRlcm1pbmFsXCI+PGRpdiBjbGFzcz1cIm91dHB1dFwiPjwvZGl2PjxkaXYgY2xhc3M9XCJpbnB1dFwiPjxzcGFuIGNsYXNzPVwicHJlZml4XCI+PC9zcGFuPjx0ZXh0YXJlYSBjbGFzcz1cInByb21wdFwiIHNwZWxsY2hlY2s9XCJmYWxzZVwiPjwvdGV4dGFyZWE+PC9kaXY+PC9kaXY+JyxcclxuICAgIHRoZW1lOiAnY21kJyxcclxuICAgIGF1dG9TY3JvbGw6IHRydWUsXHJcbiAgICBoaXN0b3J5UHJvdmlkZXI6IG51bGwsXHJcbiAgICBhdXRvY29tcGxldGVQcm92aWRlcjogbnVsbCxcclxuICAgIHNoZWxsOiBudWxsLFxyXG4gICAgcGx1Z2luczogW11cclxufTtcclxuXHJcbmNsYXNzIFRlcm1pbmFsIHtcclxuICAgIGNvbnN0cnVjdG9yKGNvbnRhaW5lck5vZGUsIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAoIWNvbnRhaW5lck5vZGUgfHwgIXV0aWxzLmlzRWxlbWVudChjb250YWluZXJOb2RlKSkge1xyXG4gICAgICAgICAgICB0aHJvdyAnXCJjb250YWluZXJOb2RlXCIgbXVzdCBiZSBhbiBIVE1MRWxlbWVudC4nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IHV0aWxzLmV4dGVuZCh7fSwgX2RlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuICAgICAgICB0aGlzLl9jb250YWluZXJOb2RlID0gY29udGFpbmVyTm9kZTtcclxuICAgICAgICB0aGlzLl90ZXJtaW5hbE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2lucHV0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcHJlZml4Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0TGluZU5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2VjaG8gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3F1ZXVlID0gW107XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0UHJlZml4ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pc0lucHV0SW5saW5lID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlQ29udGV4dCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVycyA9IHt9O1xyXG4gICAgICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9oaXN0b3J5UHJvdmlkZXIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9zaGVsbCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcGx1Z2lucyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNJbml0aWFsaXplZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNJbml0aWFsaXplZDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb3B0aW9ucygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9ucztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgcHJvbXB0UHJlZml4KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9tcHRQcmVmaXg7XHJcbiAgICB9XHJcbiAgICBzZXQgcHJvbXB0UHJlZml4KHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0UHJlZml4ID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0lucHV0SW5saW5lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUudGV4dENvbnRlbnQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5fZml4UHJvbXB0SW5kZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBlY2hvKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9lY2hvO1xyXG4gICAgfVxyXG4gICAgc2V0IGVjaG8odmFsdWUpIHtcclxuICAgICAgICB0aGlzLl9lY2hvID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNoZWxsKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaGVsbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IGhpc3RvcnlQcm92aWRlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faGlzdG9yeVByb3ZpZGVyO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBhdXRvY29tcGxldGVQcm92aWRlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXI7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHBsdWdpbnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcmVlemUodGhpcy5fcGx1Z2lucyk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNJbml0aWFsaXplZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl90ZXJtaW5hbE5vZGUgPSB1dGlscy5jcmVhdGVFbGVtZW50KHRoaXMuX29wdGlvbnMudGVtcGxhdGUpO1xyXG5cclxuICAgICAgICB0aGlzLl90ZXJtaW5hbE5vZGUuY2xhc3NOYW1lICs9ICcgY21kci10ZXJtaW5hbC0tJyArIHRoaXMuX29wdGlvbnMudGhlbWU7XHJcblxyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lck5vZGUuYXBwZW5kQ2hpbGQodGhpcy5fdGVybWluYWxOb2RlKTtcclxuXHJcbiAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZSA9IHRoaXMuX3Rlcm1pbmFsTm9kZS5xdWVyeVNlbGVjdG9yKCcub3V0cHV0Jyk7XHJcbiAgICAgICAgdGhpcy5faW5wdXROb2RlID0gdGhpcy5fdGVybWluYWxOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5pbnB1dCcpO1xyXG4gICAgICAgIHRoaXMuX3ByZWZpeE5vZGUgPSB0aGlzLl90ZXJtaW5hbE5vZGUucXVlcnlTZWxlY3RvcignLnByZWZpeCcpO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUgPSB0aGlzLl90ZXJtaW5hbE5vZGUucXVlcnlTZWxlY3RvcignLnByb21wdCcpO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSAhPT0gOSAmJiAhZXZlbnQuc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVSZXNldCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxMzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5fcHJvbXB0Tm9kZS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4ZWN1dGUodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDM4OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9oaXN0b3J5Q3ljbGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0MDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlzdG9yeUN5Y2xlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA5OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVDeWNsZSghZXZlbnQuc2hpZnRLZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuY3RybEtleSAmJiBldmVudC5rZXlDb2RlID09PSA2Nykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FuY2VsKCk7IFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9jdXJyZW50LnJlYWRMaW5lICYmIGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkTGluZS5yZXNvbHZlKHRoaXMuX3Byb21wdE5vZGUudmFsdWUpOyBcclxuICAgICAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fY3VycmVudC5yZWFkICYmICF0aGlzLl9jdXJyZW50LnJlYWRMaW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJyZW50ICYmIHRoaXMuX2N1cnJlbnQucmVhZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmNoYXJDb2RlICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkLnJlc29sdmUoU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC5jaGFyQ29kZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9maXhQcm9tcHRIZWlnaHQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fdGVybWluYWxOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgIT09IHRoaXMuX2lucHV0Tm9kZSAmJiAhdGhpcy5faW5wdXROb2RlLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkgJiZcclxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldCAhPT0gdGhpcy5fb3V0cHV0Tm9kZSAmJiAhdGhpcy5fb3V0cHV0Tm9kZS5jb250YWlucyhldmVudC50YXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0UHJlZml4ID0gdGhpcy5fb3B0aW9ucy5wcm9tcHRQcmVmaXg7XHJcblxyXG4gICAgICAgIHRoaXMuX2VjaG8gPSB0aGlzLl9vcHRpb25zLmVjaG87XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fc2hlbGwgPSB0aGlzLm9wdGlvbnMuc2hlbGwgfHwgbmV3IFNoZWxsKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2hpc3RvcnlQcm92aWRlciA9IHRoaXMuX29wdGlvbnMuaGlzdG9yeVByb3ZpZGVyIHx8IG5ldyBIaXN0b3J5UHJvdmlkZXIoKTtcclxuICAgICAgICB0aGlzLl9oaXN0b3J5UHJvdmlkZXIuYWN0aXZhdGUodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyID0gdGhpcy5fb3B0aW9ucy5hdXRvY29tcGxldGVQcm92aWRlciB8fCBuZXcgQXV0b2NvbXBsZXRlUHJvdmlkZXIoKTtcclxuICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlci5hY3RpdmF0ZSh0aGlzKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMuX29wdGlvbnMucGx1Z2lucykge1xyXG4gICAgICAgICAgICB0aGlzLl9wbHVnaW5zLnB1c2gocGx1Z2luKTtcclxuICAgICAgICAgICAgcGx1Z2luLmFjdGl2YXRlKHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVJbnB1dCgpO1xyXG5cclxuICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBkaXNwb3NlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNJbml0aWFsaXplZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9jb250YWluZXJOb2RlLnJlbW92ZUNoaWxkKHRoaXMuX3Rlcm1pbmFsTm9kZSk7XHJcbiAgICAgICAgdGhpcy5fdGVybWluYWxOb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9vdXRwdXROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3ByZWZpeE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2VjaG8gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3F1ZXVlID0gW107XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0UHJlZml4ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pc0lucHV0SW5saW5lID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlQ29udGV4dCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVycyA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLl9zaGVsbCA9IG51bGw7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9oaXN0b3J5UHJvdmlkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyLmRlYWN0aXZhdGUodGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hpc3RvcnlQcm92aWRlciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlci5kZWFjdGl2YXRlKHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLl9wbHVnaW5zKSB7XHJcbiAgICAgICAgICAgIHBsdWdpbi5kZWFjdGl2YXRlKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9wbHVnaW5zID0gW107ICAgIFxyXG5cclxuICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQoKSB7XHJcbiAgICAgICAgdGhpcy5kaXNwb3NlKCk7XHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVhZChjYWxsYmFjaywgaW50ZXJjZXB0KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlSW5wdXQodHJ1ZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGRlZmVycmVkID0gdXRpbHMuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkID0gdXRpbHMuZGVmZXIoKTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWQudGhlbigodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fZGVhY3RpdmF0ZUlucHV0KCk7XHJcbiAgICAgICAgICAgIGlmICghaW50ZXJjZXB0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLnRleHRDb250ZW50ICs9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS52YWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZml4UHJvbXB0SGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGNhbGxiYWNrKHZhbHVlLCB0aGlzLl9jdXJyZW50KTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCdVbmhhbmRsZWQgZXhjZXB0aW9uJywgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlTGluZShlcnJvciwgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9ICBcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkKGNhbGxiYWNrKS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mbHVzaElucHV0KCk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZC5pbnRlcmNlcHQgPSBpbnRlcmNlcHQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHJlYWRMaW5lKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlSW5wdXQodHJ1ZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGRlZmVycmVkID0gdXRpbHMuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkTGluZSA9IHV0aWxzLmRlZmVyKCk7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkTGluZS50aGVuKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl9maXhQcm9tcHRIZWlnaHQoKTtcclxuICAgICAgICAgICAgdGhpcy5fZGVhY3RpdmF0ZUlucHV0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZsdXNoSW5wdXQoKTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gY2FsbGJhY2sodmFsdWUsIHRoaXMuX2N1cnJlbnQpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZUxpbmUoJ1VuaGFuZGxlZCBleGNlcHRpb24nLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKGVycm9yLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0gIFxyXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWRMaW5lKGNhbGxiYWNrKS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgd3JpdGUodmFsdWUsIHN0eWxlLCByYXcpIHtcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlIHx8ICcnO1xyXG4gICAgICAgIHZhbHVlID0gcmF3ID8gdmFsdWUgOiB1dGlscy5lbmNvZGVIdG1sKHZhbHVlKTtcclxuICAgICAgICBsZXQgb3V0cHV0VmFsdWUgPSB1dGlscy5jcmVhdGVFbGVtZW50KGA8c3Bhbj4ke3ZhbHVlfTwvc3Bhbj5gKTtcclxuICAgICAgICBpZiAodHlwZW9mIHN0eWxlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBvdXRwdXRWYWx1ZS5jbGFzc05hbWUgPSBzdHlsZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvdXRwdXRWYWx1ZS5zdHlsZSA9IHN0eWxlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuX291dHB1dExpbmVOb2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX291dHB1dExpbmVOb2RlID0gdXRpbHMuY3JlYXRlRWxlbWVudCgnPGRpdj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLl9vdXRwdXRMaW5lTm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX291dHB1dExpbmVOb2RlLmFwcGVuZENoaWxkKG91dHB1dFZhbHVlKTsgICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLl9vcHRpb25zLmF1dG9TY3JvbGwpIHtcclxuICAgICAgICAgICAgdGhpcy5fdGVybWluYWxOb2RlLnNjcm9sbFRvcCA9IHRoaXMuX3Rlcm1pbmFsTm9kZS5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHdyaXRlTGluZSh2YWx1ZSwgc3R5bGUsIHJhdykge1xyXG4gICAgICAgIHZhbHVlID0gKHZhbHVlIHx8ICcnKSArICdcXG4nO1xyXG4gICAgICAgIHRoaXMud3JpdGUodmFsdWUsIHN0eWxlLCByYXcpO1xyXG4gICAgICAgIHRoaXMuX291dHB1dExpbmVOb2RlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB3cml0ZVBhZCh2YWx1ZSwgbGVuZ3RoLCBjaGFyID0gJyAnLCBzdHlsZSA9IG51bGwsIHJhdyA9IGZhbHNlKSB7XHJcbiAgICAgICAgdGhpcy53cml0ZSh1dGlscy5wYWQodmFsdWUsIGxlbmd0aCwgY2hhciksIHN0eWxlLCByYXcpO1xyXG4gICAgfVxyXG5cclxuICAgIHdyaXRlVGFibGUoZGF0YSwgY29sdW1ucywgc2hvd0hlYWRlcnMsIHN0eWxlLCByYXcpIHtcclxuICAgICAgICBjb2x1bW5zID0gY29sdW1ucy5tYXAoKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZXMgPSB2YWx1ZS5zcGxpdCgnOicpO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogdmFsdWVzWzBdLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogdmFsdWVzLmxlbmd0aCA+IDEgPyB2YWx1ZXNbMV0gOiAxMCxcclxuICAgICAgICAgICAgICAgIGhlYWRlcjogdmFsdWVzLmxlbmd0aCA+IDIgPyB2YWx1ZXNbMl0gOiB2YWx1ZXNbMF1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgd3JpdGVDZWxsID0gKHZhbHVlLCBwYWRkaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgfHwgJyc7XHJcbiAgICAgICAgICAgIGlmIChwYWRkaW5nID09PSAnKicpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud3JpdGUodmFsdWUsIHN0eWxlLCByYXcpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZVBhZCh2YWx1ZSwgcGFyc2VJbnQocGFkZGluZywgMTApLCAnICcsIHN0eWxlLCByYXcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoc2hvd0hlYWRlcnMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sIG9mIGNvbHVtbnMpIHtcclxuICAgICAgICAgICAgICAgIHdyaXRlQ2VsbChjb2wuaGVhZGVyLCBjb2wucGFkZGluZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy53cml0ZUxpbmUoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sIG9mIGNvbHVtbnMpIHtcclxuICAgICAgICAgICAgICAgIHdyaXRlQ2VsbChBcnJheShjb2wuaGVhZGVyLmxlbmd0aCArIDEpLmpvaW4oJy0nKSwgY29sLnBhZGRpbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHJvdyBvZiBkYXRhKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbCBvZiBjb2x1bW5zKSB7XHJcbiAgICAgICAgICAgICAgICB3cml0ZUNlbGwocm93W2NvbC5uYW1lXSA/IHJvd1tjb2wubmFtZV0udG9TdHJpbmcoKSA6ICcnLCBjb2wucGFkZGluZyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy53cml0ZUxpbmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIoKSB7XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZS5pbm5lckhUTUwgPSAnJztcclxuICAgIH1cclxuXHJcbiAgICBjbGVhckxpbmUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX291dHB1dE5vZGUubGFzdENoaWxkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX291dHB1dE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fb3V0cHV0Tm9kZS5sYXN0Q2hpbGQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb2N1cygpIHtcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmZvY3VzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYmx1cigpIHtcclxuICAgICAgICB1dGlscy5ibHVyKHRoaXMuX3Byb21wdE5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uKGV2ZW50LCBoYW5kbGVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XSkge1xyXG4gICAgICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XSA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIG9mZihldmVudCwgaGFuZGxlcikge1xyXG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XS5pbmRleE9mKGhhbmRsZXIpO1xyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4ZWN1dGUoY29tbWFuZExpbmUsIC4uLmFyZ3MpIHtcclxuICAgICAgICBsZXQgZGVmZXJyZWQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb21tYW5kTGluZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQgPSBjb21tYW5kTGluZS5kZWZlcnJlZDtcclxuICAgICAgICAgICAgY29tbWFuZExpbmUgPSBjb21tYW5kTGluZS50ZXh0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgY29tbWFuZExpbmUgPT09ICdzdHJpbmcnICYmIGNvbW1hbmRMaW5lLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQgPSB1dGlscy5kZWZlcigpO1xyXG4gICAgICAgICAgICBpZiAoYXJncykge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExpbmUgPSB0aGlzLl9idWlsZENvbW1hbmQoY29tbWFuZExpbmUsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkZWZlcnJlZCA9IHV0aWxzLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnSW52YWxpZCBjb21tYW5kJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3F1ZXVlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQ6IGRlZmVycmVkLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogY29tbWFuZExpbmUsXHJcbiAgICAgICAgICAgICAgICBleGVjdXRlT25seTogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvbW1hbmRUZXh0ID0gY29tbWFuZExpbmU7XHJcbiAgICAgICAgY29tbWFuZExpbmUgPSBjb21tYW5kTGluZS50cmltKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3RyaWdnZXIoJ3ByZWV4ZWN1dGUnLCBjb21tYW5kTGluZSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUudmFsdWUgPSBjb21tYW5kVGV4dDtcclxuICAgICAgICB0aGlzLl9maXhQcm9tcHRIZWlnaHQoKTtcclxuICAgICAgICB0aGlzLl9mbHVzaElucHV0KCF0aGlzLl9lY2hvKTtcclxuICAgICAgICB0aGlzLl9kZWFjdGl2YXRlSW5wdXQoKTtcclxuXHJcbiAgICAgICAgbGV0IGNhbmNlbFRva2VuID0gbmV3IENhbmNlbFRva2VuKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMaW5lOiBjb21tYW5kTGluZSxcclxuICAgICAgICAgICAgY2FuY2VsVG9rZW46IGNhbmNlbFRva2VuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNvbXBsZXRlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX291dHB1dE5vZGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3RpdmF0ZUlucHV0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fcXVldWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhlY3V0ZSh0aGlzLl9xdWV1ZS5zaGlmdCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdDtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zaGVsbC5leGVjdXRlQ29tbWFuZCh0aGlzLCBjb21tYW5kTGluZSwgY2FuY2VsVG9rZW4pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCdVbmhhbmRsZWQgZXhjZXB0aW9uJywgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKGVycm9yLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdVbmhhbmRsZWQgZXhjZXB0aW9uJyk7XHJcbiAgICAgICAgICAgIGNvbXBsZXRlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFByb21pc2UuYWxsKFtyZXN1bHRdKS50aGVuKCh2YWx1ZXMpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlcignZXhlY3V0ZScsIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMaW5lOiBjb21tYW5kTGluZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodmFsdWVzWzBdKTtcclxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAocmVhc29uKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ2V4ZWN1dGUnLCB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTGluZTogY29tbWFuZExpbmUsXHJcbiAgICAgICAgICAgICAgICBlcnJvcjogcmVhc29uXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZDtcclxuICAgIH1cclxuXHJcbiAgICBjYW5jZWwoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5jYW5jZWxUb2tlbi5jYW5jZWwoKTtcclxuICAgIH1cclxuXHJcbiAgICBfYnVpbGRDb21tYW5kKGNvbW1hbmRMaW5lLCBhcmdzKSB7XHJcbiAgICAgICAgZm9yIChsZXQgYXJnIG9mIGFyZ3MpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnICYmIGFyZy5pbmRleE9mKCcgJykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExpbmUgKz0gYCBcIiR7YXJnfVwiYDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMaW5lICs9ICcgJyArIGFyZy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb21tYW5kTGluZTtcclxuICAgIH1cclxuXHJcbiAgICBfYWN0aXZhdGVJbnB1dChpbmxpbmUpIHtcclxuICAgICAgICBpZiAoaW5saW5lKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9vdXRwdXRMaW5lTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5pbm5lckhUTUwgPSB0aGlzLl9vdXRwdXRMaW5lTm9kZS5pbm5lckhUTUw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vdXRwdXROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX291dHB1dExpbmVOb2RlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX291dHB1dExpbmVOb2RlID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9pc0lucHV0SW5saW5lID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLmlubmVySFRNTCA9IHRoaXMuX3Byb21wdFByZWZpeDtcclxuICAgICAgICAgICAgdGhpcy5faXNJbnB1dElubGluZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUuc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgIHRoaXMuX2ZpeFByb21wdEluZGVudCgpO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuZm9jdXMoKTtcclxuICAgICAgICB0aGlzLl90ZXJtaW5hbE5vZGUuc2Nyb2xsVG9wID0gdGhpcy5fdGVybWluYWxOb2RlLnNjcm9sbEhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBfZGVhY3RpdmF0ZUlucHV0KCkge1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuc3R5bGUudGV4dEluZGVudCA9ICcnO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpOyAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgX2ZsdXNoSW5wdXQocHJldmVudFdyaXRlKSB7XHJcbiAgICAgICAgaWYgKCFwcmV2ZW50V3JpdGUpIHtcclxuICAgICAgICAgICAgbGV0IG91dHB1dFZhbHVlID0gYCR7dGhpcy5fcHJlZml4Tm9kZS5pbm5lckhUTUx9JHt0aGlzLl9wcm9tcHROb2RlLnZhbHVlfWA7XHJcbiAgICAgICAgICAgIGlmIChvdXRwdXRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG91dHB1dFZhbHVlTm9kZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoYDxkaXY+JHtvdXRwdXRWYWx1ZX08L2Rpdj5gKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX291dHB1dE5vZGUuYXBwZW5kQ2hpbGQob3V0cHV0VmFsdWVOb2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS52YWx1ZSA9ICcnO1xyXG4gICAgICAgIHRoaXMuX2ZpeFByb21wdEhlaWdodCgpO1xyXG4gICAgfVxyXG5cclxuICAgIF90cmlnZ2VyKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XSkgcmV0dXJuO1xyXG4gICAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIoZGF0YSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfaGlzdG9yeUN5Y2xlKGZvcndhcmQpIHtcclxuICAgICAgICBQcm9taXNlLmFsbChbdGhpcy5faGlzdG9yeVByb3ZpZGVyLmdldE5leHRWYWx1ZShmb3J3YXJkKV0pLnRoZW4oKHZhbHVlcykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgY29tbWFuZExpbmUgPSB2YWx1ZXNbMF07XHJcbiAgICAgICAgICAgIGlmIChjb21tYW5kTGluZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS52YWx1ZSA9IGNvbW1hbmRMaW5lO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZml4UHJvbXB0SGVpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5jdXJzb3JUb0VuZCh0aGlzLl9wcm9tcHROb2RlKTtcclxuICAgICAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQodGhpcy5fcHJvbXB0Tm9kZSwgJ2NoYW5nZScsIHRydWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9hdXRvY29tcGxldGVDeWNsZShmb3J3YXJkKSB7ICAgICAgICBcclxuICAgICAgICBpZiAoIXRoaXMuX2F1dG9jb21wbGV0ZUNvbnRleHQpIHtcclxuICAgICAgICAgICAgbGV0IGlucHV0VmFsdWUgPSB0aGlzLl9wcm9tcHROb2RlLnZhbHVlO1xyXG4gICAgICAgICAgICBpbnB1dFZhbHVlID0gaW5wdXRWYWx1ZS5yZXBsYWNlKC9cXHMkLywgJyAnKTtcclxuICAgICAgICAgICAgbGV0IGN1cnNvclBvc2l0aW9uID0gdXRpbHMuZ2V0Q3Vyc29yUG9zaXRpb24odGhpcy5fcHJvbXB0Tm9kZSk7XHJcbiAgICAgICAgICAgIGxldCBzdGFydEluZGV4ID0gaW5wdXRWYWx1ZS5sYXN0SW5kZXhPZignICcsIGN1cnNvclBvc2l0aW9uKSArIDE7XHJcbiAgICAgICAgICAgIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4ICE9PSAtMSA/IHN0YXJ0SW5kZXggOiAwO1xyXG4gICAgICAgICAgICBsZXQgZW5kSW5kZXggPSBpbnB1dFZhbHVlLmluZGV4T2YoJyAnLCBzdGFydEluZGV4KTtcclxuICAgICAgICAgICAgZW5kSW5kZXggPSBlbmRJbmRleCAhPT0gLTEgPyBlbmRJbmRleCA6IGlucHV0VmFsdWUubGVuZ3RoO1xyXG4gICAgICAgICAgICBsZXQgaW5jb21wbGV0ZVZhbHVlID0gaW5wdXRWYWx1ZS5zdWJzdHJpbmcoc3RhcnRJbmRleCwgZW5kSW5kZXgpO1xyXG4gICAgICAgICAgICBsZXQgcHJlY3Vyc29yVmFsdWUgPSBpbnB1dFZhbHVlLnN1YnN0cmluZygwLCBzdGFydEluZGV4KTtcclxuICAgICAgICAgICAgbGV0IHBhcnNlZCA9IHRoaXMuc2hlbGwucGFyc2VDb21tYW5kTGluZShwcmVjdXJzb3JWYWx1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZUNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICB0ZXJtaW5hbDogdGhpcyxcclxuICAgICAgICAgICAgICAgIGluY29tcGxldGVWYWx1ZTogaW5jb21wbGV0ZVZhbHVlLFxyXG4gICAgICAgICAgICAgICAgcHJlY3Vyc29yVmFsdWU6IHByZWN1cnNvclZhbHVlLCAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHBhcnNlZDogcGFyc2VkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgUHJvbWlzZS5hbGwoW3RoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyLmdldE5leHRWYWx1ZShmb3J3YXJkLCB0aGlzLl9hdXRvY29tcGxldGVDb250ZXh0KV0pLnRoZW4oKHZhbHVlcykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB2YWx1ZXNbMF07XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS52YWx1ZSA9IHRoaXMuX2F1dG9jb21wbGV0ZUNvbnRleHQucHJlY3Vyc29yVmFsdWUgKyB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZpeFByb21wdEhlaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuY3Vyc29yVG9FbmQodGhpcy5fcHJvbXB0Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KHRoaXMuX3Byb21wdE5vZGUsICdjaGFuZ2UnLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfYXV0b2NvbXBsZXRlUmVzZXQoKSB7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlQ29udGV4dCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgX2ZpeFByb21wdEluZGVudCgpIHtcclxuICAgICAgICBsZXQgcHJlZml4V2lkdGggPSB0aGlzLl9wcmVmaXhOb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gICAgICAgIGxldCB0ZXh0ID0gdGhpcy5fcHJlZml4Tm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICBsZXQgc3BhY2VQYWRkaW5nID0gdGV4dC5sZW5ndGggLSB0ZXh0LnRyaW0oKS5sZW5ndGg7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5fcHJlZml4Tm9kZS5fc3BhY2VXaWR0aCkge1xyXG4gICAgICAgICAgICBsZXQgZWxlbTEgPSB1dGlscy5jcmVhdGVFbGVtZW50KCc8c3BhbiBzdHlsZT1cInZpc2liaWxpdHk6IGhpZGRlblwiPnwgfDwvc3Bhbj4nKTtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5hcHBlbmRDaGlsZChlbGVtMSk7XHJcbiAgICAgICAgICAgIGxldCBlbGVtMiA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoJzxzcGFuIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuXCI+fHw8L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUuYXBwZW5kQ2hpbGQoZWxlbTIpO1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLl9zcGFjZVdpZHRoID0gZWxlbTEub2Zmc2V0V2lkdGggLSBlbGVtMi5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5yZW1vdmVDaGlsZChlbGVtMSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUucmVtb3ZlQ2hpbGQoZWxlbTIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJlZml4V2lkdGggKz0gc3BhY2VQYWRkaW5nICogdGhpcy5fcHJlZml4Tm9kZS5fc3BhY2VXaWR0aDtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5zdHlsZS50ZXh0SW5kZW50ID0gcHJlZml4V2lkdGggKyAncHgnO1xyXG4gICAgfVxyXG5cclxuICAgIF9maXhQcm9tcHRIZWlnaHQoKSB7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5zdHlsZS5oZWlnaHQgPSAodGhpcy5fcHJvbXB0Tm9kZS5zY3JvbGxIZWlnaHQpICsgJ3B4JztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGVybWluYWw7XHJcbiIsIi8vT2JqZWN0XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKG91dCkge1xyXG4gICAgb3V0ID0gb3V0IHx8IHt9O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHNbaV0pXHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gYXJndW1lbnRzW2ldKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSlcclxuICAgICAgICAgICAgICAgIG91dFtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvdXQ7XHJcbn1cclxuXHJcbi8vQXJyYXlcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhcnJheUZyb20oYXJyYXlMaWtlLyosIG1hcEZuLCB0aGlzQXJnICovKSB7XHJcblxyXG4gICAgdmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcclxuICAgIHZhciBpc0NhbGxhYmxlID0gZnVuY3Rpb24gKGZuKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyB8fCB0b1N0ci5jYWxsKGZuKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcclxuICAgIH07XHJcbiAgICB2YXIgdG9JbnRlZ2VyID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIG51bWJlciA9IE51bWJlcih2YWx1ZSk7XHJcbiAgICAgICAgaWYgKGlzTmFOKG51bWJlcikpIHsgcmV0dXJuIDA7IH1cclxuICAgICAgICBpZiAobnVtYmVyID09PSAwIHx8ICFpc0Zpbml0ZShudW1iZXIpKSB7IHJldHVybiBudW1iZXI7IH1cclxuICAgICAgICByZXR1cm4gKG51bWJlciA+IDAgPyAxIDogLTEpICogTWF0aC5mbG9vcihNYXRoLmFicyhudW1iZXIpKTtcclxuICAgIH07XHJcbiAgICB2YXIgbWF4U2FmZUludGVnZXIgPSBNYXRoLnBvdygyLCA1MykgLSAxO1xyXG4gICAgdmFyIHRvTGVuZ3RoID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIGxlbiA9IHRvSW50ZWdlcih2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KGxlbiwgMCksIG1heFNhZmVJbnRlZ2VyKTtcclxuICAgIH07XHJcblxyXG4gICAgdmFyIEMgPSB0aGlzO1xyXG5cclxuICAgIHZhciBpdGVtcyA9IE9iamVjdChhcnJheUxpa2UpO1xyXG5cclxuICAgIGlmIChhcnJheUxpa2UgPT0gbnVsbCkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2FycmF5RnJvbSByZXF1aXJlcyBhbiBhcnJheS1saWtlIG9iamVjdCAtIG5vdCBudWxsIG9yIHVuZGVmaW5lZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCB1bmRlZmluZWQ7XHJcbiAgICB2YXIgVDtcclxuICAgIGlmICh0eXBlb2YgbWFwRm4gIT09ICd1bmRlZmluZWQnKSB7XHJcblxyXG4gICAgICAgIGlmICghaXNDYWxsYWJsZShtYXBGbikpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYXJyYXlGcm9tOiB3aGVuIHByb3ZpZGVkLCB0aGUgc2Vjb25kIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgICBUID0gYXJndW1lbnRzWzJdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgbGVuID0gdG9MZW5ndGgoaXRlbXMubGVuZ3RoKTtcclxuXHJcbiAgICB2YXIgQSA9IGlzQ2FsbGFibGUoQykgPyBPYmplY3QobmV3IEMobGVuKSkgOiBuZXcgQXJyYXkobGVuKTtcclxuXHJcbiAgICB2YXIgayA9IDA7XHJcblxyXG4gICAgdmFyIGtWYWx1ZTtcclxuICAgIHdoaWxlIChrIDwgbGVuKSB7XHJcbiAgICAgICAga1ZhbHVlID0gaXRlbXNba107XHJcbiAgICAgICAgaWYgKG1hcEZuKSB7XHJcbiAgICAgICAgICAgIEFba10gPSB0eXBlb2YgVCA9PT0gJ3VuZGVmaW5lZCcgPyBtYXBGbihrVmFsdWUsIGspIDogbWFwRm4uY2FsbChULCBrVmFsdWUsIGspO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIEFba10gPSBrVmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGsgKz0gMTtcclxuICAgIH1cclxuXHJcbiAgICBBLmxlbmd0aCA9IGxlbjtcclxuXHJcbiAgICByZXR1cm4gQTtcclxufVxyXG5cclxuLy9TdHJpbmdcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwYWQodmFsdWUsIGxlbmd0aCwgY2hhcikge1xyXG4gICAgbGV0IHJpZ2h0ID0gbGVuZ3RoID49IDA7XHJcbiAgICBsZW5ndGggPSBNYXRoLmFicyhsZW5ndGgpO1xyXG4gICAgd2hpbGUgKHZhbHVlLmxlbmd0aCA8IGxlbmd0aCkge1xyXG4gICAgICAgIHZhbHVlID0gcmlnaHQgPyB2YWx1ZSArIGNoYXIgOiBjaGFyICsgdmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVIdG1sKHZhbHVlKSB7XHJcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmFsdWUpKTtcclxuICAgIHJldHVybiBkaXYuaW5uZXJIVE1MO1xyXG59XHJcblxyXG4vL0Z1bmN0aW9uXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdW53cmFwKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nID8gdmFsdWUoKSA6IHZhbHVlO1xyXG59XHJcblxyXG4vL1Byb21pc2VcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZlcigpIHtcclxuICAgIGZ1bmN0aW9uIERlZmVycmVkKCkge1xyXG4gICAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcclxuICAgICAgICAgICAgdGhpcy5yZWplY3QgPSByZWplY3Q7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMudGhlbiA9IHRoaXMucHJvbWlzZS50aGVuLmJpbmQodGhpcy5wcm9taXNlKTtcclxuICAgICAgICB0aGlzLmNhdGNoID0gdGhpcy5wcm9taXNlLmNhdGNoLmJpbmQodGhpcy5wcm9taXNlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IERlZmVycmVkKCk7XHJcbn1cclxuXHJcbi8vRE9NXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNFbGVtZW50KG9iaikge1xyXG4gICAgcmV0dXJuIHR5cGVvZiBIVE1MRWxlbWVudCA9PT0gXCJvYmplY3RcIiA/XHJcbiAgICAgICAgb2JqIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgOlxyXG4gICAgICAgIG9iaiAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiBvYmoubm9kZVR5cGUgPT09IDEgJiYgdHlwZW9mIG9iai5ub2RlTmFtZSA9PT0gXCJzdHJpbmdcIjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoaHRtbCkge1xyXG4gICAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIHdyYXBwZXIuaW5uZXJIVE1MID0gaHRtbDtcclxuICAgIHJldHVybiB3cmFwcGVyLmZpcnN0Q2hpbGQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGVsZW1lbnQsIHR5cGUsIGNhbkJ1YmJsZSwgY2FuY2VsYWJsZSkge1xyXG4gICAgbGV0IGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKTtcclxuICAgIGV2ZW50LmluaXRFdmVudCh0eXBlLCBjYW5CdWJibGUsIGNhbmNlbGFibGUpO1xyXG4gICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGJsdXIoZWxlbWVudCA9IG51bGwpIHtcclxuICAgIGlmIChlbGVtZW50ICYmIGVsZW1lbnQgIT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHJldHVybjtcclxuICAgIGxldCB0ZW1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZW1wKTtcclxuICAgIHRlbXAuZm9jdXMoKTtcclxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGVtcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjdXJzb3JUb0VuZChlbGVtZW50KSB7XHJcbiAgICBsZXQgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xyXG4gICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xyXG4gICAgcmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xyXG4gICAgbGV0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgIHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJzb3JQb3NpdGlvbihlbGVtZW50KSB7XHJcbiAgICBsZXQgcG9zID0gMDtcclxuICAgIGxldCBkb2MgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQgfHwgZWxlbWVudC5kb2N1bWVudDtcclxuICAgIGxldCB3aW4gPSBkb2MuZGVmYXVsdFZpZXcgfHwgZG9jLnBhcmVudFdpbmRvdztcclxuICAgIGxldCBzZWw7XHJcbiAgICBpZiAodHlwZW9mIHdpbi5nZXRTZWxlY3Rpb24gIT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHNlbCA9IHdpbi5nZXRTZWxlY3Rpb24oKTtcclxuICAgICAgICBpZiAoc2VsLnJhbmdlQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCByYW5nZSA9IHdpbi5nZXRTZWxlY3Rpb24oKS5nZXRSYW5nZUF0KDApO1xyXG4gICAgICAgICAgICBsZXQgcHJlQ3Vyc29yUmFuZ2UgPSByYW5nZS5jbG9uZVJhbmdlKCk7XHJcbiAgICAgICAgICAgIHByZUN1cnNvclJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbGVtZW50KTtcclxuICAgICAgICAgICAgcHJlQ3Vyc29yUmFuZ2Uuc2V0RW5kKHJhbmdlLmVuZENvbnRhaW5lciwgcmFuZ2UuZW5kT2Zmc2V0KTtcclxuICAgICAgICAgICAgcG9zID0gcHJlQ3Vyc29yUmFuZ2UudG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICgoc2VsID0gZG9jLnNlbGVjdGlvbikgJiYgc2VsLnR5cGUgIT0gXCJDb250cm9sXCIpIHtcclxuICAgICAgICBsZXQgdGV4dFJhbmdlID0gc2VsLmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgICAgbGV0IHByZUN1cnNvclRleHRSYW5nZSA9IGRvYy5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xyXG4gICAgICAgIHByZUN1cnNvclRleHRSYW5nZS5tb3ZlVG9FbGVtZW50VGV4dChlbGVtZW50KTtcclxuICAgICAgICBwcmVDdXJzb3JUZXh0UmFuZ2Uuc2V0RW5kUG9pbnQoXCJFbmRUb0VuZFwiLCB0ZXh0UmFuZ2UpO1xyXG4gICAgICAgIHBvcyA9IHByZUN1cnNvclRleHRSYW5nZS50ZXh0Lmxlbmd0aDtcclxuICAgIH1cclxuICAgIHJldHVybiBwb3M7XHJcbn0iXX0=
