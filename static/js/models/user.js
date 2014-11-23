function User(name) {
    this.name = name || '';
    this.age = 20; // default, set during survey
    this.gender = 'M'; // default, set during survey

    // List of unlocked commands
    this.commands = ['cat', 'cd', 'help', 'logout', 'ls', 'man', 'mv', 'rm', 'pwd', 'whoami'];

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
