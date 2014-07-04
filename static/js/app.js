(function() {

    /* System variables */
    var system = {
        dir: {name: '~'},
        env: {},
        proc: [],
        user: {}
    };

    /* Terminals */
    var terminal = new Terminal(system);

    $(document).ready(function() {
        terminal.init($('#terminal'));
    });

})();