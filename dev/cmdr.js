(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cmdr = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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

        return Object.keys(context.terminal.definitionProvider.definitions);
      }

      this.lookups.push(commandNameLookup);
    }
  }]);

  return AutocompleteProvider;
}();

var _default = AutocompleteProvider;
exports["default"] = _default;

},{}],2:[function(require,module,exports){
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
Object.defineProperty(exports, "CommandProvider", {
  enumerable: true,
  get: function get() {
    return _commandProvider["default"];
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

var _shell = _interopRequireDefault(require("./shell.js"));

var _historyProvider = _interopRequireDefault(require("./history-provider.js"));

var _autocompleteProvider = _interopRequireDefault(require("./autocomplete-provider.js"));

var _commandProvider = _interopRequireDefault(require("./command-provider.js"));

var _command = _interopRequireDefault(require("./command.js"));

var _plugin = _interopRequireDefault(require("./plugin.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var version = '2.0.0';
exports.version = version;

},{"./autocomplete-provider.js":1,"./command-provider.js":4,"./command.js":5,"./history-provider.js":6,"./overlay-terminal.js":7,"./plugin.js":8,"./shell.js":9,"./terminal.js":10}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var utils = _interopRequireWildcard(require("./utils.js"));

var _command = _interopRequireDefault(require("./command.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _defaultOptions = {
  predefined: ['HELP', 'ECHO', 'CLS'],
  allowAbbreviations: true
};

var CommandProvider =
/*#__PURE__*/
function () {
  function CommandProvider(options) {
    _classCallCheck(this, CommandProvider);

    this.options = utils.extend({}, _defaultOptions, options);
    this.commands = {};

    this._predefine();
  }

  _createClass(CommandProvider, [{
    key: "activate",
    value: function activate(terminal) {
      if (typeof terminal.addCommand === 'undefined') {
        terminal.addCommand = this.addCommand;
      }
    }
  }, {
    key: "deactivate",
    value: function deactivate(terminal) {
      if (terminal.addCommand === this.addCommand) {
        delete terminal.addCommand;
      }
    }
  }, {
    key: "getCommands",
    value: function getCommands(name) {
      name = name.toUpperCase();
      var command = this.commands[name];

      if (command) {
        if (command.available) {
          return [command];
        }

        return null;
      }

      var commands = [];

      if (this.options.allowAbbreviations) {
        for (var key in this.commands) {
          if (key.indexOf(name, 0) === 0 && utils.unwrap(this.commands[key].available)) {
            commands.push(this.commands[key]);
          }
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
    key: "_predefine",
    value: function _predefine() {
      var provider = this;

      if (this.options.predefined.indexOf('HELP') > -1) {
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

      if (this.options.predefined.indexOf('ECHO') > -1) {
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

      if (this.options.predefined.indexOf('CLS') > -1) {
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

  return CommandProvider;
}();

var _default = CommandProvider;
exports["default"] = _default;

},{"./command.js":5,"./utils.js":11}],5:[function(require,module,exports){
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

},{"./utils.js":11}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"./terminal.js":10,"./utils.js":11}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

var _defaultOptions = {
  contextExtensions: {}
};

var Shell =
/*#__PURE__*/
function () {
  function Shell(options) {
    _classCallCheck(this, Shell);

    this.options = utils.extend({}, _defaultOptions, options);
  }

  _createClass(Shell, [{
    key: "executeCommand",
    value: function executeCommand(terminal, commandLine, cancelToken) {
      var parsed = this.parseCommandLine(commandLine);
      var commands = terminal.commandProvider.getCommands(parsed.name);

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

  return Shell;
}();

var _default = Shell;
exports["default"] = _default;

},{"./utils.js":11}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var utils = _interopRequireWildcard(require("./utils.js"));

var _historyProvider = _interopRequireDefault(require("./history-provider.js"));

var _autocompleteProvider = _interopRequireDefault(require("./autocomplete-provider.js"));

var _commandProvider = _interopRequireDefault(require("./command-provider.js"));

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
  commandProvider: null,
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
    this._commandProvider = null;
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
      this._commandProvider = this._options.commandProvider || new _commandProvider["default"]();

      this._commandProvider.activate(this);

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

      if (this._commandProvider) {
        this._commandProvider.deactivate(this);

        this._commandProvider = null;
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
    value: function write(value, cssClass) {
      value = utils.encodeHtml(value || '');
      var outputValue = utils.createElement("<span>".concat(value, "</span>"));

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
    key: "writeLine",
    value: function writeLine(value, cssClass) {
      value = (value || '') + '\n';
      this.write(value, cssClass);
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
    key: "commandProvider",
    get: function get() {
      return this._commandProvider;
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

},{"./autocomplete-provider.js":1,"./cancel-token.js":2,"./command-provider.js":4,"./history-provider.js":6,"./shell.js":9,"./utils.js":11}],11:[function(require,module,exports){
"use strict";

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXV0b2NvbXBsZXRlLXByb3ZpZGVyLmpzIiwic3JjL2NhbmNlbC10b2tlbi5qcyIsInNyYy9jbWRyLmpzIiwic3JjL2NvbW1hbmQtcHJvdmlkZXIuanMiLCJzcmMvY29tbWFuZC5qcyIsInNyYy9oaXN0b3J5LXByb3ZpZGVyLmpzIiwic3JjL292ZXJsYXktdGVybWluYWwuanMiLCJzcmMvcGx1Z2luLmpzIiwic3JjL3NoZWxsLmpzIiwic3JjL3Rlcm1pbmFsLmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztJQ0FNLG9COzs7QUFDRixrQ0FBYztBQUFBOztBQUNWLFNBQUssT0FBTCxHQUFlLEVBQWY7QUFFQSxTQUFLLFFBQUwsR0FBZ0IsSUFBaEI7QUFDQSxTQUFLLE1BQUwsR0FBYyxDQUFDLENBQWY7QUFDQSxTQUFLLE9BQUwsR0FBZSxFQUFmOztBQUVBLFNBQUssaUJBQUw7QUFDSDs7Ozs2QkFFUSxRLEVBQVUsQ0FDbEI7OzsrQkFFVSxRLEVBQVUsQ0FDcEI7OztpQ0FFWSxPLEVBQVMsTyxFQUFTO0FBQUE7O0FBQzNCLFVBQUksT0FBTyxLQUFLLEtBQUssUUFBckIsRUFBK0I7QUFDM0IsYUFBSyxRQUFMLEdBQWdCLE9BQWhCO0FBQ0EsYUFBSyxNQUFMLEdBQWMsQ0FBQyxDQUFmO0FBQ0EsYUFBSyxPQUFMLEdBQWUsS0FBSyxhQUFMLENBQW1CLE9BQW5CLENBQWY7QUFDSDs7QUFFRCxhQUFPLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQyxLQUFLLE9BQU4sQ0FBWixFQUE0QixJQUE1QixDQUFpQyxVQUFDLE1BQUQsRUFBWTtBQUNoRCxRQUFBLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBRCxDQUFmO0FBRUEsWUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLE1BQVAsQ0FBYyxVQUFDLEtBQUQsRUFBVztBQUMxQyxpQkFBTyxP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LEtBQUssQ0FBQyxZQUE1QixFQUEwQyxLQUFLLENBQUMsU0FBaEQ7QUFDQSxNQUFBLEdBQUcsR0FBRyxjQUFjLENBQUMsUUFBZixHQUEwQixNQUFoQztBQUNIO0FBQ0osR0FURCxNQVNPLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVgsS0FBeUIsR0FBRyxDQUFDLElBQUosSUFBWSxTQUF6QyxFQUFvRDtBQUN2RCxRQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsV0FBSixFQUFoQjtBQUNBLFFBQUksa0JBQWtCLEdBQUcsR0FBRyxDQUFDLElBQUosQ0FBUyxlQUFULEVBQXpCO0FBQ0EsSUFBQSxrQkFBa0IsQ0FBQyxpQkFBbkIsQ0FBcUMsT0FBckM7QUFDQSxJQUFBLGtCQUFrQixDQUFDLFdBQW5CLENBQStCLFVBQS9CLEVBQTJDLFNBQTNDO0FBQ0EsSUFBQSxHQUFHLEdBQUcsa0JBQWtCLENBQUMsSUFBbkIsQ0FBd0IsTUFBOUI7QUFDSDs7QUFDRCxTQUFPLEdBQVA7QUFDSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNsYXNzIEF1dG9jb21wbGV0ZVByb3ZpZGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubG9va3VwcyA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX2NvbnRleHQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2luZGV4ID0gLTE7XHJcbiAgICAgICAgdGhpcy5fdmFsdWVzID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fcHJlZGVmaW5lTG9va3VwcygpO1xyXG4gICAgfVxyXG4gICAgICAgIFxyXG4gICAgYWN0aXZhdGUodGVybWluYWwpIHsgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGRlYWN0aXZhdGUodGVybWluYWwpIHtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0TmV4dFZhbHVlKGZvcndhcmQsIGNvbnRleHQpIHtcclxuICAgICAgICBpZiAoY29udGV4dCAhPT0gdGhpcy5fY29udGV4dCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcclxuICAgICAgICAgICAgdGhpcy5faW5kZXggPSAtMTsgICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5fdmFsdWVzID0gdGhpcy5fbG9va3VwVmFsdWVzKGNvbnRleHQpOyBcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFt0aGlzLl92YWx1ZXNdKS50aGVuKCh2YWx1ZXMpID0+IHtcclxuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzWzBdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IGNvbXBsZXRlVmFsdWVzID0gdmFsdWVzLmZpbHRlcigodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjb250ZXh0LmluY29tcGxldGVWYWx1ZSA9PT0gJycgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS50b0xvd2VyQ2FzZSgpLnNsaWNlKDAsIGNvbnRleHQuaW5jb21wbGV0ZVZhbHVlLnRvTG93ZXJDYXNlKCkubGVuZ3RoKSA9PT0gY29udGV4dC5pbmNvbXBsZXRlVmFsdWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoY29tcGxldGVWYWx1ZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2luZGV4ID49IGNvbXBsZXRlVmFsdWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5kZXggPSAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoZm9yd2FyZCAmJiB0aGlzLl9pbmRleCA8IGNvbXBsZXRlVmFsdWVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZm9yd2FyZCAmJiB0aGlzLl9pbmRleCA+PSBjb21wbGV0ZVZhbHVlcy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmRleCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIWZvcndhcmQgJiYgdGhpcy5faW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmRleC0tO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFmb3J3YXJkICYmIHRoaXMuX2luZGV4IDw9IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4ID0gY29tcGxldGVWYWx1ZXMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIGNvbXBsZXRlVmFsdWVzW3RoaXMuX2luZGV4XTtcclxuICAgICAgICB9KTsgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBfbG9va3VwVmFsdWVzKGNvbnRleHQpIHtcclxuICAgICAgICBcclxuICAgICAgICBmdW5jdGlvbiByZXNvbHZlVmFsdWVzKHZhbHVlcykge1xyXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZXMpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlcyA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlcyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGxvb2t1cCBvZiB0aGlzLmxvb2t1cHMpIHsgICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHJlc3VsdHMgPSByZXNvbHZlVmFsdWVzKGxvb2t1cCk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHRzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgX3ByZWRlZmluZUxvb2t1cHMoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZnVuY3Rpb24gY29tbWFuZE5hbWVMb29rdXAoY29udGV4dCkgeyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoY29udGV4dC5wcmVjdXJzb3JWYWx1ZS50cmltKCkgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGNvbnRleHQudGVybWluYWwuZGVmaW5pdGlvblByb3ZpZGVyLmRlZmluaXRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5sb29rdXBzLnB1c2goY29tbWFuZE5hbWVMb29rdXApOyAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEF1dG9jb21wbGV0ZVByb3ZpZGVyOyIsImNsYXNzIENhbmNlbFRva2VuIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX2lzQ2FuY2VsUmVxdWVzdGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fY2FuY2VsSGFuZGxlcnMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNDYW5jZWxSZXF1ZXN0ZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzQ2FuY2VsUmVxdWVzdGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbmNlbCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzQ2FuY2VsUmVxdWVzdGVkKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgdGhpcy5fY2FuY2VsSGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlcih0aGlzKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faXNDYW5jZWxSZXF1ZXN0ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1bmNhbmNlbCgpIHtcclxuICAgICAgICB0aGlzLl9pc0NhbmNlbFJlcXVlc3RlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIG9uQ2FuY2VsKGhhbmRsZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNDYW5jZWxSZXF1ZXN0ZWQpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZXIodGhpcyk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jYW5jZWxIYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIG9mZkNhbmNlbChoYW5kbGVyKSB7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5fY2FuY2VsSGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9jYW5jZWxIYW5kbGVycy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2FuY2VsVG9rZW47IiwiXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVGVybWluYWwgfSBmcm9tICcuL3Rlcm1pbmFsLmpzJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBPdmVybGF5VGVybWluYWwgfSBmcm9tICcuL292ZXJsYXktdGVybWluYWwuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFNoZWxsIH0gZnJvbSAnLi9zaGVsbC5qcyc7XHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgSGlzdG9yeVByb3ZpZGVyIH0gZnJvbSAnLi9oaXN0b3J5LXByb3ZpZGVyLmpzJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBBdXRvY29tcGxldGVQcm92aWRlciB9IGZyb20gJy4vYXV0b2NvbXBsZXRlLXByb3ZpZGVyLmpzJztcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBDb21tYW5kUHJvdmlkZXIgfSBmcm9tICcuL2NvbW1hbmQtcHJvdmlkZXIuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbW1hbmQgfSBmcm9tICcuL2NvbW1hbmQuanMnO1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFBsdWdpbiB9IGZyb20gJy4vcGx1Z2luLmpzJztcclxuZXhwb3J0IGNvbnN0IHZlcnNpb24gPSAnMi4wLjAnOyIsImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgQ29tbWFuZCBmcm9tICcuL2NvbW1hbmQuanMnO1xyXG5cclxuY29uc3QgX2RlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgcHJlZGVmaW5lZDogWydIRUxQJywgJ0VDSE8nLCAnQ0xTJ10sXHJcbiAgICBhbGxvd0FiYnJldmlhdGlvbnM6IHRydWVcclxufTtcclxuXHJcbmNsYXNzIENvbW1hbmRQcm92aWRlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gdXRpbHMuZXh0ZW5kKHt9LCBfZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSB7fTtcclxuXHJcbiAgICAgICAgdGhpcy5fcHJlZGVmaW5lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYWN0aXZhdGUodGVybWluYWwpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHRlcm1pbmFsLmFkZENvbW1hbmQgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHRlcm1pbmFsLmFkZENvbW1hbmQgPSB0aGlzLmFkZENvbW1hbmQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRlYWN0aXZhdGUodGVybWluYWwpIHtcclxuICAgICAgICBpZiAodGVybWluYWwuYWRkQ29tbWFuZCA9PT0gdGhpcy5hZGRDb21tYW5kKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0ZXJtaW5hbC5hZGRDb21tYW5kO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRDb21tYW5kcyhuYW1lKSB7XHJcbiAgICAgICAgbmFtZSA9IG5hbWUudG9VcHBlckNhc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGNvbW1hbmQgPSB0aGlzLmNvbW1hbmRzW25hbWVdO1xyXG5cclxuICAgICAgICBpZiAoY29tbWFuZCkge1xyXG4gICAgICAgICAgICBpZiAoY29tbWFuZC5hdmFpbGFibGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbY29tbWFuZF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY29tbWFuZHMgPSBbXTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGxvd0FiYnJldmlhdGlvbnMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMuY29tbWFuZHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihuYW1lLCAwKSA9PT0gMCAmJiB1dGlscy51bndyYXAodGhpcy5jb21tYW5kc1trZXldLmF2YWlsYWJsZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb21tYW5kcy5wdXNoKHRoaXMuY29tbWFuZHNba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb21tYW5kcztcclxuICAgIH1cclxuXHJcbiAgICBhZGRDb21tYW5kKGNvbW1hbmQpIHtcclxuICAgICAgICBpZiAoIShjb21tYW5kIGluc3RhbmNlb2YgQ29tbWFuZCkpIHtcclxuICAgICAgICAgICAgY29tbWFuZCA9IG5ldyBDb21tYW5kKC4uLmFyZ3VtZW50cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY29tbWFuZHNbY29tbWFuZC5uYW1lXSA9IGNvbW1hbmQ7XHJcbiAgICB9XHJcblxyXG4gICAgX3ByZWRlZmluZSgpIHtcclxuICAgICAgICBsZXQgcHJvdmlkZXIgPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnByZWRlZmluZWQuaW5kZXhPZignSEVMUCcpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdIRUxQJyxcclxuICAgICAgICAgICAgICAgIG1haW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRlcm1pbmFsLndyaXRlTGluZSgnVGhlIGZvbGxvd2luZyBjb21tYW5kcyBhcmUgYXZhaWxhYmxlOicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGF2YWlsYWJsZUNvbW1hbmRzID0gT2JqZWN0LmtleXMocHJvdmlkZXIuY29tbWFuZHMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGtleSkgPT4geyByZXR1cm4gcHJvdmlkZXIuY29tbWFuZHNba2V5XTsgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoZGVmKSA9PiB7IHJldHVybiBkZWYuYXZhaWxhYmxlOyB9KTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoID0gYXZhaWxhYmxlQ29tbWFuZHMuc2xpY2UoKS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBiLm5hbWUubGVuZ3RoIC0gYS5uYW1lLmxlbmd0aDsgfSlbMF0ubmFtZS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZVRhYmxlKGF2YWlsYWJsZUNvbW1hbmRzLCBbJ25hbWU6JyArIChsZW5ndGggKyAyKS50b1N0cmluZygpLCAnZGVzY3JpcHRpb246NDAnXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRlcm1pbmFsLndyaXRlTGluZSgnKiBQYXNzIFwiLz9cIiBpbnRvIGFueSBjb21tYW5kIHRvIGRpc3BsYXkgaGVscCBmb3IgdGhhdCBjb21tYW5kLicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm92aWRlci5vcHRpb25zLmFsbG93QWJicmV2aWF0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRlcm1pbmFsLndyaXRlTGluZSgnKiBDb21tYW5kIGFiYnJldmlhdGlvbnMgYXJlIGFsbG93ZWQgKGUuZy4gXCJIXCIgZm9yIFwiSEVMUFwiKS4nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdMaXN0cyB0aGUgYXZhaWxhYmxlIGNvbW1hbmRzLidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnByZWRlZmluZWQuaW5kZXhPZignRUNITycpID4gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdFQ0hPJyxcclxuICAgICAgICAgICAgICAgIG1haW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG9nZ2xlID0gdGhpcy5hcmdTdHJpbmcudG9VcHBlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodG9nZ2xlID09PSAnT04nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwuZWNobyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0b2dnbGUgPT09ICdPRkYnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwuZWNobyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5hcmdTdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUodGhpcy5hcmdTdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwud3JpdGVMaW5lKCdFQ0hPIGlzICcgKyAodGhpcy50ZXJtaW5hbC5lY2hvID8gJ29uLicgOiAnb2ZmLicpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdEaXNwbGF5cyBtZXNzYWdlcywgb3IgdG9nZ2xlcyBjb21tYW5kIGVjaG9pbmcuJyxcclxuICAgICAgICAgICAgICAgIHVzYWdlOiAnRUNITyBbT04gfCBPRkZdXFxuRUNITyBbbWVzc2FnZV1cXG5cXG5UeXBlIEVDSE8gd2l0aG91dCBwYXJhbWV0ZXJzIHRvIGRpc3BsYXkgdGhlIGN1cnJlbnQgZWNobyBzZXR0aW5nLidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnByZWRlZmluZWQuaW5kZXhPZignQ0xTJykgPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ0NMUycsXHJcbiAgICAgICAgICAgICAgICBtYWluOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ2xlYXJzIHRoZSBjb21tYW5kIHByb21wdC4nXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ29tbWFuZFByb3ZpZGVyOyIsImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xyXG5cclxuY2xhc3MgQ29tbWFuZCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBtYWluLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBvcHRpb25zID0gbWFpbjtcclxuICAgICAgICAgICAgbWFpbiA9IG5hbWU7XHJcbiAgICAgICAgICAgIG5hbWUgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIG1haW4gIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IG1haW47XHJcbiAgICAgICAgICAgIG1haW4gPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLm1haW4gPSBtYWluO1xyXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMudXNhZ2UgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmhlbHAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlZmluaXRpb24uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwud3JpdGVMaW5lKHRoaXMuZGVmaW5pdGlvbi5kZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGVmaW5pdGlvbi5kZXNjcmlwdGlvbiAmJiB0aGlzLmRlZmluaXRpb24udXNhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudGVybWluYWwud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGVmaW5pdGlvbi51c2FnZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hbC53cml0ZUxpbmUodGhpcy5kZWZpbml0aW9uLnVzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHV0aWxzLmV4dGVuZCh0aGlzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdGhpcy5tYWluID0gdGhpcy5tYWluIHx8ICgoKT0+e30pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5uYW1lICE9PSAnc3RyaW5nJylcclxuICAgICAgICAgICAgdGhyb3cgJ1wibmFtZVwiIG11c3QgYmUgYSBzdHJpbmcuJztcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMubWFpbiAhPT0gJ2Z1bmN0aW9uJylcclxuICAgICAgICAgICAgdGhyb3cgJ1wibWFpblwiIG11c3QgYmUgYSBmdW5jdGlvbi4nO1xyXG5cclxuICAgICAgICB0aGlzLm5hbWUgPSB0aGlzLm5hbWUudG9VcHBlckNhc2UoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoIXRoaXMudXNhZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy51c2FnZSA9IHRoaXMubmFtZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvbW1hbmQ7XHJcbiIsImNsYXNzIEhpc3RvcnlQcm92aWRlciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnZhbHVlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9wcmVleGVjdXRlSGFuZGxlciA9IChjb21tYW5kKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWVzLnVuc2hpZnQoY29tbWFuZCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBhY3RpdmF0ZSh0ZXJtaW5hbCkgeyBcclxuICAgICAgICB0ZXJtaW5hbC5vbigncHJlZXhlY3V0ZScsIHRoaXMuX3ByZWV4ZWN1dGVIYW5kbGVyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZGVhY3RpdmF0ZSh0ZXJtaW5hbCkge1xyXG4gICAgICAgIHRlcm1pbmFsLm9mZigncHJlZXhlY3V0ZScsIHRoaXMuX3ByZWV4ZWN1dGVIYW5kbGVyKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0TmV4dFZhbHVlKGZvcndhcmQpIHtcclxuICAgICAgICBpZiAoZm9yd2FyZCAmJiB0aGlzLmluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmluZGV4LS07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlc1t0aGlzLmluZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFmb3J3YXJkICYmIHRoaXMudmFsdWVzLmxlbmd0aCA+IHRoaXMuaW5kZXggKyAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW3RoaXMuaW5kZXhdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgSGlzdG9yeVByb3ZpZGVyOyIsImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgVGVybWluYWwgZnJvbSAnLi90ZXJtaW5hbC5qcyc7XHJcblxyXG5jb25zdCBfZGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICBhdXRvT3BlbjogZmFsc2UsXHJcbiAgICBvcGVuS2V5OiAxOTIsXHJcbiAgICBjbG9zZUtleTogMjdcclxufTtcclxuXHJcbmNsYXNzIE92ZXJsYXlUZXJtaW5hbCBleHRlbmRzIFRlcm1pbmFsIHtcclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGxldCBvdmVybGF5Tm9kZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoJzxkaXYgc3R5bGU9XCJkaXNwbGF5OiBub25lXCIgY2xhc3M9XCJjbWRyLW92ZXJsYXlcIj48L2Rpdj4nKTtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG92ZXJsYXlOb2RlKTtcclxuXHJcbiAgICAgICAgb3B0aW9ucyA9IHV0aWxzLmV4dGVuZCh7fSwgX2RlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgc3VwZXIob3ZlcmxheU5vZGUsIG9wdGlvbnMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX292ZXJsYXlOb2RlID0gb3ZlcmxheU5vZGU7XHJcbiAgICAgICAgdGhpcy5fZG9jdW1lbnRFdmVudEhhbmRsZXIgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXQgaXNPcGVuKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9vdmVybGF5Tm9kZS5zdHlsZS5kaXNwbGF5ICE9PSAnbm9uZSc7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9kb2N1bWVudEV2ZW50SGFuZGxlciA9IChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNPcGVuICYmXHJcbiAgICAgICAgICAgICAgICBbJ0lOUFVUJywgJ1RFWFRBUkVBJywgJ1NFTEVDVCddLmluZGV4T2YoZXZlbnQudGFyZ2V0LnRhZ05hbWUpID09PSAtMSAmJlxyXG4gICAgICAgICAgICAgICAgIWV2ZW50LnRhcmdldC5pc0NvbnRlbnRFZGl0YWJsZSAmJlxyXG4gICAgICAgICAgICAgICAgZXZlbnQua2V5Q29kZSA9PSB0aGlzLm9wdGlvbnMub3BlbktleSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbigpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaXNPcGVuICYmIGV2ZW50LmtleUNvZGUgPT0gdGhpcy5vcHRpb25zLmNsb3NlS2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fZG9jdW1lbnRFdmVudEhhbmRsZXIpO1xyXG5cclxuICAgICAgICBzdXBlci5pbml0KCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b09wZW4pIHtcclxuICAgICAgICAgICAgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSByZXR1cm47XHJcbiAgICBcclxuICAgICAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2RvY3VtZW50RXZlbnRIYW5kbGVyKTsgICAgXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLl9vdmVybGF5Tm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgb3BlbigpIHtcclxuICAgICAgICB0aGlzLl9vdmVybGF5Tm9kZS5zdHlsZS5kaXNwbGF5ID0gJyc7ICAgICAgICBcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9maXhQcm9tcHRJbmRlbnQoKTsgIC8vaGFjazogdXNpbmcgJ3ByaXZhdGUnIG1ldGhvZCBmcm9tIGJhc2UgY2xhc3MgdG8gZml4IGluZGVudFxyXG4gICAgICAgICAgICB0aGlzLmZvY3VzKCk7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKSB7XHJcbiAgICAgICAgdGhpcy5fb3ZlcmxheU5vZGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XHJcbiAgICAgICAgdGhpcy5ibHVyKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE92ZXJsYXlUZXJtaW5hbDsiLCJjbGFzcyBQbHVnaW4ge1xyXG4gICAgYWN0aXZhdGUodGVybWluYWwpIHtcclxuICAgIH1cclxuXHJcbiAgICBkZWFjdGl2YXRlKHRlcm1pbmFsKSB7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBsdWdpbjsiLCJpbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL3V0aWxzLmpzJztcclxuXHJcbmNvbnN0IF9kZWZhdWx0T3B0aW9ucyA9IHtcclxuICAgIGNvbnRleHRFeHRlbnNpb25zOiB7fVxyXG59O1xyXG5cclxuY2xhc3MgU2hlbGwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB1dGlscy5leHRlbmQoe30sIF9kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhlY3V0ZUNvbW1hbmQodGVybWluYWwsIGNvbW1hbmRMaW5lLCBjYW5jZWxUb2tlbikge1xyXG4gICAgICAgIGxldCBwYXJzZWQgPSB0aGlzLnBhcnNlQ29tbWFuZExpbmUoY29tbWFuZExpbmUpO1xyXG4gICAgICAgIGxldCBjb21tYW5kcyA9IHRlcm1pbmFsLmNvbW1hbmRQcm92aWRlci5nZXRDb21tYW5kcyhwYXJzZWQubmFtZSk7XHJcbiAgICAgICAgaWYgKCFjb21tYW5kcyB8fCBjb21tYW5kcy5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgICAgIHRlcm1pbmFsLndyaXRlTGluZSgnSW52YWxpZCBjb21tYW5kJywgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbW1hbmRzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgdGVybWluYWwud3JpdGVMaW5lKCdBbWJpZ3VvdXMgY29tbWFuZCcsICdlcnJvcicpO1xyXG4gICAgICAgICAgICB0ZXJtaW5hbC53cml0ZUxpbmUoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21tYW5kcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGVybWluYWwud3JpdGVQYWQoY29tbWFuZHNbaV0ubmFtZSwgMTApO1xyXG4gICAgICAgICAgICAgICAgdGVybWluYWwud3JpdGVMaW5lKGNvbW1hbmRzW2ldLmRlc2NyaXB0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ZXJtaW5hbC53cml0ZUxpbmUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvbW1hbmQgPSBjb21tYW5kc1swXTtcclxuXHJcbiAgICAgICAgbGV0IGNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgIHRlcm1pbmFsOiB0ZXJtaW5hbCxcclxuICAgICAgICAgICAgY29tbWFuZExpbmU6IGNvbW1hbmRMaW5lLFxyXG4gICAgICAgICAgICBjb21tYW5kOiBjb21tYW5kLFxyXG4gICAgICAgICAgICBwYXJzZWQ6IHBhcnNlZCxcclxuICAgICAgICAgICAgZGVmZXI6IHV0aWxzLmRlZmVyLFxyXG4gICAgICAgICAgICBjYW5jZWxUb2tlbjogY2FuY2VsVG9rZW5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB1dGlscy5leHRlbmQoY29udGV4dCwgdGhpcy5vcHRpb25zLmNvbnRleHRFeHRlbnNpb25zKTtcclxuXHJcbiAgICAgICAgbGV0IGFyZ3MgPSBwYXJzZWQuYXJncztcclxuXHJcbiAgICAgICAgaWYgKGNvbW1hbmQuaGVscCAmJiBhcmdzLmxlbmd0aCA+IDAgJiYgYXJnc1thcmdzLmxlbmd0aCAtIDFdID09PSBcIi8/XCIpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb21tYW5kLmhlbHAgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICB0ZXJtaW5hbC53cml0ZUxpbmUoY29tbWFuZC5oZWxwKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY29tbWFuZC5oZWxwID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbWFuZC5oZWxwLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29tbWFuZC5tYWluLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlQ29tbWFuZExpbmUoY29tbWFuZExpbmUpIHsgXHJcbiAgICAgICAgbGV0IGV4cCA9IC9bXlxcc1wiXSt8XCIoW15cIl0qKVwiL2dpLFxyXG4gICAgICAgICAgICBuYW1lID0gbnVsbCxcclxuICAgICAgICAgICAgYXJnU3RyaW5nID0gbnVsbCxcclxuICAgICAgICAgICAgYXJncyA9IFtdLFxyXG4gICAgICAgICAgICBtYXRjaCA9IG51bGw7XHJcblxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgbWF0Y2ggPSBleHAuZXhlYyhjb21tYW5kTGluZSk7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gbWF0Y2hbMV0gPyBtYXRjaFsxXSA6IG1hdGNoWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoLmluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZ1N0cmluZyA9IGNvbW1hbmRMaW5lLnN1YnN0cih2YWx1ZS5sZW5ndGggKyAobWF0Y2hbMV0gPyAzIDogMSkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSB3aGlsZSAobWF0Y2ggIT09IG51bGwpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICBhcmdTdHJpbmc6IGFyZ1N0cmluZyxcclxuICAgICAgICAgICAgYXJnczogYXJnc1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNoZWxsOyIsImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgSGlzdG9yeVByb3ZpZGVyIGZyb20gJy4vaGlzdG9yeS1wcm92aWRlci5qcyc7XHJcbmltcG9ydCBBdXRvY29tcGxldGVQcm92aWRlciBmcm9tICcuL2F1dG9jb21wbGV0ZS1wcm92aWRlci5qcyc7XHJcbmltcG9ydCBDb21tYW5kUHJvdmlkZXIgZnJvbSAnLi9jb21tYW5kLXByb3ZpZGVyLmpzJztcclxuaW1wb3J0IFNoZWxsIGZyb20gJy4vc2hlbGwuanMnO1xyXG5pbXBvcnQgQ2FuY2VsVG9rZW4gZnJvbSAnLi9jYW5jZWwtdG9rZW4uanMnO1xyXG5cclxuY29uc3QgX2RlZmF1bHRPcHRpb25zID0ge1xyXG4gICAgZWNobzogdHJ1ZSxcclxuICAgIHByb21wdFByZWZpeDogJz4nLFxyXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiY21kci10ZXJtaW5hbFwiPjxkaXYgY2xhc3M9XCJvdXRwdXRcIj48L2Rpdj48ZGl2IGNsYXNzPVwiaW5wdXRcIj48c3BhbiBjbGFzcz1cInByZWZpeFwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwicHJvbXB0XCIgc3BlbGxjaGVjaz1cImZhbHNlXCIgY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiIC8+PC9kaXY+PC9kaXY+JyxcclxuICAgIHRoZW1lOiAnY21kJyxcclxuICAgIGNvbW1hbmRQcm92aWRlcjogbnVsbCxcclxuICAgIGhpc3RvcnlQcm92aWRlcjogbnVsbCxcclxuICAgIGF1dG9jb21wbGV0ZVByb3ZpZGVyOiBudWxsLFxyXG4gICAgc2hlbGw6IG51bGwsXHJcbiAgICBwbHVnaW5zOiBbXVxyXG59O1xyXG5cclxuY2xhc3MgVGVybWluYWwge1xyXG4gICAgY29uc3RydWN0b3IoY29udGFpbmVyTm9kZSwgb3B0aW9ucykge1xyXG4gICAgICAgIGlmICghY29udGFpbmVyTm9kZSB8fCAhdXRpbHMuaXNFbGVtZW50KGNvbnRhaW5lck5vZGUpKSB7XHJcbiAgICAgICAgICAgIHRocm93ICdcImNvbnRhaW5lck5vZGVcIiBtdXN0IGJlIGFuIEhUTUxFbGVtZW50Lic7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9vcHRpb25zID0gdXRpbHMuZXh0ZW5kKHt9LCBfZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lck5vZGUgPSBjb250YWluZXJOb2RlO1xyXG4gICAgICAgIHRoaXMuX3Rlcm1pbmFsTm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5faW5wdXROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9wcmVmaXhOb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9vdXRwdXROb2RlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZWNobyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcXVldWUgPSBbXTtcclxuICAgICAgICB0aGlzLl9wcm9tcHRQcmVmaXggPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2lzSW5wdXRJbmxpbmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVDb250ZXh0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXJzID0ge307XHJcbiAgICAgICAgdGhpcy5faXNJbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2hpc3RvcnlQcm92aWRlciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2NvbW1hbmRQcm92aWRlciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fc2hlbGwgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3BsdWdpbnMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGlzSW5pdGlhbGl6ZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzSW5pdGlhbGl6ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9wdGlvbnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHByb21wdFByZWZpeCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvbXB0UHJlZml4O1xyXG4gICAgfVxyXG4gICAgc2V0IHByb21wdFByZWZpeCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX3Byb21wdFByZWZpeCA9IHZhbHVlO1xyXG4gICAgICAgIGlmICghdGhpcy5faXNJbnB1dElubGluZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpeFByb21wdEluZGVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgZWNobygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZWNobztcclxuICAgIH1cclxuICAgIHNldCBlY2hvKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fZWNobyA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzaGVsbCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2hlbGw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBoaXN0b3J5UHJvdmlkZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hpc3RvcnlQcm92aWRlcjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgYXV0b2NvbXBsZXRlUHJvdmlkZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBjb21tYW5kUHJvdmlkZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbW1hbmRQcm92aWRlcjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgcGx1Z2lucygpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmZyZWV6ZSh0aGlzLl9wbHVnaW5zKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0luaXRpYWxpemVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX3Rlcm1pbmFsTm9kZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQodGhpcy5fb3B0aW9ucy50ZW1wbGF0ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3Rlcm1pbmFsTm9kZS5jbGFzc05hbWUgKz0gJyBjbWRyLXRlcm1pbmFsLS0nICsgdGhpcy5fb3B0aW9ucy50aGVtZTtcclxuXHJcbiAgICAgICAgdGhpcy5fY29udGFpbmVyTm9kZS5hcHBlbmRDaGlsZCh0aGlzLl90ZXJtaW5hbE5vZGUpO1xyXG5cclxuICAgICAgICB0aGlzLl9vdXRwdXROb2RlID0gdGhpcy5fdGVybWluYWxOb2RlLnF1ZXJ5U2VsZWN0b3IoJy5vdXRwdXQnKTtcclxuICAgICAgICB0aGlzLl9pbnB1dE5vZGUgPSB0aGlzLl90ZXJtaW5hbE5vZGUucXVlcnlTZWxlY3RvcignLmlucHV0Jyk7XHJcbiAgICAgICAgdGhpcy5fcHJlZml4Tm9kZSA9IHRoaXMuX3Rlcm1pbmFsTm9kZS5xdWVyeVNlbGVjdG9yKCcucHJlZml4Jyk7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZSA9IHRoaXMuX3Rlcm1pbmFsTm9kZS5xdWVyeVNlbGVjdG9yKCcucHJvbXB0Jyk7XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2N1cnJlbnQpIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlICE9PSA5ICYmICFldmVudC5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVJlc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDEzOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhlY3V0ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzg6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2hpc3RvcnlDeWNsZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDQwOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9oaXN0b3J5Q3ljbGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZUN5Y2xlKCFldmVudC5zaGlmdEtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5jdHJsS2V5ICYmIGV2ZW50LmtleUNvZGUgPT09IDY3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYW5jZWwoKTsgXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2N1cnJlbnQucmVhZExpbmUgJiYgZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lLnJlc29sdmUodGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCk7IFxyXG4gICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50LnJlYWQgJiYgIXRoaXMuX2N1cnJlbnQucmVhZExpbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnQgJiYgdGhpcy5fY3VycmVudC5yZWFkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuY2hhckNvZGUgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWQucmVzb2x2ZShTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LmNoYXJDb2RlKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl90ZXJtaW5hbE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCAhPT0gdGhpcy5faW5wdXROb2RlICYmICF0aGlzLl9pbnB1dE5vZGUuY29udGFpbnMoZXZlbnQudGFyZ2V0KSAmJlxyXG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0ICE9PSB0aGlzLl9vdXRwdXROb2RlICYmICF0aGlzLl9vdXRwdXROb2RlLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Byb21wdE5vZGUuZm9jdXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9tcHRQcmVmaXggPSB0aGlzLl9vcHRpb25zLnByb21wdFByZWZpeDtcclxuXHJcbiAgICAgICAgdGhpcy5fZWNobyA9IHRoaXMuX29wdGlvbnMuZWNobztcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9zaGVsbCA9IHRoaXMub3B0aW9ucy5zaGVsbCB8fCBuZXcgU2hlbGwoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fY29tbWFuZFByb3ZpZGVyID0gdGhpcy5fb3B0aW9ucy5jb21tYW5kUHJvdmlkZXIgfHwgbmV3IENvbW1hbmRQcm92aWRlcigpO1xyXG4gICAgICAgIHRoaXMuX2NvbW1hbmRQcm92aWRlci5hY3RpdmF0ZSh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyID0gdGhpcy5fb3B0aW9ucy5oaXN0b3J5UHJvdmlkZXIgfHwgbmV3IEhpc3RvcnlQcm92aWRlcigpO1xyXG4gICAgICAgIHRoaXMuX2hpc3RvcnlQcm92aWRlci5hY3RpdmF0ZSh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5fYXV0b2NvbXBsZXRlUHJvdmlkZXIgPSB0aGlzLl9vcHRpb25zLmF1dG9jb21wbGV0ZVByb3ZpZGVyIHx8IG5ldyBBdXRvY29tcGxldGVQcm92aWRlcigpO1xyXG4gICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyLmFjdGl2YXRlKHRoaXMpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBwbHVnaW4gb2YgdGhpcy5fb3B0aW9ucy5wbHVnaW5zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BsdWdpbnMucHVzaChwbHVnaW4pO1xyXG4gICAgICAgICAgICBwbHVnaW4uYWN0aXZhdGUodGhpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9hY3RpdmF0ZUlucHV0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc0luaXRpYWxpemVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lck5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fdGVybWluYWxOb2RlKTtcclxuICAgICAgICB0aGlzLl90ZXJtaW5hbE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX291dHB1dE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2lucHV0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcHJlZml4Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZWNobyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcXVldWUgPSBbXTtcclxuICAgICAgICB0aGlzLl9wcm9tcHRQcmVmaXggPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2lzSW5wdXRJbmxpbmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9hdXRvY29tcGxldGVDb250ZXh0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXJzID0ge307XHJcblxyXG4gICAgICAgIHRoaXMuX3NoZWxsID0gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2hpc3RvcnlQcm92aWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9oaXN0b3J5UHJvdmlkZXIuZGVhY3RpdmF0ZSh0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5faGlzdG9yeVByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyLmRlYWN0aXZhdGUodGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbW1hbmRQcm92aWRlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9jb21tYW5kUHJvdmlkZXIuZGVhY3RpdmF0ZSh0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5fY29tbWFuZFByb3ZpZGVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMuX3BsdWdpbnMpIHtcclxuICAgICAgICAgICAgcGx1Z2luLmRlYWN0aXZhdGUodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3BsdWdpbnMgPSBbXTsgICAgXHJcblxyXG4gICAgICAgIHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXNldCgpIHtcclxuICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICByZWFkKGNhbGxiYWNrLCBpbnRlcmNlcHQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2N1cnJlbnQpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVJbnB1dCh0cnVlKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgZGVmZXJyZWQgPSB1dGlscy5kZWZlcigpO1xyXG5cclxuICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWQgPSB1dGlscy5kZWZlcigpO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZC50aGVuKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWQgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9kZWFjdGl2YXRlSW5wdXQoKTtcclxuICAgICAgICAgICAgaWYgKCFpbnRlcmNlcHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUudGV4dENvbnRlbnQgKz0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGNhbGxiYWNrKHZhbHVlLCB0aGlzLl9jdXJyZW50KTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCdVbmhhbmRsZWQgZXhjZXB0aW9uJywgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlTGluZShlcnJvciwgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9ICBcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkKGNhbGxiYWNrKS50aGVuKGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9mbHVzaElucHV0KCk7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQucmVhZC5pbnRlcmNlcHQgPSBpbnRlcmNlcHQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHJlYWRMaW5lKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9jdXJyZW50KSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlSW5wdXQodHJ1ZSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGRlZmVycmVkID0gdXRpbHMuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkTGluZSA9IHV0aWxzLmRlZmVyKCk7XHJcbiAgICAgICAgdGhpcy5fY3VycmVudC5yZWFkTGluZS50aGVuKCh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50LnJlYWRMaW5lID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLl9kZWFjdGl2YXRlSW5wdXQoKTtcclxuICAgICAgICAgICAgdGhpcy5fZmx1c2hJbnB1dCgpO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjYWxsYmFjayh2YWx1ZSwgdGhpcy5fY3VycmVudCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlTGluZSgnVW5oYW5kbGVkIGV4Y2VwdGlvbicsICdlcnJvcicpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZUxpbmUoZXJyb3IsICdlcnJvcicpO1xyXG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgfSAgXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZExpbmUoY2FsbGJhY2spLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZGVmZXJyZWQucmVqZWN0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZDtcclxuICAgIH1cclxuXHJcbiAgICB3cml0ZSh2YWx1ZSwgY3NzQ2xhc3MpIHtcclxuICAgICAgICB2YWx1ZSA9IHV0aWxzLmVuY29kZUh0bWwodmFsdWUgfHwgJycpO1xyXG4gICAgICAgIGxldCBvdXRwdXRWYWx1ZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoYDxzcGFuPiR7dmFsdWV9PC9zcGFuPmApO1xyXG4gICAgICAgIGlmIChjc3NDbGFzcykge1xyXG4gICAgICAgICAgICBvdXRwdXRWYWx1ZS5jbGFzc05hbWUgPSBjc3NDbGFzcztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9vdXRwdXRMaW5lTm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZSA9IHV0aWxzLmNyZWF0ZUVsZW1lbnQoJzxkaXY+PC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX291dHB1dE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5fb3V0cHV0TGluZU5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZS5hcHBlbmRDaGlsZChvdXRwdXRWYWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgd3JpdGVMaW5lKHZhbHVlLCBjc3NDbGFzcykge1xyXG4gICAgICAgIHZhbHVlID0gKHZhbHVlIHx8ICcnKSArICdcXG4nO1xyXG4gICAgICAgIHRoaXMud3JpdGUodmFsdWUsIGNzc0NsYXNzKTtcclxuICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgd3JpdGVQYWQodmFsdWUsIGxlbmd0aCwgY2hhciA9ICcgJywgY3NzQ2xhc3MgPSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy53cml0ZSh1dGlscy5wYWQodmFsdWUsIGxlbmd0aCwgY2hhciksIGNzc0NsYXNzKTtcclxuICAgIH1cclxuXHJcbiAgICB3cml0ZVRhYmxlKGRhdGEsIGNvbHVtbnMsIHNob3dIZWFkZXJzLCBjc3NDbGFzcykge1xyXG4gICAgICAgIGNvbHVtbnMgPSBjb2x1bW5zLm1hcCgodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlcyA9IHZhbHVlLnNwbGl0KCc6Jyk7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiB2YWx1ZXNbMF0sXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiB2YWx1ZXMubGVuZ3RoID4gMSA/IHZhbHVlc1sxXSA6IDEwLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyOiB2YWx1ZXMubGVuZ3RoID4gMiA/IHZhbHVlc1syXSA6IHZhbHVlc1swXVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxldCB3cml0ZUNlbGwgPSAodmFsdWUsIHBhZGRpbmcpID0+IHtcclxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSB8fCAnJztcclxuICAgICAgICAgICAgaWYgKHBhZGRpbmcgPT09ICcqJykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZSh2YWx1ZSwgY3NzQ2xhc3MpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZVBhZCh2YWx1ZSwgcGFyc2VJbnQocGFkZGluZywgMTApLCAnICcsIGNzc0NsYXNzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHNob3dIZWFkZXJzKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbCBvZiBjb2x1bW5zKSB7XHJcbiAgICAgICAgICAgICAgICB3cml0ZUNlbGwoY29sLmhlYWRlciwgY29sLnBhZGRpbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNvbCBvZiBjb2x1bW5zKSB7XHJcbiAgICAgICAgICAgICAgICB3cml0ZUNlbGwoQXJyYXkoY29sLmhlYWRlci5sZW5ndGggKyAxKS5qb2luKCctJyksIGNvbC5wYWRkaW5nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLndyaXRlTGluZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCByb3cgb2YgZGF0YSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2wgb2YgY29sdW1ucykge1xyXG4gICAgICAgICAgICAgICAgd3JpdGVDZWxsKHJvd1tjb2wubmFtZV0gPyByb3dbY29sLm5hbWVdLnRvU3RyaW5nKCkgOiAnJywgY29sLnBhZGRpbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMud3JpdGVMaW5lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKCkge1xyXG4gICAgICAgIHRoaXMuX291dHB1dE5vZGUuaW5uZXJIVE1MID0gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgZm9jdXMoKSB7XHJcbiAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS5mb2N1cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGJsdXIoKSB7XHJcbiAgICAgICAgdXRpbHMuYmx1cih0aGlzLl9wcm9tcHROb2RlKTtcclxuICAgIH1cclxuXHJcbiAgICBvbihldmVudCwgaGFuZGxlcikge1xyXG4gICAgICAgIGlmICghdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0pIHtcclxuICAgICAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0ucHVzaChoYW5kbGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBvZmYoZXZlbnQsIGhhbmRsZXIpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5fZXZlbnRIYW5kbGVyc1tldmVudF0uaW5kZXhPZihoYW5kbGVyKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleGVjdXRlKGNvbW1hbmRMaW5lLCAuLi5hcmdzKSB7XHJcbiAgICAgICAgbGV0IGRlZmVycmVkO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29tbWFuZExpbmUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkID0gY29tbWFuZExpbmUuZGVmZXJyZWQ7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMaW5lID0gY29tbWFuZExpbmUudGV4dDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGNvbW1hbmRMaW5lID09PSAnc3RyaW5nJyAmJiBjb21tYW5kTGluZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkID0gdXRpbHMuZGVmZXIoKTtcclxuICAgICAgICAgICAgaWYgKGFyZ3MpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMaW5lID0gdGhpcy5fYnVpbGRDb21tYW5kKGNvbW1hbmRMaW5lLCBhcmdzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQgPSB1dGlscy5kZWZlcigpO1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ0ludmFsaWQgY29tbWFuZCcpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fY3VycmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9xdWV1ZS5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkOiBkZWZlcnJlZCxcclxuICAgICAgICAgICAgICAgIHRleHQ6IGNvbW1hbmRMaW5lLFxyXG4gICAgICAgICAgICAgICAgZXhlY3V0ZU9ubHk6IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjb21tYW5kVGV4dCA9IGNvbW1hbmRMaW5lO1xyXG4gICAgICAgIGNvbW1hbmRMaW5lID0gY29tbWFuZExpbmUudHJpbSgpO1xyXG5cclxuICAgICAgICB0aGlzLl90cmlnZ2VyKCdwcmVleGVjdXRlJywgY29tbWFuZExpbmUpO1xyXG5cclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gY29tbWFuZFRleHQ7XHJcbiAgICAgICAgdGhpcy5fZmx1c2hJbnB1dCghdGhpcy5fZWNobyk7XHJcbiAgICAgICAgdGhpcy5fZGVhY3RpdmF0ZUlucHV0KCk7XHJcblxyXG4gICAgICAgIGxldCBjYW5jZWxUb2tlbiA9IG5ldyBDYW5jZWxUb2tlbigpO1xyXG5cclxuICAgICAgICB0aGlzLl9jdXJyZW50ID0ge1xyXG4gICAgICAgICAgICBjb21tYW5kTGluZTogY29tbWFuZExpbmUsXHJcbiAgICAgICAgICAgIGNhbmNlbFRva2VuOiBjYW5jZWxUb2tlblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBjb21wbGV0ZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vdXRwdXROb2RlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndyaXRlTGluZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aXZhdGVJbnB1dCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3F1ZXVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4ZWN1dGUodGhpcy5fcXVldWUuc2hpZnQoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQ7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5fc2hlbGwuZXhlY3V0ZUNvbW1hbmQodGhpcywgY29tbWFuZExpbmUsIGNhbmNlbFRva2VuKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICB0aGlzLndyaXRlTGluZSgnVW5oYW5kbGVkIGV4Y2VwdGlvbicsICdlcnJvcicpO1xyXG4gICAgICAgICAgICB0aGlzLndyaXRlTGluZShlcnJvciwgJ2Vycm9yJyk7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnVW5oYW5kbGVkIGV4Y2VwdGlvbicpO1xyXG4gICAgICAgICAgICBjb21wbGV0ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBQcm9taXNlLmFsbChbcmVzdWx0XSkudGhlbigodmFsdWVzKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXIoJ2V4ZWN1dGUnLCB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTGluZTogY29tbWFuZExpbmVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHZhbHVlc1swXSk7XHJcbiAgICAgICAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgKHJlYXNvbikgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyKCdleGVjdXRlJywge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExpbmU6IGNvbW1hbmRMaW5lLFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6IHJlYXNvblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAgY29tcGxldGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgY2FuY2VsKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fY3VycmVudCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuX2N1cnJlbnQuY2FuY2VsVG9rZW4uY2FuY2VsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgX2J1aWxkQ29tbWFuZChjb21tYW5kTGluZSwgYXJncykge1xyXG4gICAgICAgIGZvciAobGV0IGFyZyBvZiBhcmdzKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXJnID09PSAnc3RyaW5nJyAmJiBhcmcuaW5kZXhPZignICcpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMaW5lICs9IGAgXCIke2FyZ31cImA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTGluZSArPSAnICcgKyBhcmcudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29tbWFuZExpbmU7XHJcbiAgICB9XHJcblxyXG4gICAgX2FjdGl2YXRlSW5wdXQoaW5saW5lKSB7XHJcbiAgICAgICAgaWYgKGlubGluZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fb3V0cHV0TGluZU5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUuaW5uZXJIVE1MID0gdGhpcy5fb3V0cHV0TGluZU5vZGUuaW5uZXJIVE1MO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9vdXRwdXRMaW5lTm9kZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vdXRwdXRMaW5lTm9kZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5faXNJbnB1dElubGluZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5pbm5lckhUTUwgPSB0aGlzLl9wcm9tcHRQcmVmaXg7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzSW5wdXRJbmxpbmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5faW5wdXROb2RlLnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcclxuICAgICAgICB0aGlzLl9maXhQcm9tcHRJbmRlbnQoKTtcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLmZvY3VzKCk7XHJcbiAgICAgICAgdGhpcy5fdGVybWluYWxOb2RlLnNjcm9sbFRvcCA9IHRoaXMuX3Rlcm1pbmFsTm9kZS5zY3JvbGxIZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgX2RlYWN0aXZhdGVJbnB1dCgpIHtcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnN0eWxlLnRleHRJbmRlbnQgPSAnJztcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTsgICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIF9mbHVzaElucHV0KHByZXZlbnRXcml0ZSkge1xyXG4gICAgICAgIGlmICghcHJldmVudFdyaXRlKSB7XHJcbiAgICAgICAgICAgIGxldCBvdXRwdXRWYWx1ZSA9IGAke3RoaXMuX3ByZWZpeE5vZGUuaW5uZXJIVE1MfSR7dGhpcy5fcHJvbXB0Tm9kZS5pbm5lckhUTUx9YDtcclxuICAgICAgICAgICAgaWYgKG91dHB1dFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3V0cHV0VmFsdWVOb2RlID0gdXRpbHMuY3JlYXRlRWxlbWVudChgPGRpdj4ke291dHB1dFZhbHVlfTwvZGl2PmApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb3V0cHV0Tm9kZS5hcHBlbmRDaGlsZChvdXRwdXRWYWx1ZU5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3ByZWZpeE5vZGUudGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgX3RyaWdnZXIoZXZlbnQsIGRhdGEpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2V2ZW50SGFuZGxlcnNbZXZlbnRdKSByZXR1cm47XHJcbiAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiB0aGlzLl9ldmVudEhhbmRsZXJzW2V2ZW50XSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlcihkYXRhKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9oaXN0b3J5Q3ljbGUoZm9yd2FyZCkge1xyXG4gICAgICAgIFByb21pc2UuYWxsKFt0aGlzLl9oaXN0b3J5UHJvdmlkZXIuZ2V0TmV4dFZhbHVlKGZvcndhcmQpXSkudGhlbigodmFsdWVzKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBjb21tYW5kTGluZSA9IHZhbHVlc1swXTtcclxuICAgICAgICAgICAgaWYgKGNvbW1hbmRMaW5lKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50ID0gY29tbWFuZExpbmU7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5jdXJzb3JUb0VuZCh0aGlzLl9wcm9tcHROb2RlKTtcclxuICAgICAgICAgICAgICAgIHV0aWxzLmRpc3BhdGNoRXZlbnQodGhpcy5fcHJvbXB0Tm9kZSwgJ2NoYW5nZScsIHRydWUsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9hdXRvY29tcGxldGVDeWNsZShmb3J3YXJkKSB7ICAgICAgICBcclxuICAgICAgICBpZiAoIXRoaXMuX2F1dG9jb21wbGV0ZUNvbnRleHQpIHtcclxuICAgICAgICAgICAgbGV0IGlucHV0VmFsdWUgPSB0aGlzLl9wcm9tcHROb2RlLnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICBpbnB1dFZhbHVlID0gaW5wdXRWYWx1ZS5yZXBsYWNlKC9cXHMkLywgJyAnKTtcclxuICAgICAgICAgICAgbGV0IGN1cnNvclBvc2l0aW9uID0gdXRpbHMuZ2V0Q3Vyc29yUG9zaXRpb24odGhpcy5fcHJvbXB0Tm9kZSk7XHJcbiAgICAgICAgICAgIGxldCBzdGFydEluZGV4ID0gaW5wdXRWYWx1ZS5sYXN0SW5kZXhPZignICcsIGN1cnNvclBvc2l0aW9uKSArIDE7XHJcbiAgICAgICAgICAgIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4ICE9PSAtMSA/IHN0YXJ0SW5kZXggOiAwO1xyXG4gICAgICAgICAgICBsZXQgZW5kSW5kZXggPSBpbnB1dFZhbHVlLmluZGV4T2YoJyAnLCBzdGFydEluZGV4KTtcclxuICAgICAgICAgICAgZW5kSW5kZXggPSBlbmRJbmRleCAhPT0gLTEgPyBlbmRJbmRleCA6IGlucHV0VmFsdWUubGVuZ3RoO1xyXG4gICAgICAgICAgICBsZXQgaW5jb21wbGV0ZVZhbHVlID0gaW5wdXRWYWx1ZS5zdWJzdHJpbmcoc3RhcnRJbmRleCwgZW5kSW5kZXgpO1xyXG4gICAgICAgICAgICBsZXQgcHJlY3Vyc29yVmFsdWUgPSBpbnB1dFZhbHVlLnN1YnN0cmluZygwLCBzdGFydEluZGV4KTtcclxuICAgICAgICAgICAgbGV0IHBhcnNlZCA9IHRoaXMuc2hlbGwucGFyc2VDb21tYW5kTGluZShwcmVjdXJzb3JWYWx1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZUNvbnRleHQgPSB7XHJcbiAgICAgICAgICAgICAgICB0ZXJtaW5hbDogdGhpcyxcclxuICAgICAgICAgICAgICAgIGluY29tcGxldGVWYWx1ZTogaW5jb21wbGV0ZVZhbHVlLFxyXG4gICAgICAgICAgICAgICAgcHJlY3Vyc29yVmFsdWU6IHByZWN1cnNvclZhbHVlLCAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHBhcnNlZDogcGFyc2VkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgUHJvbWlzZS5hbGwoW3RoaXMuX2F1dG9jb21wbGV0ZVByb3ZpZGVyLmdldE5leHRWYWx1ZShmb3J3YXJkLCB0aGlzLl9hdXRvY29tcGxldGVDb250ZXh0KV0pLnRoZW4oKHZhbHVlcykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB2YWx1ZXNbMF07XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvbXB0Tm9kZS50ZXh0Q29udGVudCA9IHRoaXMuX2F1dG9jb21wbGV0ZUNvbnRleHQucHJlY3Vyc29yVmFsdWUgKyB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHV0aWxzLmN1cnNvclRvRW5kKHRoaXMuX3Byb21wdE5vZGUpO1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuZGlzcGF0Y2hFdmVudCh0aGlzLl9wcm9tcHROb2RlLCAnY2hhbmdlJywgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgX2F1dG9jb21wbGV0ZVJlc2V0KCkge1xyXG4gICAgICAgIHRoaXMuX2F1dG9jb21wbGV0ZUNvbnRleHQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIF9maXhQcm9tcHRJbmRlbnQoKSB7XHJcbiAgICAgICAgbGV0IHByZWZpeFdpZHRoID0gdGhpcy5fcHJlZml4Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuICAgICAgICBsZXQgdGV4dCA9IHRoaXMuX3ByZWZpeE5vZGUudGV4dENvbnRlbnQ7XHJcbiAgICAgICAgbGV0IHNwYWNlUGFkZGluZyA9IHRleHQubGVuZ3RoIC0gdGV4dC50cmltKCkubGVuZ3RoO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuX3ByZWZpeE5vZGUuX3NwYWNlV2lkdGgpIHtcclxuICAgICAgICAgICAgbGV0IGVsZW0xID0gdXRpbHMuY3JlYXRlRWxlbWVudCgnPHNwYW4gc3R5bGU9XCJ2aXNpYmlsaXR5OiBoaWRkZW5cIj58IHw8L3NwYW4+Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUuYXBwZW5kQ2hpbGQoZWxlbTEpO1xyXG4gICAgICAgICAgICBsZXQgZWxlbTIgPSB1dGlscy5jcmVhdGVFbGVtZW50KCc8c3BhbiBzdHlsZT1cInZpc2liaWxpdHk6IGhpZGRlblwiPnx8PC9zcGFuPicpO1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLmFwcGVuZENoaWxkKGVsZW0yKTtcclxuICAgICAgICAgICAgdGhpcy5fcHJlZml4Tm9kZS5fc3BhY2VXaWR0aCA9IGVsZW0xLm9mZnNldFdpZHRoIC0gZWxlbTIub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZWZpeE5vZGUucmVtb3ZlQ2hpbGQoZWxlbTEpO1xyXG4gICAgICAgICAgICB0aGlzLl9wcmVmaXhOb2RlLnJlbW92ZUNoaWxkKGVsZW0yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByZWZpeFdpZHRoICs9IHNwYWNlUGFkZGluZyAqIHRoaXMuX3ByZWZpeE5vZGUuX3NwYWNlV2lkdGg7XHJcblxyXG4gICAgICAgIHRoaXMuX3Byb21wdE5vZGUuc3R5bGUudGV4dEluZGVudCA9IHByZWZpeFdpZHRoICsgJ3B4JztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgVGVybWluYWw7XHJcbiIsIi8vT2JqZWN0XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKG91dCkge1xyXG4gICAgb3V0ID0gb3V0IHx8IHt9O1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHNbaV0pXHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gYXJndW1lbnRzW2ldKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSlcclxuICAgICAgICAgICAgICAgIG91dFtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvdXQ7XHJcbn1cclxuICBcclxuLy9TdHJpbmdcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwYWQodmFsdWUsIGxlbmd0aCwgY2hhcikge1xyXG4gICAgbGV0IHJpZ2h0ID0gbGVuZ3RoID49IDA7XHJcbiAgICBsZW5ndGggPSBNYXRoLmFicyhsZW5ndGgpO1xyXG4gICAgd2hpbGUgKHZhbHVlLmxlbmd0aCA8IGxlbmd0aCkge1xyXG4gICAgICAgIHZhbHVlID0gcmlnaHQgPyB2YWx1ZSArIGNoYXIgOiBjaGFyICsgdmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVIdG1sKHZhbHVlKSB7XHJcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmFsdWUpKTtcclxuICAgIHJldHVybiBkaXYuaW5uZXJIVE1MO1xyXG59XHJcblxyXG4vL0Z1bmN0aW9uXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdW53cmFwKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nID8gdmFsdWUoKSA6IHZhbHVlO1xyXG59XHJcblxyXG4vL1Byb21pc2VcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZlcigpIHtcclxuICAgIGZ1bmN0aW9uIERlZmVycmVkKCkge1xyXG4gICAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcclxuICAgICAgICAgICAgdGhpcy5yZWplY3QgPSByZWplY3Q7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMudGhlbiA9IHRoaXMucHJvbWlzZS50aGVuLmJpbmQodGhpcy5wcm9taXNlKTtcclxuICAgICAgICB0aGlzLmNhdGNoID0gdGhpcy5wcm9taXNlLmNhdGNoLmJpbmQodGhpcy5wcm9taXNlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IERlZmVycmVkKCk7XHJcbn1cclxuXHJcbi8vRE9NXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNFbGVtZW50KG9iaikge1xyXG4gICAgcmV0dXJuIHR5cGVvZiBIVE1MRWxlbWVudCA9PT0gXCJvYmplY3RcIiA/XHJcbiAgICAgICAgb2JqIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgOlxyXG4gICAgICAgIG9iaiAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiAhPT0gbnVsbCAmJiBvYmoubm9kZVR5cGUgPT09IDEgJiYgdHlwZW9mIG9iai5ub2RlTmFtZSA9PT0gXCJzdHJpbmdcIjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoaHRtbCkge1xyXG4gICAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIHdyYXBwZXIuaW5uZXJIVE1MID0gaHRtbDtcclxuICAgIHJldHVybiB3cmFwcGVyLmZpcnN0Q2hpbGQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGVsZW1lbnQsIHR5cGUsIGNhbkJ1YmJsZSwgY2FuY2VsYWJsZSkge1xyXG4gICAgbGV0IGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0hUTUxFdmVudHMnKTtcclxuICAgIGV2ZW50LmluaXRFdmVudCh0eXBlLCBjYW5CdWJibGUsIGNhbmNlbGFibGUpO1xyXG4gICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGJsdXIoZWxlbWVudCA9IG51bGwpIHtcclxuICAgIGlmIChlbGVtZW50ICYmIGVsZW1lbnQgIT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHJldHVybjtcclxuICAgIGxldCB0ZW1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZW1wKTtcclxuICAgIHRlbXAuZm9jdXMoKTtcclxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodGVtcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjdXJzb3JUb0VuZChlbGVtZW50KSB7XHJcbiAgICBsZXQgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xyXG4gICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xyXG4gICAgcmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xyXG4gICAgbGV0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgIHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJzb3JQb3NpdGlvbihlbGVtZW50KSB7XHJcbiAgICBsZXQgcG9zID0gMDtcclxuICAgIGxldCBkb2MgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQgfHwgZWxlbWVudC5kb2N1bWVudDtcclxuICAgIGxldCB3aW4gPSBkb2MuZGVmYXVsdFZpZXcgfHwgZG9jLnBhcmVudFdpbmRvdztcclxuICAgIGxldCBzZWw7XHJcbiAgICBpZiAodHlwZW9mIHdpbi5nZXRTZWxlY3Rpb24gIT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHNlbCA9IHdpbi5nZXRTZWxlY3Rpb24oKTtcclxuICAgICAgICBpZiAoc2VsLnJhbmdlQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCByYW5nZSA9IHdpbi5nZXRTZWxlY3Rpb24oKS5nZXRSYW5nZUF0KDApO1xyXG4gICAgICAgICAgICBsZXQgcHJlQ3Vyc29yUmFuZ2UgPSByYW5nZS5jbG9uZVJhbmdlKCk7XHJcbiAgICAgICAgICAgIHByZUN1cnNvclJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbGVtZW50KTtcclxuICAgICAgICAgICAgcHJlQ3Vyc29yUmFuZ2Uuc2V0RW5kKHJhbmdlLmVuZENvbnRhaW5lciwgcmFuZ2UuZW5kT2Zmc2V0KTtcclxuICAgICAgICAgICAgcG9zID0gcHJlQ3Vyc29yUmFuZ2UudG9TdHJpbmcoKS5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICgoc2VsID0gZG9jLnNlbGVjdGlvbikgJiYgc2VsLnR5cGUgIT0gXCJDb250cm9sXCIpIHtcclxuICAgICAgICBsZXQgdGV4dFJhbmdlID0gc2VsLmNyZWF0ZVJhbmdlKCk7XHJcbiAgICAgICAgbGV0IHByZUN1cnNvclRleHRSYW5nZSA9IGRvYy5ib2R5LmNyZWF0ZVRleHRSYW5nZSgpO1xyXG4gICAgICAgIHByZUN1cnNvclRleHRSYW5nZS5tb3ZlVG9FbGVtZW50VGV4dChlbGVtZW50KTtcclxuICAgICAgICBwcmVDdXJzb3JUZXh0UmFuZ2Uuc2V0RW5kUG9pbnQoXCJFbmRUb0VuZFwiLCB0ZXh0UmFuZ2UpO1xyXG4gICAgICAgIHBvcyA9IHByZUN1cnNvclRleHRSYW5nZS50ZXh0Lmxlbmd0aDtcclxuICAgIH1cclxuICAgIHJldHVybiBwb3M7XHJcbn0iXX0=
