(function() {

    /* System variables */
    var system = {
        dir: {name: '~'},
        env: {},
        proc: [],
        user: {
            name: '',
            permissions: {},
            superuser: $app.DEBUG
        }
    };

    /* Terminals */
    var terminal = new Terminal(system);

    $(document).ready(function() {
        $('#terminal').terminal({}, terminal.options.base);
    });

})();