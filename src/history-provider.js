class HistoryProvider {
    constructor(shell) {
        this.shell = shell;
        this.history = [];
        this.historyIndex = -1;
        
        this._preexecuteHandler = (command) => {
            this.history.unshift(command);
            this.historyIndex = -1;
        }
        this.shell.on('preexecute', this._preexecuteHandler);
    }
    
    dispose() {
        this.clear();
        this.shell.off('preexecute', this._preexecuteHandler);
    }
    
    cycle(forward) {
        if (forward && this.historyIndex > 0) {
            this.historyIndex--;
            return this.history[this.historyIndex];
        }
        if (!forward && this.history.length > this.historyIndex + 1) {
            this.historyIndex++;
            return this.history[this.historyIndex];
        }
        return null;
    }
    
    clear() {
        this.history = [];
        this.historyIndex = -1;  
    }
}

export default HistoryProvider;