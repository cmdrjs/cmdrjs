import * as utils from './utils.js';
import HistoryProvider from './history-provider.js';
import AutocompleteProvider from './autocomplete-provider.js';
import DefinitionProvider from './definition-provider.js';
import CommandHandler from './command-handler.js';
import CommandParser from './command-parser.js';
import CancelToken from './cancel-token.js';

const _defaultOptions = {
    echo: true,
    promptPrefix: '>',
    template: '<div class="cmdr-shell"><div class="output"></div><div class="input"><span class="prefix"></span><div class="prompt" spellcheck="false" contenteditable="true" /></div></div>',
    theme: 'cmd',
    definitionProvider: null,
    historyProvider: null,
    autocompleteProvider: null,
    commandHandler: null,
    commandParser: null,
    plugins: []
};

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
        this._plugins = [];

        this.init();
    }

    get isInitialized() {
        return this._isInitialized;
    }

    get options() {
        return this._options;
    }

    get promptPrefix() {
        return this._promptPrefix;
    }
    set promptPrefix(value) {
        this._promptPrefix = value;
        if (!this._isInputInline) {
            this._prefixNode.textContent = value;
            this._fixPromptIndent();
        }
    }

    get echo() {
        return this._echo;
    }
    set echo(value) {
        this._echo = value;
    }

    get commandHandler() {
        return this._commandHandler;
    }
    
    get commandParser() {
        return this._commandParser;
    }

    get historyProvider() {
        return this._historyProvider;
    }

    get autocompleteProvider() {
        return this._autocompleteProvider;
    }

    get definitionProvider() {
        return this._definitionProvider;
    }

    get plugins() {
        return Object.freeze(this._plugins);
    }

    init() {
        if (this._isInitialized) return;

        this._shellNode = utils.createElement(this._options.template);

        this._shellNode.className += ' cmdr-shell--' + this._options.theme;

        this._containerNode.appendChild(this._shellNode);

        this._outputNode = this._shellNode.querySelector('.output');
        this._inputNode = this._shellNode.querySelector('.input');
        this._prefixNode = this._shellNode.querySelector('.prefix');
        this._promptNode = this._shellNode.querySelector('.prompt');

        this._promptNode.addEventListener('keydown', (event) => {
            if (!this._current) {
                if (event.keyCode !== 9 && !event.shiftKey) {
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
            } else {
                if (event.ctrlKey && event.keyCode === 67) {
                    this.cancel(); 
                } else if (this._current.readLine && event.keyCode === 13) {
                    this._current.readLine.resolve(this._promptNode.textContent); 
                } 
                
                if (!this._current.read && !this._current.readLine) {
                    event.preventDefault();
                    return false;
                }
            }
                        
            return true;
        });

        this._promptNode.addEventListener('keypress', (event) => {
            if (this._current && this._current.read) {
                if (event.charCode !== 0) {
                    this._current.read.resolve(String.fromCharCode(event.charCode));
                }
                event.preventDefault();
                return false;
            }
            return true;
        });

        this._shellNode.addEventListener('click', (event) => {
            if (event.target !== this._inputNode && !this._inputNode.contains(event.target) &&
                event.target !== this._outputNode && !this._outputNode.contains(event.target)) {
                this._promptNode.focus();
            }
        });

        this._promptPrefix = this._options.promptPrefix;

        this._echo = this._options.echo;
        
        this._commandHandler = this.options.commandHandler || new CommandHandler();
        this._commandParser = this.options.commandParser || new CommandParser();

        this._definitionProvider = this._options.definitionProvider || new DefinitionProvider();
        this._definitionProvider.activate(this);

        this._historyProvider = this._options.historyProvider || new HistoryProvider();
        this._historyProvider.activate(this);

        this._autocompleteProvider = this._options.autocompleteProvider || new AutocompleteProvider();
        this._autocompleteProvider.activate(this);

        for (let plugin of this._options.plugins) {
            this._plugins.push(plugin);
            plugin.activate(this);
        }

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
        this._echo = true;
        this._current = null;
        this._queue = [];
        this._promptPrefix = null;
        this._isInputInline = false;
        this._autocompleteContext = null;
        this._eventHandlers = {};

        this._commandHandler = null;
        this._commandParser = null;

        if (this._historyProvider) {
            this._historyProvider.deactivate(this);
            this._historyProvider = null;
        }
        if (this._autocompleteProvider) {
            this._autocompleteProvider.deactivate(this);
            this._autocompleteProvider = null;
        }
        if (this._definitionProvider) {
            this._definitionProvider.deactivate(this);
            this._definitionProvider = null;
        }
        for (let plugin of this._plugins) {
            plugin.deactivate(this);
        }
        this._plugins = [];    

        this._isInitialized = false;
    }

    reset() {
        this.dispose();
        this.init();
    }

    read(callback, intercept) {
        if (!this._current) return;

        this._activateInput(true);
        
        let deferred = utils.defer();

        this._current.read = utils.defer();
        this._current.read.then((value) => {
            this._current.read = null;
            this._deactivateInput();
            if (!intercept) {
                this._prefixNode.textContent += value;
                this._promptNode.textContent = '';
            }
                        
            let result = false;
            try {
                result = callback(value, this._current);
            } catch (error) {
                this.writeLine('Unhandled exception', 'error');
                this.writeLine(error, 'error');
                deferred.reject(error);
            }  
            if (result === true) {
                this.read(callback).then(deferred.resolve, deferred.reject);
            } else {
                this._flushInput();
                deferred.resolve();
            }
            deferred.resolve();
        });
        this._current.read.intercept = intercept;
        
        return deferred;
    }

    readLine(callback) {
        if (!this._current) return;

        this._activateInput(true);
        
        let deferred = utils.defer();

        this._current.readLine = utils.defer();
        this._current.readLine.then((value) => {
            this._current.readLine = null;
            this._promptNode.textContent = value;
            this._deactivateInput();
            this._flushInput();
            let result = false;
            try {
                result = callback(value, this._current);
            } catch (error) {
                this.writeLine('Unhandled exception', 'error');
                this.writeLine(error, 'error');
                deferred.reject(error);
            }  
            if (result === true) {
                this.readLine(callback).then(deferred.resolve, deferred.reject);
            } else {
                deferred.resolve();
            }
        });
        
        return deferred;
    }

    write(value, cssClass) {
        value = utils.encodeHtml(value || '');
        let outputValue = utils.createElement(`<span>${value}</span>`);
        if (cssClass) {
            outputValue.className = cssClass;
        }
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

    writePad(value, length, char = ' ', cssClass = null) {
        this.write(utils.pad(value, length, char), cssClass);
    }

    writeTable(data, columns, showHeaders, cssClass) {
        columns = columns.map((value) => {
            let values = value.split(':');
            return {
                name: values[0],
                padding: values.length > 1 ? values[1] : 10,
                header: values.length > 2 ? values[2] : values[0]
            };
        });
        let writeCell = (value, padding) => {
            value = value || '';
            if (padding === '*') {
                this.write(value, cssClass);
            } else {
                this.writePad(value, parseInt(padding, 10), ' ', cssClass);
            }
        };
        if (showHeaders) {
            for (let col of columns) {
                writeCell(col.header, col.padding);
            }
            this.writeLine();
            for (let col of columns) {
                writeCell(Array(col.header.length + 1).join('-'), col.padding);
            }
            this.writeLine();
        }
        for (let row of data) {
            for (let col of columns) {
                writeCell(row[col.name] ? row[col.name].toString() : '', col.padding);
            }
            this.writeLine();
        }
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

    on(event, handler) {
        if (!this._eventHandlers[event]) {
            this._eventHandlers[event] = [];
        }
        this._eventHandlers[event].push(handler);
    }

    off(event, handler) {
        if (!this._eventHandlers[event]) {
            return;
        }
        let index = this._eventHandlers[event].indexOf(handler);
        if (index > -1) {
            this._eventHandlers[event].splice(index, 1);
        }
    }

    execute(command, ...args) {
        let deferred;
        if (typeof command === 'object') {
            deferred = command.deferred;
            command = command.text;
        }
        else if (typeof command === 'string' && command.length > 0) {
            deferred = utils.defer();
            if (args) {
                command = this._buildCommand(command, args);
            }
        }
        else {
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

        let commandText = command;
        command = command.trim();

        this._trigger('preexecute', command);

        this._promptNode.textContent = commandText;
        this._flushInput(!this._echo);
        this._deactivateInput();

        let cancelToken = new CancelToken();

        this._current = {
            command: command,
            cancelToken: cancelToken
        };

        let complete = () => {
            setTimeout(() => {
                this._current = null;
                if (this._outputNode.children.length > 0) {
                    this.writeLine();
                }
                this._activateInput();
                if (this._queue.length > 0) {
                    this.execute(this._queue.shift());
                }
            }, 0);
        };

        let result;
        try {
            result = this._commandHandler.executeCommand(this, command, cancelToken);
        } catch (error) {
            this.writeLine('Unhandled exception', 'error');
            this.writeLine(error, 'error');
            deferred.reject('Unhandled exception');
            complete();
            return deferred;
        }

        Promise.all([result]).then((values) => {
            this._trigger('execute', {
                command: command
            });
            try {
                deferred.resolve(values[0]);
            } finally {
                complete();
            }
        }, (reason) => {
            this._trigger('execute', {
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

    cancel() {
        if (!this._current) return;
        this._current.cancelToken.cancel();
    }

    _buildCommand(command, args) {
        for (let arg of args) {
            if (typeof arg === 'string' && arg.indexOf(' ') > -1) {
                command += ` "${arg}"`;
            } else {
                command += ' ' + arg.toString();
            }
        }
        return command;
    }

    _activateInput(inline) {
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

    _deactivateInput() {
        this._promptNode.style.textIndent = '';
        this._promptNode.setAttribute('disabled', 'disabled');        
    }

    _flushInput(preventWrite) {
        if (!preventWrite) {
            let outputValue = `${this._prefixNode.innerHTML}${this._promptNode.innerHTML}`;
            if (outputValue) {
                let outputValueNode = utils.createElement(`<div>${outputValue}</div>`);
                this._outputNode.appendChild(outputValueNode);
            }
        }
        this._prefixNode.textContent = '';
        this._promptNode.textContent = '';
    }

    _trigger(event, data) {
        if (!this._eventHandlers[event]) return;
        for (let handler of this._eventHandlers[event]) {
            try {
                handler(data);
            } catch (error) {
                console.error(error);
            }
        }
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
        if (!this._autocompleteContext) {
            let inputValue = this._promptNode.textContent;
            inputValue = inputValue.replace(/\s$/, ' ');
            let cursorPosition = utils.getCursorPosition(this._promptNode);
            let startIndex = inputValue.lastIndexOf(' ', cursorPosition) + 1;
            startIndex = startIndex !== -1 ? startIndex : 0;
            let endIndex = inputValue.indexOf(' ', startIndex);
            endIndex = endIndex !== -1 ? endIndex : inputValue.length;
            let incompleteValue = inputValue.substring(startIndex, endIndex);
            let precursorValue = inputValue.substring(0, startIndex);
            let parsed = this.commandParser.parseCommand(precursorValue);
            this._autocompleteContext = {
                shell: this,
                incompleteValue: incompleteValue,
                precursorValue: precursorValue,                
                parsed: parsed
            };
        }        
        
        Promise.all([this._autocompleteProvider.getNextValue(forward, this._autocompleteContext)]).then((values) => {
            let value = values[0];
            if (value) {
                this._promptNode.textContent = this._autocompleteContext.precursorValue + value;
                utils.cursorToEnd(this._promptNode);
                utils.dispatchEvent(this._promptNode, 'change', true, false);
            }
        });
    }

    _autocompleteReset() {
        this._autocompleteContext = null;
    }

    _fixPromptIndent() {
        let prefixWidth = this._prefixNode.getBoundingClientRect().width;
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

        prefixWidth += spacePadding * this._prefixNode._spaceWidth;

        this._promptNode.style.textIndent = prefixWidth + 'px';
    }
}

export default Shell;
