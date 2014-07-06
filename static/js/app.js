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
            arguments = _.map(arguments, function(arg) {
                return _.isString(arg) ? arg : arg.toString();
            });
            var printTerminal = error ? terminal.error : terminal.echo;
            printTerminal(arguments.join(' '));
        }
    };

    /* Terminal objects */
    var terminal = new Terminal(system);
    var $term = $('#terminal');

    $(document).ready(function() {
        $term.terminal({}, terminal.options.base);

        var resizeTerminal = function() {
            var newHeight = Math.round($(window).height()) - 120;
            $term.height(_.max([100, newHeight]));
            $term.resize();
        };
        resizeTerminal(); // Set initial size.

        // Resize terminal on window resize.
        $(window).resize(_.debounce(resizeTerminal, 150));
    });

})();