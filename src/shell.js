import * as utils from './utils.js';
import HistoryProvider from './history-provider.js';
import AutocompleteProvider from './autocomplete-provider.js';

const _defaultOptions = {
    autoInit: true,
    echo: true,
    defaultPromptPrefix: '>',
    template: '<div class="cmdr-shell"><div class="output"></div><div class="input"><span class="prefix"></span><div class="prompt" spellcheck="false" contenteditable="true" /></div></div>',
    predefinedCommands: true,
    abbreviatedCommands: true    
};

const _promptIndentPadding = typeof InstallTrigger !== 'undefined'; // Firefox - misplaced cursor when using 'text-indent'

class Shell {
    constructor(containerNode, options) {
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
        this._definitions = {};
        this._current = null;
        this._queue = [];
        this._promptPrefix = null;
        this._isInputInline = false;
        this._autocompleteValue = null;
        this._eventHandlers = {};
        this._isInitialized = false;
        
        this._historyProvider = null;
        this._autocompleteProvider = null;
        
        if (this._options.autoInit) {
            this.init();
        }
    }
    
    get isInitialized() {
        return this._isInitialized;
    }
    
    get options() {
        return this._options;
    }

    get definitions() {
        return this._definitions;
    }
    
    get promptPrefix() {
        return this._promptPrefix;
    }
    set promptPrefix(value) {
        this._promptPrefix = value;
        if (!this._isInputInline) {
            this._prefixNode.textContent = value;
            this._setPromptIndent();
        }
    }
    
    get historyProvider() {
        return this._historyProvider;
    }
    set historyProvider(value) {
        if (this._historyProvider) {
            this._historyProvider.dispose();
        }
        this._historyProvider = value;
    }
    
    get autocompleteProvider() {
        return this._autocompleteProvider;
    }
    set autocompleteProvider(value) {
        if (this._autocompleteProvider) {
            this._autocompleteProvider.dispose();
        }
        this._autocompleteProvider = value;
    }
    
    init() {
        if (this._isInitialized) return;
                
        this._shellNode = utils.createElement(this._options.template);

        this._containerNode.appendChild(this._shellNode);

        this._outputNode = this._shellNode.querySelector('.output');
        this._inputNode = this._shellNode.querySelector('.input');
        this._prefixNode = this._shellNode.querySelector('.prefix');
        this._promptNode = this._shellNode.querySelector('.prompt');

        this._promptNode.addEventListener('keydown', (event) => {
            if (!this._current) {
                if (event.keyCode !== 9) {
                    this._autocompleteReset();
                }                
                switch (event.keyCode) {
                    case 13:
                        let value = this._promptNode.textContent;
                        if (value) {
                            this.execute(value);
                        }
                        event.preventDefault();
                        return false;
                    case 38:
                        this._historyCycle(false);
                        event.preventDefault();
                        return false;
                    case 40:
                        this._historyCycle(true);
                        event.preventDefault();
                        return false;
                    case 9:
                        this._autocompleteCycle(!event.shiftKey);
                        event.preventDefault();
                        return false;
                }
            } else if (this._current.readLine && event.keyCode === 13) {
                this._current.readLine.resolve(this._promptNode.textContent);
                return false;
            }
            return true;
        });

        this._promptNode.addEventListener('keypress', (event) => {
            if (this._current && this._current.read) {
                if (event.charCode !== 0) {
                    this._current.read.char = String.fromCharCode(event.charCode);
                    if (this._current.read.capture) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            return true;
        });

        this._promptNode.addEventListener('keyup', () => {
            if (this._current && this._current.read && this._current.read.char) {
                this._current.read.resolve(this._current.read.char);
            }
        });

        this._promptNode.addEventListener('paste', () => {
            setTimeout(() => {
                let value = this._promptNode.textContent;
                let lines = value.split(/\r\n|\r|\n/g);
                let length = lines.length;
                if (length > 1) {
                    for (let i = 1; i < length; i++) {
                        if (lines[i].length > 0) {
                            this._queue.get(this).push(lines[i]);
                        }
                    }
                    if (this._current && this._current.readLine) {
                        this._current.readLine.resolve(lines[0]);
                    } else if (this._current && this._current.read) {
                        this._current.read.resolve(lines[0][0]);
                    } else {
                        this._current(lines[0]);
                    }
                }
            }, 0);
        });

        if (_promptIndentPadding) {
            this._promptNode.addEventListener('input', () => {
                prompt.css(this._getPromptIndent());
            });
        }

        this._shellNode.addEventListener('click', (event) => {
            if (event.target !== this._inputNode && !this._inputNode.contains(event.target) &&
                event.target !== this._outputNode && !this._outputNode.contains(event.target)) {
                this._promptNode.focus();
            }
        });

        if (this._options.predefinedCommands) {
            this.predefine();
        }
        
        if (!this._historyProvider) {
            this._historyProvider = new HistoryProvider(this);
        }
        if (!this._autocompleteProvider) {
            this._autocompleteProvider = new AutocompleteProvider(this);
        }
        
        this._promptPrefix = this._options.defaultPromptPrefix;

        this._activateInput();
        
        this._isInitialized = true;
    }

    dispose() {
        if (!this._isInitialized) return;
        
        this._containerNode.removeChild(this._shellNode);
        this._shellNode = null;
        this._outputNode = null;
        this._inputNode = null;
        this._prefixNode = null;
        this._promptNode = null;
        this._definitions = {};
        this._current = null;
        this._queue = [];
        this._promptPrefix = null;
        this._isInputInline = false;
        this._eventHandlers = {};
        
        if (this._historyProvider) {
            this._historyProvider.dispose();
            this._historyProvider = null;
        }
        if (this._autocompleteProvider) {
            this._autocompleteProvider.dispose();
            this._autocompleteProvider = null;
        }
        
        this._isInitialized = false;      
    }
        
    reset() {
        this.dispose();
        this.init();
    }

    read(callback, capture) {
        if (!this._current) return;

        this._activateInput(true);

        this._current.read = utils.defer();
        this._current.read.then((value) => {
            this._current.read = null;
            if (!capture) {
                this._promptNode.textContent = value;
            }
            this._deactivateInput();
            if (callback(value, this._current) === true) {
                this.read(callback, capture);
            } else {
                this._flushInput();
            }
        });
        this._current.read.capture = capture;

        if (this._queue.length > 0) {
            this._current.read.resolve(this._queue.shift()[0]);
        }
    }

    readLine(callback) {
        if (!this._current) return;

        this._activateInput(true);

        this._current.readLine = utils.defer();
        this._current.readLine.then((value) => {
            this._current.readLine = null;
            this._promptNode.textContent = value;
            this._deactivateInput();
            this._flushInput();
            if (callback(value, this._current) === true) {
                this.readLine(callback);
            }
        });

        if (this._queue.length > 0) {
            this._current.readLine.resolve(this._queue.shift());
        }
    }

    write(value, cssClass) {
        value = value || '';
        let outputValue = utils.createElement(`<span class="${cssClass}">${value}</span>`);
        if (!this._outputLineNode) {
            this._outputLineNode = utils.createElement('<div></div>');
            this._outputNode.appendChild(this._outputLineNode);
        }
        this._outputLineNode.appendChild(outputValue);
    }

    writeLine(value, cssClass) {
        value = (value || '') + '\n';
        this.write(value, cssClass);
        this._outputLineNode = null;
    }

    writePad(value, padding, length, cssClass) {
        this.write(utils.pad(value, padding, length), cssClass);
    }

    clear() {
        this._outputNode.innerHTML = '';
    }
    
    focus() {
        this._promptNode.focus();
    }
    
    blur() {
        utils.blur(this._promptNode);
    }

    execute(command) {
        if (this._current) {
            this._queue.push(command);
            return;
        }

        if (typeof command !== 'string' || command.length === 0) {
            throw 'Invalid command';
        }
        
        this._trigger('preexecute', command);
        
        this._promptNode.textContent = command;
        this._flushInput(!this._options.echo);
        this._deactivateInput();

        command = command.trim();

        let parsed = this._parseCommand(command);

        let definitions = this._getDefinitions(parsed.name);
        if (!definitions || definitions.length < 1) {
            this.writeLine('Invalid command', 'error');
            this._activateInput();
            return;
        } else if (definitions.length > 1) {
            this.writeLine('Ambiguous command', 'error');
            this.writeLine();
            for (let i = 0; i < definitions.length; i++) {
                this.writePad(definitions[i].name, ' ', 10);
                this.writeLine(definitions[i].description);
            }
            this.writeLine();
            this._activateInput();
            return;
        }

        let definition = definitions[0];

        this._current = {
            command: command,
            definition: definition,
            shell: this
        };
        
        let args = parsed.args;
        if (!definition.parse) {
            args = [parsed.arg];
        }       
        
        this._trigger('executing', this._current);

        let result;
        try {
            result = definition.callback.apply(this._current, args);
        } catch (error) {
            this.writeLine('Unhandled exception. See browser console log for details.', 'error');
            console.error(error);
        }

        Promise.all([result]).then(() => {
            setTimeout(() => {
                this._trigger('execute', this._current);
                this._current = null;
                this._activateInput();
                if (this._queue.length > 0) {
                    this.execute(this._queue.shift());
                }
            }, 0);
        });
    }

    define(names, callback, options) {
        let definitions = this._createDefinitions(names, callback, options);
        for (let i = 0, l = definitions.length; i < l; i++) {
            this._definitions[definitions[i].name] = definitions[i];
        }
    }
    
    predefine() {
        this.define(['HELP', '?'], function () {
            this.shell.writeLine('The following commands are available:');
            this.shell.writeLine();
            for (let key in this.shell.definitions) {
                let definition = this.shell.definitions[key];
                if (!!utils.unwrap(definition.available)) {
                    this.shell.writePad(key, ' ', 10);
                    this.shell.writeLine(definition.description);
                }
            }
            this.shell.writeLine();
        }, {
                description: 'Lists the available commands'
            });

        this.define('ECHO', function (arg) {
            let toggle = arg.toUpperCase();
            if (toggle === 'ON') {
                this.shell.options.echo = true;
            } else if (toggle === 'OFF') {
                this.shell.options.echo = false;
            } else {
                this.shell.writeLine(arg);
            }
        }, {
                parse: false,
                description: 'Displays provided text or toggles command echoing'
            });

        this.define(['CLS'], function () {
            this.shell.clear();
        }, {
                description: 'Clears the command prompt'
            });
    }

    on(event, callback) {
        if (!this._eventHandlers[event]) {
            this._eventHandlers[event] = [];
        }
        this._eventHandlers[event].push(callback);
    }

    off(event, callback) {
        if (!this._eventHandlers[event]) {
            return;
        }
        let index = this._eventHandlers[event].indexOf(callback);
        if (index > -1) {
            this._eventHandlers[event].splice(index, 1);
        }
    }
    
    _trigger(event, data) {
        if (!this._eventHandlers[event]) return;
        for (let callback of this._eventHandlers[event]) {
            callback.call(this, data);
        }
    }

    _activateInput(inline) {
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
        setTimeout(() => {
            this._promptNode.setAttribute('disabled', false);
            this._setPromptIndent();
            this._promptNode.focus();
            utils.smoothScroll(this._shellNode, this._shellNode.scrollHeight, 1000);
        }, 0);
    }

    _deactivateInput() {
        this._promptNode.setAttribute('disabled', true);
        this._inputNode.style.display = 'none';
    }

    _flushInput(preventWrite) {
        if (!preventWrite) {
            this.write(this._prefixNode.textContent);
            this.writeLine(this._promptNode.textContent);
        }
        this._prefixNode.textContent = '';
        this._promptNode.textContent = '';
    }
    
    _historyCycle(forward) {
        Promise.all([this._historyProvider.getNextValue(forward)]).then((values) => {
            let command = values[0];
            if (command) {
                this._promptNode.textContent = command;
                utils.cursorToEnd(this._promptNode);
                utils.dispatchEvent(this._promptNode, 'change', true, false);
            }
        });
    }
    
    _autocompleteCycle(forward) {
        let input = this._promptNode.textContent;
        input = input.replace(/\s$/, ' '); //fixing end whitespace
        let cursorPosition = utils.getCursorPosition(this._promptNode);
        let startIndex = input.lastIndexOf(' ', cursorPosition) + 1;
        startIndex = startIndex !== -1 ? startIndex : 0;
        if (this._autocompleteValue === null) {
            let endIndex = input.indexOf(' ', startIndex);
            endIndex = endIndex !== -1 ? endIndex : input.length;
            this._autocompleteValue = input.substring(startIndex, endIndex);
        }
        Promise.all([this._autocompleteProvider.getNextValue(forward, this._autocompleteValue)]).then((values) => {
            let value = values[0];
            if (value) {
                this._promptNode.textContent = input.substring(0, startIndex) + value;
                utils.cursorToEnd(this._promptNode);
                utils.dispatchEvent(this._promptNode, 'change', true, false);
            }
        });
    }
    
    _autocompleteReset() {
        this._autocompleteValue = null;
    }

    _parseCommand(command) {
        let exp = /[^\s"]+|"([^"]*)"/gi,
            name = null,
            arg = null,
            args = [],
            match = null;

        do {
            match = exp.exec(command);
            if (match !== null) {
                let value = match[1] ? match[1] : match[0];
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

    _createDefinitions(names, callback, options) {
        if (typeof names !== 'string' && !Array.isArray(names)) {
            options = callback;
            callback = names;
            names = null;
        }
        if (typeof callback !== 'function') {
            options = callback;
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

        let definitions = [];

        for (let i = 0, l = names.length; i < l; i++) {
            let definition = {
                name: names[i].toUpperCase(),
                callback: callback,
                parse: true,
                available: true
            };

            utils.extend(definition, options);

            definitions.push(definition);
        }

        return definitions;
    }

    _getDefinitions(name) {
        name = name.toUpperCase();

        let definition = this._definitions[name];

        if (definition) {
            return [definition];
        }
        
        let definitions = [];
        
        if (this._options.abbreviatedCommands)
        {
            for (let key in this._definitions) {
                if (key.indexOf(name, 0) === 0 && utils.unwrap(this._definitions[key].available)) {
                    definitions.push(this._definitions[key]);
                }
            }
        }

        return definitions;
    }

    _getPrefixWidth() {
        let width = this._prefixNode.getBoundingClientRect().width;
        let text = this._prefixNode.textContent;
        let spacePadding = text.length - text.trim().length;

        if (!this._prefixNode._spaceWidth) {
            let elem1 = utils.createElement('<span style="visibility: hidden">| |</span>');
            this._prefixNode.appendChild(elem1);
            let elem2 = utils.createElement('<span style="visibility: hidden">||</span>');
            this._prefixNode.appendChild(elem2);
            this._prefixNode._spaceWidth = elem1.offsetWidth - elem2.offsetWidth;
            this._prefixNode.removeChild(elem1);
            this._prefixNode.removeChild(elem2);
        }

        width += spacePadding * this._prefixNode._spaceWidth;
        return width;
    }

    _setPromptIndent() {
        let prefixWidth = this._getPrefixWidth() + 'px';
        if (_promptIndentPadding) {
            if (this._promptNode.textContent) {
                this._promptNode.style.textIndent = prefixWidth;
                this._promptNode.style.paddingLeft = '';
            } else {
                this._promptNode.style.textIndent = '';
                this._promptNode.style.paddingLeft = prefixWidth;
            }
        }
        else {
            this._promptNode.style.textIndent = prefixWidth;
        }
    }
}

export default Shell;