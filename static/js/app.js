(function() {

    /* System variables */
    var system = {
        debug: $app.DEBUG,
        dirTree: {},
        directory: {},
        progress: 0,
        user: null
    };

    /* Terminal objects */
    var terminal = new Terminal(system);
    var $term = $('#terminal');
    terminal.terminal = $term;

    $(document).ready(function() {
        // TODO: fullscreen requires user interaction (e.g. clicking a button).
        // Smarter way to get around this?
        /*$('body').click(function() {
            $(this).fullscreen();
        });*/

        $term.terminal({}, terminal.options.base);

        var resizeTerminal = function() {
            var newHeight = Math.round($(window).height()) - 100;
            $term.height(_.max([100, newHeight]));
            $term.resize();
        };
        resizeTerminal(); // Set initial size.

        // Resize terminal on window resize.
        $(window).resize(_.debounce(resizeTerminal, 150));
    });

})();
