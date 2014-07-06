(function() {

    /* System variables */
    var system = {
        debug: $app.DEBUG,
        dir: {name: '~'},
        env: {},
        proc: [],
        user: null
    };

    /* Debug-specific logging utility function. Also echoes in terminal. */
    system.log = function(args) {
        if (!system.debug) {
            return;
        }
        // If first argument contains 'error', print message in red.
        var error = _.isString(args) && /error/i.test(args);

        if (console) {
            var printConsole = error ? console.error : console.log;
            printConsole.apply(console, arguments);
        }

        if (terminal = $.terminal.active()) {
            args = _.isString(args) ? args : args.toString();
            var printTerminal = error ? terminal.error : terminal.echo;
            printTerminal(args);
        }
    };

    /* Terminals */
    var terminal = new Terminal(system);

    $(document).ready(function() {
        $('#terminal').terminal({}, terminal.options.base);
    });

})();