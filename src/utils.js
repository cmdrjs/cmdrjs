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

//Array

export function arrayFrom(arrayLike/*, mapFn, thisArg */) {

    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
        return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
        var number = Number(value);
        if (isNaN(number)) { return 0; }
        if (number === 0 || !isFinite(number)) { return number; }
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
        var len = toInteger(value);
        return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    var C = this;

    var items = Object(arrayLike);

    if (arrayLike == null) {
        throw new TypeError('arrayFrom requires an array-like object - not null or undefined');
    }

    var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
    var T;
    if (typeof mapFn !== 'undefined') {

        if (!isCallable(mapFn)) {
            throw new TypeError('arrayFrom: when provided, the second argument must be a function');
        }


        if (arguments.length > 2) {
            T = arguments[2];
        }
    }

    var len = toLength(items.length);

    var A = isCallable(C) ? Object(new C(len)) : new Array(len);

    var k = 0;

    var kValue;
    while (k < len) {
        kValue = items[k];
        if (mapFn) {
            A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
            A[k] = kValue;
        }
        k += 1;
    }

    A.length = len;

    return A;
}

//String

export function pad(value, length, char) {
    let right = length >= 0;
    length = Math.abs(length);
    while (value.length < length) {
        value = right ? value + char : char + value;
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