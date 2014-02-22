//todo: argument masking
//todo: command piping
//todo: argument single quotes
//todo: echo hide quoted command
//todo: input hold focus

;(function (define) {
    define(['jquery'], function($) {

        var version = '1.0.0-alpha',
            commands = {},
            activated = false,
            template = '<div class="cmdr" style="display: none"><form><input type="text" /></form><div class="output"></div></div>',
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
            writeWarning: writeWarning,
            writeLineWarning: writeLineWarning,
            writeError: writeError,
            writeLineError: writeLineError,
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

        cmdr.setup('ECHO', function (command) {
            var arg = command.substring(5);
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
            form = $('form', container);
            input = $('input', container);
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

            form.on('submit', function() {
                var command = input.val();
                if (command) {
                    historyAdd(command);
                    execute(command);
                    input.val('');
                }
                return false;
            });

            input.on('keypress', function(event) {
                if (event.keyCode === 38) {
                    historyBack();
                } else if (event.keyCode === 40) {
                    historyForward();
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

        function writeWarning(value) {
            if (!activated) return;

            write(value, 'warning');
        }

        function writeLineWarning(value) {
            if (!activated) return;

            writeLine(value, 'warning');
        }

        function writeError(value) {
            if (!activated) return;

            write(value, 'error');
        }

        function writeLineError(value) {
            if (!activated) return;

            writeLine(value, 'error');
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

            if (config.echo) {
                writeLine('> ' + command);
            }

            var parts = parseCommand(command);
            var name = parts[0].toUpperCase();
            var args = parts.slice(1);
            var definition = commands[name];
            if (!definition) {
                writeLineError('Invalid command');
                return;
            }

            if (!definition.parse) {
                args = [command];
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
            var exp = /[^\s"]+|"([^"]*)"/gi;
            var parts = [];
            do {
                var match = exp.exec(command);
                if (match != null) {
                    parts.push(match[1] ? match[1] : match[0]);
                }
            } while (match != null);
            return parts;
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
