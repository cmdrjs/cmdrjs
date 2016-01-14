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
        this.available = true;
        
        utils.extend(this, options);
        
        if (typeof this.name !== 'string')
            throw '"name" must be a string.';
        if (typeof this.main !== 'function')
            throw '"main" must be a function.';
            
        this.name = this.name.toUpperCase();
    }
}

export default Definition;
