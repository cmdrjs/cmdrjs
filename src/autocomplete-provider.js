class AutocompleteProvider {
    constructor(shell) {
        this.shell = shell;
        this.values = [];
        this.valuesIndex = -1;
    }
    
    dispose() {
    }
    
    cycle(forward) {
        if (!forward && this.valuesIndex > 0) {
            this.valuesIndex--;
            return this.values[this.valuesIndex];
        }
        if (forward && this.values.length > this.valuesIndex + 1) {
            this.valuesIndex++;
            return this.values[this.valuesIndex];
        }
        return null;
    }
}

export default AutocompleteProvider;