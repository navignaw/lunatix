var Terminal = function(system) {

    /* Helper functions */
    var parseCommand = function(command) {
        // Parse input string into array, stripping whitespace and quotes.
        var args = $.trim(command).split(/\s+/);
        if (args.length == 0) {
            return null;
        }

        $.each(args, function(index, value) {
            var match = value.match(/(["'])(\\?.)*?\1/);
            if (match) {
                // For now, just remove outer quotation marks.
                // We may need to be smarter about escape characters.
                args[index] = value.substring(1, value.length - 1);
            }
        });

        var name = args[0];
        args = args.splice(1, args.length - 1);

        // TODO: find all options preceded by - or --
        var options = [];

        // TODO: pipe command |
        // TODO: redirect commands <, >

        return {
            name: name,
            args: args,
            options: options,
            rest: args.join(' ')
        };
    };

    /* Terminal options */
    var options = {
        login: {
            greetings: 'What is your name?',
            name: 'login',
            prompt: '$> '
        },

        main: {
            greetings: 'You awaken in a dark directory...',
            name: 'main',
            onStart: function(term) {
                term.clear();
                term.echo(this.greetings);
            },
            prompt: '$> '
        },

        confirm: function(prompt) {
            prompt: prompt || 'Are you sure? [y/n] '
        }
    };

    var self = {

        /* Called on page load */
        init: function(term) {
            term.terminal(self.login, options.login);
        },

        /* Login interpreter */
        login: function(command, term) {
            var user = $.trim(command);
            if (user !== '') {
                // TODO: If username already exists, prompt for password.
                console.log('logged in as:', user);
                system.user.name = user;
                term.push(self.interpreter, options.main);
            }
        },

        /* Accepted commands */
        commands: {
            cd: function(cmd, term) {
                // TODO: change directory
            },

            echo: function(cmd, term) {
                term.echo(cmd.rest);
                console.log(cmd);
            },

            help: function(cmd, term) {
                // TODO: don't be mean.
                term.echo('no help for you');
            },

            pwd: function(cmd, term) {
                term.echo(system.dir.name);
            },

            ps: function(cmd, term) {
                // TODO: list processes
            },

            kill: function(cmd, term) {
                // TODO: kill process
            },

            whoami: function(cmd, term) {
                term.echo(system.user.name);
            }
        },

        /* Main interpreter for shell */
        interpreter: function(command, term) {
            var cmd = parseCommand(command);
            if (!cmd) {
                return;
            }

            if (self.commands.hasOwnProperty(cmd.name)) {
                self.commands[cmd.name](cmd, term);
            } else {
                term.echo(cmd.name + ': command not found');
            }
        },

        /* Confirmation terminal: awaits y/n input */
        confirm: function(prompt, success, term) {
            term.push(function(command) {
                if (command.match(/y|yes/i)) {
                    term.pop();
                    success();
                } else if (command.match(/n|no/i)) {
                    term.pop();
                }
            }, options.confirm(prompt));
        }

    };
    return self;

}