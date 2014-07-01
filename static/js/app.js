(function() {

    /* System variables */
    var system = {
        user: null,
        directory: 'testDirectory'
    };

    /* Terminals */
    var terminal = new Terminal(system);
    var main = terminal.main();

    var onLogin = function(user, term) {
        console.log('logged in as:', user);
        system.user = user;
        term.push(main.interpreter, main.options);
    }
    var login = terminal.login(onLogin);


    $(document).ready(function() {
        $('#terminal').terminal(login.interpreter, login.options);
    });

})();