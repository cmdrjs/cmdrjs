/*
 * cmdrjs
 * Version 1.0.0-alpha
 * Copyright 2014 Shaftware.
 * All Rights Reserved.  
 * Use, reproduction, distribution, and modification of this code is subject to the terms and 
 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
 *
 * Project: https://github.com/shaftware/cmdrjs
 */

; (function (define) {
    define(['jquery'], function($) {

        var version = '1.0.0-alpha',
            commands = {},
            activated = false,
            template = '<div class="cmdr" style="display: none"><div class="input"><textarea/></div><div class="output"></div></div>',
            container,
            form,
            input,
            output,
            outputLine,
            history = [],
            historyIndex = -1,
            config = {
                openKey: 96,
                fixedInput: false,
                echo: true
            };

        var cmdr = {
            activate: activate,
            deactivate: deactivate,
            reactivate: reactivate,
            open: open,
            close: close,
            write: write,
            writeLine: writeLine,
            clear: clear,
            execute: execute,
            setup: setup,
            commands: commands,
            config: config,
            version: version
        };

        cmdr.setup('CLS', function () {
            this.clear();
        });

        cmdr.setup('EXIT', function () {
            this.close();
        });

        cmdr.setup('ECHO', function (arg) {
            var toggle = arg.toUpperCase();
            if (toggle === 'ON') {
                this.config.echo = true;
            } else if (toggle === 'OFF') {
                this.config.echo = false;
            } else {
                this.writeLine(arg);
            }
        }, { parse: false });

        return cmdr;

        function activate() {
            if (activated) return;

            container = $(template).appendTo('body');
            input = $('textarea', container);
            output = $('.output', container);
            if (!config.fixedInput) {
                container.prepend(output);
            }

            $(document).on('keypress.cmdr', function(event) {
                if (!$(event.target).is('input, textarea, select') && event.which === config.openKey) {
                    open();
                } else if (event.keyCode === 27) {
                    close();
                }
            });
            
            input.on('keypress', function (event) {
                switch(event.keyCode) {
                    case 13:
                        var command = input.val();
                        if (command) {
                            historyAdd(command);
                            execute(command);
                            input.val('');
                        }
                        return false;
                    case 38:
                        historyBack();
                        return false;
                    case 40:
                        historyForward();
                        return false;
                    case 9:
                        return false;
                }
                return true;
            });

            container.on('click', function(event) {
                if (!$(event.target).is('textarea')) {
                    input.focus();
                }
            });

            activated = true;
        }

        function deactivate() {
            if (!activated) return;

            container.remove();
            container = null;
            form = null;
            input = null;
            output = null;

            $(document).off('keypress.cmdr');

            activated = false;
        }

        function reactivate() {
            if (activated) {
                deactivate();
            }
            activate();
        }

        function open() {
            if (!activated) return;

            container.show();
            input.focus();
        }

        function close() {
            if (!activated) return;

            container.hide();
        }

        function write(value, cssClass) {
            if (!activated) return;

            value = '' + value;

            var outputValue = $('<span/>').addClass(cssClass).text(value);
            if (!outputLine) {
                outputLine = $('<div/>').appendTo(output);
            }
            outputLine.append(outputValue);
        }

        function writeLine(value, cssClass) {
            if (!activated) return;

            write(value, cssClass);
            outputLine = null;
        }

        function clear() {
            if (!activated) return;

            output.html('');
        }

        function execute(command) {
            if (!activated) return;

            if (typeof command !== 'string') {
                throw 'Invalid command';
            }

            command = command.trim();

            if (config.echo) {
                writeLine('> ' + command);
            }

            var parsed = parseCommand(command);
            var definition = commands[parsed.name.toUpperCase()];
            if (!definition) {
                writeLine('Invalid command', 'error');
                return;
            }

            var args = parsed.args;
            if (!definition.parse) {
                args = [parsed.arg];
            }

            definition.callback.apply(cmdr, args);
        }

        function setup(name, callback, settings) {
            var definition = resolveDefinition(name, callback, settings);
            commands[definition.name] = definition;
        }

        function historyAdd(command) {
            history.unshift(command);
            historyIndex = -1;
        }

        function historyBack() {
            if (history.length > historyIndex + 1) {
                historyIndex++;
                input.val(history[historyIndex]);
            }
        }

        function historyForward() {
            if (historyIndex > 0) {
                historyIndex--;
                input.val(history[historyIndex]);
            }
        }

        function parseCommand(command) {
            var exp = /[^\s"]+|"([^"]*)"/gi,
                name = null,
                arg = null,
                args = [];

            do {
                var match = exp.exec(command);
                if (match != null) {
                    var value = match[1] ? match[1] : match[0];
                    if (match.index === 0) {
                        name = value;
                        arg = command.substr(value.length + (match[1] ? 3 : 1));
                    } else {
                        args.push(value);
                    }
                }
            } while (match != null);

            return {
                name: name,
                arg: arg,
                args: args
            };
        }

        function resolveDefinition(name, callback, settings) {
            if (typeof name !== 'string') {
                settings = callback;
                callback = name;
                name = null;
            }
            if (typeof callback !== 'function') {
                settings = callback;
                callback = null;
            }

            var definition = {
                name: name,
                callback: callback,
                parse: true
            };

            $.extend(definition, settings);

            if (typeof definition.name !== 'string' ||
                typeof definition.callback !== 'function') {
                throw 'Invalid command definition';
            }

            definition.name = definition.name.toUpperCase();

            return definition;
        }
    });
}(typeof define === 'function' && define.amd ? define : function (deps, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('jquery'));
    } else {
        window['cmdr'] = factory(window['jQuery']);
    }
}));
