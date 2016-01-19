class AutocompleteProvider {
    constructor() {
        this.lookups = [];
        
        this._incompleteValue = null;
        this._index = -1;
        this._values = [];
    }
        
    bind(shell) { 
    }
    
    unbind(shell) {
    }
    
    getNextValue(forward, incompleteValue, inputValue) {
        if (incompleteValue !== this._incompleteValue) {
            this._incompleteValue = incompleteValue;
            this._index = -1;            
            this._values = this._lookupValues(inputValue); 
        }
        
        return Promise.all([this._values]).then((values) => {
            values = values[0];
            
            let completeValues = values.filter((value) => {
                return value.toLowerCase().slice(0, incompleteValue.toLowerCase().length) === incompleteValue.toLowerCase();
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
    
    _lookupValues(inputValue) {
        
        function resolveValues(values) {
            if (Array.isArray(values)) {
                return values;
            } 
            if (typeof values === 'function') {
                return values(inputValue);
            }
            return null;
        }
        
        function isMatch(lookup) {
            if (lookup.match instanceof RegExp) {
                return lookup.match.test(inputValue);
            } else if (typeof lookup.match === 'function') {
                return lookup.match(inputValue);
            }
        }
               
        for (let lookup of this.lookups) {
            let results;            
            
            results = resolveValues(lookup);
            if (results) {
                return results;
            }
            
            if (isMatch(lookup)) {
                results = resolveValues(lookup.values);
                if (results) {
                    return results;
                }
            }                       
        }
        return [];
    }    
}

export default AutocompleteProvider;