import * as utils from './utils.js';
import Definition from './definition.js';

const _defaultOptions = {
    predefined: ['HELP', 'ECHO', 'CLS'],
    allowAbbreviations: true    
};

class DefinitionProvider {
    constructor(options) { 
        this.options = utils.extend({}, _defaultOptions, options);
        this.shell = null;
        this.definitions = {};
        
        this._predefine();
    }
    
    attach(shell) { 
    }
    
    detach(shell) {
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
    
    addDefinition(definition) {
        this.definitions[definition.name] = definition;
    }
        
    _predefine() {        
        let provider = this;
        
        if (this.options.predefined.indexOf('HELP') > -1) {
            this.addDefinition(new Definition('HELP', function () {
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
                }));
        }

        if (this.options.predefined.indexOf('ECHO') > -1) {
            this.addDefinition(new Definition('ECHO', function (arg) {
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
                }));
        }
                
        if (this.options.predefined.indexOf('CLS') > -1) {
            this.addDefinition(new Definition('CLS', function () {
                this.shell.clear();
            }, {
                    description: 'Clears the command prompt'
                }));
        }    
    }
}

export default DefinitionProvider;