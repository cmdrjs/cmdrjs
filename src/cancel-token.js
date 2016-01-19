class CancelToken {
    constructor() {
        this._isCancelRequested = false;
        this._cancelHandlers = [];
    }

    get isCancelRequested() {
        return this._isCancelRequested;
    }

    cancel() {
        if (!this._isCancelRequested) {
            for (let handler of this._cancelHandlers) {
                try {
                    handler(this);
                } catch (error) {
                    console.error(error);
                }
            }
        }
        this._isCancelRequested = true;
    }
    
    uncancel() {
        this._isCancelRequested = false;
    }

    onCancel(handler) {
        if (this._isCancelRequested) {
            try {
                handler(this);
            } catch (error) {
                console.error(error);
            }
        }
        this._cancelHandlers.push(handler);
    }

    offCancel(handler) {
        let index = this._cancelHandlers.indexOf(handler);
        if (index > -1) {
            this._cancelHandlers.splice(index, 1);
        }
    }
}

export default CancelToken;