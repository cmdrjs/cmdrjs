class CommandHandler {
    
     executeCommand(shell, command) { 
        let parsed = this._parseCommand(command);

        let definitions = shell.definitionProvider.getDefinitions(parsed.name);
        if (!definitions || definitions.length < 1) {
            shell.writeLine('Invalid command', 'error');
            return false;
        } else if (definitions.length > 1) {
            shell.writeLine('Ambiguous command', 'error');
            shell.writeLine();
            for (let i = 0; i < definitions.length; i++) {
                shell.writePad(definitions[i].name, ' ', 10);
                shell.writeLine(definitions[i].description);
            }
            shell.writeLine();
            return false;
        }

        let definition = definitions[0];

        let thisArg = {
            shell: shell,
            command: command,
            definition: definition,
            args: parsed.args,
            argString: parsed.argString
        };
        
        let args = parsed.args;
        
        return definition.callback.apply(thisArg, args);
    }
    
    _parseCommand(command) {
        let exp = /[^\s"]+|"([^"]*)"/gi,
            name = null,
            argString = null,
            args = [],
            match = null;

        do {
            match = exp.exec(command);
            if (match !== null) {
                let value = match[1] ? match[1] : match[0];
                if (match.index === 0) {
                    name = value;
                    argString = command.substr(value.length + (match[1] ? 3 : 1));
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

export default CommandHandler;