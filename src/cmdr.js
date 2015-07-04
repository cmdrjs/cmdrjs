/*
 * cmdrjs
 * Version 1.0.3-alpha
 * Copyright 2014 Shaftware.
 * All Rights Reserved.  
 * Use, reproduction, distribution, and modification of this code is subject to the terms and 
 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
 *
 * Project: https://github.com/shaftware/cmdrjs
 */

; (function (define) {
    define(['jquery'], function ($) {

        var version = '1.0.3-alpha',
            commands = {},
            activated = false,
            template = '<div class="cmdr" style="display: none"><div class="output"></div><div class="input"><span class="prefix"></span><textarea class="prompt" spellcheck="false" row="1" /></div></div>',
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
                openKey: 96,
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

        cmdr.setup('VER', function () {
            cmdr.writeLine('cmdrjs (version ' + cmdr.version + ')');
        }, {
            description: 'Displays the cmdrjs version'
        });

        cmdr.setup('HELP', function () {
            cmdr.writeLine('The following commands are available:');
            cmdr.writeLine();
            for (var name in commands) {
                var command = commands[name];
                cmdr.write(pad(name, ' ', 10));
                cmdr.writeLine(command.description);
            }
            cmdr.writeLine();
        }, {
            description: 'Lists the available commands'
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

        cmdr.setup('CLS', function () {
            cmdr.clear();
        }, {
            description: 'Clears the command prompt'
        });

        cmdr.setup('EXIT', function () {
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

            prompt.on('paste', function () {
                setTimeout(function () {
                    var value = prompt.val();
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

            current.read = $.Deferred().done(function (value) {
                current.read = null;
                if (!capture) {
                    prompt.val(value);
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

            current.readLine = $.Deferred().done(function (value) {
                current.readLine = null;
                prompt.val(value);
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
            }

            if (typeof command !== 'string' || command.length === 0) {
                throw 'Invalid command';
            }

            prompt.val(command);
            flushInput(!config.echo);
            historyAdd(command);
            deactivateInput();

            command = command.trim();
            
            var parsed = parseCommand(command);
            var definition = commands[parsed.name.toUpperCase()];
            if (!definition) {
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

            $.when(result).done(function () {
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
            commands[definition.name] = definition;
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
            }, 0);
        }

        function deactivateInput() {
            prompt.prop('disabled', true);
            input.hide();
        }

        function flushInput(preventWrite) {
            if (!preventWrite) {
                write(prefix.text());
                writeLine(prompt.val());
            }
            prefix.text('');
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
                args = [],
                match = null;
            do {
                match = exp.exec(command);
                if (match !== null) {
                    var value = match[1] ? match[1] : match[0];
                    if (match.index === 0) {
                        name = value;
                        arg = command.substr(value.length + (match[1] ? 3 : 1));
                    } else {
                        args.push(value);
                    }
                }
            } while (match !== null);

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

    });
}(typeof define === 'function' && define.amd ? define : function (deps, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('jquery'));
    } else {
        window.cmdr = factory(jQuery);
    }
}));
