/* Utility and helper functions */
var Util = (function() {

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

    /* Process path and return file object or null if path is invalid.
     * If partial, returns last valid directory in string.
     */
    self.parseDirectory = function(path, partial) {
        // TODO: check permissions?
        var dirs = _.compact(path.split('/'));
        var currentDir = System.directory;
        for (var i = 0; i < dirs.length; i++) {
            if (dirs[i] === '.') {
                continue;
            } else if (dirs[i] === '..') {
                // Go up a level
                if (currentDir.parent) {
                    currentDir = System.dirTree[currentDir.parent];
                } else {
                    self.log('At root directory, cannot go up!');
                    return null;
                }
            } else if (i === 0 && (dirs[i] === 'home' || dirs[i] === '~')) {
                currentDir = System.dirTree['home'];
            } else if (_.contains(currentDir.children, dirs[i])) {
                currentDir = System.dirTree[dirs[i]];
            } else if (partial) {
                break;
            } else {
                self.log('Directory not found:', path);
                return null;
            }
            if (currentDir.hidden) {
                return null;
            }
        }
        return currentDir;
    };

    /* Return full path of file or directory */
    self.getFullPath = function(dir, fullHome) {
        var currentDir = dir || System.directory;
        if (!currentDir.path) {
            currentDir.path = currentDir.parent ?
                              self.getFullPath(System.dirTree[currentDir.parent]) + '/' + currentDir.name :
                              '~';
        }
        if (fullHome) {
            return '/home' + currentDir.path.substring(1);
        }

        // Extra hack to hide path while in maze
        if ((/01\/maze\/.+/).test(currentDir.path)) {
            return self.getFullPath(System.dirTree['maze']) + '/???';
        }
        return currentDir.path;
    };

    self.isExecutable = function(path) {
        // TODO: Check if file at path exists and is executable.
        return false;
    };

    self.tabComplete = function(term, commands) {
        // Return array of suggested commands on tab-complete.
        var allChildren = function(dir) {
            var children = _.filter(dir.children, function(dirOrFile) {
                return !(System.dirTree[dirOrFile].hidden);
            });
            return _.map(children, function(child) {
                return System.dirTree[child].name;
            });
        };
        var allDirectories = function(dir) {
            var dirs = _.filter(allChildren(dir), function(dirOrFile) {
                return (System.dirTree[dirOrFile].type === 'dir') &&
                       !(System.dirTree[dirOrFile].hidden);
            });
            return _.map(dirs, function(dirName) {
                return dirName + '/';
            });
        };
        var allFiles = function(dir) {
            return _.filter(allChildren(dir), function(dirOrFile) {
                return (System.dirTree[dirOrFile].type !== 'dir') &&
                       !(System.dirTree[dirOrFile].hidden);
            });
        };

        var str = term.get_command();
        var input = _.last(_.compact(str.split(' '))) || '';

        // TODO: Return relative path to object and prepend to all children
        // in tabcomplete array.
        if ((/^\s*(cat)\s(.*)/).test(str)) {
            return allChildren(self.parseDirectory(input, true));
        } else if ((/^\s*(cd|ls)\s(.*)/).test(str)) {
            return allDirectories(self.parseDirectory(input, true));
        } else if ((/^\.\/(.*)/).test(str)) {
            return allFiles(self.parseDirectory(input, true));
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
    self.echoTemplate = function(term, type, template) {
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
