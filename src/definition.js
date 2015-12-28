import * as utils from './utils.js';

class Definition {
    constructor(name, callback, options) {
        if (typeof name !== 'string') {
            options = callback;
            callback = name;
            name = null;
        }
        if (typeof callback !== 'function') {
            options = callback;
            callback = null;
        }
        
        this.name = name;
        this.callback = callback;
        this.description = null;
        this.parse = true;
        this.available = true;
        
        utils.extend(this, options);
        
        if (typeof this.name !== 'string')
            throw '"name" must be a string.';
        if (typeof this.callback !== 'function')
            throw '"callback" must be a function.';
            
        this.name = this.name.toUpperCase();
    }
}

export default Definition;