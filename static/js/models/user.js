var User = function(name, superuser) {
    name = name || '';
    superuser = superuser || false;
    var baseCommands = ['help', 'logout', 'quit', 'pwd', 'whoami'];

    var self = {
        name: name,
        commands: baseCommands, // List of unlocked commands
        superuser: superuser    // Special mode for debugging
    }

    return self;
}