var Terminal = function(system) {

    /* Helper functions */
    var init = function(term) {
        term.push(self.login, self.options.login);
    };

    var parseCommand = function(command) {
        // Parse input string into array, stripping whitespace and quotes.
        var args = $.terminal.parseArguments($.trim(command));
        if (args.length === 0) {
            return null;
        }

        var name = _.first(args);
        args = _.rest(args);

        // Find all options preceded by - or --
        var options = _.filter(args, function(arg) {
            return (/^-{1,2}\w+$/).test(arg);
        });

        // TODO: redirect commands <, >

        return {
            name: name,
            args: args,
            options: options,
            rest: args.join(' ')
        };
    };

    var isExecutable = function(path) {
        // TODO: Check if file at path exists and is executable.
        return false;
    };

    var tabComplete = function(str, commands) {
        str = $.trim(str);
        // TODO: Add support for tab-completing files and directories.
        if (str === '' || str === './') {
            return []; // directories and files
        } else if (str === 'cd' || str === 'ls') {
            return []; // directories
        }

        return commands;
    };

    /* Echo message to terminal with custom styling.
     * options: {raw: bool, flush: bool}.
     * style: {color: '#hexcol', class: 'class1 class2', css: {}}.
     * output: where to print (default is 'stdout').
     */
    var prettyPrint = function(term, message, options, style, output) {
        options = options || {};
        output = output || 'stdout';

        if (output === 'stdout') {
            var echoOptions = {};
            if (style) {
                style.css = style.css || {};
                if (_.has(style, 'color')) {
                    style.css.color = style.color;
                }

                options.finalize = function(div) {
                    div.css(style.css);
                    if (_.has(style, 'class')) {
                        div.addClass(style.class);
                    }
                };
            }
            term.echo(message, options);
        } else {
            // TODO: If output is file, save new file with output.
        }
    };

    /* Echo HTML from template */
    var echoTemplate = function(term, type, template) {
        term.pause();

        $.ajax({
            type: 'GET',
            url: $app.SCRIPT_ROOT + '/' + type + '/' + template,
            success: function(html) {
                term.echo(html, {raw: true});
            }
        }).fail(function(jqXHR, textStatus, error) {
            term.exception(error);
            term.echo(jqXHR.responseText, {raw: true});
        }).always(function() {
            term.resume();
        });
    };

    var self = {

        /* Login interpreter */
        login: function(command, term) {
            var username = $.trim(command);
            if (username !== '') {
                term.pause();

                $.ajax({
                    type: 'POST',
                    url: $app.SCRIPT_ROOT + '/login',
                    data: {username: username},
                    success: function(data) {
                        // TODO: If username already exists, prompt for password.
                        system.user = new User(username, system.debug);
                        system.log('logged in as:', username);
                        system.log(system.user);
                        term.push(self.interpreter, self.options.main);
                        term.clear();
                        term.greetings();
                    }
                }).fail(function() {
                    term.error("Login failed. Please try again.");
                    term.greetings();
                }).always(function() {
                    term.resume();
                });
            }
        },

        /* Accepted commands.
         * Return a string to allow piping or redirecting result.
         * End result will be printed in terminal.
         */
        commands: {
            cd: function(cmd, term) {
                // TODO: change directory
            },

            chmod: function(cmd, term) {
                // TODO: change mode/permissions
            },

            cp: function(cmd, term) {
                // TODO: copy files
            },

            credits: function(cmd, term) {
                echoTemplate(term, 'commands', 'credits');
            },

            echo: function(cmd, term) {
                return cmd.rest;
            },

            eval: function(cmd, term) {
                // Only available to debuggers or console hackers!
                // Lying is bad, but we don't want to get their hopes up.
                if (!system.user.superuser) {
                    prettyPrint(term, 'eval: command not found');
                } else if (cmd.rest === '') {
                    prettyPrint(term, 'please enter script to eval.');
                }
                try {
                    var result = window.eval(cmd.rest);
                    if (!_.isUndefined(result)) {
                        system.log(result);
                    }
                } catch(e) {
                    system.log(e.toString());
                }
            },

            grep: function(cmd, term) {
                // TODO: grep
            },

            help: function(cmd, term) {
                return self.commands.man(cmd, term);
            },

            kill: function(cmd, term) {
                // TODO: kill process
            },

            logout: function(cmd, term) {
                prettyPrint(term, 'Are you sure you wish to exit? ' +
                                  'Any unsaved data will be lost.');
                self.confirm(term, null, function() {
                    term.pause();

                    $.ajax({
                        type: 'POST',
                        url: $app.SCRIPT_ROOT + '/logout'
                    }).always(function() {
                        term.pop();
                        term.resume();
                    });
                });
            },

            ls: function(cmd, term) {
                // TODO: list files
                return 'Files: ';
            },

            man: function(cmd, term) {
                if (cmd.args.length > 0) {
                    var command = cmd.args[0];
                    if (_.contains(system.user.commands, command)) {
                        // Load manual for command.
                        echoTemplate(term, 'man', cmd.args[0]);
                        return;
                    } else {
                        return 'No manual entry found for `[[i;#fff;]' + command + ']`.\n' +
                               'Type `[[i;#fff;]' + cmd.name + ']` to see a list of commands.';
                    }
                }
                // TODO: be more helpful.
                var text = 'To learn more about invidual commands, type ' +
                           '`[[i;#fff;]' + cmd.name + ' <cmd>]`.\n\n' +
                           'Available commands:\n' + system.user.commands.join('\t');
                if (system.user.superuser) {
                    text += '\nSuperuser commands:\n' +
                            _.difference(_.keys(self.commands), system.user.commands).join('\t');
                }
                return text;
            },

            mkdir: function(cmd, term) {
                // TODO: make directory
            },

            mute: function(cmd, term) {
                // TODO: mute sound
                if (self.muted) {
                    return 'Sound unmuted.';
                } else {
                    return 'Sound muted.';
                }
            },

            mv: function(cmd, term) {
                // TODO: move files
            },

            pwd: function(cmd, term) {
                system.log(system.dir);
                return system.dir.name;
            },

            ps: function(cmd, term) {
                system.log(system.proc);
                // TODO: list processes
                return 'Processes: ';
            },

            quit: function(cmd, term) {
                self.commands.logout(cmd, term);
            },

            test: function(cmd, term) {
                // Only available to debuggers or console hackers!
                // Lying is bad, but we don't want to get their hopes up.
                if (!system.user.superuser) {
                    prettyPrint(term, 'test: command not found');
                }
                switch (cmd.args[0]) {
                    case 'confirm':
                        self.confirm(term, 'hello? [y/n] ', function() {
                            prettyPrint(term, 'whee');
                        });
                        break;

                    case 'animateText':
                        var text = 'i am typing`2000`\nwatch me ``escape``';
                        self.animateText(term, text, '%> ', function() {
                            prettyPrint(term, 'all done');
                        });
                        break;

                    case 'command':
                        system.log(cmd);
                        break;

                    case 'echoTemplate':
                        echoTemplate(term, 'commands', 'doesNotExist');
                        break;

                    case 'prettyPrint':
                        prettyPrint(term, 'this is red text', null, {color: 'red'});
                        prettyPrint(term, 'this is slick', null, {css: {'font-style': 'italic'}});
                        prettyPrint(term, 'i am class death', null, {class: 'death'});
                        prettyPrint(term, '<em>italicized html</em>', {raw: true});
                        break;

                    default:
                        prettyPrint(term, 'Invalid command. Options are: ' + [
                            'confirm', 'animateText', 'echoTemplate', 'prettyPrint', 'command']
                            .join(', '));
                }
            },

            whoami: function(cmd, term) {
                system.log(system.user);
                return system.user.name;
            }
        },

        /* Main interpreter for shell */
        interpreter: function(command, term) {
            var result = '';
            var commands = command.split('|');

            // Loop through piped commands, appending each result onto next command.
            for (var i = 0; i < commands.length; i++) {
                var cmd = parseCommand([commands[i], result].join(' '));
                if (!cmd) {
                    return;
                }

                if (_.has(self.commands, cmd.name)) {
                    // Check for permissions.
                    if (system.user.superuser || _.contains(system.user.commands, cmd.name)) {
                        result = self.commands[cmd.name](cmd, term);
                        if (!result || !_.isString(result)) {
                            break;
                        }
                    } else {
                        prettyPrint(term, cmd.name + ': permission denied');
                        return;
                    }
                } else if (isExecutable(cmd.name)) {
                    // TODO: execute file if permissions are okay.
                } else {
                    prettyPrint(term, cmd.name + ': command not found');
                    return;
                }
            }

            // Print final result to terminal.
            if (result) {
                prettyPrint(term, result);
            }
        },

        /* Confirmation terminal: awaits y/n input */
        confirm: function(term, prompt, success) {
            term.push(function(command) {
                if (/^(y|yes|yea)$/i.test(command)) {
                    term.pop();
                    success();
                } else if (/^(n|no|nay)$/i.test(command)) {
                    term.pop();
                } else {
                    prettyPrint(term, "Please enter 'yes' or 'no'.");
                }
            }, self.options.confirm(prompt));
        },

        /* Animated typing terminal.
         * Use `x` in message to indicate x ms pause,
         * and `` to escape (write ` character). */
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
            var readCharacter = function() {
                if (c === message.length) {
                    prettyPrint(term, prompt + term.get_command());
                    term.set_command('');
                    term.set_prompt(old_prompt);
                    self.animating = false;
                    callback();
                    return;
                }

                var character = message[c++];
                // Check for special character.
                if (character !== '`') {
                    term.insert(character);
                } else if (c !== message.length) {
                    var nextCharacter = message[c++];
                    switch (nextCharacter) {
                        case '`':
                            term.insert('`');
                            break;
                        default:
                            // Extract number of milliseconds to pause.
                            var digits = message.substring(c-1).match(/^\d*/);
                            var waitCount = 0;
                            if (digits) {
                                waitCount = parseInt(digits[0]);
                                c += digits[0].length;
                            }
                            _.delay(readCharacter, waitCount + delay);
                            return;
                    }
                }
                _.delay(readCharacter, delay);
            };
            _.delay(readCharacter, delay);
        },

        /* Terminal options */
        options: {
            base: {
                name: 'lunatix',
                // Hack since greetings are not updated in new terminals.
                greetings: function(callback) {
                    var name = self.terminal.name();
                    if (name === 'lunatix') {
                        callback('');
                    } else {
                        callback(self.options[name].greetings || '');
                    }
                },
                prompt: '$> ',
                completion: [],
                onBlur: false,
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
                    var results = tabComplete(str, system.user.commands);
                    callback(results);
                },
                keydown: function(e, term) {
                    if (self.animating) {
                        return false;
                    }
                    // Custom logout on CTRL+D
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
        },

        /* Additional settings */
        muted: false,
        terminal: null
    };
    return self;

};