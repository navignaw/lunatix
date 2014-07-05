(function() {

    /* System variables */
    var system = {
        debug: $app.DEBUG,
        dir: {name: '~'},
        env: {},
        proc: [],
        user: null
    };

    /* Terminals */
    var terminal = new Terminal(system);

    $(document).ready(function() {
        $('#terminal').terminal({}, terminal.options.base);
    });

})();