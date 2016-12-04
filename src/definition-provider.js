import * as utils from './utils.js';
import Definition from './definition.js';

const _defaultOptions = {
    predefined: ['HELP', 'ECHO', 'CLS'],
    allowAbbreviations: true
};

class DefinitionProvider {
    constructor(options) {
        this.options = utils.extend({}, _defaultOptions, options);
        this.definitions = {};

        this.define = (...args) => {
            this.addDefinition(new Definition(...args));
        };

        this._predefine();
    }

    activate(shell) {
        if (typeof shell.define === 'undefined') {
            shell.define = this.define;
        }
    }

    deactivate(shell) {
        if (shell.define === this.define) {
            delete shell.define;
        }
    }

    getDefinitions(name) {
        name = name.toUpperCase();

        let definition = this.definitions[name];

        if (definition) {
            if (definition.available) {
                return [definition];
            }
            return null;
        }

        let definitions = [];

        if (this.options.allowAbbreviations) {
            for (let key in this.definitions) {
                if (key.indexOf(name, 0) === 0 && utils.unwrap(this.definitions[key].available)) {
                    definitions.push(this.definitions[key]);
                }
            }
        }

        return definitions;
    }

    addDefinition(definition) {
        this.definitions[definition.name] = definition;
    }

    _predefine() {
        let provider = this;

        if (this.options.predefined.indexOf('HELP') > -1) {
            this.define({
                name: 'HELP',
                main: function () {
                    this.shell.writeLine('The following commands are available:');
                    this.shell.writeLine();
                    var availableDefinitions = Object.keys(provider.definitions)
                        .map((key) => { return provider.definitions[key]; })
                        .filter((def) => { return def.available; });
                    var length = availableDefinitions.slice().sort(function (a, b) { return b.name.length - a.name.length; })[0].name.length;
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
                main: function () {
                    let toggle = this.argString.toUpperCase();
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
                main: function () {
                    this.shell.clear();
                },
                description: 'Clears the command prompt.'
            });
        }
    }
}

export default DefinitionProvider;