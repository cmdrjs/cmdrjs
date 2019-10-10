class ShellBase {

    constructor() {
    }
    
    executeCommand(terminal, commandLine, cancelToken) {
        
    }

    getCommands(name) {
        return [];
    }

    parseCommandLine(commandLine, parseName) { 
        let exp = /[^\s"]+|"([^"]*)"/gi,
            name = null,
            argString = null,
            args = [],
            match = null;

        do {
            match = exp.exec(commandLine);
            if (match !== null) {
                if (parseName) {
                    let value = match[1] ? match[1] : match[0];
                    if (match.index === 0) {
                        name = value;
                        argString = commandLine.substr(value.length + (match[1] ? 3 : 1));
                    } else {
                        args.push(value);
                    }
                } else {
                    args.push(match[0]);
                }
            }
        } while (match !== null);

        if (parseName) {
            return {
                name: name,
                argString: argString,
                args: args
            };
        } else {
            return args;
        }
    }
}

export default ShellBase;