//Object

export function extend(out) {
    out = out || {};

    for (let i = 1; i < arguments.length; i++) {
        if (!arguments[i])
            continue;

        for (let key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key))
                out[key] = arguments[i][key];
        }
    }

    return out;
}
  
//String

export function pad(value, padding, length) {
    let right = length >= 0;
    length = Math.abs(length);
    while (value.length < length) {
        value = right ? value + padding : padding + value;
    }
    return value;
}

export function encodeHtml(value) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(value));
    return div.innerHTML;
}

//Function

export function unwrap(value) {
    return typeof value === 'function' ? value() : value;
}

//Promise

export function defer() {
    function Deferred() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });

        this.then = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise);
    }

    return new Deferred();
}

//DOM

export function isElement(obj) {
    return typeof HTMLElement === "object" ?
        obj instanceof HTMLElement :
        obj && typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string";
}

export function createElement(html) {
    let wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.firstChild;
}

export function dispatchEvent(element, type, canBubble, cancelable) {
    let event = document.createEvent('HTMLEvents');
    event.initEvent(type, canBubble, cancelable);
    element.dispatchEvent(event);
}

export function blur(element = null) {
    if (element && element !== document.activeElement) return;
    let temp = document.createElement("input");
    document.body.appendChild(temp);
    temp.focus();
    document.body.removeChild(temp);
}

export function cursorToEnd(element) {
    let range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    let selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

export function getCursorPosition(element) {
    let pos = 0;
    let doc = element.ownerDocument || element.document;
    let win = doc.defaultView || doc.parentWindow;
    let sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            let range = win.getSelection().getRangeAt(0);
            let preCursorRange = range.cloneRange();
            preCursorRange.selectNodeContents(element);
            preCursorRange.setEnd(range.endContainer, range.endOffset);
            pos = preCursorRange.toString().length;
        }
    } else if ((sel = doc.selection) && sel.type != "Control") {
        let textRange = sel.createRange();
        let preCursorTextRange = doc.body.createTextRange();
        preCursorTextRange.moveToElementText(element);
        preCursorTextRange.setEndPoint("EndToEnd", textRange);
        pos = preCursorTextRange.text.length;
    }
    return pos;
}