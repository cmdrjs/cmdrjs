class HistoryProvider {
    constructor(settings) {
        this.history = [];
        this.historyIndex = -1;
    }
    
    add(command) {
        this.history.unshift(command);
        this.historyIndex = -1;
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