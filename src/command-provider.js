import * as utils from './utils.js';
import Command from './command.js';

const _defaultOptions = {
    predefined: ['HELP', 'ECHO', 'CLS'],
    allowAbbreviations: true
};

class CommandProvider {
    constructor(options) {
        this.options = utils.extend({}, _defaultOptions, options);
        this.commands = {};

        this._predefine();
    }

    activate(terminal) {
        if (typeof terminal.addCommand === 'undefined') {
            terminal.addCommand = this.addCommand;
        }
    }

    deactivate(terminal) {
        if (terminal.addCommand === this.addCommand) {
            delete terminal.addCommand;
        }
    }

    getCommands(name) {
        name = name.toUpperCase();

        let command = this.commands[name];

        if (command) {
            if (command.available) {
                return [command];
            }
            return null;
        }

        let commands = [];

        if (this.options.allowAbbreviations) {
            for (let key in this.commands) {
                if (key.indexOf(name, 0) === 0 && utils.unwrap(this.commands[key].available)) {
                    commands.push(this.commands[key]);
                }
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

    _predefine() {
        let provider = this;

        if (this.options.predefined.indexOf('HELP') > -1) {
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

        if (this.options.predefined.indexOf('ECHO') > -1) {
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

        if (this.options.predefined.indexOf('CLS') > -1) {
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

export default CommandProvider;