function User(name, superuser) {
    this.name = name || '';
    this.superuser = superuser || false;  // Enable special mode for debugging

    // List of unlocked commands
    this.commands = ['cd', 'help', 'logout', 'ls', 'man', 'mute', 'pwd', 'quit', 'whoami'];
}