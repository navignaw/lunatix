var Story = {};

/* Check system variables after every command in order to advance the story. */
Story.checkStory = function(term, system, cmd) {
    switch (system.progress) {
        case 0:
            if (cmd === 'cd' && system.directory.name === 'test') {
                term.echo('YOU HAVE ADVANCED THE STORY');
                system.progress++;
            }
            break;

        case 1:
            if (cmd === 'cd' && system.directory.name === 'home') {
                term.echo('Welcome home');
            }
            break;
    }
    return null;
};