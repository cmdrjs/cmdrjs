/*!
 * @overview    cmdrjs - A JavaScript based command line interface for web pages.
 * @copyright   Copyright (c) 2015 John Cruikshank 
 * @license     Licensed under MIT license
 * @version     1.1.0-alpha
*/

import promise from 'es6-promise';
promise.polyfill();

export { default as Shell } from './shell.js';
export { default as OverlayShell } from './overlay-shell.js';
export { default as HistoryProvider } from './history-provider.js';
export { default as AutocompleteProvider } from './autocomplete-provider.js';
export const version = '1.1.0-alpha';