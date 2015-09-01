/* Global system variables */
var System = {
    debug: $app.DEBUG,
    version: '1.0.1',
    dirTree: {},
    directory: {},
    path: '/home',
    progress: {
        arc: 'intro',
        help: '',
        value: 0,
        hints: 0,
        logs: {}
    },
    exe: '',
    user: null
};

(function() {
    /* Terminal objects */
    var $term = $('#terminal');
    Terminal.terminal = $term;

    $(document).ready(function() {
        // TODO: fullscreen requires user interaction (e.g. clicking a button).
        // Smarter way to get around this?
        /*$('body').click(function() {
            $(this).fullscreen();
        });*/

        $term.terminal({}, Terminal.options.base);

        var resizeTerminal = function() {
            var newHeight = Math.round($(window).height()) - Terminal.offset;
            $term.height(_.max([100, newHeight]));
            $term.resize();
        };
        resizeTerminal(); // Set initial size.

        // Resize terminal on window resize.
        $(window).resize(_.debounce(resizeTerminal, 150));
    });

})();
