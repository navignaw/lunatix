var Terminal = function(system) {

    /* Helper functions */
    var Util = Utility(system);
    var parseCommand = Util.parseCommand;
    var parseDirectory = Util.parseDirectory;
    var prettyPrint = Util.prettyPrint;
    var echoTemplate = Util.echoTemplate;

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
                        Util.log('logged in as:', username);
                        Util.log(system.user);
                        File.getDirectory('maze.json', function(json) {
                            system.dirTree = json;
                            system.directory = json["home"];
                            term.push(self.interpreter, self.options.main);
                            term.clear();
                            term.greetings();
                        });
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
            cat: function(cmd, term) {
                var dir = _.first(cmd.args);
                var newFile = dir ? parseDirectory(dir) : system.directory;
                if (newFile) {
                    if (newFile.type !== 'dir') {
                        return newFile.text;
                    } else {
                        prettyPrint(term, 'cat: ' + cmd.rest + ': is a directory');
                    }
                } else {
                    prettyPrint(term, 'cat: ' + cmd.rest + ': No such file');
                }
            },

            cd: function(cmd, term) {
                // TODO: Improve error messages
                var dir = _.first(cmd.args);
                if (dir) {
                    var newDir = parseDirectory(dir);
                    if (newDir) {
                        // TODO: what if they don't have permission to access directory?
                        if (newDir.type === 'dir') {
                            system.directory = newDir;
                        } else {
                            prettyPrint(term, 'cd: ' + cmd.rest + ' is not a directory');
                        }
                    } else {
                        prettyPrint(term, 'cd: ' + cmd.rest + ': No such file or directory');
                    }
                } else {
                    // Handle case with no arguments
                    prettyPrint(term, 'cannot cd without arguments');
                }
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
                        Util.log(result);
                    }
                } catch(e) {
                    Util.log(e.toString());
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
                var dir = _.first(cmd.args);
                var newDir = dir ? parseDirectory(dir) : system.directory;
                if (newDir) {
                    if (newDir.type === 'dir') {
                        return _.map(newDir.children, function(child) {
                            return system.dirTree[child].name;
                        }).join('\t');
                    } else {
                        return newDir.name;
                    }
                } else {
                    prettyPrint(term, 'ls: ' + cmd.rest + ': directory not found');
                }
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
                var text = 'To learn more about individual commands, type ' +
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
                return system.directory.name;
            },

            ps: function(cmd, term) {
                Util.log(system.proc);
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
                        Util.animateText(term, text, '%> ', function() {
                            prettyPrint(term, 'all done');
                        });
                        break;

                    case 'command':
                        Util.log(cmd);
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
                return system.user.name;
            }
        },

        /* Main interpreter for shell */
        interpreter: function(command, term) {
            var result = '';
            var commands = command.split('|');
            var name;

            // Loop through piped commands, appending each result onto next command.
            for (var i = 0; i < commands.length; i++) {
                var cmd = parseCommand([commands[i], result].join(' '));
                if (!cmd) {
                    return;
                }
                name = cmd.name;

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
                } else if (Util.isExecutable(cmd.name)) {
                    // TODO: execute file if permissions are okay.
                } else {
                    prettyPrint(term, cmd.name + ': command not found');
                    return;
                }
            }

            // Print final result to terminal and check to advance story.
            if (result) {
                prettyPrint(term, result);
            }
            Story.checkStory(term, system, name);
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
                onInit: function(term) {
                    term.push(self.login, self.options.login);
                },
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
                    var results = Util.tabComplete(term, system.user.commands);
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