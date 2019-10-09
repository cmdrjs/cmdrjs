class ShellBase {

    constructor() {
    }
    
    executeCommand(terminal, commandLine, cancelToken) {
        
    }

    getCommands(name) {
        
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

export default ShellBase;