import * as utils from './utils.js';
import ShellBase from './shell-base.js';
import Command from './command.js';

const _defaultOptions = {
    contextExtensions: {},
    builtInCommands: ['HELP', 'ECHO', 'CLS'],
    allowAbbreviations: true
};

class Shell extends ShellBase {

    constructor(options) {
        super();
        this.options = utils.extend({}, _defaultOptions, options);
        this.commands = {};

        this._addBuiltInCommands();
    }

    executeCommand(terminal, commandLine, cancelToken) {
        let parsed = this.parseCommandLine(commandLine);
        let commands = this.getCommands(parsed.name);
        if (!commands || commands.length < 1) {
            terminal.writeLine('Invalid command', 'error');
            return false;
        } else if (commands.length > 1) {
            terminal.writeLine('Ambiguous command', 'error');
            terminal.writeLine();
            for (let i = 0; i < commands.length; i++) {
                terminal.writePad(commands[i].name, 10);
                terminal.writeLine(commands[i].description);
            }
            terminal.writeLine();
            return false;
        }

        let command = commands[0];

        let context = {
            terminal: terminal,
            commandLine: commandLine,
            command: command,
            parsed: parsed,
            defer: utils.defer,
            cancelToken: cancelToken
        };

        utils.extend(context, this.options.contextExtensions);

        let args = parsed.args;

        if (command.help && args.length > 0 && args[args.length - 1] === "/?") {
            if (typeof command.help === 'string') {
                terminal.writeLine(command.help);
                return false;
            } else if (typeof command.help === 'function') {
                return command.help.apply(context, args);
            }
        }

        return command.main.apply(context, args);
    }

    getCommands(name) {
        let commands = [];

        if (name) {
            name = name.toUpperCase();

            let command = this.commands[name];

            if (command) {
                if (command.available) {
                    return [command];
                }
                return null;
            }


            if (this.options.allowAbbreviations) {
                for (let key in this.commands) {
                    if (key.indexOf(name, 0) === 0 && utils.unwrap(this.commands[key].available)) {
                        commands.push(this.commands[key]);
                    }
                }
            }
        } else {
            for (let key in this.commands) {
                commands.push(this.commands[key]);
            }
        }

        return commands;
    }

    addCommand(command) {
        if (!(command instanceof Command)) {
            command = new Command(...arguments);
        }
        this.commands[command.name] = command;
    }

    _addBuiltInCommands() {
        let provider = this;

        if (this.options.builtInCommands.indexOf('HELP') > -1) {
            this.addCommand({
                name: 'HELP',
                main: function () {
                    this.terminal.writeLine('The following commands are available:');
                    this.terminal.writeLine();
                    var availableCommands = Object.keys(provider.commands)
                        .map((key) => { return provider.commands[key]; })
                        .filter((def) => { return def.available; });
                    var length = availableCommands.slice().sort(function (a, b) { return b.name.length - a.name.length; })[0].name.length;
                    this.terminal.writeTable(availableCommands, ['name:' + (length + 2).toString(), 'description:40']);
                    this.terminal.writeLine();
                    this.terminal.writeLine('* Pass "/?" into any command to display help for that command.');
                    if (provider.options.allowAbbreviations) {
                        this.terminal.writeLine('* Command abbreviations are allowed (e.g. "H" for "HELP").');
                    }
                },
                description: 'Lists the available commands.'
            });
        }

        if (this.options.builtInCommands.indexOf('ECHO') > -1) {
            this.addCommand({
                name: 'ECHO',
                main: function () {
                    let toggle = this.argString.toUpperCase();
                    if (toggle === 'ON') {
                        this.terminal.echo = true;
                    } else if (toggle === 'OFF') {
                        this.terminal.echo = false;
                    } else if (this.argString) {
                        this.terminal.writeLine(this.argString);
                    } else {
                        this.terminal.writeLine('ECHO is ' + (this.terminal.echo ? 'on.' : 'off.'));
                    }
                },
                description: 'Displays messages, or toggles command echoing.',
                usage: 'ECHO [ON | OFF]\nECHO [message]\n\nType ECHO without parameters to display the current echo setting.'
            });
        }

        if (this.options.builtInCommands.indexOf('CLS') > -1) {
            this.addCommand({
                name: 'CLS',
                main: function () {
                    this.terminal.clear();
                },
                description: 'Clears the command prompt.'
            });
        }
    }
}

export default Shell;