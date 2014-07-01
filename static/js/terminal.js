var Terminal = function(system) {

    /* Helper functions */
    var parseArgs = function(command) {
        // Parse input string into array, stripping whitespace and quotes.
        var args = $.trim(command).split(/\s+/);
        $.each(args, function(index, value) {
            var match = value.match(/(["'])(\\?.)*?\1/);
            if (match) {
                // For now, just remove outer quotation marks.
                // We may need to be smarter about escape characters.
                args[index] = value.substring(1, value.length - 1);
            }
        });
        return args;
    }

    /* Main terminal */
    var main = function() {
        return {
            options: {
                greetings: 'You awaken in a dark directory...',
                name: 'main',
                prompt: '$> ',
                onStart: function(term) {
                    term.clear();
                    term.echo(this.greetings);
                }
            },

            interpreter: function(command, term) {
                var args = parseArgs(command);
                if (args.length === 0) {
                    return;
                }

                switch (args[0]) {
                    case 'echo':
                        term.echo(args[1]);
                        break;

                    case 'help':
                        term.echo('no help for you');
                        break;

                    case 'pwd':
                        term.echo(system.directory);
                        break;

                    case 'whoami':
                        term.echo(system.user);
                        break;

                    default:
                        term.echo(args[0] + ': command not found');
                }
            }
        };
    };

    /* Login terminal */
    var login = function(success) {
        return {
            options: {
                greetings: 'What is your name?',
                name: 'login',
                prompt: '$> '
            },

            interpreter: function(command, term) {
                if (command !== '') {
                    // TODO: If username already exists, prompt for password.
                    success(command, term);
                }
            }
        };
    };

    /* Confirmation terminal: awaits y/n input */
    var confirm = function(term, success, prompt) {
        return {
            options: {
                "prompt": prompt || "Are you sure? [y/n] "
            },

            interpreter: function(command) {
                if (command.match(/y|yes/i)) {
                    term.pop();
                    success();
                } else if (command.match(/n|no/i)) {
                    term.pop();
                }
            }
        };
    };

    return {
        main: main,
        login: login,
        confirm: confirm
    };
}