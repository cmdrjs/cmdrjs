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
    define(['jquery'], function ($) {

        var version = '1.0.0-alpha',
            commands = {},
            activated = false,
            template = '<div class="cmdr" style="display: none"><div class="output"></div><div class="input"><textarea class="prompt" spellcheck="false" row="1" /></div></div>',
            container,
            input,
            prompt,
            output,
            outputLine,
            current,
            queue = [],
            history = [],
            historyIndex = -1,
            config = {
                autoOpen: false,
                openKey: 96,
                closeKey: 27,
                echo: true
            };

        var cmdr = {
            activate: activate,
            deactivate: deactivate,
            reactivate: reactivate,
            open: open,
            close: close,
            read: read,
            readLine: readLine,
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
            input = $('.input', container);
            prompt = $('.prompt', container);
            output = $('.output', container);

            $(document).on('keypress.cmdr', function (event) {
                if (!isOpen() && !$(event.target).is('input, textarea, select') && checkKey(event, config.openKey)) {
                    event.preventDefault();
                    open();
                } else if (isOpen() && checkKey(event, config.closeKey)) {
                    close();
                }
            });

            prompt.on('keydown', function (event) {
                if (!current) {
                    switch (event.keyCode) {
                        case 13:
                            var value = prompt.val();
                            if (value) {
                                flushPrompt();
                                historyAdd(value);
                                execute(value);
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
                } else if (current.readLine && event.keyCode === 13) {
                    current.readLine.resolve(prompt.val());
                    return false;
                } 
                return true;
            });

            prompt.on('keypress', function(event) {
                if (current && current.read) {
                    if (event.charCode !== 0) {
                        current.read.char = String.fromCharCode(event.charCode);
                        if (current.read.capture) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
                return true;
            });

            prompt.on('keyup', function () {
                if (current && current.read && current.read.char) {
                    current.read.resolve(current.read.char);
                }
            });

            prompt.on('change cut paste drop keydown', function () {
                setTimeout(function () {
                    prompt.height('auto').height(prompt[0].scrollHeight);
                }, 0);
            });

            var resizeThrottle;
            $(window).on('resize.cmdr', function () {
                clearTimeout(resizeThrottle);
                resizeThrottle = setTimeout(function () {
                    prompt.height('auto').height(prompt[0].scrollHeight);
                }, 100);
            });

            container.on('click', function (event) {
                if (!$(event.target).is('.input *, .output *')) {
                    prompt.focus();
                }
            });

            activated = true;

            if (config.autoOpen) {
                open();
            }
        }

        function deactivate() {
            if (!activated) return;

            container.remove();
            container = null;
            input = null;
            prompt = null;
            output = null;

            $(document).off('keypress.cmdr');
            $(window).off('resize.cmdr');

            activated = false;
        }

        function reactivate() {
            if (activated) {
                deactivate();
            }
            activate();
        }

        function isOpen() {
            return container.is(':visible');
        }

        function open() {
            if (!activated) return;

            container.show();
            prompt.focus();
        }

        function close() {
            if (!activated) return;

            container.hide();
            prompt.blur();
        }

        function read(callback, capture) {
            if (!activated) return;
            if (!current) return;
            
            activatePrompt();

            current.read = $.Deferred().done(function (value) {
                deactivatePrompt();
                current.read = null;
                if (callback.call(cmdr, value) === true) {
                    read(callback, capture);
                } else {
                    flushPrompt();
                }
            });

            current.read.capture = capture;
        }

        function readLine(callback) {
            if (!activated) return;
            if (!current) return;

            activatePrompt();

            current.readLine = $.Deferred().done(function (value) {
                writeLine(value);
                deactivatePrompt();
                current.readLine = null;
                flushPrompt();
                if (callback.call(cmdr, value) === true) {
                    readLine(callback);
                }
            });
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
            if (current) return; 

            if (typeof command !== 'string') {
                throw 'Invalid command';
            }
            
            command = command.trim();
            
            var parsed = parseCommand(command);
            var definition = commands[parsed.name.toUpperCase()];
            if (!definition) {
                writeLine('Invalid command', 'error');
                return;
            }

            current = {
                command: command,
                definition: definition
            };

            deactivatePrompt();

            var args = parsed.args;
            if (!definition.parse) {
                args = [parsed.arg];
            }

            var result = definition.callback.apply(cmdr, args);

            $.when(result).done(function () {
                current = null;
                if (queue.length > 0) {
                    execute(queue.shift());
                }
                activatePrompt();
            });
        }

        function setup(name, callback, settings) {
            var definition = resolveDefinition(name, callback, settings);
            commands[definition.name] = definition;
        }

        function activatePrompt() {
            prompt.prop('disabled', false).show();
        }

        function deactivatePrompt() {
            prompt.prop('disabled', true).hide();
        }

        function flushPrompt() {
            if (config.echo) {
                writeLine(prompt.val());
            }
            prompt.val('');
        }

        function historyAdd(command) {
            history.unshift(command);
            historyIndex = -1;
        }

        function historyBack() {
            if (history.length > historyIndex + 1) {
                historyIndex++;
                prompt.val(history[historyIndex]).change();
            }
        }

        function historyForward() {
            if (historyIndex > 0) {
                historyIndex--;
                prompt.val(history[historyIndex]).change();
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

        function checkKey(event, key) {
            return (event.which || event.keyCode) === key;
        }
    });
}(typeof define === 'function' && define.amd ? define : function (deps, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('jquery'));
    } else {
        window['cmdr'] = factory(window['jQuery']);
    }
}));
