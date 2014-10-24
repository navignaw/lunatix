/* Global system variables */
// TODO: save into local storage
var System = {
    debug: $app.DEBUG,
    version: '0.0.1',
    dirTree: {},
    directory: {},
    progress: {
        arc: "intro",
        value: 0,
        logs: {}
    },
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
            var newHeight = Math.round($(window).height()) - 100;
            $term.height(_.max([100, newHeight]));
            $term.resize();
        };
        resizeTerminal(); // Set initial size.

        // Resize terminal on window resize.
        $(window).resize(_.debounce(resizeTerminal, 150));
    });

})();
