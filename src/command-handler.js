import * as utils from './utils.js';

class CommandHandler {
    
     executeCommand(shell, command, cancelToken) { 
        let parsed = shell.commandParser.parseCommand(command);

        let definitions = shell.definitionProvider.getDefinitions(parsed.name);
        if (!definitions || definitions.length < 1) {
            shell.writeLine('Invalid command', 'error');
            return false;
        } else if (definitions.length > 1) {
            shell.writeLine('Ambiguous command', 'error');
            shell.writeLine();
            for (let i = 0; i < definitions.length; i++) {
                shell.writePad(definitions[i].name, 10);
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
            parsed: parsed,
            defer: utils.defer,
            cancelToken: cancelToken
        };
        
        let args = parsed.args;
        
        if (definition.help && args.length > 0 && args[args.length-1] === "/?") {
            if (typeof definition.help === 'string') {
                shell.writeLine(definition.help);
                return false;
            } else if (typeof definition.help === 'function') {
                return definition.help.apply(thisArg, args);
            }
        }
                        
        return definition.main.apply(thisArg, args);
    }
}

export default CommandHandler;