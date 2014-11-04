/* Utility and helper functions */
var Util = (function() {

    var HOME_DIR = '/home';
    var self = {};

    String.prototype.capitalize = function() {
        return this.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    /* Overwrite argument parser to ignore ints, floats, and regex */
    var command_re = /('[^']*'|"(\\"|[^"])*"|\/(\\\/|[^\/])+\/[gimy]*|(\\ |[^ ])+|[\w-]+)/g;
    $.terminal.parseArguments = function(string) {
        return $.map(string.match(command_re) || [], function(arg) {
            if (arg[0] === "'" && arg[arg.length-1] === "'") {
                return arg.replace(/^'|'$/g, '');
            } else if (arg[0] === '"' && arg[arg.length-1] === '"') {
                arg = arg.replace(/^"|"$/g, '').replace(/\\([" ])/g, '$1');
                return arg.replace(/\\\\|\\t|\\n/g, function(string) {
                    if (string[1] === 't') {
                        return '\t';
                    } else if (string[1] === 'n') {
                        return '\n';
                    } else {
                        return '\\';
                    }
                }).replace(/\\x([0-9a-f]+)/gi, function(_, hex) {
                    return String.fromCharCode(parseInt(hex, 16));
                }).replace(/\\0([0-7]+)/g, function(_, oct) {
                    return String.fromCharCode(parseInt(oct, 8));
                });
            } else {
                return arg.replace(/\\ /g, ' ');
            }
        });
    };

    /* Debug-specific logging utility function. Also echoes in terminal. */
    self.log = function(args) {
        if (!System.debug) {
            return;
        }
        // If first argument contains 'error', print message in red.
        var error = _.isString(args) && /error/i.test(args);

        if (console) {
            var printConsole = error ? console.error : console.log;
            printConsole.apply(console, arguments);
        }

        var terminal = $.terminal.active();
        if (terminal) {
            var newArguments = _.map(arguments, function(arg) {
                return _.isString(arg) ? arg : arg.toString();
            });
            var printTerminal = error ? terminal.error : terminal.echo;
            printTerminal('LOG: ' + newArguments.join(' '));
        }
    };

    self.parseCommand = function(command) {
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

    /* Trim directory or file from path after last / */
    self.getParent = function(path) {
        if (path === HOME_DIR) return null;
        return path.replace(/\/[^\/]+$/, '');
    };

    /* Return array of full paths of all non-hidden children */
    self.getChildren = function(path) {
        var dir = System.dirTree[path];
        if (dir.type !== 'dir') {
            return [];
        }
        return _(dir.children).map(function(child) {
            if (child.charAt(0) === '/') {
                return child;
            } else {
                return path + '/' + child;
            }
        }).filter(function(child) {
            return !System.dirTree[child].hidden;
        }).value();
    };

    /* Process path and return new path or null if path is invalid.
     * If partial, returns last valid directory in string.
     */
    self.parseDirectory = function(path, partial) {
        // TODO: check permissions?
        var dirs = _.compact(path.split('/'));
        var currentDir = System.directory;
        var currentPath = System.path;
        for (var i = 0, len = dirs.length; i < len; i++) {
            if (dirs[i] === '.') {
                continue;
            } else if (dirs[i] === '..') {
                // Go up a level
                currentPath = self.getParent(currentPath);
                if (currentPath) {
                    currentDir = System.dirTree[currentPath];
                } else {
                    self.log('At root directory, cannot go up!');
                    return null;
                }
            } else if (i === 0 && (dirs[i] === 'home' || dirs[i] === '~')) {
                // Return to home directory
                currentPath = HOME_DIR;
                currentDir = System.dirTree[currentPath];
            } else {
                // Go to child directory or file
                var child = _.find(self.getChildren(currentPath), function(child) {
                    return System.dirTree[child].name === dirs[i];
                });
                if (child) {
                    currentPath = child;
                    currentDir = System.dirTree[child];
                } else if (partial) {
                    break;
                } else {
                    self.log('Directory not found:', path);
                    return null;
                }
            }
        }
        return currentPath;
    };

    /* Return full path of file or directory */
    self.getFullPath = function(path, fullHome) {
        var currentPath = path || System.path;
        if (fullHome) {
            return currentPath;
        }
        currentPath = currentPath.replace(new RegExp('^' + HOME_DIR), '~');

        // Extra hack to hide path while in maze
        if ((/01\/maze\/.+/).test(currentPath)) {
            currentPath = currentPath.replace(/\/maze\/.+/, '/maze/???');
        }
        return currentPath;
    };

    /* Return array of suggested commands on tab-complete. */
    self.tabComplete = function(term, commands) {
        // TODO: Fix after refactoring: these functions should now take path strings
        var str = term.get_command();
        var input = _.last(_.compact(str.split(' '))) || '';

        var allChildren = function(path) {
            return _.map(self.getChildren(path), function(dirOrFile) {
                // TODO: prepend relative path from input to all children
                /*if (/\//.test(input)) {
                    return input.replace(/\/[^\/]+$/, System.dirTree[dirOrFile].name);
                }*/
                return System.dirTree[dirOrFile].name;
            });
        };
        var allDirectories = function(path) {
            return _(self.getChildren(path)).filter(function(dirOrFile) {
                return System.dirTree[dirOrFile].type === 'dir';
            }).map(function(dir) {
                // TODO: prepend relative path from input to all children
                /*if (/\//.test(input)) {
                    return input.replace(/\/[^\/]+$/, System.dirTree[dir].name + '/');
                }*/
                return System.dirTree[dir].name + '/';
            }).value();
        };
        var allFiles = function(path) {
            return _(self.getChildren(path)).filter(function(dirOrFile) {
                return System.dirTree[dirOrFile].type !== 'dir';
            }).map(function(file) {
                // TODO: prepend relative path from input to all children
                /*if (/\//.test(input)) {
                    return input.replace(/\/[^\/]+$/, System.dirTree[file].name);
                }*/
                return System.dirTree[file].name;
            }).value();
        };
        var allExes = function(path) {
            return _(self.getChildren(path)).filter(function(dirOrFile) {
                return System.dirTree[dirOrFile].type === 'exe';
            }).map(function(file) {
                // TODO: prepend relative path from input to all children
                /*if (/\//.test(input)) {
                    return input.replace(/\/[^\/]+$/, System.dirTree[file].name);
                }*/
                return './' + System.dirTree[file].name;
            }).value();
        };

        if ((/^\s*(cat)\s(.*)/).test(str)) {
            return allChildren(self.parseDirectory(input, true));
        } else if ((/^\s*(cd|ls)\s(.*)/).test(str)) {
            return allDirectories(self.parseDirectory(input, true));
        } else if ((/^\.\/(.*)/).test(str)) {
            return allExes(self.parseDirectory(input, true));
        }
        return commands;
    };

    /* Echo message to terminal with custom styling.
     * options: {raw: bool, flush: bool}.
     * style: {color: '#hexcol', class: 'class1 class2', css: {}}.
     * output: where to print (default is 'stdout').
     */
    self.prettyPrint = function(term, message, options, style, output) {
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
    self.echoTemplate = function(term, template) {
        term.pause();

        $.ajax({
            type: 'GET',
            url: [$app.SCRIPT_ROOT, '/static/messages/', template, '.html'].join(''),
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

    /* Animated typing terminal.
     * Use `x` in message to indicate x ms pause,
     * and `` to escape (write ` character). */
    self.animating = false;
    self.animateTextAsync = function(term, message, prompt, callback, delay, style) {
        if (message.length === 0) {
            return;
        }
        prompt = prompt || '';
        callback = callback || _.noop;
        delay = delay || 40;
        self.animating = true;

        var old_prompt = term.get_prompt();
        var c = 0;
        term.set_prompt(prompt);
        /* Every delay ms, insert a new character into the command line.
         * When all characters are inserted, echo to terminal and replace prompt. */
        var readCharacter = function() {
            if (!self.animating || c === message.length) {
                self.prettyPrint(term, prompt + term.get_command(), null, style);
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
                            waitCount = parseInt(digits[0], 10);
                            c += digits[0].length;
                        }
                        _.delay(readCharacter, waitCount + delay);
                        return;
                }
            }
            _.delay(readCharacter, delay);
        };
        _.delay(readCharacter, delay);
    };

    /* Promises! Allow chaining of multiple asynchronous requests via then and fail */
    self.animateText = function(term, message, prompt, delay, style) {
        var deferred = $.Deferred();
        self.animateTextAsync(term, message, prompt, deferred.resolve, delay);
        return deferred.promise();
    };

    // Animated AI text: hard-code text color and speed
    self.animateAI = function(term, color, message, prompt) {
        var deferred = $.Deferred();
        var cmd = term.children('.cmd');
        var old_color = cmd.css('color');
        var resolve = function() {
            cmd.css('color', old_color);
            deferred.resolve();
        };
        cmd.css('color', color);
        self.animateTextAsync(term, message, prompt, resolve, 40, {color: color});
        return deferred.promise();
    };

    self.confirm = function(term, prompt) {
        var deferred = $.Deferred();
        Terminal.confirm(term, prompt, deferred.resolve, deferred.reject);
        return deferred.promise();
    };

    self.multichoice = function(term, options, prompt, condition) {
        var deferred = $.Deferred();
        Terminal.multichoice(term, options, prompt, deferred.resolve, condition);
        return deferred.promise();
    };

    self.input = function(term, prompt) {
        var deferred = $.Deferred();
        Terminal.input(term, prompt, deferred.resolve);
        return deferred.promise();
    };

    return self;
})();
