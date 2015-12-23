import * as utils from './utils.js';

const _defaultSettings = {
    echo: true,
    promptPrefix: '> ',
    template: '<div class="cmdr-console"><div class="output"></div><div class="input"><span class="prefix"></span><div class="prompt" spellcheck="false" contenteditable="true" /></div></div>',
    basicCommands: true
};

const _promptIndentPadding = typeof InstallTrigger !== 'undefined'; // Firefox - misplaced cursor when using 'text-indent'

class _Console {
    constructor(instance, containerNode, settings) {
        this.instance = instance;
        this.containerNode = containerNode;
        this.settings = utils.extend({}, _defaultSettings, settings);
        this.consoleNode = null;
        this.inputNode = null;
        this.prefixNode = null;
        this.promptNode = null;
        this.outputNode = null;
        this.outputLineNode = null;
        this.definitions = {};
        this.current = null;
        this.queue = [];
        this.history = [];
        this.historyIndex = -1;

        this.init();
    }

    init() {
        this.consoleNode = utils.createElement(this.settings.template);

        this.containerNode.appendChild(this.consoleNode);

        this.outputNode = this.consoleNode.querySelector('.output');
        this.inputNode = this.consoleNode.querySelector('.input');
        this.prefixNode = this.consoleNode.querySelector('.prefix');
        this.promptNode = this.consoleNode.querySelector('.prompt');

        this.promptNode.addEventListener('keydown', (function (event) {
            if (!this.current) {
                switch (event.keyCode) {
                    case 13:
                        var value = this.promptNode.textContent;
                        if (value) {
                            this.execute(value);
                        }
                        event.preventDefault();
                        return false;
                    case 38:
                        this.historyBack();
                        event.preventDefault();
                        return false;
                    case 40:
                        this.historyForward();
                        event.preventDefault();
                        return false;
                    case 9:
                        event.preventDefault();
                        return false;
                }
            } else if (this.current.readLine && event.keyCode === 13) {
                this.current.readLine.resolve(this.promptNode.textContent);
                return false;
            }
            return true;
        }).bind(this));

        this.promptNode.addEventListener('keypress', (function (event) {
            if (this.current && this.current.read) {
                if (event.charCode !== 0) {
                    this.current.read.char = String.fromCharCode(event.charCode);
                    if (this.current.read.capture) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            return true;
        }).bind(this));

        this.promptNode.addEventListener('keyup', (function () {
            if (this.current && this.current.read && this.current.read.char) {
                this.current.read.resolve(this.current.read.char);
            }
        }).bind(this));

        this.promptNode.addEventListener('paste', (function () {
            setTimeout((function () {
                var value = this.promptNode.textContent;
                var lines = value.split(/\r\n|\r|\n/g);
                var length = lines.length;
                if (length > 1) {
                    for (var i = 1; i < length; i++) {
                        if (lines[i].length > 0) {
                            this.queue.get(this).push(lines[i]);
                        }
                    }
                    if (this.current && this.current.readLine) {
                        this.current.readLine.resolve(lines[0]);
                    } else if (this.current && this.current.read) {
                        this.current.read.resolve(lines[0][0]);
                    } else {
                        this.current(lines[0]);
                    }
                }
            }).bind(this), 0);
        }).bind(this));

        if (_promptIndentPadding) {
            this.promptNode.addEventListener('input', (function () {
                prompt.css(this.getPromptIndent());
            }).bind(this));
        }

        this.consoleNode.addEventListener('click', (function (event) {
            if (event.target !== this.inputNode && !this.inputNode.contains(event.target) &&
                event.target !== this.outputNode && !this.outputNode.contains(event.target)) {
                this.promptNode.focus();
            }
        }).bind(this));

        if (this.settings.basicCommands) {
            this.defineBasic();
        }

        this.activateInput();
    }

    dispose() {
        this.containerNode.removeChild(this.consoleNode);
        this.consoleNode = null;
        this.outputNode = null;
        this.inputNode = null;
        this.prefixNode = null;
        this.promptNode = null;
        this.definitions = {};
        this.current = null;
        this.queue = [];
        this.history = [];
        this.historyIndex = -1;
    }

    read(callback, capture) {
        if (!this.current) return;

        this.activateInput(true);

        this.current.read = utils.defer();
        this.current.read.then((function (value) {
            this.current.read = null;
            if (!capture) {
                this.promptNode.textContent = value;
            }
            this.deactivateInput();
            if (callback.call(this.current, value) === true) {
                this.read(callback, capture);
            } else {
                this.flushInput();
            }
        }).bind(this));
        this.current.read.capture = capture;

        if (this.queue.length > 0) {
            this.current.read.resolve(this.queue.shift()[0]);
        }
    }

    readLine(callback) {
        if (!this.current) return;

        this.activateInput(true);

        this.current.readLine = utils.defer();
        this.current.readLine.then((function (value) {
            this.current.readLine = null;
            this.promptNode.textContent = value;
            this.deactivateInput();
            this.flushInput();
            if (callback.call(this.current, value) === true) {
                this.readLine(callback);
            }
        }).bind(this));

        if (this.queue.length > 0) {
            this.current.readLine.resolve(this.queue.shift());
        }
    }

    write(value, cssClass) {
        value = value || '';
        var outputValue = utils.createElement(`<span class="${cssClass}">${value}</span>`);
        if (!this.outputLineNode) {
            this.outputLineNode = utils.createElement('<div></div>');
            this.outputNode.appendChild(this.outputLineNode);
        }
        this.outputLineNode.appendChild(outputValue);
    }

    writeLine(value, cssClass) {
        value = (value || '') + '\n';
        this.write(value, cssClass);
        this.outputLineNode = null;
    }

    writePad(value, padding, length, cssClass) {
        this.write(utils.pad(value, padding, length), cssClass);
    }

    clear() {
        this.outputNode.innerHTML = '';
    }

    execute(command) {
        if (this.current) {
            this.queue.push(command);
            return;
        }

        if (typeof command !== 'string' || command.length === 0) {
            throw 'Invalid command';
        }

        this.promptNode.textContent = command;
        this.flushInput(!this.settings.echo);
        this.historyAdd(command);
        this.deactivateInput();

        command = command.trim();

        var parsed = this.parseCommand(command);

        var definitions = this.getDefinitions(parsed.name);
        if (!definitions || definitions.length < 1) {
            this.writeLine('Invalid command', 'error');
            this.activateInput();
            return;
        } else if (definitions.length > 1) {
            this.writeLine('Ambiguous command', 'error');
            this.writeLine();
            for (var i = 0; i < definitions.length; i++) {
                this.writePad(definitions[i].name, ' ', 10);
                this.writeLine(definitions[i].description);
            }
            this.writeLine();
            this.activateInput();
            return;
        }

        var definition = definitions[0];

        this.current = {
            command: command,
            definition: definition,
            console: this.instance
        };

        var args = parsed.args;
        if (!definition.parse) {
            args = [parsed.arg];
        }

        var result;
        try {
            result = definition.callback.apply(this.current, args);
        } catch (error) {
            this.writeLine('Unhandled exception. See consoleNode log for details.', 'error');
            console.error(error);
        }

        Promise.all([result]).then((function () {
            setTimeout((function () {
                this.current = null;
                this.activateInput();
                if (this.queue.length > 0) {
                    this.execute(this.queue.shift());
                }
            }).bind(this), 0);
        }).bind(this));
    }

    define(names, callback, settings) {
        var definitions = this.createDefinitions(names, callback, settings);
        for (var i = 0, l = definitions.length; i < l; i++) {
            this.definitions[definitions[i].name] = definitions[i];
        }
    }

    activateInput(inline) {
        if (inline) {
            if (this.outputLineNode) {
                this.prefixNode.textContent = this.outputLineNode.textContent;
                this.outputNode.removeChild(this.outputLineNode);
                this.outputLineNode = null;
            }
        } else {
            this.prefixNode.textContent = this.settings.promptPrefix;
        }
        this.inputNode.style.display = '';
        setTimeout((function () {
            this.promptNode.setAttribute('disabled', false);
            this.setPromptIndent();
            this.promptNode.focus();
            utils.smoothScroll(this.consoleNode, this.consoleNode.scrollHeight, 1000);
        }).bind(this), 0);
    }

    deactivateInput() {
        this.promptNode.setAttribute('disabled', true);
        this.inputNode.style.display = 'none';
    }

    flushInput(preventWrite) {
        if (!preventWrite) {
            this.write(this.prefixNode.textContent);
            this.writeLine(this.promptNode.textContent);
        }
        this.prefixNode.textContent = '';
        this.promptNode.textContent = '';
    }

    historyAdd(command) {
        this.history.unshift(command);
        this.historyIndex = -1;
    }

    historyBack() {
        if (this.history.length > this.historyIndex + 1) {
            this.historyIndex++;
            this.promptNode.textContent = history[this.historyIndex];
            var event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, false);
            this.promptNode.dispatchEvent(event);
        }
    }

    historyForward() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.promptNode.textContent = history[this.historyIndex];
            var event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, false);
            this.promptNode.dispatchEvent(event);
        }
    }

    parseCommand(command) {
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

    createDefinitions(names, callback, settings) {
        if (typeof names !== 'string' && !Array.isArray(names)) {
            settings = callback;
            callback = names;
            names = null;
        }
        if (typeof callback !== 'function') {
            settings = callback;
            callback = null;
        }

        if (typeof names === 'string') {
            names = [names];
        } else if (Array.isArray(names)) {
            names = names.filter(function (value) {
                return typeof value === 'string';
            });
        }

        if (!Array.isArray(names) ||
            names.length === 0 ||
            typeof callback !== 'function') {
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

            utils.extend(definition, settings);

            definitions.push(definition);
        }

        return definitions;
    }

    getDefinitions(name) {
        name = name.toUpperCase();

        var definition = this.definitions[name];

        if (definition) {
            return [definition];
        }

        var definitions = [];

        for (var key in this.definitions) {
            if (key.indexOf(name, 0) === 0 && utils.unwrap(this.definitions[key].available)) {
                definitions.push(this.definitions[key]);
            }
        }

        return definitions;
    }

    getPrefixWidth() {
        var width = this.prefixNode.getBoundingClientRect().width;
        var text = this.prefixNode.textContent;
        var spacePadding = text.length - text.trim().length;

        if (!this.prefixNode._spaceWidth) {
            var elem1 = utils.createElement('<span style="visibility: hidden">| |</span>');
            this.prefixNode.appendChild(elem1);
            var elem2 = utils.createElement('<span style="visibility: hidden">||</span>')
            this.prefixNode.appendChild(elem2);
            this.prefixNode._spaceWidth = elem1.offsetWidth - elem2.offsetWidth;
            this.prefixNode.removeChild(elem1);
            this.prefixNode.removeChild(elem2);
        }

        width += spacePadding * this.prefixNode._spaceWidth;
        return width;
    }

    setPromptIndent() {
        var prefixWidth = this.getPrefixWidth() + 'px';
        if (_promptIndentPadding) {
            if (this.promptNode.textContent) {
                this.promptNode.style.textIndent = prefixWidth;
                this.promptNode.style.paddingLeft = '';
            } else {
                this.promptNode.style.textIndent = '';
                this.promptNode.style.paddingLeft = prefixWidth;
            }
        }
        else {
            this.promptNode.style.textIndent = prefixWidth;
        }
    }

    defineBasic() {
        this.define(['HELP', '?'], function () {
            this.console.writeLine('The following commands are available:');
            this.console.writeLine();
            for (var key in this.console.definitions) {
                var definition = this.console.definitions[key];
                if (!!utils.unwrap(definition.available)) {
                    this.console.writePad(key, ' ', 10);
                    this.console.writeLine(definition.description);
                }
            }
            this.console.writeLine();
        }, {
                description: 'Lists the available commands'
            });

        this.define('ECHO', function (arg) {
            var toggle = arg.toUpperCase();
            if (toggle === 'ON') {
                this.console.settings.echo = true;
            } else if (toggle === 'OFF') {
                this.console.settings.echo = false;
            } else {
                this.console.writeLine(arg);
            }
        }, {
                parse: false,
                description: 'Displays provided text or toggles command echoing'
            });

        this.define(['CLS'], function () {
            this.console.clear();
        }, {
                description: 'Clears the command prompt'
            });
    }
}

const _console = new WeakMap();

class Console {
    constructor(containerNode, settings) {
        _console.set(this, new _Console(this, containerNode, settings));
    }

    get settings() {
        return _console.get(this).settings;
    }

    get definitions() {
        return _console.get(this).definitions;
    }

    dispose() {
        _console.get(this).dispose();
    }

    reset() {
        _console.get(this).dispose();
        _console.get(this).init();
    }

    read(callback, capture) {
        _console.get(this).read(callback, capture);
    }

    readLine(callback) {
        _console.get(this).readLine(callback);
    }

    write(value, cssClass) {
        _console.get(this).write(value, cssClass);
    }

    writeLine(value, cssClass) {
        _console.get(this).writeLine(value, cssClass);
    }

    writePad(value, padding, length, cssClass) {
        _console.get(this).writePad(value, padding, length, cssClass);
    }

    clear() {
        _console.get(this).clear();
    }

    execute(command) {
        _console.get(this).execute(command);
    }

    define(names, callback, settings) {
        _console.get(this).define(names, callback, settings);
    }
}

export default Console;