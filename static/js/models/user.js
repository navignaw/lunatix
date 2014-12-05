function User(name) {
    this.name = name || '';
    this.dob = "2120-02-19"; // default, set during survey
    this.gender = 'Male'; // default, set during survey
    this.occupation = 'Citizen';

    // List of unlocked commands
    this.commands = ['cd', 'help', 'logout', 'ls', 'man', 'pwd', 'whoami'];

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
