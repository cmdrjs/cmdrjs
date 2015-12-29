class AutocompleteProvider {
    constructor(shell) {
        this.shell = null;
        this.values = [];
        this.index = -1;
        this.incompleteValue = null;
    }
    
    init(shell) {
        this.shell = shell;
    }
    
    dispose() {
        this.shell = null;
        this.values = [];
        this.index = -1;
        this.incompleteValue = null;
    }
    
    getNextValue(forward, incompleteValue) {
        if (incompleteValue !== this.incompleteValue) {
            this.index = -1;
        }
        this.incompleteValue = incompleteValue;
        
        let completeValues = this.values.filter((value) => {
            return value.toLowerCase().slice(0, incompleteValue.toLowerCase()) === incompleteValue.toLowerCase();
        });
        
        if (completeValues.length === 0) {
            return null;
        }
        
        if (this.index >= completeValues.length) {
            this.index = -1;
        }
                
        if (forward && this.index < completeValues.length - 1) {
            this.index++;
        }
        else if (forward && this.index >= completeValues.length - 1) {
            this.index = 0;
        }
        else if (!forward && this.index > 0) {
            this.index--;
        }
        else if (!forward && this.index <= 0) {
            this.index = completeValues.length - 1;
        }
        
        return completeValues[this.index];
    }
}

export default AutocompleteProvider;