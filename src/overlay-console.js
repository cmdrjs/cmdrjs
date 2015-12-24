import * as utils from './utils.js';
import Console from './console.js';

const _defaultOptions = {
    autoOpen: false,
    openKey: 192,
    closeKey: 27
};

let _instance = null;

class OverlayConsole extends Console {
    constructor(options) {
        
        var overlayNode;
        if (_instance) {
            overlayNode = _instance._overlayNode;
            _instance.dispose();
        }
        
        if (!overlayNode) {
            overlayNode = utils.createElement('<div style="display: none" class="cmdr-overlay"></div>');
            document.body.appendChild(overlayNode);
        }

        options = utils.extend({}, _defaultOptions, options);

        super(overlayNode, options);
        
        this._overlayNode = overlayNode;
        this._documentEventHandler = null;
        
        _instance = this;
    }

    init() {
        if (this.initialized) return;

        this._documentEventHandler = (event) => {
            if (!this.isOpen() &&
                ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(event.target.tagName) === -1 &&
                !event.target.isContentEditable &&
                event.keyCode == this.options.openKey) {
                event.preventDefault();
                this.open();
            } else if (this.isOpen() && event.keyCode == this.options.closeKey) {
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

        document.removeEventListener('keydown', this._documentEventHandler);

        this.close();

        super.dispose();
    }

    isOpen() {
        return this._overlayNode.style.display !== 'none';
    }

    open() {
        this._overlayNode.style.display = '';

        setTimeout(() => {
            this._setPromptIndent();  //hack: using 'private' method from base class to fix indent
            this.focus();
        }, 0);
    }

    close() {
        this._overlayNode.style.display = 'none';
        this.blur();
    }

    predefine() {
        super.predefine();

        this.define(['CLOSE', 'EXIT'], function () {
            this.console.close();
        }, {
                description: 'Closes the command prompt'
            });
    }
}

export default OverlayConsole;