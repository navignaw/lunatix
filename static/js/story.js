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
        var animateAI = _.partial(Util.animateAI, term);
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
                                   'Updating logs...`500`\n' +
                                   'Initializing survey.`400`.`500`.`1200`\n\n`200`';
                        animateText(text).then(function() {
                            term.clear();
                            text = 'We need to learn a little bit more about you.`500`\n\n' +
                                   'In which department are you most interested?`200`\n' +
                                   '[Innovation, Enforcement, Resources, General]';
                            return animateAI(text);
                        }).then(function() {
                            return multichoice(['innovation', 'enforcement', 'resources', 'general']);
                        }).then(function(result) {
                            System.user.answers.department = result;
                            text = '\nHow have you served us before?`200`\n' +
                                   '[Employment, Promotion, Compliance, None]';
                            return animateAI(text);
                        }).then(function() {
                            return multichoice(['employment', 'promotion', 'compliance', 'none']);
                        }).then(function(result) {
                            System.user.answers.previous = result;
                            return animateAI('\nQuantify your proficiency.`200` [1-5]');
                        }).then(function() {
                            return multichoice(['1', '2', '3', '4', '5']);
                        }).then(function(result) {
                            System.user.answers.proficiency = result;
                            text = '\nState the optimum color.`200`\n' +
                                   '[Fuschia, Chartreuse, Cornflower, Green]';
                            return animateAI(text);
                        }).then(function() {
                            return multichoice(['fuschia', 'chartreuse', 'cornflower', 'green']);
                        }).then(function(result) {
                            System.user.answers.color = result;
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
