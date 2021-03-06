class HistoryProvider {
    constructor() {
        this.values = [];
        this.index = -1;
        
        this._preexecuteHandler = (command) => {
            this.values.unshift(command);
            this.index = -1;
        };
    }
    
    activate(terminal) { 
        terminal.on('preexecute', this._preexecuteHandler);
    }
    
    deactivate(terminal) {
        terminal.off('preexecute', this._preexecuteHandler);
    }
    
    getNextValue(forward) {
        if (forward && this.index > 0) {
            this.index--;
            return this.values[this.index];
        }
        if (!forward && this.values.length > this.index + 1) {
            this.index++;
            return this.values[this.index];
        }
        return null;
    }
}

export default HistoryProvider;