var Executable = (function() {

    /* Constants */
    var AI_GREEN = '#78C778';
    var AI_RED = '#FF2424';
    var LOG_DIR = 'test';

    var self = {};

    /* Execute a file by name. */
    self.executeFile = function(term, file, cmd) {
        var prettyPrint = _.partial(Util.prettyPrint, term);
        var animateText = _.partial(Util.animateText, term);
        var greenAI = _.partial(Util.animateAI, term, AI_GREEN);
        var redAI = _.partial(Util.animateAI, term, AI_RED);
        var confirm = _.partial(Util.confirm, term);
        var multichoice = _.partial(Util.multichoice, term);
        var input = _.partial(Util.input, term);

        var text, log;

        switch (file) {
            case 'submit':
                if (System.progress.arc === 'test02' && System.progress.value === 1) {
                    // Test 02: clutter
                    log = System.progress.logs['test02'];

                    switch (cmd.rest) {
                        case 'unchewable':
                            text = 'Subject allows biological needs to outweigh necessary development.';
                            break;

                        case 'untastable':
                            text = 'Subject persists in usage of clearly unhelpful data.';
                            break;

                        case '':
                            text = 'Subject fails to submit a solution with the submission.';
                            break;

                        case 'unsolvable':
                            text = 'Subject passes minimum qualifications for the second module.';
                            greenAI(text).then(function() {
                                System.progress.value++;
                                Story.checkStory(term, null);
                            });
                            return;

                        default:
                            if (System.progress.hints === 0)
                                text = 'Subject has submitted an invalid answer. This failure will be logged.';
                            else if (System.progress.hints === 1)
                                text = 'Subject continues to submit incorrect guesses.';
                            else
                                text = 'Subject has either resorted to guesswork or is incapable of successfully analyzing presented files.';
                            redAI('LOG: ' + text);
                            System.progress.hints++;
                            return;
                    }
                    redAI('LOG: ' + text).then(function() {
                        if (_.contains(['unchewable', 'untastable'], cmd.rest) && !_.has(log, cmd.rest)) {
                            log[cmd.rest] = true;
                            log.text.push(text);
                        }
                    });
                } else {
                    redAI('This test has already terminated.');
                }
                break;

            default:
                System.log('Executable not found!');
                return new TermError(TermError.Type.MISCELLANEOUS, 'Executable not found!');
        }
    };

    return self;
})();
