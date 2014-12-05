var Terminal = (function() {

    /* Helper functions */
    var parseDirectory = Util.parseDirectory;
    var prettyPrint = Util.prettyPrint;
    var echoTemplate = Util.echoTemplate;

    var unameminlen = 4;
    var unamemaxlen = 20;

    var self = {

        /* Login interpreter */
        login: function(command, term) {
            var username = $.trim(command);

            if (username.length < unameminlen || unamemaxlen < username.length) {
                username = 'dissident';
            }

            if (username !== '') {
                term.pause();

                $.ajax({
                    type: 'POST',
                    url: $app.SCRIPT_ROOT + '/login',
                    data: {username: username},
                    success: function(data) {
                        // TODO: If username already exists, prompt for password.
                        System.user = new User(username);
                        File.getDirectory('home.json', function(json) {
                            System.dirTree = json;
                            System.directory = json[System.path];
                            term.push(self.interpreter, self.options.main);
                            term.clear();
                            term.greetings();
                            Story.checkStory(term, null);
                        });

                        $.ajax({
                            type: 'GET',
                            url: [$app.SCRIPT_ROOT, '/static/content/man.json'].join(''),
                            success: function(json) {
                                self.manuals = _.isString(json) ? $.parseJSON(json) : json;
                            },
                        }).fail(function(jqXHR, textStatus, error) {
                            console.error(error);
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
         * Return a string to allow piping or redirection, or an TermError object with a default message.
         * End result will be printed in terminal.
         */
        commands: {
            cat: function(cmd, term) {
                var dir = _.first(cmd.args);
                if (!dir) {
                    throw new TermError(TermError.Type.INVALID_ARGUMENTS, 'cannot cat without arguments');
                }
                var newPath = parseDirectory(dir);
                if (!newPath) {
                    throw new TermError(TermError.Type.FILE_NOT_FOUND, 'cat: ' + cmd.rest + ': No such file');
                }

                var newFile = System.dirTree[newPath];
                if (newFile.type === 'dir') {
                    throw new TermError(TermError.Type.INVALID_FILE_TYPE, 'cat: ' + cmd.rest + ' is a directory');
                } else {
                    if (System.progress.arc === 'gov' && System.progress.value === 1 && (/gov\/data\/citizens/).test(newPath)) {
                        // FIXME: Hackily hardcoded
                        newFile.text = Util.generateProfile(dir, true);
                        return newFile.text;
                    }
                    if (newFile.type === 'html') {
                        prettyPrint(term, newFile.text, {raw: true}, {css: newFile.style || {}});
                    } else {
                        return newFile.text;
                    }
                }
            },

            cd: function(cmd, term) {
                // TODO: Improve error messages
                var dir = _.first(cmd.args);
                if (dir) {
                    var newPath = parseDirectory(dir);
                    if (newPath) {
                        var newDir = System.dirTree[newPath];
                        if (newDir.type === 'dir') {
                            if (newDir.locked) {
                                throw new TermError(TermError.Type.PERMISSION_DENIED, 'cd: ' + cmd.rest + ': Permission denied');
                            }
                            System.path = newPath;
                            System.directory = newDir;
                        } else {
                            throw new TermError(TermError.Type.INVALID_FILE_TYPE, 'cd: ' + cmd.rest + ' is not a directory');
                        }
                    } else {
                        throw new TermError(TermError.Type.DIRECTORY_NOT_FOUND, 'cd: ' + cmd.rest + ': No such file or directory');
                    }
                } else {
                    // Handle case with no arguments
                    throw new TermError(TermError.Type.INVALID_ARGUMENTS, 'cannot cd without arguments');
                }
            },

            chmod: function(cmd, term, sudo) {
                if (!sudo) {
                    throw new TermError(TermError.Type.PERMISSION_DENIED, 'chmod: Permission denied');
                }
                var chmod_match = (/^[u,g,o,a]+[\+,\=][w,r,x]+ (\w+)/).exec(cmd.rest);
                if (!chmod_match) {
                    throw new TermError(TermError.Type.INVALID_ARGUMENTS, 'chmod: invalid arguments');
                }

                var file = chmod_match[1];
                if (file) file = Util.parseDirectory(file);
                if (file) {
                    File.unlockFile(file);
                } else {
                    throw new TermError(TermError.Type.DIRECTORY_NOT_FOUND, 'chmod: No such file or directory');
                }
            },

            cp: function(cmd, term) {
                // TODO: copy files
            },

            credits: function(cmd, term) {
                echoTemplate(term, 'credits');
            },

            echo: function(cmd, term) {
                return cmd.rest;
            },

            eval: function(cmd, term) {
                // Only available to debuggers or console hackers!
                // Lying is bad, but we don't want to get their hopes up.
                if (!System.debug) {
                    throw new TermError(TermError.Type.COMMAND_NOT_FOUND, 'eval: command not found');
                } else if (cmd.rest === '') {
                    throw new TermError(TermError.Type.INVALID_ARGUMENTS, 'please enter script to eval.');
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
                if (System.progress.help) {
                    if (System.progress.arc !== 'gov') {
                        prettyPrint(term, 'Task: ' + System.progress.help, null, {color: Util.Color.AI_GREEN});
                    } else {
                        prettyPrint(term, System.progress.help, null, {color: Util.Color.AI_RED});
                    }
                }
                text = 'For a list of available commands, input `[[i;#fff;]man]`. To learn about an individual command, type `[[i;#fff;]man <cmd>]`.';
                return text;
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
                var newPath = dir ? parseDirectory(dir) : System.path;
                if (newPath) {
                    var newDir = System.dirTree[newPath];
                    if (newDir.type === 'dir') {
                        return _.map(Util.getChildren(newPath), function(child) {
                            var fileOrDir = System.dirTree[child];
                            if (fileOrDir.type === 'dir') {
                                return ['[[;', Util.Color.DIR_BLUE, ';]', fileOrDir.name, '/]'].join('');
                            } else if (fileOrDir.type === 'exe') {
                                return ['[[;', Util.Color.AI_GREEN, ';]', fileOrDir.name, ']'].join('');
                            }
                            return fileOrDir.name;
                        }).join('\t');
                    } else {
                        return dir;
                    }
                } else {
                    throw new TermError(TermError.Type.DIRECTORY_NOT_FOUND, 'ls: ' + cmd.rest + ': directory not found');
                }
            },

            man: function(cmd, term) {
                var text;
                if (cmd.args.length > 0) {
                    var command = cmd.args[0];
                    if (_.contains(System.user.commands, command) && _.has(self.manuals, command)) {
                        // Load manual for command.
                        var manual = self.manuals[command];
                        text = [];
                        text.push('[[;#fff;]COMMAND]: ' + command + ' - ' + manual.name);
                        text.push('[[;#fff;]EXAMPLE USAGE]: ' + manual.examples.join('\n               '));
                        text.push('[[;#fff;]DESCRIPTION]: ' + manual.description + '\n');
                        prettyPrint(term, text.join('\n\n'));
                        return;
                    } else if (_.has(self.commands, command)) {
                        return 'While that is a legitimate command, you have not yet demonstrated sufficient mastery ' +
                               'of more basic commands to use it.';
                    } else {
                        return 'No manual entry found for `[[i;#fff;]' + command + ']`.\n' +
                               'Type `[[i;#fff;]man]` to see a list of commands.';
                    }
                }

                text = 'To learn more about individual commands, type `[[i;#fff;]man <cmd>]`.\n\n' +
                       'Available commands:\n' + System.user.commands.join('\t');
                if (System.debug) {
                    text += '\nSuperuser commands:\n' +
                            _.difference(_.keys(self.commands), System.user.commands).join('\t');
                }
                return text;
            },

            mkdir: function(cmd, term) {
                // TODO: make directory
            },

            mv: function(cmd, term) {
                if (cmd.args.length < 2) {
                    throw new TermError(TermError.Type.INVALID_ARGUMENTS, 'cannot mv without 2 arguments');
                }
                var file, target, targetName;
                var fileDir = parseDirectory(cmd.args[0]);
                var targetDir = parseDirectory(cmd.args[1]);

                // Check that file exists and is not directory
                if (fileDir) {
                    file = System.dirTree[fileDir];
                    targetName = file.name;
                    if (file.type === 'dir') {
                        throw new TermError(TermError.Type.INVALID_FILE_TYPE, 'mv: ' + cmd.args[0] + ': cannot move directory');
                    }
                } else {
                    throw new TermError(TermError.Type.FILE_NOT_FOUND, 'mv: ' + cmd.args[0] + ': No such file');
                }
                // Check permissions
                if (!file.movable) {
                    throw new TermError(TermError.Type.PERMISSION_DENIED, 'mv: ' + cmd.args[0] + ': Permission denied');
                }

                // If target does not exist, check one directory above.
                if (!targetDir) {
                    targetDir = parseDirectory(_.initial(cmd.args[1].split('/')).join('/'));
                    targetName = _.last(cmd.args[1].split('/'));
                }
                if (targetDir) {
                    target = System.dirTree[targetDir];
                    if (target.type !== 'dir') {
                        throw new TermError(TermError.Type.FILE_ALREADY_EXISTS, 'mv: ' + cmd.args[1] + ': target already exists');
                    }
                    if (!target.movable) {
                        throw new TermError(TermError.Type.PERMISSION_DENIED, 'mv: ' + cmd.args[0] + ': Permission denied');
                    }
                } else {
                    throw new TermError(TermError.Type.FILE_NOT_FOUND, 'mv: ' + cmd.args[1] + ': No such file or directory');
                }

                var newFile = _.clone(file);
                newFile.name = targetName;
                File.createFile(targetDir, targetName, newFile);
                File.removeFile(_.initial(fileDir.split('/')).join('/'), file.name);
            },

            pwd: function(cmd, term) {
                return Util.getFullPath(null, true);
            },

            ps: function(cmd, term) {
                Util.log(System.proc);
                // TODO: list processes
                return 'Processes: ';
            },

            rm: function(cmd, term) {
                if (!cmd.args) {
                    throw new TermError(TermError.Type.INVALID_ARGUMENTS, 'rm: needs an argument');
                }
                var fileDir = parseDirectory(cmd.args[0]);
                if (!fileDir) {
                    throw new TermError(TermError.Type.FILE_NOT_FOUND, 'rm: ' + cmd.args[0] + ': No such file');
                }
                var file = System.dirTree[fileDir];
                if (file.type === 'dir') {
                    throw new TermError(TermError.Type.PERMISSION_DENIED, 'rm: ' + cmd.args[0] + ': Permission denied! cannot rm directory');
                }

                // Check permissions
                if (!file.removable) {
                    throw new TermError(TermError.Type.PERMISSION_DENIED, 'rm: ' + cmd.args[0] + ': Permission denied');
                }

                File.removeFile(_.initial(fileDir.split('/')).join('/'), file.name);
            },

            sudo: function(cmd, term) {
                var SUDO_PASSWORD = '3249';
                self.input(term, 'Password: ', function(input) {
                    if (input !== SUDO_PASSWORD) {
                        prettyPrint(term, 'Password rejected. This access will be logged.', null, {color: Util.Color.AI_YELLOW});
                        return;
                    } else if (!_.contains(System.user.commands, _.first(cmd.args))) {
                        prettyPrint(term, _.first(cmd.args) + ': command not found.', null, {color: Util.Color.AI_YELLOW});
                        return;
                    }

                    // Run all permissible commands
                    var newcmd = {
                        name: _.first(cmd.args),
                        args: _.rest(cmd.args),
                        options: cmd.options,
                        rest: _.rest(cmd.args).join(' ')
                    };
                    try {
                        var result = self.commands[newcmd.name](newcmd, term, true);
                        if (result && _.isString(result)) {
                            prettyPrint(term, result);
                        }
                        Story.checkStory(term, newcmd.name, null);
                    } catch (error) {
                        if (error.type === TermError.Type.PERMISSION_DENIED) {
                            error.text = 'sudo: permission denied. This command is restricted to the highest administrator privileges only.';
                        }
                        Story.checkStory(term, newcmd.name, error);
                    }
                }, true);
            },

            test: function(cmd, term) {
                // Only available to debuggers or console hackers!
                // Lying is bad, but we don't want to get their hopes up.
                if (!System.debug) {
                    throw new TermError(TermError.Type.COMMAND_NOT_FOUND, 'test: command not found');
                }
                switch (cmd.args[0]) {
                    case 'confirm':
                        self.confirm(term, 'hello? [y/n] ', function() {
                            prettyPrint(term, 'whee');
                        });
                        break;

                    case 'animateText':
                        var text = 'i am typing`2000`\nwatch me ``escape``';
                        Util.animateText(term, text, '%> ').then(function() {
                            prettyPrint(term, 'all done');
                        });
                        break;

                    case 'command':
                        Util.log(cmd);
                        break;

                    case 'echoTemplate':
                        echoTemplate(term, 'doesNotExist');
                        break;

                    case 'panic':
                        echoTemplate(term, 'panic');
                        break;

                    case 'prettyPrint':
                        prettyPrint(term, 'this is red text', null, {color: 'red'});
                        prettyPrint(term, 'this is slick', null, {css: {'font-style': 'italic'}});
                        prettyPrint(term, 'i am class death', null, {class: 'death'});
                        prettyPrint(term, '<em>italicized html</em>', {raw: true});
                        break;

                    case 'chain':
                        Util.animateText(term, 'Testing a chain of commands').then(function() {
                            return Util.confirm(term, 'DOES IT WORK? [y/n] ').fail(function() {
                                prettyPrint(term, 'you failed!');
                            });
                        }).then(function() {
                            prettyPrint(term, 'What is your favorite color?');
                            return Util.input(term);
                        }).then(function(result) {
                            prettyPrint(term, 'you typed: ' + result);
                            prettyPrint(term, 'What is your favorite thing to rm? (cheese, milk, puppies)');
                            return Util.multichoice(term, ['cheese', 'milk', 'puppies']);
                        }).then(function(result) {
                            prettyPrint(term, 'you typed: ' + result);
                            prettyPrint(term, 'YOU HAVE ADVANCED THE STORY');
                        });
                        break;

                    case 'wait':
                        Util.wait(term, 2000).then(function() {
                            prettyPrint(term, 'waited 1 second');
                        });
                        break;

                    default:
                        prettyPrint(term, 'Invalid command. Options are: ' + [
                            'chain', 'confirm', 'animateText', 'echoTemplate', 'panic', 'prettyPrint', 'command', 'wait']
                            .join(', '));
                }
            },

            whoami: function(cmd, term) {
                return System.user.name;
            }
        },

        /* Main interpreter for shell */
        interpreter: function(command, term) {
            var result = '';
            var commands = command.split('|');
            var name;

            var children = _.map(Util.getChildren(System.path), function(child) {
                return System.dirTree[child].name;
            });

            // Loop through piped commands, appending each result onto next command.
            try {
                for (var i = 0, len = commands.length; i < len; i++) {
                    var cmd = Util.parseCommand([commands[i], result].join(' '));
                    if (!cmd) {
                        return;
                    }
                    name = cmd.name;

                    if (_.has(self.commands, cmd.name)) {
                        // Check for permissions.
                        if (System.debug || _.contains(System.user.commands, cmd.name)) {
                            result = self.commands[cmd.name](cmd, term);
                            if (!result || !_.isString(result)) {
                                break;
                            }
                        } else {
                            throw new TermError(TermError.Type.COMMAND_LOCKED,
                                'While that is a legitimate command, you have not yet demonstrated sufficient mastery of more basic commands to use it.');
                        }
                    } else if ((/^\.\/\w+/).test(cmd.name)) {
                        // Run executable if file exists and user has valid permissions.
                        // TODO: for now, assume executables are only run in the same directory.
                        var file = cmd.name.substring(2);
                        if (_.contains(children, file)) {
                            result = Executable.executeFile(term, file, cmd);
                        } else {
                            throw new TermError(TermError.Type.FILE_NOT_FOUND, cmd.name + ': no such file or directory');
                        }
                    } else {
                        throw new TermError(TermError.Type.COMMAND_NOT_FOUND, cmd.name + ': command not found');
                    }
                }
            } catch (error) {
                Story.checkStory(term, name, error);
                return;
            }

            // Print final result to terminal and check to advance story.
            if (result && _.isString(result)) {
                prettyPrint(term, result);
            }
            Story.checkStory(term, name, null);
        },

        /* Confirmation terminal: awaits y/n input */
        confirm: function(term, prompt, success, reject) {
            term.push(function(command) {
                command = $.trim(command);
                if (/^(y|yes|yea)$/i.test(command)) {
                    term.pop();
                    success(command);
                } else if (/^(n|no|nay)$/i.test(command)) {
                    term.pop();
                    (reject || _.noop)(command);
                } else {
                    prettyPrint(term, "Please enter 'yes' or 'no'.");
                }
            }, self.options.confirm(prompt));
        },

        /* Multiple choice terminal: select a predetermined option */
        multichoice: function(term, options, prompt, callback, condition) {
            term.push(function(command) {
                command = $.trim(command.toLowerCase());
                if ((condition || _.noop)(command)) {
                    return;
                } else if (_.contains(options, command)) {
                    term.pop();
                    callback(command);
                } else {
                    prettyPrint(term, "Please enter one of the options above.", null, {color: Util.Color.AI_YELLOW});
                }
            }, self.options.multichoice(options, prompt));
        },

        /* Input terminal: prints prompt and calls callback with input */
        input: function(term, prompt, callback, condition) {
            term.push(function(command) {
                command = $.trim(command);
                if ((condition || _.noop)(command)) {
                    return;
                }
                term.pop();
                callback(command);
            }, self.options.input(prompt));
        },

        /* Countdown timer prompt (relaxation station) */
        countdown: function(term, callback) {
            term.push(_.noop, self.options.countdown(callback));
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
                        var greetings = self.options[name].greetings;
                        callback(_.isFunction(greetings) ? greetings() : greetings || '');
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
                    if (Util.animating) {
                        // Skip animating text on Ctrl+C or Enter
                        if (System.exe !== 'relax' && ((e.which === 67 && e.ctrlKey) || e.which === 13)) {
                            Util.animating = false;
                        }
                        return false;
                    }
                    // Ctrl+D: cannot exit past login screen
                    if (e.which === 68 && e.ctrlKey) {
                        return false;
                    }
                }
            },

            login: {
                name: 'login',
                greetings: function() {
                    return 'LX2084 Server Literacy Training Course\n' +
                           'v' + System.version + '\n\n' +
                           'Greetings, USER #' + _.random(10000, 99999).toString() + '\n' +
                           'Please enter your official government identifier.';
                },
                prompt: '$> ',
                completion: [],
                onStart: function(term) {
                    term.clear();
                    term.greetings();
                }
            },

            main: {
                name: 'main',
                greetings: function() {
                    return 'LX2084 Server Literacy Training Course\n' +
                           'v' + System.version + '\n\n';
                },
                prompt: function(callback) {
                    callback('[' + System.user.name + ' ' + Util.getFullPath() + ']$ ');
                },
                completion: function(term, str, callback) {
                    var results = Util.tabComplete(term, System.user.commands);
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
            },

            multichoice: function(options, prompt) {
                return {
                    completion: options,
                    prompt: prompt || '$> '
                };
            },

            input: function(prompt) {
                return {
                    prompt: prompt || '$> '
                };
            },

            countdown: function(callback) {
                return {
                    prompt: ' ',
                    keydown: function(e, term) {
                        // Check for Ctrl-C
                        if (e.which === 67 && e.ctrlKey) {
                            callback(term);
                        } else {
                            return false; // disable other keys
                        }
                    }
                };
            }
        },

        /* Additional settings */
        manuals: {},
        terminal: null,
        offset: 100 // height offset from window height
    };
    return self;

})();
