class HistoryProvider {
    constructor(shell) {
        this.shell = shell;
        this.values = [];
        this.index = -1;
        
        this._preexecuteHandler = (command) => {
            this.values.unshift(command);
            this.index = -1;
        };
        this.shell.on('preexecute', this._preexecuteHandler);
    }
    
    dispose() {
        this.values = [];
        this.index = -1;
        this.shell.off('preexecute', this._preexecuteHandler);
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