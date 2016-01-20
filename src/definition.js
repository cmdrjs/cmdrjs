import * as utils from './utils.js';

class Definition {
    constructor(name, main, options) {
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
                this.shell.writeLine(this.definition.description);
            }
            if (this.definition.description && this.definition.usage) {
                this.shell.writeLine();
            }
            if (this.definition.usage) {
                this.shell.writeLine(this.definition.usage);
            }
        };

        utils.extend(this, options);
        
        if (typeof this.name !== 'string')
            throw '"name" must be a string.';
        if (typeof this.main !== 'function')
            throw '"main" must be a function.';

        this.name = this.name.toUpperCase();
        
        if (!this.usage) {
            this.usage = this.name;
        }
    }
}

export default Definition;
