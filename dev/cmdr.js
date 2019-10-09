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
    value: function getCommands(name) {}
  }, {
    key: "parseCommandLine",
    value: function parseCommandLine(commandLine) {
      var exp = /[^\s"]+|"([^"]*)"/gi,
          name = null,
          argString = null,
          args = [],
          match = null;

      do {
        match = exp.exec(commandLine);

        if (match !== null) {
          var value = match[1] ? match[1] : match[0];

          if (match.index === 0) {
            name = value;
            argString = commandLine.substr(value.length + (match[1] ? 3 : 1));
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
      var parsed = this.parseCommandLine(commandLine);
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
    key: "clear",
    value: function clear() {
      this._outputNode.innerHTML = '';
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
      var _this4 = this;

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
          _this4._current = null;

          if (_this4._outputNode.children.length > 0) {
            _this4.writeLine();
          }

          _this4._activateInput();

          if (_this4._queue.length > 0) {
            _this4.execute(_this4._queue.shift());
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
        _this4._trigger('execute', {
          commandLine: commandLine
        });

        try {
          deferred.resolve(values[0]);
        } finally {
          complete();
        }
      }, function (reason) {
        _this4._trigger('execute', {
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
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = args[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var arg = _step3.value;

          if (typeof arg === 'string' && arg.indexOf(' ') > -1) {
            commandLine += " \"".concat(arg, "\"");
          } else {
            commandLine += ' ' + arg.toString();
          }
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
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this._eventHandlers[event][Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var handler = _step4.value;

          try {
            handler(data);
          } catch (error) {
            console.error(error);
          }
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
    }
  }, {
    key: "_historyCycle",
    value: function _historyCycle(forward) {
      var _this5 = this;

      Promise.all([this._historyProvider.getNextValue(forward)]).then(function (values) {
        var commandLine = values[0];

        if (commandLine) {
          _this5._promptNode.textContent = commandLine;
          utils.cursorToEnd(_this5._promptNode);
          utils.dispatchEvent(_this5._promptNode, 'change', true, false);
        }
      });
    }
  }, {
    key: "_autocompleteCycle",
    value: function _autocompleteCycle(forward) {
      var _this6 = this;

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
          _this6._promptNode.textContent = _this6._autocompleteContext.precursorValue + value;
          utils.cursorToEnd(_this6._promptNode);
          utils.dispatchEvent(_this6._promptNode, 'change', true, false);
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXV0b2NvbXBsZXRlLXByb3ZpZGVyLmpzIiwic3JjL2NhbmNlbC10b2tlbi5qcyIsInNyYy9jbWRyLmpzIiwic3JjL2NvbW1hbmQuanMiLCJzcmMvaGlzdG9yeS1wcm92aWRlci5qcyIsInNyYy9vdmVybGF5LXRlcm1pbmFsLmpzIiwic3JjL3BsdWdpbi5qcyIsInNyYy9zaGVsbC1iYXNlLmpzIiwic3JjL3NoZWxsLmpzIiwic3JjL3Rlcm1pbmFsLmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQ0FBOzs7Ozs7Ozs7Ozs7SUFFTSxvQjs7O0FBQ0Ysa0NBQWM7QUFBQTs7QUFDVixTQUFLLE9BQUwsR0FBZSxFQUFmO0FBRUEsU0FBSyxRQUFMLEdBQWdCLElBQWhCO0FBQ0EsU0FBSyxNQUFMLEdBQWMsQ0FBQyxDQUFmO0FBQ0EsU0FBSyxPQUFMLEdBQWUsRUFBZjs7QUFFQSxTQUFLLGlCQUFMO0FBQ0g7Ozs7NkJBRVEsUSxFQUFVLENBQ2xCOzs7K0JBRVUsUSxFQUFVLENBQ3BCOzs7aUNBRVksTyxFQUFTLE8sRUFBUztBQUFBOztBQUMzQixVQUFJLE9BQU8sS0FBSyxLQUFLLFFBQXJCLEVBQStCO0FBQzNCLGFBQUssUUFBTCxHQUFnQixPQUFoQjtBQUNBLGFBQUssTUFBTCxHQUFjLENBQUMsQ0FBZjtBQUNBLGFBQUssT0FBTCxHQUFlLEtBQUssYUFBTCxDQUFtQixPQUFuQixDQUFmO0FBQ0g7O0FBRUQsYUFBTyxPQUFPLENBQUMsR0FBUixDQUFZLENBQUMsS0FBSyxPQUFOLENBQVosRUFBNEIsSUFBNUIsQ0FBaUMsVUFBQyxNQUFELEVBQVk7QUFDaEQsUUFBQSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUQsQ0FBZjtBQUVBLFlBQUksY0FBYyxHQUFHLE1BQU0sQ0FBQyxNQUFQLENBQWMsVUFBQyxLQUFELEVBQVc7QUFDMUMsaUJB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QW9EO0FBQ3ZELFFBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQyxXQUFKLEVBQWhCO0FBQ0EsUUFBSSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsSUFBSixDQUFTLGVBQVQsRUFBekI7QUFDQSxJQUFBLGtCQUFrQixDQUFDLGlCQUFuQixDQUFxQyxPQUFyQztBQUNBLElBQUEsa0JBQWtCLENBQUMsV0FBbkIsQ0FBK0IsVUFBL0IsRUFBMkMsU0FBM0M7QUFDQSxJQUFBLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxJQUFuQixDQUF3QixNQUE5QjtBQUNIOztBQUNELFNBQU8sR0FBUDtBQUNIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy5qcyc7XHJcblxyXG5jbGFzcyBBdXRvY29tcGxldGVQcm92aWRlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmxvb2t1cHMgPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9jb250ZXh0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pbmRleCA9IC0xO1xyXG4gICAgICAgIHRoaXMuX3ZhbHVlcyA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3ByZWRlZmluZUxvb2t1cHMoKTtcclxuICAgIH1cclxuICAgICAgICBcclxuICAgIGFjdGl2YXRlKHRlcm1pbmFsKSB7IFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkZWFjdGl2YXRlKHRlcm1pbmFsKSB7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldE5leHRWYWx1ZShmb3J3YXJkLCBjb250ZXh0KSB7XHJcbiAgICAgICAgaWYgKGNvbnRleHQgIT09IHRoaXMuX2NvbnRleHQpIHtcclxuICAgICAgICAgICAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XHJcbiAgICAgICAgICAgIHRoaXMuX2luZGV4ID0gLTE7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlcyA9IHRoaXMuX2xvb2t1cFZhbHVlcyhjb250ZXh0KTsgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbdGhpcy5fdmFsdWVzXSkudGhlbigodmFsdWVzKSA9PiB7XHJcbiAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlc1swXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBjb21wbGV0ZVZhbHVlcyA9IHZhbHVlcy5maWx0ZXIoKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGV4dC5pbmNvbXBsZXRlVmFsdWUgPT09ICcnIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUudG9Mb3dlckNhc2UoKS5zbGljZSgwLCBjb250ZXh0LmluY29tcGxldGVWYWx1ZS50b0xvd2VyQ2FzZSgpLmxlbmd0aCkgPT09IGNvbnRleHQuaW5jb21wbGV0ZVZhbHVlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGNvbXBsZXRlVmFsdWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbmRleCA+PSBjb21wbGV0ZVZhbHVlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4ID0gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGZvcndhcmQgJiYgdGhpcy5faW5kZXggPCBjb21wbGV0ZVZhbHVlcy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGZvcndhcmQgJiYgdGhpcy5faW5kZXggPj0gY29tcGxldGVWYWx1ZXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5kZXggPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFmb3J3YXJkICYmIHRoaXMuX2luZGV4ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5kZXgtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghZm9yd2FyZCAmJiB0aGlzLl9pbmRleCA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmRleCA9IGNvbXBsZXRlVmFsdWVzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiBjb21wbGV0ZVZhbHVlc1t0aGlzLl9pbmRleF07XHJcbiAgICAgICAgfSk7ICBcclxuICAgIH1cclxuICAgIFxyXG4gICAgX2xvb2t1cFZhbHVlcyhjb250ZXh0KSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZVZhbHVlcyh2YWx1ZXMpIHtcclxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWVzKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlcztcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZXMgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZXMoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBsb29rdXAgb2YgdGhpcy5sb29rdXBzKSB7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCByZXN1bHRzID0gcmVzb2x2ZVZhbHVlcyhsb29rdXApO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0cykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICAgICAgICAgIH0gICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICBcclxuICAgIF9wcmVkZWZpbmVMb29rdXBzKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZ1bmN0aW9uIGNvbW1hbmROYW1lTG9va3VwKGNvbnRleHQpIHsgICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKGNvbnRleHQucHJlY3Vyc29yVmFsdWUudHJpbSgpICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGNvbW1hbmRzID0gY29udGV4dC50ZXJtaW5hbC5zaGVsbC5nZXRDb21tYW5kcygpOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB2YXIgbmFtZXMgPSB1dGlscy5hcnJheUZyb20oY29tbWFuZHMsIGMgPT4gYy5uYW1lKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5hbWVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmxvb2t1cHMucHVzaChjb21tYW5kTmFtZUxvb2t1cCk7ICAgICAgICBcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXV0b2NvbXBsZXRlUHJvdmlkZXI7IiwiY2xhc3MgQ2FuY2VsVG9rZW4ge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5faXNDYW5jZWxSZXF1ZXN0ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9jYW5jZWxIYW5kbGVycyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBpc0NhbmNlbFJlcXVlc3RlZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faXNDYW5jZWxSZXF1ZXN0ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgY2FuY2VsKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5faXNDYW5jZWxSZXF1ZXN0ZWQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiB0aGlzLl9jYW5jZWxIYW5kbGVycykge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pc0NhbmNlbFJlcXVlc3RlZCA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVuY2FuY2VsKCkge1xyXG4gICAgICAgIHRoaXMuX2lzQ2FuY2VsUmVxdWVzdGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgb25DYW5jZWwoaGFuZGxlcikge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0NhbmNlbFJlcXVlc3RlZCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcih0aGlzKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2NhbmNlbEhhbmRsZXJzLnB1c2goaGFuZGxlcik7XHJcbiAgICB9XHJcblxyXG4gICAgb2ZmQ2FuY2VsKGhhbmRsZXIpIHtcclxuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLl9jYW5jZWxIYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpO1xyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NhbmNlbEhhbmRsZXJzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDYW5jZWxUb2tlbjsiLCJcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBUZXJtaW5hbCB9IGZyb20gJy4vdGVybWluYWwuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIE92ZXJsYXlUZXJtaW5hbCB9IGZyb20gJy4vb3ZlcmxheS10ZXJtaW5hbC5qcyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2hlbGxCYXNlIH0gZnJvbSAnLi9zaGVsbC1iYXNlLmpzJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBTaGVsbCB9IGZyb20gJy4vc2hlbGwuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEhpc3RvcnlQcm92aWRlciB9IGZyb20gJy4vaGlzdG9yeS1wcm92aWRlci5qcyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQXV0b2NvbXBsZXRlUHJvdmlkZXIgfSBmcm9tICcuL2F1dG9jb21wbGV0ZS1wcm92aWRlci5qcyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ29tbWFuZCB9IGZyb20gJy4vY29tbWFuZC5qcyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUGx1Z2luIH0gZnJvbSAnLi9wbHVnaW4uanMnO1xyXG5leHBvcnQgY29uc3QgdmVyc2lvbiA9ICcyLjAuMCc7IiwiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy5qcyc7XHJcblxyXG5jbGFzcyBDb21tYW5kIHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUsIG1haW4sIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSBtYWluO1xyXG4gICAgICAgICAgICBtYWluID0gbmFtZTtcclxuICAgICAgICAgICAgbmFtZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgbWFpbiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBvcHRpb25zID0gbWFpbjtcclxuICAgICAgICAgICAgbWFpbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMubWFpbiA9IG1haW47XHJcbiAgICAgICAgdGhpcy5kZXNjcmlwdGlvbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy51c2FnZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaGVscCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGVmaW5pdGlvbi5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUodGhpcy5kZWZpbml0aW9uLmRlc2NyaXB0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5kZWZpbml0aW9uLmRlc2NyaXB0aW9uICYmIHRoaXMuZGVmaW5pdGlvbi51c2FnZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5kZWZpbml0aW9uLnVzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRlcm1pbmFsLndyaXRlTGluZSh0aGlzLmRlZmluaXRpb24udXNhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdXRpbHMuZXh0ZW5kKHRoaXMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICB0aGlzLm1haW4gPSB0aGlzLm1haW4gfHwgKCgpPT57fSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLm5hbWUgIT09ICdzdHJpbmcnKVxyXG4gICAgICAgICAgICB0aHJvdyAnXCJuYW1lXCIgbXVzdCBiZSBhIHN0cmluZy4nO1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5tYWluICE9PSAnZnVuY3Rpb24nKVxyXG4gICAgICAgICAgICB0aHJvdyAnXCJtYWluXCIgbXVzdCBiZSBhIGZ1bmN0aW9uLic7XHJcblxyXG4gICAgICAgIHRoaXMubmFtZSA9IHRoaXMubmFtZS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICghdGhpcy51c2FnZSkge1xyXG4gICAgICAgICAgICB0aGlzLnVzYWdlID0gdGhpcy5uYW1lO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ29tbWFuZDtcclxuIiwiY2xhc3MgSGlzdG9yeVByb3ZpZGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudmFsdWVzID0gW107XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3ByZWV4ZWN1dGVIYW5kbGVyID0gKGNvbW1hbmQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXMudW5zaGlmdChjb21tYW5kKTtcclxuICAgICAgICAgICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGFjdGl2YXRlKHRlcm1pbmFsKSB7IFxyXG4gICAgICAgIHRlcm1pbmFsLm9uKCdwcmVleGVjdXRlJywgdGhpcy5fcHJlZXhlY3V0ZUhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBkZWFjdGl2YXRlKHRlcm1pbmFsKSB7XHJcbiAgICAgICAgdGVybWluYWwub2ZmKCdwcmVleGVjdXRlJywgdGhpcy5fcHJlZXhlY3V0ZUhhbmRsZXIpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXROZXh0VmFsdWUoZm9yd2FyZCkge1xyXG4gICAgICAgIGlmIChmb3J3YXJkICYmIHRoaXMuaW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXgtLTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW3RoaXMuaW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWZvcndhcmQgJiYgdGhpcy52YWx1ZXMubGVuZ3RoID4gdGhpcy5pbmRleCArIDEpIHtcclxuICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZXNbdGhpcy5pbmRleF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBIaXN0b3J5UHJvdmlkZXI7IiwiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCBUZXJtaW5hbCBmcm9tICcuL3Rlcm1pbmFsLmpzJztcclxuXHJcbmNvbnN0IF9kZWZhdWx0T3B0aW9ucyA9IHtcclxuICAgIGF1dG9PcGVuOiBmYWxzZSxcclxuICAgIG9wZW5LZXk6IDE5MixcclxuICAgIGNsb3NlS2V5OiAyN1xyXG59O1xyXG5cclxuY2xhc3MgT3ZlcmxheVRlcm1pbmFsIGV4dGVuZHMgVGVybWluYWwge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgbGV0IG92ZXJsYXlOb2RlID0gdXRpbHMuY3JlYXRlRWxlbWVudCgnPGRpdiBzdHlsZT1cImRpc3BsYXk6IG5vbmVcIiBjbGFzcz1cImNtZHItb3ZlcmxheVwiPjwvZGl2PicpO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3ZlcmxheU5vZGUpO1xyXG5cclxuICAgICAgICBvcHRpb25zID0gdXRpbHMuZXh0ZW5kKHt9LCBfZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICBzdXBlcihvdmVybGF5Tm9kZSwgb3B0aW9ucyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fb3ZlcmxheU5vZGUgPSBvdmVybGF5Tm9kZTtcclxuICAgICAgICB0aGlzLl9kb2N1bWVudEV2ZW50SGFuZGxlciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBpc09wZW4oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX292ZXJsYXlOb2RlLnN0eWxlLmRpc3BsYXkgIT09ICdub25lJztcclxuICAgIH1cclxuXHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2RvY3VtZW50RXZlbnRIYW5kbGVyID0gKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc09wZW4gJiZcclxuICAgICAgICAgICAgICAgIFsnSU5QVVQnLCAnVEVYVEFSRUEnLCAnU0VMRUNUJ10uaW5kZXhPZihldmVudC50YXJnZXQudGFnTmFtZSkgPT09IC0xICYmXHJcbiAgICAgICAgICAgICAgICAhZXZlbnQudGFyZ2V0LmlzQ29udGVudEVkaXRhYmxlICYmXHJcbiAgICAgICAgICAgICAgICBldmVudC5rZXlDb2RlID09IHRoaXMub3B0aW9ucy5vcGVuS2V5KSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc09wZW4gJiYgZXZlbnQua2V5Q29kZSA9PSB0aGlzLm9wdGlvbnMuY2xvc2VLZXkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9kb2N1bWVudEV2ZW50SGFuZGxlcik7XHJcblxyXG4gICAgICAgIHN1cGVyLmluaXQoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvT3Blbikge1xyXG4gICAgICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcG9zZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaW5pdGlhbGl6ZWQpIHJldHVybjtcclxuICAgIFxyXG4gICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICAgICAgICBcclxuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fZG9jdW1lbnRFdmVudEhhbmRsZXIpOyAgICBcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRoaXMuX292ZXJsYXlOb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuKCkge1xyXG4gICAgICAgIHRoaXMuX292ZXJsYXlOb2RlLnN0eWxlLmRpc3BsYXkgPSAnJzsgICAgICAgIFxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcclxuXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpeFByb21wdEluZGVudCgpOyAgLy9oYWNrOiB1c2luZyAncHJpdmF0ZScgbWV0aG9kIGZyb20gYmFzZSBjbGFzcyB0byBmaXggaW5kZW50XHJcbiAgICAgICAgICAgIHRoaXMuZm9jdXMoKTtcclxuICAgICAgICB9LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSgpIHtcclxuICAgICAgICB0aGlzLl9vdmVybGF5Tm9kZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnJztcclxuICAgICAgICB0aGlzLmJsdXIoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgT3ZlcmxheVRlcm1pbmFsOyIsImNsYXNzIFBsdWdpbiB7XHJcbiAgICBhY3RpdmF0ZSh0ZXJtaW5hbCkge1xyXG4gICAgfVxyXG5cclxuICAgIGRlYWN0aXZhdGUodGVybWluYWwpIHtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGx1Z2luOyIsImNsYXNzIFNoZWxsQmFzZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGV4ZWN1dGVDb21tYW5kKHRlcm1pbmFsLCBjb21tYW5kTGluZSwgY2FuY2VsVG9rZW4pIHtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb21tYW5kcyhuYW1lKSB7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VDb21tYW5kTGluZShjb21tYW5kTGluZSkgeyBcclxuICAgICAgICBsZXQgZXhwID0gL1teXFxzXCJdK3xcIihbXlwiXSopXCIvZ2ksXHJcbiAgICAgICAgICAgIG5hbWUgPSBudWxsLFxyXG4gICAgICAgICAgICBhcmdTdHJpbmcgPSBudWxsLFxyXG4gICAgICAgICAgICBhcmdzID0gW10sXHJcbiAgICAgICAgICAgIG1hdGNoID0gbnVsbDtcclxuXHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBtYXRjaCA9IGV4cC5leGVjKGNvbW1hbmRMaW5lKTtcclxuICAgICAgICAgICAgaWYgKG1hdGNoICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBtYXRjaFsxXSA/IG1hdGNoWzFdIDogbWF0Y2hbMF07XHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2guaW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJnU3RyaW5nID0gY29tbWFuZExpbmUuc3Vic3RyKHZhbHVlLmxlbmd0aCArIChtYXRjaFsxXSA/IDMgOiAxKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IHdoaWxlIChtYXRjaCAhPT0gbnVsbCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgICAgIGFyZ1N0cmluZzogYXJnU3RyaW5nLFxyXG4gICAgICAgICAgICBhcmdzOiBhcmdzXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2hlbGxCYXNlOyIsImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgU2hlbGxCYXNlIGZyb20gJy4vc2hlbGwtYmFzZS5qcyc7XHJcbmltcG9ydCBDb21tYW5kIGZyb20gJy4vY29tbWFuZC5qcyc7XHJcblxyXG5jb25zdCBfZGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICBjb250ZXh0RXh0ZW5zaW9uczoge30sXHJcbiAgICBidWlsdEluQ29tbWFuZHM6IFsnSEVMUCcsICdFQ0hPJywgJ0NMUyddLFxyXG4gICAgYWxsb3dBYmJyZXZpYXRpb25zOiB0cnVlXHJcbn07XHJcblxyXG5jbGFzcyBTaGVsbCBleHRlbmRzIFNoZWxsQmFzZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gdXRpbHMuZXh0ZW5kKHt9LCBfZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSB7fTtcclxuXHJcbiAgICAgICAgdGhpcy5fYWRkQnVpbHRJbkNvbW1hbmRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhlY3V0ZUNvbW1hbmQodGVybWluYWwsIGNvbW1hbmRMaW5lLCBjYW5jZWxUb2tlbikge1xyXG4gICAgICAgIGxldCBwYXJzZWQgPSB0aGlzLnBhcnNlQ29tbWFuZExpbmUoY29tbWFuZExpbmUpO1xyXG4gICAgICAgIGxldCBjb21tYW5kcyA9IHRoaXMuZ2V0Q29tbWFuZHMocGFyc2VkLm5hbWUpO1xyXG4gICAgICAgIGlmICghY29tbWFuZHMgfHwgY29tbWFuZHMubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICB0ZXJtaW5hbC53cml0ZUxpbmUoJ0ludmFsaWQgY29tbWFuZCcsICdlcnJvcicpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb21tYW5kcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRlcm1pbmFsLndyaXRlTGluZSgnQW1iaWd1b3VzIGNvbW1hbmQnLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgdGVybWluYWwud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tbWFuZHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRlcm1pbmFsLndyaXRlUGFkKGNvbW1hbmRzW2ldLm5hbWUsIDEwKTtcclxuICAgICAgICAgICAgICAgIHRlcm1pbmFsLndyaXRlTGluZShjb21tYW5kc1tpXS5kZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGVybWluYWwud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjb21tYW5kID0gY29tbWFuZHNbMF07XHJcblxyXG4gICAgICAgIGxldCBjb250ZXh0ID0ge1xyXG4gICAgICAgICAgICB0ZXJtaW5hbDogdGVybWluYWwsXHJcbiAgICAgICAgICAgIGNvbW1hbmRMaW5lOiBjb21tYW5kTGluZSxcclxuICAgICAgICAgICAgY29tbWFuZDogY29tbWFuZCxcclxuICAgICAgICAgICAgcGFyc2VkOiBwYXJzZWQsXHJcbiAgICAgICAgICAgIGRlZmVyOiB1dGlscy5kZWZlcixcclxuICAgICAgICAgICAgY2FuY2VsVG9rZW46IGNhbmNlbFRva2VuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdXRpbHMuZXh0ZW5kKGNvbnRleHQsIHRoaXMub3B0aW9ucy5jb250ZXh0RXh0ZW5zaW9ucyk7XHJcblxyXG4gICAgICAgIGxldCBhcmdzID0gcGFyc2VkLmFyZ3M7XHJcblxyXG4gICAgICAgIGlmIChjb21tYW5kLmhlbHAgJiYgYXJncy5sZW5ndGggPiAwICYmIGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gXCIvP1wiKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29tbWFuZC5oZWxwID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgdGVybWluYWwud3JpdGVMaW5lKGNvbW1hbmQuaGVscCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbW1hbmQuaGVscCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1hbmQuaGVscC5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbW1hbmQubWFpbi5hcHBseShjb250ZXh0LCBhcmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb21tYW5kcyhuYW1lKSB7XHJcbiAgICAgICAgbGV0IGNvbW1hbmRzID0gW107XHJcblxyXG4gICAgICAgIGlmIChuYW1lKSB7XHJcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnRvVXBwZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29tbWFuZCA9IHRoaXMuY29tbWFuZHNbbmFtZV07XHJcblxyXG4gICAgICAgICAgICBpZiAoY29tbWFuZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbW1hbmQuYXZhaWxhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtjb21tYW5kXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGxvd0FiYnJldmlhdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiB0aGlzLmNvbW1hbmRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleS5pbmRleE9mKG5hbWUsIDApID09PSAwICYmIHV0aWxzLnVud3JhcCh0aGlzLmNvbW1hbmRzW2tleV0uYXZhaWxhYmxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kcy5wdXNoKHRoaXMuY29tbWFuZHNba2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMuY29tbWFuZHMpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRzLnB1c2godGhpcy5jb21tYW5kc1trZXldKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvbW1hbmRzO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZENvbW1hbmQoY29tbWFuZCkge1xyXG4gICAgICAgIGlmICghKGNvbW1hbmQgaW5zdGFuY2VvZiBDb21tYW5kKSkge1xyXG4gICAgICAgICAgICBjb21tYW5kID0gbmV3IENvbW1hbmQoLi4uYXJndW1lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jb21tYW5kc1tjb21tYW5kLm5hbWVdID0gY29tbWFuZDtcclxuICAgIH1cclxuXHJcbiAgICBfYWRkQnVpbHRJbkNvbW1hbmRzKCkge1xyXG4gICAgICAgIGxldCBwcm92aWRlciA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYnVpbHRJbkNvbW1hbmRzLmluZGV4T2YoJ0hFTFAnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnSEVMUCcsXHJcbiAgICAgICAgICAgICAgICBtYWluOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUoJ1RoZSBmb2xsb3dpbmcgY29tbWFuZHMgYXJlIGF2YWlsYWJsZTonKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRlcm1pbmFsLndyaXRlTGluZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhdmFpbGFibGVDb21tYW5kcyA9IE9iamVjdC5rZXlzKHByb3ZpZGVyLmNvbW1hbmRzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKChrZXkpID0+IHsgcmV0dXJuIHByb3ZpZGVyLmNvbW1hbmRzW2tleV07IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGRlZikgPT4geyByZXR1cm4gZGVmLmF2YWlsYWJsZTsgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxlbmd0aCA9IGF2YWlsYWJsZUNvbW1hbmRzLnNsaWNlKCkuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYi5uYW1lLmxlbmd0aCAtIGEubmFtZS5sZW5ndGg7IH0pWzBdLm5hbWUubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwud3JpdGVUYWJsZShhdmFpbGFibGVDb21tYW5kcywgWyduYW1lOicgKyAobGVuZ3RoICsgMikudG9TdHJpbmcoKSwgJ2Rlc2NyaXB0aW9uOjQwJ10pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUoJyogUGFzcyBcIi8/XCIgaW50byBhbnkgY29tbWFuZCB0byBkaXNwbGF5IGhlbHAgZm9yIHRoYXQgY29tbWFuZC4nKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvdmlkZXIub3B0aW9ucy5hbGxvd0FiYnJldmlhdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUoJyogQ29tbWFuZCBhYmJyZXZpYXRpb25zIGFyZSBhbGxvd2VkIChlLmcuIFwiSFwiIGZvciBcIkhFTFBcIikuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTGlzdHMgdGhlIGF2YWlsYWJsZSBjb21tYW5kcy4nXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5idWlsdEluQ29tbWFuZHMuaW5kZXhPZignRUNITycpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdFQ0hPJyxcclxuICAgICAgICAgICAgICAgIG1haW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG9nZ2xlID0gdGhpcy5hcmdTdHJpbmcudG9VcHBlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodG9nZ2xlID09PSAnT04nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwuZWNobyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0b2dnbGUgPT09ICdPRkYnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwuZWNobyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5hcmdTdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUodGhpcy5hcmdTdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwud3JpdGVMaW5lKCdFQ0hPIGlzICcgKyAodGhpcy50ZXJtaW5hbC5lY2hvID8gJ29uLicgOiAnb2ZmLicpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdEaXNwbGF5cyBtZXNzYWdlcywgb3IgdG9nZ2xlcyBjb21tYW5kIGVjaG9pbmcuJyxcclxuICAgICAgICAgICAgICAgIHVzYWdlOiAnRUNITyBbT04gfCBPRkZdXFxuRUNITyBbbWVzc2FnZV1cXG5cXG5UeXBlIEVDSE8gd2l0aG91dCBwYXJhbWV0ZXJzIHRvIGRpc3BsYXkgdGhlIGN1cnJlbnQgZWNobyBzZXR0aW5nLidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJ1aWx0SW5Db21tYW5kcy5pbmRleE9mKCdDTFMnKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnQ0xTJyxcclxuICAgICAgICAgICAgICAgIG1haW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRlcm1pbmFsLmNsZWFyKCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDbGVhcnMgdGhlIGNvbW1hbmQgcHJvbXB0LidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTaGVsbDsiLCJpbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IEhpc3RvcnlQcm92aWRlciBmcm9tICcuL2hpc3RvcnktcHJvdmlkZXIuanMnO1xyXG5pbXBvcnQgQXV0b2NvbXBsZXRlUHJvdmlkZXIgZnJvbSAnLi9hdXRvY29tcGxldGUtcHJvdmlkZXIuanMnO1xyXG5pbXBvcnQgU2hlbGwgZnJvbSAnLi9zaGVsbC5qcyc7XHJcbmltcG9ydCBDYW5jZWxUb2tlbiBmcm9tICcuL2NhbmNlbC10b2tlbi5qcyc7XHJcblxyXG5jb25zdCBfZGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICBlY2hvOiB0cnVlLFxyXG4gICAgcHJvbXB0UHJlZml4OiAnPicsXHJcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJjbWRyLXRlcm1pbmFsXCI+PGRpdiBjbGFzcz1cIm91dHB1dFwiPjwvZGl2PjxkaXYgY2xhc3M9XCJpbnB1dFwiPjxzcGFuIGNsYXNzPVwicHJlZml4XCI+PC9zcGFuPjxkaXYgY2xhc3M9XCJwcm9tcHRcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIiBjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCIgLz48L2Rpdj48L2Rpdj4nLFxyXG4gICAgdGhlbWU6ICdjbWQnLFxyXG4gICAgaGlzdG9yeVByb3ZpZGVyOiBudWxsLFxyXG4gICAgYXV0b2NvbXBsZXRlUHJvdmlkZXI6IG51bGwsXHJcbiAgICBzaGVsbDogbnVsbCxcclxuICAgIHBsdWdpbnM6IFtdXHJcbn07XHJcblxyXG5jbGFzcyBUZXJtaW5hbCB7XHJcbiAgICBjb25zdHJ1Y3Rvcihjb250YWluZXJOb2RlLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKCFjb250YWluZXJOb2RlIHx8ICF1dGlscy5pc0VsZW1lbnQoY29udGFpbmVyTm9kZSkpIHtcclxuICAgICAgICAgICAgdGhyb3cgJ1wiY29udGFpbmVyTm9kZVwiIG11c3QgYmUgYW4gSFRNTEVsZW1lbnQuJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSB1dGlscy5leHRlbmQoe30sIF9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyTm9kZSA9IGNvbnRhaW5lck5vZGU7XHJcbiAgICAgICAgdGhpcy5fdGVybWluYWxOb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3ByZWZpeE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX291dHB1dE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX291dHB1dExpbmVOb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9lY2hvID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9xdWV1ZSA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdFByZWZpeCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5faXNJbnB1dElubGluZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZUNvbnRleHQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnMgPSB7fTtcclxuICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fc2hlbGwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3BsdWdpbnMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGlzSW5pdGlhbGl6ZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzSW5pdGlhbGl6ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9wdGlvbnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHByb21wdFByZWZpeCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvbXB0UHJlZml4O1xyXG4gICAgfVxyXG4gICAgc2V0IHByb21wdFByZWZpeCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX3Byb21wdFByZWZpeCA9IHZhbHVlO1xyXG4gICAgICAgIGlmICghdGhpcy5faXNJbnB1dElubGluZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpeFByb21wdEluZGVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgZWNobygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZWNobztcclxuICAgIH1cclxuICAgIHNldCBlY2hvKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fZWNobyA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzaGVsbCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2hlbGw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBoaXN0b3J5UHJvdmlkZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hpc3RvcnlQcm92aWRlcjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgYXV0b2NvbXBsZXRlUHJvdmlkZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBwbHVnaW5zKCkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QuZnJlZXplKHRoaXMuX3BsdWdpbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzSW5pdGlhbGl6ZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fdGVybWluYWxOb2RlID0gdXRpbHMuY3JlYXRlRWxlbWVudCh0aGlzLl9vcHRpb25zLnRlbXBsYXRlKTtcclxuXHJcbiAgICAgICAgdGhpcy5fdGVybWluYWxOb2RlLmNsYXNzTmFtZSArPSAnIGNtZHItdGVybWluYWwtLScgKyB0aGlzLl9vcHRpb25zLnRoZW1lO1xyXG5cclxuICAgICAgICB0aGlzLl9jb250YWluZXJOb2RlLmFwcGVuZENoaWxkKHRoaXMuX3Rlcm1pbmFsTm9kZSk7XHJcblxyXG4gICAgICAgIHRoaXMuX291dHB1dE5vZGUgPSB0aGlzLl90ZXJtaW5hbE5vZGUucXVlcnlTZWxlY3RvcignLm91dHB1dCcpO1xyXG4gICAgICAgIHRoaXMuX2lucHV0Tm9kZSA9IHRoaXMuX3Rlcm1pbmFsTm9kZS5xdWVyeVNlbGVjdG9yKCcuaW5wdXQnKTtcclxuICAgICAgICB0aGlzLl9wcmVmaXhOb2RlID0gdGhpcy5fdGVybWluYWxOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5wcmVmaXgnKTtcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlID0gdGhpcy5fdGVybWluYWxOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5wcm9tcHQnKTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fY3VycmVudCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgIT09IDkgJiYgIWV2ZW50LnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUmVzZXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTM6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leGVjdXRlKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzODpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlzdG9yeUN5Y2xlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2hpc3RvcnlDeWNsZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgOTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlQ3ljbGUoIWV2ZW50LnNoaWZ0S2V5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmN0cmxLZXkgJiYgZXZlbnQua2V5Q29kZSA9PT0gNjcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbmNlbCgpOyBcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fY3VycmVudC5yZWFkTGluZSAmJiBldmVudC5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZExpbmUucmVzb2x2ZSh0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50KTsgXHJcbiAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2N1cnJlbnQucmVhZCAmJiAhdGhpcy5fY3VycmVudC5yZWFkTGluZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fY3VycmVudCAmJiB0aGlzLl9jdXJyZW50LnJlYWQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5jaGFyQ29kZSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZC5yZXNvbHZlKFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQuY2hhckNvZGUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3Rlcm1pbmFsTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9PSB0aGlzLl9pbnB1dE5vZGUgJiYgIXRoaXMuX2lucHV0Tm9kZS5jb250YWlucyhldmVudC50YXJnZXQpICYmXHJcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQgIT09IHRoaXMuX291dHB1dE5vZGUgJiYgIXRoaXMuX291dHB1dE5vZGUuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5mb2N1cygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb21wdFByZWZpeCA9IHRoaXMuX29wdGlvbnMucHJvbXB0UHJlZml4O1xyXG5cclxuICAgICAgICB0aGlzLl9lY2hvID0gdGhpcy5fb3B0aW9ucy5lY2hvO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX3NoZWxsID0gdGhpcy5vcHRpb25zLnNoZWxsIHx8IG5ldyBTaGVsbCgpO1xyXG5cclxuICAgICAgICB0aGlzLl9oaXN0b3J5UHJvdmlkZXIgPSB0aGlzLl9vcHRpb25zLmhpc3RvcnlQcm92aWRlciB8fCBuZXcgSGlzdG9yeVByb3ZpZGVyKCk7XHJcbiAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyLmFjdGl2YXRlKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVQcm92aWRlciA9IHRoaXMuX29wdGlvbnMuYXV0b2NvbXBsZXRlUHJvdmlkZXIgfHwgbmV3IEF1dG9jb21wbGV0ZVByb3ZpZGVyKCk7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIuYWN0aXZhdGUodGhpcyk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHBsdWdpbiBvZiB0aGlzLl9vcHRpb25zLnBsdWdpbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5fcGx1Z2lucy5wdXNoKHBsdWdpbik7XHJcbiAgICAgICAgICAgIHBsdWdpbi5hY3RpdmF0ZSh0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlSW5wdXQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzcG9zZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzSW5pdGlhbGl6ZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyTm9kZS5yZW1vdmVDaGlsZCh0aGlzLl90ZXJtaW5hbE5vZGUpO1xyXG4gICAgICAgIHRoaXMuX3Rlcm1pbmFsTm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5faW5wdXROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9wcmVmaXhOb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9lY2hvID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9xdWV1ZSA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdFByZWZpeCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5faXNJbnB1dElubGluZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZUNvbnRleHQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgdGhpcy5fc2hlbGwgPSBudWxsO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5faGlzdG9yeVByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hpc3RvcnlQcm92aWRlci5kZWFjdGl2YXRlKHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLl9oaXN0b3J5UHJvdmlkZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIuZGVhY3RpdmF0ZSh0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5fcGx1Z2lucykge1xyXG4gICAgICAgICAgICBwbHVnaW4uZGVhY3RpdmF0ZSh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcGx1Z2lucyA9IFtdOyAgICBcclxuXHJcbiAgICAgICAgdGhpcy5faXNJbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0KCkge1xyXG4gICAgICAgIHRoaXMuZGlzcG9zZSgpO1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlYWQoY2FsbGJhY2ssIGludGVyY2VwdCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fY3VycmVudCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9hY3RpdmF0ZUlucHV0KHRydWUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBkZWZlcnJlZCA9IHV0aWxzLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZCA9IHV0aWxzLmRlZmVyKCk7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkLnRoZW4oKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZCA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlYWN0aXZhdGVJbnB1dCgpO1xyXG4gICAgICAgICAgICBpZiAoIWludGVyY2VwdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS50ZXh0Q29udGVudCArPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gY2FsbGJhY2sodmFsdWUsIHRoaXMuX2N1cnJlbnQpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZUxpbmUoJ1VuaGFuZGxlZCBleGNlcHRpb24nLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKGVycm9yLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0gIFxyXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWQoY2FsbGJhY2spLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZsdXNoSW5wdXQoKTtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkLmludGVyY2VwdCA9IGludGVyY2VwdDtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmVhZExpbmUoY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2N1cnJlbnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVJbnB1dCh0cnVlKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZGVmZXJyZWQgPSB1dGlscy5kZWZlcigpO1xyXG5cclxuICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lID0gdXRpbHMuZGVmZXIoKTtcclxuICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lLnRoZW4oKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZExpbmUgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlYWN0aXZhdGVJbnB1dCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9mbHVzaElucHV0KCk7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGNhbGxiYWNrKHZhbHVlLCB0aGlzLl9jdXJyZW50KTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCdVbmhhbmRsZWQgZXhjZXB0aW9uJywgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlTGluZShlcnJvciwgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9ICBcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkTGluZShjYWxsYmFjaykudGhlbihkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHdyaXRlKHZhbHVlLCBzdHlsZSkge1xyXG4gICAgICAgIHZhbHVlID0gdXRpbHMuZW5jb2RlSHRtbCh2YWx1ZSB8fCAnJyk7XHJcbiAgICAgICAgbGV0IG91dHB1dFZhbHVlID0gdXRpbHMuY3JlYXRlRWxlbWVudChgPHNwYW4+JHt2YWx1ZX08L3NwYW4+YCk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzdHlsZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgb3V0cHV0VmFsdWUuY2xhc3NOYW1lID0gc3R5bGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3V0cHV0VmFsdWUuc3R5bGUgPSBzdHlsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9vdXRwdXRMaW5lTm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX291dHB1dE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5fb3V0cHV0TGluZU5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZS5hcHBlbmRDaGlsZChvdXRwdXRWYWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgd3JpdGVMaW5lKHZhbHVlLCBzdHlsZSkge1xyXG4gICAgICAgIHZhbHVlID0gKHZhbHVlIHx8ICcnKSArICdcXG4nO1xyXG4gICAgICAgIHRoaXMud3JpdGUodmFsdWUsIHN0eWxlKTtcclxuICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIoKSB7XHJcbiAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZS5pbm5lckhUTUwgPSAnJztcclxuICAgIH1cclxuXHJcbiAgICBmb2N1cygpIHtcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmZvY3VzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYmx1cigpIHtcclxuICAgICAgICB1dGlscy5ibHVyKHRoaXMuX3Byb21wdE5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uKGV2ZW50LCBoYW5kbGVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XSkge1xyXG4gICAgICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XSA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XS5wdXNoKGhhbmRsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIG9mZihldmVudCwgaGFuZGxlcikge1xyXG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XS5pbmRleE9mKGhhbmRsZXIpO1xyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4ZWN1dGUoY29tbWFuZExpbmUsIC4uLmFyZ3MpIHtcclxuICAgICAgICBsZXQgZGVmZXJyZWQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb21tYW5kTGluZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQgPSBjb21tYW5kTGluZS5kZWZlcnJlZDtcclxuICAgICAgICAgICAgY29tbWFuZExpbmUgPSBjb21tYW5kTGluZS50ZXh0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgY29tbWFuZExpbmUgPT09ICdzdHJpbmcnICYmIGNvbW1hbmRMaW5lLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQgPSB1dGlscy5kZWZlcigpO1xyXG4gICAgICAgICAgICBpZiAoYXJncykge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExpbmUgPSB0aGlzLl9idWlsZENvbW1hbmQoY29tbWFuZExpbmUsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkZWZlcnJlZCA9IHV0aWxzLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnSW52YWxpZCBjb21tYW5kJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3F1ZXVlLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQ6IGRlZmVycmVkLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogY29tbWFuZExpbmUsXHJcbiAgICAgICAgICAgICAgICBleGVjdXRlT25seTogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvbW1hbmRUZXh0ID0gY29tbWFuZExpbmU7XHJcbiAgICAgICAgY29tbWFuZExpbmUgPSBjb21tYW5kTGluZS50cmltKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX3RyaWdnZXIoJ3ByZWV4ZWN1dGUnLCBjb21tYW5kTGluZSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQgPSBjb21tYW5kVGV4dDtcclxuICAgICAgICB0aGlzLl9mbHVzaElucHV0KCF0aGlzLl9lY2hvKTtcclxuICAgICAgICB0aGlzLl9kZWFjdGl2YXRlSW5wdXQoKTtcclxuXHJcbiAgICAgICAgbGV0IGNhbmNlbFRva2VuID0gbmV3IENhbmNlbFRva2VuKCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMaW5lOiBjb21tYW5kTGluZSxcclxuICAgICAgICAgICAgY2FuY2VsVG9rZW46IGNhbmNlbFRva2VuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNvbXBsZXRlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2N1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX291dHB1dE5vZGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3RpdmF0ZUlucHV0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fcXVldWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhlY3V0ZSh0aGlzLl9xdWV1ZS5zaGlmdCgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdDtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLl9zaGVsbC5leGVjdXRlQ29tbWFuZCh0aGlzLCBjb21tYW5kTGluZSwgY2FuY2VsVG9rZW4pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCdVbmhhbmRsZWQgZXhjZXB0aW9uJywgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKGVycm9yLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdVbmhhbmRsZWQgZXhjZXB0aW9uJyk7XHJcbiAgICAgICAgICAgIGNvbXBsZXRlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFByb21pc2UuYWxsKFtyZXN1bHRdKS50aGVuKCh2YWx1ZXMpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlcignZXhlY3V0ZScsIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMaW5lOiBjb21tYW5kTGluZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodmFsdWVzWzBdKTtcclxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAocmVhc29uKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ2V4ZWN1dGUnLCB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTGluZTogY29tbWFuZExpbmUsXHJcbiAgICAgICAgICAgICAgICBlcnJvcjogcmVhc29uXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZDtcclxuICAgIH1cclxuXHJcbiAgICBjYW5jZWwoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5jYW5jZWxUb2tlbi5jYW5jZWwoKTtcclxuICAgIH1cclxuXHJcbiAgICBfYnVpbGRDb21tYW5kKGNvbW1hbmRMaW5lLCBhcmdzKSB7XHJcbiAgICAgICAgZm9yIChsZXQgYXJnIG9mIGFyZ3MpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnICYmIGFyZy5pbmRleE9mKCcgJykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExpbmUgKz0gYCBcIiR7YXJnfVwiYDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMaW5lICs9ICcgJyArIGFyZy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb21tYW5kTGluZTtcclxuICAgIH1cclxuXHJcbiAgICBfYWN0aXZhdGVJbnB1dChpbmxpbmUpIHtcclxuICAgICAgICBpZiAoaW5saW5lKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9vdXRwdXRMaW5lTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5pbm5lckhUTUwgPSB0aGlzLl9vdXRwdXRMaW5lTm9kZS5pbm5lckhUTUw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vdXRwdXROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX291dHB1dExpbmVOb2RlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX291dHB1dExpbmVOb2RlID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9pc0lucHV0SW5saW5lID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLmlubmVySFRNTCA9IHRoaXMuX3Byb21wdFByZWZpeDtcclxuICAgICAgICAgICAgdGhpcy5faXNJbnB1dElubGluZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUuc3R5bGUuZGlzcGxheSA9ICcnO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xyXG4gICAgICAgIHRoaXMuX2ZpeFByb21wdEluZGVudCgpO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuZm9jdXMoKTtcclxuICAgICAgICB0aGlzLl90ZXJtaW5hbE5vZGUuc2Nyb2xsVG9wID0gdGhpcy5fdGVybWluYWxOb2RlLnNjcm9sbEhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBfZGVhY3RpdmF0ZUlucHV0KCkge1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuc3R5bGUudGV4dEluZGVudCA9ICcnO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpOyAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgX2ZsdXNoSW5wdXQocHJldmVudFdyaXRlKSB7XHJcbiAgICAgICAgaWYgKCFwcmV2ZW50V3JpdGUpIHtcclxuICAgICAgICAgICAgbGV0IG91dHB1dFZhbHVlID0gYCR7dGhpcy5fcHJlZml4Tm9kZS5pbm5lckhUTUx9JHt0aGlzLl9wcm9tcHROb2RlLmlubmVySFRNTH1gO1xyXG4gICAgICAgICAgICBpZiAob3V0cHV0VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBvdXRwdXRWYWx1ZU5vZGUgPSB1dGlscy5jcmVhdGVFbGVtZW50KGA8ZGl2PiR7b3V0cHV0VmFsdWV9PC9kaXY+YCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vdXRwdXROb2RlLmFwcGVuZENoaWxkKG91dHB1dFZhbHVlTm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS50ZXh0Q29udGVudCA9ICcnO1xyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQgPSAnJztcclxuICAgIH1cclxuXHJcbiAgICBfdHJpZ2dlcihldmVudCwgZGF0YSkge1xyXG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHJldHVybjtcclxuICAgICAgICBmb3IgKGxldCBoYW5kbGVyIG9mIHRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyKGRhdGEpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX2hpc3RvcnlDeWNsZShmb3J3YXJkKSB7XHJcbiAgICAgICAgUHJvbWlzZS5hbGwoW3RoaXMuX2hpc3RvcnlQcm92aWRlci5nZXROZXh0VmFsdWUoZm9yd2FyZCldKS50aGVuKCh2YWx1ZXMpID0+IHtcclxuICAgICAgICAgICAgbGV0IGNvbW1hbmRMaW5lID0gdmFsdWVzWzBdO1xyXG4gICAgICAgICAgICBpZiAoY29tbWFuZExpbmUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQgPSBjb21tYW5kTGluZTtcclxuICAgICAgICAgICAgICAgIHV0aWxzLmN1cnNvclRvRW5kKHRoaXMuX3Byb21wdE5vZGUpO1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuZGlzcGF0Y2hFdmVudCh0aGlzLl9wcm9tcHROb2RlLCAnY2hhbmdlJywgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgX2F1dG9jb21wbGV0ZUN5Y2xlKGZvcndhcmQpIHsgICAgICAgIFxyXG4gICAgICAgIGlmICghdGhpcy5fYXV0b2NvbXBsZXRlQ29udGV4dCkge1xyXG4gICAgICAgICAgICBsZXQgaW5wdXRWYWx1ZSA9IHRoaXMuX3Byb21wdE5vZGUudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgICAgIGlucHV0VmFsdWUgPSBpbnB1dFZhbHVlLnJlcGxhY2UoL1xccyQvLCAnICcpO1xyXG4gICAgICAgICAgICBsZXQgY3Vyc29yUG9zaXRpb24gPSB1dGlscy5nZXRDdXJzb3JQb3NpdGlvbih0aGlzLl9wcm9tcHROb2RlKTtcclxuICAgICAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSBpbnB1dFZhbHVlLmxhc3RJbmRleE9mKCcgJywgY3Vyc29yUG9zaXRpb24pICsgMTtcclxuICAgICAgICAgICAgc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXggIT09IC0xID8gc3RhcnRJbmRleCA6IDA7XHJcbiAgICAgICAgICAgIGxldCBlbmRJbmRleCA9IGlucHV0VmFsdWUuaW5kZXhPZignICcsIHN0YXJ0SW5kZXgpO1xyXG4gICAgICAgICAgICBlbmRJbmRleCA9IGVuZEluZGV4ICE9PSAtMSA/IGVuZEluZGV4IDogaW5wdXRWYWx1ZS5sZW5ndGg7XHJcbiAgICAgICAgICAgIGxldCBpbmNvbXBsZXRlVmFsdWUgPSBpbnB1dFZhbHVlLnN1YnN0cmluZyhzdGFydEluZGV4LCBlbmRJbmRleCk7XHJcbiAgICAgICAgICAgIGxldCBwcmVjdXJzb3JWYWx1ZSA9IGlucHV0VmFsdWUuc3Vic3RyaW5nKDAsIHN0YXJ0SW5kZXgpO1xyXG4gICAgICAgICAgICBsZXQgcGFyc2VkID0gdGhpcy5zaGVsbC5wYXJzZUNvbW1hbmRMaW5lKHByZWN1cnNvclZhbHVlKTtcclxuICAgICAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlQ29udGV4dCA9IHtcclxuICAgICAgICAgICAgICAgIHRlcm1pbmFsOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgaW5jb21wbGV0ZVZhbHVlOiBpbmNvbXBsZXRlVmFsdWUsXHJcbiAgICAgICAgICAgICAgICBwcmVjdXJzb3JWYWx1ZTogcHJlY3Vyc29yVmFsdWUsICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgcGFyc2VkOiBwYXJzZWRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9ICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBQcm9taXNlLmFsbChbdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIuZ2V0TmV4dFZhbHVlKGZvcndhcmQsIHRoaXMuX2F1dG9jb21wbGV0ZUNvbnRleHQpXSkudGhlbigodmFsdWVzKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHZhbHVlc1swXTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gdGhpcy5fYXV0b2NvbXBsZXRlQ29udGV4dC5wcmVjdXJzb3JWYWx1ZSArIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuY3Vyc29yVG9FbmQodGhpcy5fcHJvbXB0Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5kaXNwYXRjaEV2ZW50KHRoaXMuX3Byb21wdE5vZGUsICdjaGFuZ2UnLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfYXV0b2NvbXBsZXRlUmVzZXQoKSB7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlQ29udGV4dCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgX2ZpeFByb21wdEluZGVudCgpIHtcclxuICAgICAgICBsZXQgcHJlZml4V2lkdGggPSB0aGlzLl9wcmVmaXhOb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gICAgICAgIGxldCB0ZXh0ID0gdGhpcy5fcHJlZml4Tm9kZS50ZXh0Q29udGVudDtcclxuICAgICAgICBsZXQgc3BhY2VQYWRkaW5nID0gdGV4dC5sZW5ndGggLSB0ZXh0LnRyaW0oKS5sZW5ndGg7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5fcHJlZml4Tm9kZS5fc3BhY2VXaWR0aCkge1xyXG4gICAgICAgICAgICBsZXQgZWxlbTEgPSB1dGlscy5jcmVhdGVFbGVtZW50KCc8c3BhbiBzdHlsZT1cInZpc2liaWxpdHk6IGhpZGRlblwiPnwgfDwvc3Bhbj4nKTtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5hcHBlbmRDaGlsZChlbGVtMSk7XHJcbiAgICAgICAgICAgIGxldCBlbGVtMiA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoJzxzcGFuIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuXCI+fHw8L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUuYXBwZW5kQ2hpbGQoZWxlbTIpO1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLl9zcGFjZVdpZHRoID0gZWxlbTEub2Zmc2V0V2lkdGggLSBlbGVtMi5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5yZW1vdmVDaGlsZChlbGVtMSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUucmVtb3ZlQ2hpbGQoZWxlbTIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJlZml4V2lkdGggKz0gc3BhY2VQYWRkaW5nICogdGhpcy5fcHJlZml4Tm9kZS5fc3BhY2VXaWR0aDtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5zdHlsZS50ZXh0SW5kZW50ID0gcHJlZml4V2lkdGggKyAncHgnO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUZXJtaW5hbDtcclxuIiwiLy9PYmplY3RcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQob3V0KSB7XHJcbiAgICBvdXQgPSBvdXQgfHwge307XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoIWFyZ3VtZW50c1tpXSlcclxuICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBhcmd1bWVudHNbaV0pIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1tpXS5oYXNPd25Qcm9wZXJ0eShrZXkpKVxyXG4gICAgICAgICAgICAgICAgb3V0W2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLy9BcnJheVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFycmF5RnJvbShhcnJheUxpa2UvKiwgbWFwRm4sIHRoaXNBcmcgKi8pIHtcclxuXHJcbiAgICB2YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xyXG4gICAgdmFyIGlzQ2FsbGFibGUgPSBmdW5jdGlvbiAoZm4pIHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nIHx8IHRvU3RyLmNhbGwoZm4pID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xyXG4gICAgfTtcclxuICAgIHZhciB0b0ludGVnZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB2YXIgbnVtYmVyID0gTnVtYmVyKHZhbHVlKTtcclxuICAgICAgICBpZiAoaXNOYU4obnVtYmVyKSkgeyByZXR1cm4gMDsgfVxyXG4gICAgICAgIGlmIChudW1iZXIgPT09IDAgfHwgIWlzRmluaXRlKG51bWJlcikpIHsgcmV0dXJuIG51bWJlcjsgfVxyXG4gICAgICAgIHJldHVybiAobnVtYmVyID4gMCA/IDEgOiAtMSkgKiBNYXRoLmZsb29yKE1hdGguYWJzKG51bWJlcikpO1xyXG4gICAgfTtcclxuICAgIHZhciBtYXhTYWZlSW50ZWdlciA9IE1hdGgucG93KDIsIDUzKSAtIDE7XHJcbiAgICB2YXIgdG9MZW5ndGggPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB2YXIgbGVuID0gdG9JbnRlZ2VyKHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobGVuLCAwKSwgbWF4U2FmZUludGVnZXIpO1xyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgQyA9IHRoaXM7XHJcblxyXG4gICAgdmFyIGl0ZW1zID0gT2JqZWN0KGFycmF5TGlrZSk7XHJcblxyXG4gICAgaWYgKGFycmF5TGlrZSA9PSBudWxsKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYXJyYXlGcm9tIHJlcXVpcmVzIGFuIGFycmF5LWxpa2Ugb2JqZWN0IC0gbm90IG51bGwgb3IgdW5kZWZpbmVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG1hcEZuID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB2b2lkIHVuZGVmaW5lZDtcclxuICAgIHZhciBUO1xyXG4gICAgaWYgKHR5cGVvZiBtYXBGbiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuXHJcbiAgICAgICAgaWYgKCFpc0NhbGxhYmxlKG1hcEZuKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhcnJheUZyb206IHdoZW4gcHJvdmlkZWQsIHRoZSBzZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XHJcbiAgICAgICAgICAgIFQgPSBhcmd1bWVudHNbMl07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBsZW4gPSB0b0xlbmd0aChpdGVtcy5sZW5ndGgpO1xyXG5cclxuICAgIHZhciBBID0gaXNDYWxsYWJsZShDKSA/IE9iamVjdChuZXcgQyhsZW4pKSA6IG5ldyBBcnJheShsZW4pO1xyXG5cclxuICAgIHZhciBrID0gMDtcclxuXHJcbiAgICB2YXIga1ZhbHVlO1xyXG4gICAgd2hpbGUgKGsgPCBsZW4pIHtcclxuICAgICAgICBrVmFsdWUgPSBpdGVtc1trXTtcclxuICAgICAgICBpZiAobWFwRm4pIHtcclxuICAgICAgICAgICAgQVtrXSA9IHR5cGVvZiBUID09PSAndW5kZWZpbmVkJyA/IG1hcEZuKGtWYWx1ZSwgaykgOiBtYXBGbi5jYWxsKFQsIGtWYWx1ZSwgayk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgQVtrXSA9IGtWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgayArPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIEEubGVuZ3RoID0gbGVuO1xyXG5cclxuICAgIHJldHVybiBBO1xyXG59XHJcblxyXG4vL1N0cmluZ1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhZCh2YWx1ZSwgbGVuZ3RoLCBjaGFyKSB7XHJcbiAgICBsZXQgcmlnaHQgPSBsZW5ndGggPj0gMDtcclxuICAgIGxlbmd0aCA9IE1hdGguYWJzKGxlbmd0aCk7XHJcbiAgICB3aGlsZSAodmFsdWUubGVuZ3RoIDwgbGVuZ3RoKSB7XHJcbiAgICAgICAgdmFsdWUgPSByaWdodCA/IHZhbHVlICsgY2hhciA6IGNoYXIgKyB2YWx1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUh0bWwodmFsdWUpIHtcclxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGRpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2YWx1ZSkpO1xyXG4gICAgcmV0dXJuIGRpdi5pbm5lckhUTUw7XHJcbn1cclxuXHJcbi8vRnVuY3Rpb25cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1bndyYXAodmFsdWUpIHtcclxuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgPyB2YWx1ZSgpIDogdmFsdWU7XHJcbn1cclxuXHJcbi8vUHJvbWlzZVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZmVyKCkge1xyXG4gICAgZnVuY3Rpb24gRGVmZXJyZWQoKSB7XHJcbiAgICAgICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xyXG4gICAgICAgICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy50aGVuID0gdGhpcy5wcm9taXNlLnRoZW4uYmluZCh0aGlzLnByb21pc2UpO1xyXG4gICAgICAgIHRoaXMuY2F0Y2ggPSB0aGlzLnByb21pc2UuY2F0Y2guYmluZCh0aGlzLnByb21pc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgRGVmZXJyZWQoKTtcclxufVxyXG5cclxuLy9ET01cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0VsZW1lbnQob2JqKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIEhUTUxFbGVtZW50ID09PSBcIm9iamVjdFwiID9cclxuICAgICAgICBvYmogaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA6XHJcbiAgICAgICAgb2JqICYmIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgb2JqICE9PSBudWxsICYmIG9iai5ub2RlVHlwZSA9PT0gMSAmJiB0eXBlb2Ygb2JqLm5vZGVOYW1lID09PSBcInN0cmluZ1wiO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRWxlbWVudChodG1sKSB7XHJcbiAgICBsZXQgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgd3JhcHBlci5pbm5lckhUTUwgPSBodG1sO1xyXG4gICAgcmV0dXJuIHdyYXBwZXIuZmlyc3RDaGlsZDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZWxlbWVudCwgdHlwZSwgY2FuQnViYmxlLCBjYW5jZWxhYmxlKSB7XHJcbiAgICBsZXQgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnSFRNTEV2ZW50cycpO1xyXG4gICAgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIGNhbkJ1YmJsZSwgY2FuY2VsYWJsZSk7XHJcbiAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYmx1cihlbGVtZW50ID0gbnVsbCkge1xyXG4gICAgaWYgKGVsZW1lbnQgJiYgZWxlbWVudCAhPT0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgcmV0dXJuO1xyXG4gICAgbGV0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRlbXApO1xyXG4gICAgdGVtcC5mb2N1cygpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0ZW1wKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGN1cnNvclRvRW5kKGVsZW1lbnQpIHtcclxuICAgIGxldCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XHJcbiAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWxlbWVudCk7XHJcbiAgICByYW5nZS5jb2xsYXBzZShmYWxzZSk7XHJcbiAgICBsZXQgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xyXG4gICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnNvclBvc2l0aW9uKGVsZW1lbnQpIHtcclxuICAgIGxldCBwb3MgPSAwO1xyXG4gICAgbGV0IGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudCB8fCBlbGVtZW50LmRvY3VtZW50O1xyXG4gICAgbGV0IHdpbiA9IGRvYy5kZWZhdWx0VmlldyB8fCBkb2MucGFyZW50V2luZG93O1xyXG4gICAgbGV0IHNlbDtcclxuICAgIGlmICh0eXBlb2Ygd2luLmdldFNlbGVjdGlvbiAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgc2VsID0gd2luLmdldFNlbGVjdGlvbigpO1xyXG4gICAgICAgIGlmIChzZWwucmFuZ2VDb3VudCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IHJhbmdlID0gd2luLmdldFNlbGVjdGlvbigpLmdldFJhbmdlQXQoMCk7XHJcbiAgICAgICAgICAgIGxldCBwcmVDdXJzb3JSYW5nZSA9IHJhbmdlLmNsb25lUmFuZ2UoKTtcclxuICAgICAgICAgICAgcHJlQ3Vyc29yUmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICBwcmVDdXJzb3JSYW5nZS5zZXRFbmQocmFuZ2UuZW5kQ29udGFpbmVyLCByYW5nZS5lbmRPZmZzZXQpO1xyXG4gICAgICAgICAgICBwb3MgPSBwcmVDdXJzb3JSYW5nZS50b1N0cmluZygpLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKChzZWwgPSBkb2Muc2VsZWN0aW9uKSAmJiBzZWwudHlwZSAhPSBcIkNvbnRyb2xcIikge1xyXG4gICAgICAgIGxldCB0ZXh0UmFuZ2UgPSBzZWwuY3JlYXRlUmFuZ2UoKTtcclxuICAgICAgICBsZXQgcHJlQ3Vyc29yVGV4dFJhbmdlID0gZG9jLmJvZHkuY3JlYXRlVGV4dFJhbmdlKCk7XHJcbiAgICAgICAgcHJlQ3Vyc29yVGV4dFJhbmdlLm1vdmVUb0VsZW1lbnRUZXh0KGVsZW1lbnQpO1xyXG4gICAgICAgIHByZUN1cnNvclRleHRSYW5nZS5zZXRFbmRQb2ludChcIkVuZFRvRW5kXCIsIHRleHRSYW5nZSk7XHJcbiAgICAgICAgcG9zID0gcHJlQ3Vyc29yVGV4dFJhbmdlLnRleHQubGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBvcztcclxufSJdfQ==
