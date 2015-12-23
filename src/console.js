import * as utils from './utils.js';

const _defaultSettings = {
    echo: true,
    promptPrefix: '> ',
    template: '<div class="cmdr-console"><div class="output"></div><div class="input"><span class="prefix"></span><div class="prompt" spellcheck="false" contenteditable="true" /></div></div>'
};

const _promptIndentPadding = typeof InstallTrigger !== 'undefined'; // Firefox - misplaced cursor when using 'text-indent'

class _Console {
    constructor(container, settings) {
        this.container = container;
        this.settings = utils.extend({}, _defaultSettings, settings);
        this.console = null;
        this.input = null;
        this.prefix = null;
        this.prompt = null;
        this.output = null;
        this.outputLine = null;
        this.definitions = {};
        this.current = null;
        this.queue = [],
        this.history = [],
        this.historyIndex = -1,

        this.init();
    }

    init() {
        this.console = utils.createElement(this.settings.template);

        this.container.appendChild(this.console);

        this.output = this.console.querySelector('.output');
        this.input = this.console.querySelector('.input');
        this.prefix = this.console.querySelector('.prefix');
        this.prompt = this.console.querySelector('.prompt');

        this.prompt.addEventListener('keydown', (function (event) {
            if (!this.current) {
                switch (event.keyCode) {
                    case 13:
                        var value = this.prompt.textContent;
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
                this.current.readLine.resolve(this.prompt.textContent);
                return false;
            }
            return true;
        }).bind(this));

        this.prompt.addEventListener('keypress', (function (event) {
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

        this.prompt.addEventListener('keyup', (function () {
            if (this.current && this.current.read && this.current.read.char) {
                this.current.read.resolve(this.current.read.char);
            }
        }).bind(this));

        this.prompt.addEventListener('paste', (function () {
            setTimeout((function () {
                var value = this.prompt.textContent;
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
            this.prompt.addEventListener('input', (function () {
                prompt.css(this.getPromptIndent());
            }).bind(this));
        }

        this.console.addEventListener('click', (function (event) {
            if (event.target !== this.input && !this.input.contains(event.target) &&
                event.target !== this.output && !this.output.contains(event.target)) {
                this.prompt.focus();
            }
        }).bind(this));
        
        this.activateInput();
    }

    dispose() {
        this.container.removeChild(this.console);
        this.console = null;
        this.output = null;
        this.input = null;
        this.prefix = null;
        this.prompt = null;
    }

    read(callback, capture) {
        if (!this.current) return;

        this.activateInput(true);

        this.current.read = utils.defer();        
        this.current.read.then((function (value) {
            this.current.read = null;
            if (!capture) {
                this.prompt.textContent = value;
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
            this.prompt.textContent = value;
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
        if (!this.outputLine) {
            this.outputLine = utils.createElement('<div></div>');
            this.output.appendChild(this.outputLine);
        }
        this.outputLine.appendChild(outputValue);
    }

    writeLine(value, cssClass) {
        value = (value || '') + '\n';
        this.write(value, cssClass);
        this.outputLine = null;
    }

    writePad(value, padding, length, cssClass) {
        this.write(utils.pad(value, padding, length), cssClass);
    }

    clear() {
        this.output.innerHTML = '';
    }

    execute(command) {
        if (this.current) {
            this.queue.push(command);
            return;
        }

        if (typeof command !== 'string' || command.length === 0) {
            throw 'Invalid command';
        }

        this.prompt.textContent = command;
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
            definition: definition
        };

        var args = parsed.args;
        if (!definition.parse) {
            args = [parsed.arg];
        }

        var result;
        try {
            result = definition.callback.apply(this.current, args);
        } catch (error) {
            this.writeLine('Unhandled exception. See console log for details.', 'error');
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
            if (this.outputLine) {
                this.prefix.textContent = this.outputLine.textContent;
                this.output.removeChild(this.outputLine);
                this.outputLine = null;
            }
        } else {
            this.prefix.textContent = this.settings.promptPrefix;
        }
        this.input.style.display = '';
        setTimeout((function () {
            this.prompt.setAttribute('disabled', false);            
            this.setPromptIndent();            
            this.prompt.focus();
            utils.smoothScroll(this.console, this.console.scrollHeight, 1000);
        }).bind(this), 0);
    }

    deactivateInput() {
        this.prompt.setAttribute('disabled', true);
        this.input.style.display = 'none';
    }

    flushInput(preventWrite) {
        if (!preventWrite) {
            this.write(this.prefix.textContent);
            this.writeLine(this.prompt.textContent);
        }
        this.prefix.textContent = '';
        this.prompt.textContent = '';
    }

    historyAdd(command) {
        this.history.unshift(command);
        this.historyIndex = -1;
    }

    historyBack() { 
        if (this.history.length > this.historyIndex + 1) {
            this.historyIndex++;
            this.prompt.textContent = history[this.historyIndex];
            var event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, false);
            this.prompt.dispatchEvent(event);
        }
    }

    historyForward() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.prompt.textContent = history[this.historyIndex];
            var event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, false);
            this.prompt.dispatchEvent(event);
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
        var width = this.prefix.getBoundingClientRect().width;
        var text = this.prefix.textContent;
        var spacePadding = text.length - text.trim().length;
        
        if (!this.prefix._spaceWidth) {
            var elem1 = utils.createElement('<span style="visibility: hidden">| |</span>');
            this.prefix.appendChild(elem1);
            var elem2 = utils.createElement('<span style="visibility: hidden">||</span>')
            this.prefix.appendChild(elem2);
            this.prefix._spaceWidth = elem1.offsetWidth - elem2.offsetWidth;
            this.prefix.removeChild(elem1);
            this.prefix.removeChild(elem2);
        }
        
        width += spacePadding * this.prefix._spaceWidth;
        return width;
    }

    setPromptIndent() {
        var prefixWidth = this.getPrefixWidth() + 'px';
        if (_promptIndentPadding) {
            if (this.prompt.textContent) {
                this.prompt.style.textIndent = prefixWidth;
                this.prompt.style.paddingLeft = '';
            } else {
                this.prompt.style.textIndent = '';
                this.prompt.style.paddingLeft = prefixWidth;
            }
        }
        else {
            this.prompt.style.textIndent = prefixWidth;
        }
    }
}

const _console = new WeakMap();

class Console {
    constructor(container, settings) {
        _console.set(this, new _Console(container, settings));
    }

    dispose() {
        _console.get(this).dispose();
    }
}

export default Console;