import * as utils from './utils.js';

const _defaultOptions = {
    predefined: ['HELP', 'ECHO', 'CLS'],
    allowAbbreviations: true    
};

class DefinitionProvider {
    constructor(shell, options = {}) {
        this.shell = shell;        
        this.options = utils.extend({}, _defaultOptions, options);
        this.definitions = {};
        
        this._predefine();
    }
    
    dispose() {
        this.definitions = {};
    }
    
    getDefinitions(name) {
        name = name.toUpperCase();

        let definition = this.definitions[name];

        if (definition) {
            return [definition];
        }
        
        let definitions = [];
        
        if (this.options.allowAbbreviations)
        {
            for (let key in this.definitions) {
                if (key.indexOf(name, 0) === 0 && utils.unwrap(this.definitions[key].available)) {
                    definitions.push(this.definitions[key]);
                }
            }
        }

        return definitions;
    }
    
    define(names, callback, options) {
        let definitions = this._createDefinitions(names, callback, options);
        for (let i = 0, l = definitions.length; i < l; i++) {
            this.definitions[definitions[i].name] = definitions[i];
        }
    }
    
    _predefine() {
        let provider = this;
        
        if (this.options.predefined.indexOf('HELP') > -1) {
            this.define(['HELP'], function () {
                this.shell.writeLine('The following commands are available:');
                this.shell.writeLine();
                for (let key in provider.definitions) {
                    let definition = provider.definitions[key];
                    if (!!utils.unwrap(definition.available)) {
                        this.shell.writePad(key, ' ', 10);
                        this.shell.writeLine(definition.description);
                    }
                }
                this.shell.writeLine();
            }, {
                    description: 'Lists the available commands'
                });
        }

        if (this.options.predefined.indexOf('ECHO') > -1) {
            this.define('ECHO', function (arg) {
                let toggle = arg.toUpperCase();
                if (toggle === 'ON') {
                    this.shell.echo = true;
                } else if (toggle === 'OFF') {
                    this.shell.echo = false;
                } else {
                    this.shell.writeLine(arg);
                }
            }, {
                    parse: false,
                    description: 'Displays provided text or toggles command echoing'
                });
        }
        
        
        if (this.options.predefined.indexOf('CLS') > -1) {
            this.define(['CLS'], function () {
                this.shell.clear();
            }, {
                    description: 'Clears the command prompt'
                });
        }
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
}

export default DefinitionProvider;