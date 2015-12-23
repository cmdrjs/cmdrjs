import promise from 'es6-promise';
promise.polyfill();

export { default as Console } from './console.js';
export { default as OverlayConsole } from './overlay-console.js';
export const version = '1.1.0-alpha';