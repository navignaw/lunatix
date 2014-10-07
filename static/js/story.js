var Story = {};

/* Check System variables after every command in order to advance the story. */
Story.checkStory = function(term, cmd) {
    var prettyPrint = Util.prettyPrint;
    var animateText = Util.animateText;

    switch (System.progress) {
        case 0:
            if (cmd === 'cd' && System.directory.name === 'test') {
                prettyPrint(term, 'YOU HAVE ADVANCED THE STORY');
                System.progress++;
            }
            break;

        case 1:
            if (cmd === 'cd' && System.directory.name === 'home') {
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