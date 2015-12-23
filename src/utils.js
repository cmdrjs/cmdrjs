export function extend(out) {
    out = out || {};
    for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i];
        if (!obj) continue;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object')
                    extend(out[key], obj[key]);
                else
                    out[key] = obj[key];
            }
        }
    }
    return out;
};

export function createElement(html) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.firstChild;
};

export function pad(value, padding, length) {
    var right = length >= 0;
    length = Math.abs(length);
    while (value.length < length) {
        value = right ? value + padding : padding + value;
    }
    return value;
}

export function unwrap(value) {
    return typeof value === 'function' ? value() : value;
}

export function smoothScroll(element, target, duration) {
    target = Math.round(target);
    duration = Math.round(duration);
    if (duration < 0) {
        return Promise.reject("Invalid duration");
    }
    if (duration === 0) {
        element.scrollTop = target;
        return Promise.resolve();
    }

    var startTime = Date.now();
    var endTime = startTime + duration;

    var startTop = element.scrollTop;
    var distance = target - startTop;

    var smoothStep = function(start, end, point) {
        if(point <= start) { return 0; }
        if(point >= end) { return 1; }
        var x = (point - start) / (end - start);
        return x*x*(3 - 2*x);
    }

    return new Promise(function(resolve, reject) {
        var previousTop = element.scrollTop;

        var scrollFrame = function() {
            if(element.scrollTop != previousTop) {
                reject("interrupted");
                return;
            }

            var now = Date.now();
            var point = smoothStep(startTime, endTime, now);
            var frameTop = Math.round(startTop + (distance * point));
            element.scrollTop = frameTop;

            if(now >= endTime) {
                resolve();
                return;
            }

            if(element.scrollTop === previousTop
                && element.scrollTop !== frameTop) {
                resolve();
                return;
            }
            previousTop = element.scrollTop;

            setTimeout(scrollFrame, 0);
        }

        setTimeout(scrollFrame, 0);
    });
}

export function defer() {
    function Deferred() {
        this.promise = new Promise((function (resolve, reject) {
            this.resolve = resolve;
            this.reject = reject;
        }).bind(this));

        this.then = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise);
    };
    
    return new Deferred();
}