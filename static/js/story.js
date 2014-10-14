var Story = (function() {
    var self = {};

    function advanceArc(newArc, newDir) {
        System.progress.arc = newArc;
        System.progress.value = 0;

        if (newDir) {
            System.dirTree[newDir].hidden = false;
        }
    }

    /* Check System variables after every command in order to advance the story. */
    self.checkStory = function(term, cmd) {
        var prettyPrint = _.partial(Util.prettyPrint, term);
        var animateText = _.partial(Util.animateText, term);
        var confirm = _.partial(Util.confirm, term);
        var multichoice = _.partial(Util.multichoice, term);
        var input = _.partial(Util.input, term);

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
                        animateText(text).then(function() {
                            return confirm('DOES IT WORK? [y/n] ').fail(function() {
                                prettyPrint('you failed!');
                            });
                        }).then(function() {
                            prettyPrint('What is your favorite color?');
                            return input();
                        }).then(function(result) {
                            System.user.answers.favcolor = result;
                            prettyPrint('you typed: ' + result);
                            prettyPrint('What is your favorite thing to rm? (cheese, milk, puppies)');
                            return multichoice(['cheese', 'milk', 'puppies']);
                        }).then(function(result) {
                            System.user.answers.favrm = result;
                            prettyPrint('you typed: ' + result);
                            prettyPrint('YOU HAVE ADVANCED THE STORY');
                            advanceArc('test01', '01');
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
