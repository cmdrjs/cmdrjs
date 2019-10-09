import * as utils from './utils.js';

const _defaultOptions = {
    contextExtensions: {}
};

class Shell {

    constructor(options) {
        this.options = utils.extend({}, _defaultOptions, options);
    }

    executeCommand(terminal, commandLine, cancelToken) {
        let parsed = this.parseCommandLine(commandLine);
        let commands = terminal.commandProvider.getCommands(parsed.name);
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

    parseCommandLine(commandLine) { 
        let exp = /[^\s"]+|"([^"]*)"/gi,
            name = null,
            argString = null,
            args = [],
            match = null;

        do {
            match = exp.exec(commandLine);
            if (match !== null) {
                let value = match[1] ? match[1] : match[0];
                if (match.index === 0) {
                    name = value;
                    argString = commandLine.substr(value.length + (match[1] ? 3 : 1));
                } else {
                    args.push(value);
                }
            }
        } while (match !== null);

        return {
            name: name,
            argString: argString,
            args: args
        };
    }
}

export default Shell;