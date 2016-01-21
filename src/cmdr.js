import promise from 'es6-promise';
promise.polyfill();

export { default as Shell } from './shell.js';
export { default as OverlayShell } from './overlay-shell.js';
export { default as CommandHandler } from './command-handler.js';
export { default as CommandParser } from './command-parser.js';
export { default as HistoryProvider } from './history-provider.js';
export { default as AutocompleteProvider } from './autocomplete-provider.js';
export { default as DefinitionProvider } from './definition-provider.js';
export { default as Definition } from './definition.js';
export const version = '1.1.11';