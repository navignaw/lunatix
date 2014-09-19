function User(name, superuser) {
    this.name = name || '';
    this.superuser = superuser || false;  // Enable special mode for debugging

    // List of unlocked commands
    this.commands = ['help', 'logout', 'man', 'mute', 'pwd', 'quit', 'whoami'];
}