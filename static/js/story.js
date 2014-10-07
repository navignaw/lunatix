var Story = {};

/* Check system variables after every command in order to advance the story. */
Story.checkStory = function(term, system, cmd) {
    var Util = Utility(system);
    var prettyPrint = Util.prettyPrint;
    var animateText = Util.animateText;

    switch (system.progress) {
        case 0:
            if (cmd === 'cd' && system.directory.name === 'test') {
                prettyPrint(term, 'YOU HAVE ADVANCED THE STORY');
                system.progress++;
            }
            break;

        case 1:
            if (cmd === 'cd' && system.directory.name === 'home') {
                prettyPrint(term, 'Welcome home');
                var text = 'i am typing`2000`\nwatch me ``escape``';
                animateText(term, text, '%> ', function() {
                    prettyPrint(term, 'all done');
                });
            }
            break;
    }
    return null;
};