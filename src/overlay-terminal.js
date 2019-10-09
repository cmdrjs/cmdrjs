import * as utils from './utils.js';
import Terminal from './terminal.js';

const _defaultOptions = {
    autoOpen: false,
    openKey: 192,
    closeKey: 27
};

class OverlayTerminal extends Terminal {
    constructor(options) {
                
        let overlayNode = utils.createElement('<div style="display: none" class="cmdr-overlay"></div>');
        document.body.appendChild(overlayNode);

        options = utils.extend({}, _defaultOptions, options);

        super(overlayNode, options);
        
        this._overlayNode = overlayNode;
        this._documentEventHandler = null;
    }
    
    get isOpen() {
        return this._overlayNode.style.display !== 'none';
    }

    init() {
        if (this.initialized) return;

        this._documentEventHandler = (event) => {
            if (!this.isOpen &&
                ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(event.target.tagName) === -1 &&
                !event.target.isContentEditable &&
                event.keyCode == this.options.openKey) {
                event.preventDefault();
                this.open();
            } else if (this.isOpen && event.keyCode == this.options.closeKey) {
                this.close();
            }
        };

        document.addEventListener('keydown', this._documentEventHandler);

        super.init();

        if (this.options.autoOpen) {
            this.open();
        }
    }

    dispose() {
        if (!this.initialized) return;
    
        super.dispose();
        
        document.removeEventListener('keydown', this._documentEventHandler);    
        document.body.removeChild(this._overlayNode);
    }

    open() {
        this._overlayNode.style.display = '';        
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            this._fixPromptIndent();  //hack: using 'private' method from base class to fix indent
            this.focus();
        }, 0);
    }

    close() {
        this._overlayNode.style.display = 'none';
        document.body.style.overflow = '';
        this.blur();
    }
}

export default OverlayTerminal;