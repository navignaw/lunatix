var User = function(name, superuser) {
    name = name || '';
    superuser = superuser || false;
    var baseCommands = ['help', 'logout', 'quit', 'pwd', 'whoami'];

    var self = {
        name: name,
        commands: baseCommands,
        superuser: superuser
    }

    return self;
}