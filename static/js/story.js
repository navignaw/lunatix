var Story = (function() {
    var self = {};

    function advanceArc(newArc) {
        System.progress.arc = newArc;
        System.progress.value = 0;
    }

    /* Check System variables after every command in order to advance the story. */
    self.checkStory = function(term, cmd) {
        var prettyPrint = Util.prettyPrint;
        var animateText = Util.animateText;

        switch (System.progress.arc) {
            // Intro survey
            case "intro":
                switch (System.progress.value) {
                    case 0:
                        // Initializing app
                        var text = 'Searching for user profile...`500` None found!\n' +
                                   'Creating profile for user ' + System.user.name + '...`400`\n\n' +
                                   'Initializing survey...`600`\n' +
                                   'Loading adjective nouns...`500`\n' +
                                   'Downloading malware.`200`.`200`.`700`\n' +
                                   'rming puppies...`800`\n';
                        animateText(term, text, '', function() {
                            prettyPrint(term, 'YOU HAVE ADVANCED THE STORY');
                            advanceArc('test01');
                        });
                        break;
                }
                break;

            // Test 01: Maze
            case "test01":
                switch (System.progress.value) {
                    case 0:
                        break;
                }
                break;
        }
    };

    return self;
})();