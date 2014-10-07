/* Utility and helper functions */
var Util = (function() {

    var self = {};

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

    self.parseDirectory = function(path, partial) {
        // Process path and return file object or null if path is invalid.
        // If partial, returns last valid directory in string.
        // TODO: check for absolute directories (for now, assume all are relative)
        var dirs = _.compact(path.split('/')); // TODO: what if they escape a slash?
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
            } else if (_.contains(currentDir.children, dirs[i])) {
                currentDir = System.dirTree[dirs[i]];
            } else if (partial) {
                break;
            } else {
                self.log('Directory not found:', path);
                return null;
            }
        }
        return currentDir;
    };

    self.isExecutable = function(path) {
        // TODO: Check if file at path exists and is executable.
        return false;
    };

    self.tabComplete = function(term, commands) {
        // Return array of suggested commands on tab-complete.
        var allChildren = function(dir) {
            return _.map(dir.children, function(child) {
                return System.dirTree[child].name;
            });
        };
        var allDirectories = function(dir) {
            var dirs = _.filter(allChildren(dir), function(dirOrFile) {
                return System.dirTree[dirOrFile].type === 'dir';
            });
            return _.map(dirs, function(dirName) {
                return dirName + '/';
            });
        };
        var allFiles = function(dir) {
            return _.filter(allChildren(dir), function(dirOrFile) {
                return System.dirTree[dirOrFile].type !== 'dir';
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
    self.animateText = function(term, message, prompt, callback, delay) {
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
                self.prettyPrint(term, prompt + term.get_command());
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

    return self;
})();