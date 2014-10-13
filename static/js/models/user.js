function User(name) {
    this.name = name || '';

    // List of unlocked commands
    this.commands = ['cat', 'cd', 'help', 'logout', 'ls', 'man', 'mute', 'pwd', 'quit', 'whoami'];

    // Creepy government tracking information
    this.ip = '';

    // Survey answers
    this.answers = {};

    $.ajax({
        type: 'GET',
        url: $app.SCRIPT_ROOT + '/user/ip'
    }).done((function(json) {
        this.ip = json.ip;
    }).bind(this)
    ).fail(function(jqXHR, textStatus, error) {
        console.error(error);
    });
}
