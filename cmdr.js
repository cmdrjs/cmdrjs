/*
 * cmdrjs
 * Version 1.0.2-alpha
 * Copyright 2014 Shaftware.
 * All Rights Reserved.  
 * Use, reproduction, distribution, and modification of this code is subject to the terms and 
 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
 *
 * Project: https://github.com/shaftware/cmdrjs
 */

; (function (define) {
    define(['jquery'], function ($) {

        var version = '1.0.1-alpha',
            commands = {},
            activated = false,
            template = '<div class="cmdr" style="display: none"><div class="output"></div><div class="input"><span class="prefix"></span><div class="prompt" spellcheck="false" contenteditable="true" /></div></div>',
            container,
            input,
            prefix,
            prompt,
            output,
            outputLine,
            current,
            queue = [],
            history = [],
            historyIndex = -1,
            config = {
                autoOpen: false,
                openKey: 192,
                closeKey: 27,
                echo: true,
                promptPrefix: '> '
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

        cmdr.setup(['HELP','?','/?'], function () {
            cmdr.writeLine('The following commands are available:');
            cmdr.writeLine();
            for (var key in commands) {
                var definition = commands[key];
                if (!!unwrap(definition.available)) {
                    cmdr.write(pad(key, ' ', 10));
                    cmdr.writeLine(definition.description);
                }
            }
            cmdr.writeLine();
        }, {
            description: 'Lists the available commands'
        });

        cmdr.setup(['VERSION', 'VER'], function () {
            cmdr.writeLine('cmdrjs (version ' + cmdr.version + ')');
        }, {
            description: 'Displays the cmdrjs version'
        });

        cmdr.setup('ECHO', function (arg) {
            var toggle = arg.toUpperCase();
            if (toggle === 'ON') {
                cmdr.config.echo = true;
            } else if (toggle === 'OFF') {
                cmdr.config.echo = false;
            } else {
                cmdr.writeLine(arg);
            }
        }, {
            parse: false,
            description: 'Displays provided text or toggles command echoing'
        });

        cmdr.setup(['CLEAR','CLS'], function () {
            cmdr.clear();
        }, {
            description: 'Clears the command prompt'
        });

        cmdr.setup(['QUIT','EXIT'], function () {
            cmdr.close();
        }, {
            description: 'Closes the command prompt'
        });

        return cmdr;

        function activate() {
            if (activated) return;

            container = $(template).appendTo('body');
            input = $('.input', container);
            prefix = $('.prefix', container);
            prompt = $('.prompt', container);
            output = $('.output', container);

            $(document).on('keydown.cmdr', function (event) {
                if (!isOpen() && !$(event.target).is('input, textarea, select, [contenteditable]') && event.keyCode ==  config.openKey) {
                    event.preventDefault();
                    open();
                } else if (isOpen() && event.keyCode == config.closeKey) {
                    close();
                }
            });

            prompt.on('keydown', function (event) {
                if (!current) {
                    switch (event.keyCode) {
                        case 13:
                            var value = promptVal();
                            if (value) {
                                execute(value);
                            }
                            event.preventDefault();
                            return false;
                        case 38:
                            historyBack();
                            event.preventDefault();
                            return false;
                        case 40:
                            historyForward();
                            event.preventDefault();
                            return false;
                        case 9:
                            event.preventDefault();
                            return false;
                    }
                } else if (current.readLine && event.keyCode === 13) {
                    current.readLine.resolve(promptVal());
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

            prompt.on('paste', function () {
                setTimeout(function () {
                    var value = promptVal();
                    var lines = value.split(/\r\n|\r|\n/g);
                    var length = lines.length;
                    if (length > 1) {
                        for (var i = 1; i < length; i++) {
                            if (lines[i].length > 0) {
                                queue.push(lines[i]);
                            }
                        }
                        if (current && current.readLine) {
                            current.readLine.resolve(lines[0]);
                        } else if (current && current.read) {
                            current.read.resolve(lines[0][0]);
                        } else {
                            execute(lines[0]);
                        }
                    }
                }, 0);
            });

            container.on('click', function (event) {
                if (!$(event.target).is('.input *, .output *')) {
                    prompt.focus();
                }
            });

            activateInput();

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
            prefix = null;
            prompt = null;
            output = null;

            $(document).off('keydown.cmdr');

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

            setTimeout(function () {
                prompt.css('text-indent', getPrefixWidth() + 'px').focus();
            }, 0);
        }

        function close() {
            if (!activated) return;

            container.hide();
            prompt.blur();
        }

        function read(callback, capture) {
            if (!activated) return;
            if (!current) return;
            
            activateInput(true);

            current.read = $.Deferred().always(function (value) {
                current.read = null;
                if (!capture) {
                    promptVal(value);
                }
                deactivateInput();
                if (callback.call(current, value) === true) {
                    read(callback, capture);
                } else {
                    flushInput();
                }
            });
            current.read.capture = capture;
            
            if (queue.length > 0) {
                current.read.resolve(queue.shift()[0]);
            }
        }

        function readLine(callback) {
            if (!activated) return;
            if (!current) return;

            activateInput(true);

            current.readLine = $.Deferred().always(function (value) {
                current.readLine = null;
                promptVal(value);
                deactivateInput();
                flushInput();
                if (callback.call(current, value) === true) {
                    readLine(callback);
                }
            });

            if (queue.length > 0) {
                current.readLine.resolve(queue.shift());
            }
        }

        function write(value, cssClass) {
            if (!activated) return;

            value = value || '';

            var outputValue = $('<span/>').addClass(cssClass).text(value);
            if (!outputLine) {
                outputLine = $('<div/>').appendTo(output);
            }
            outputLine.append(outputValue);
        }

        function writeLine(value, cssClass) {
            if (!activated) return;

            value = (value || '') + '\n';

            write(value, cssClass);
            outputLine = null;
        }

        function clear() {
            if (!activated) return;

            output.html('');
        }

        function execute(command) {
            if (!activated) return;
            if (current) {
                queue.push(command);
                return;
            }; 

            if (typeof command !== 'string' || command.length === 0) {
                throw 'Invalid command';
            }

            promptVal(command);
            flushInput(!config.echo);
            historyAdd(command);
            deactivateInput();

            command = command.trim();
            
            var parsed = parseCommand(command);
            var definition = commands[parsed.name.toUpperCase()];
            if (!definition || !unwrap(definition.available)) {
                writeLine('Invalid command', 'error');
                activateInput();
                return;
            }

            current = {
                command: command,
                definition: definition
            };

            var args = parsed.args;
            if (!definition.parse) {
                args = [parsed.arg];
            }

            var result = definition.callback.apply(current, args);

            $.when(result).always(function () {
                setTimeout(function () {
                    current = null;
                    activateInput();
                    if (queue.length > 0) {
                        execute(queue.shift());
                    }
                }, 0);
            });
        }

        function setup(name, callback, settings) {
            var definition = resolveDefinition(name, callback, settings);
            for (var i = 0, l = definition.names.length; i < l; i++) {
                commands[definition.names[i].toUpperCase()] = definition;
            }
        }

        function activateInput(inline) {
            if (inline) {
                if (outputLine) {
                    prefix.text(outputLine.text());
                    outputLine.remove();
                    outputLine = null;
                }
            } else {
                prefix.text(config.promptPrefix);
            }
            input.show();
            setTimeout(function () {
                prompt.prop('disabled', false).css('text-indent', getPrefixWidth() + 'px').focus();
                container.animate({
                    scrollTop: container[0].scrollHeight
                }, 1000);
            }, 0);
        }

        function deactivateInput() {
            prompt.prop('disabled', true);
            input.hide();
        }

        function flushInput(preventWrite) {
            if (!preventWrite) {
                write(prefix.text());
                writeLine(promptVal());
            }
            prefix.text('');
            promptVal('');
        }

        function historyAdd(command) {
            history.unshift(command);
            historyIndex = -1;
        }

        function historyBack() {
            if (history.length > historyIndex + 1) {
                historyIndex++;
                promptVal(history[historyIndex]);
                prompt.change();
            }
        }

        function historyForward() {
            if (historyIndex > 0) {
                historyIndex--;
                promptVal(history[historyIndex]);
                prompt.change();
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

        function resolveDefinition(names, callback, settings) {
            if (typeof names !== 'string' && !$.isArray(names)) {
                settings = callback;
                callback = names;
                names = null;
            }
            if (typeof callback !== 'function') {
                settings = callback;
                callback = null;
            }

            if (typeof names === 'string') {
                names = [names]
            } else if ($.isArray(names)) {
                names = $.grep(names, function(value) {
                    return typeof value === 'string';
                });
            }

            var definition = {
                names: names,
                callback: callback,
                parse: true,
                available: true
            };

            $.extend(definition, settings);

            if (!$.isArray(definition.names) ||
                definition.names.length === 0 ||
                typeof definition.callback !== 'function') {
                throw 'Invalid command definition';
            }
            
            return definition;
        }

        function getPrefixWidth() {
            var width = prefix.width();
            var text = prefix.text();
            var spacePadding = text.length - text.trim().length;
            width += spacePadding * getPrefixSpaceWidth();
            return width;
        }

        function getPrefixSpaceWidth() {
            if (!prefix._spaceWidth) {
                var elem1 = $('<span style="visibility: hidden">| |</span>').appendTo(prefix);
                var elem2 = $('<span style="visibility: hidden">||</span>').appendTo(prefix);
                prefix._spaceWidth = elem1.innerWidth() - elem2.innerWidth();
                elem1.remove();
                elem2.remove();
            }
            return prefix._spaceWidth;
        }

        function pad(value, padding, length) {
            var right = length >= 0;
            length = Math.abs(length);
            while (value.length < length) {
                value = right ? value + padding : padding + value;
            }
            return value;
        }

        function unwrap(value) {
            return typeof value === 'function' ? value() : value;
        }

        function promptVal(value) {
            if (typeof value === 'undefined') {
                return prompt.text();
            } else {
                prompt.text(value);
            }
        }

    });
}(typeof define === 'function' && define.amd ? define : function (deps, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('jquery'));
    } else {
        window['cmdr'] = factory(window['jQuery']);
    }
}));
