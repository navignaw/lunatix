var Terminal = function(system) {

    /* Helper functions */
    var trim = $.trim;

    var init = function(term) {
        term.push(self.login, self.options.login);
    };

    var parseCommand = function(command) {
        // Parse input string into array, stripping whitespace and quotes.
        var args = trim(command).split(/\s+/);
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

        var name = _.first(args);
        args = _.rest(args);

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

    var tabComplete = function(str, commands) {
        str = trim(str);
        // TODO: Add support for tab-completing files and directories.
        if (str === '' || str === './') {
            return []; // directories and files
        } else if (str === 'cd' || str === 'ls') {
            return []; // directories
        }

        // TODO: Only complete commands user has permissions for.
        return commands;
    };

    var echoTemplate = function(type, template, term) {
        term.pause();

        // Load HTML from template.
        $.get($SCRIPT_ROOT + '/' + type + '/' + template, function(html) {
            term.echo(html, {raw: true});
        }).fail(function(jqXHR, textStatus, error) {
            term.error('Error: ' + error);
            term.echo(jqXHR.responseText, {raw: true});
        }).always(function() {
            term.resume();
        });
    };

    var self = {

        /* Login interpreter */
        login: function(command, term) {
            var user = trim(command);
            if (user !== '') {
                // TODO: If username already exists, prompt for password.
                console.log('logged in as:', user);
                system.user.name = user;
                term.push(self.interpreter, self.options.main);
                term.clear();
                term.greetings();
            }
        },

        /* Accepted commands */
        commands: {
            cd: function(cmd, term) {
                // TODO: change directory
            },

            credits: function(cmd, term) {
                echoTemplate('commands', 'credits', term);
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

            logout: function(cmd, term) {
                term.echo('Are you sure you wish to exit? Any unsaved data will be lost.');
                self.confirm(term, null, function() {
                    term.pop();
                });
            },

            // TODO: Remove in final version.
            test: function(cmd, term) {
                switch (cmd.args[0]) {
                    case 'confirm':
                        self.confirm(term, 'hello? [y/n] ', function() {
                            term.echo('whee');
                        });
                        break;

                    case 'animateText':
                        self.animateText(term, 'i am typing', '$> ', function() {
                            term.echo('all done');
                        });
                        break;

                    default:
                        term.echo('Invalid command. Options are: ' + [
                            'confirm', 'animateText'].join(', '));
                }
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

            if (_.has(self.commands, cmd.name)) {
                // Check for permissions.
                if (system.user.superuser || _.has(system.user.permissions, cmd.name)) {
                    self.commands[cmd.name](cmd, term);
                } else {
                    term.echo(cmd.name + ': permission denied');
                }
            } else {
                term.echo(cmd.name + ': command not found');
            }
        },

        /* Confirmation terminal: awaits y/n input */
        confirm: function(term, prompt, success) {
            term.push(function(command) {
                if (command.match(/^(y|yes|yea)$/i)) {
                    term.pop();
                    success();
                } else if (command.match(/^(n|no|nay)$/i)) {
                    term.pop();
                } else {
                    term.echo("Please enter 'yes' or 'no'.");
                }
            }, self.options.confirm(prompt));
        },

        /* Animated typing terminal */
        animating: false,
        animateText: function(term, message, prompt, callback, delay) {
            if (message.length === 0) {
                return;
            }
            prompt = prompt || '';
            callback = callback || _.noop;
            delay = delay || 100;
            self.animating = true;

            var old_prompt = term.get_prompt();
            var c = 0;
            term.set_prompt(prompt);
            var interval = setInterval(function() {
                term.insert(message[c++]);
                if (c == message.length) {
                    clearInterval(interval);
                    // execute in next interval
                    setTimeout(function() {
                        // swap command with prompt
                        term.set_command('');
                        term.echo(prompt + message);
                        term.set_prompt(old_prompt);
                        self.animating = false;
                        callback();
                    }, delay);
                }
            }, delay);
        },

        /* Terminal options */
        options: {
            base: {
                name: 'lunatix',
                // Hack since greetings are not updated in new terminals.
                greetings: function(callback) {
                    var name = $.terminal.active().name();
                    if (name === 'lunatix') {
                        callback('');
                    } else {
                        callback(self.options[name].greetings || '');
                    }
                },
                prompt: '$> ',
                completion: [],
                onInit: init,
                keydown: function(e) {
                    // Disable keypresses while animating text.
                    if (self.animating) {
                        return false;
                    }
                    // CTRL+D: cannot exit past login screen
                    if (e.which === 68 && e.ctrlKey) {
                        return false;
                    }
                }
            },

            login: {
                name: 'login',
                greetings: 'What is your name?',
                prompt: '$> ',
                completion: [],
                onStart: function(term) {
                    term.clear();
                    term.greetings();
                }
            },

            main: {
                name: 'main',
                greetings: 'You awaken in a dark directory...',
                prompt: '$> ',
                completion: function(term, str, callback) {
                    var results = tabComplete(str, _.keys(self.commands));
                    callback(results);
                },
                keydown: function(e, term) {
                    if (self.animating) {
                        return false;
                    }
                    if (e.which === 68 && e.ctrlKey) {
                        term.exec('logout');
                    }
                }
            },

            confirm: function(prompt) {
                return {
                    completion: ['yes', 'no'],
                    prompt: prompt || '[y/n] '
                };
            }
        }
    };
    return self;

}