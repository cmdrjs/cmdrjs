class AutocompleteProvider {
    constructor() {
        this.lookups = [];
        
        this._context = null;
        this._index = -1;
        this._values = [];
        
        this._predefineLookups();
    }
        
    bind(shell) { 
    }
    
    unbind(shell) {
    }
    
    getNextValue(forward, context) {
        if (context !== this._context) {
            this._context = context;
            this._index = -1;            
            this._values = this._lookupValues(context); 
        }
        
        return Promise.all([this._values]).then((values) => {
            values = values[0];
            
            let completeValues = values.filter((value) => {
                return context.incompleteValue === '' ||
                       value.toLowerCase().slice(0, context.incompleteValue.toLowerCase().length) === context.incompleteValue.toLowerCase();
            });
            
            if (completeValues.length === 0) {
                return null;
            }
            
            if (this._index >= completeValues.length) {
                this._index = -1;
            }
                    
            if (forward && this._index < completeValues.length - 1) {
                this._index++;
            }
            else if (forward && this._index >= completeValues.length - 1) {
                this._index = 0;
            }
            else if (!forward && this._index > 0) {
                this._index--;
            }
            else if (!forward && this._index <= 0) {
                this._index = completeValues.length - 1;
            }
            
            return completeValues[this._index];
        });  
    }
    
    _lookupValues(context) {
        
        function resolveValues(values) {
            if (Array.isArray(values)) {
                return values;
            } 
            if (typeof values === 'function') {
                return values(context);
            }
            return null;
        }
               
        for (let lookup of this.lookups) {
            let results;            
            
            results = resolveValues(lookup);
            if (results) {
                return results;
            }                       
        }
        return [];
    }
    
    _predefineLookups() {
        
        function commandNameLookup(context) {            
            if (context.precursorValue.trim() !== '') {
                return null;
            }
            
            return Object.keys(context.shell.definitionProvider.definitions);
        }
        
        this.lookups.push(commandNameLookup);        
    }
}

export default AutocompleteProvider;