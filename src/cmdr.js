import promise from 'es6-promise';
promise.polyfill();

export { default as Console } from './console.js';

import OverlayConsole from './overlay-console.js';
var _overlayConsole = null;
export function overlay(settings) {
    if (_overlayConsole) {
        _overlayConsole.dispose();
    }
    _overlayConsole = new OverlayConsole(settings);
    return _overlayConsole;
}

export const version = '1.1.0-alpha';