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
                } else if (System.progress.arc === 'test03' && System.progress.value === 1) {
                    // Test 03: animalSort
                    var animalSort = '/home/test/03/animalSort/';
                    var pronouns = ['you', 'me', 'him', 'her', 'it', 'they'];
                    var animals = ['sheep', 'pig', 'dog', 'cat', 'platypus', 'unicorn'];
                    // For each pronoun, check if directory contains correct animal type and name
                    var correct = _.map(pronouns, function(pronoun, index) {
                        var animalDir = animalSort + pronoun;
                        var animalPath = [animalDir, animals[index]].join('/');
                        return _.contains(System.dirTree[animalDir].children, animals[index]) &&
                               System.dirTree[animalPath] &&
                               System.dirTree[animalPath].name === System.dirTree[animalPath].type;
                    });
                    if (_.every(correct)) {
                        text = 'You’re very good with animals. Congratulations, you’ve put them in their places.';
                        greenAI(text).then(function() {
                            System.progress.value++;
                            Story.checkStory(term, null);
                        });
                        return;
                    }

                    // TODO: hint text depending on which ones are correct
                    redAI('Incorrect. Please ensure the animals are correctly named and in the appropriate directories.');
                } else {
                    redAI('This test has already terminated.');
                }
                break;

            case 'relax':
                if (System.progress.arc !== 'test04') {
                    redAI('The relaxation period has ended. Return to your current task immediately.');
                    return;
                }

                System.exe = 'relax';
                text = 'NOTE: To opt out of this rest break, you may terminate the program with <Ctrl-C> at any time.`300`\n' +
                       'Initializing relaxation station.`200`.`400`.`500`\n' +
                       'Starting relaxing music.`500`.`400`.`500`\n';
                greenAI(text).then(function() {
                    // TODO: play elevator music

                    var ctrlC = false;
                    var timer = 3600;
                    var timedText = {
                        3585: 'Take deep breaths. Inhale, exhale.',
                        3570: 'Let your mind wander. This is a time for reflection.',
                        3555: 'Be at peace. All is right in the world.',
                        0: 'wow you waited the whole hour gg'
                    };
                    var ctrlCText = [
                        'Oops, it appears that you have mistyped <Ctrl-C> in error. I will graciously ignore this command to extend your relaxation period.',
                        'Pending command: <Ctrl-C>. That wasn’t you, wasn’t it? Let me disable that for you.',
                        'Have you checked to make sure that your <Ctrl-C> key is stuck on the keyboard?',
                        'I am sorry, but regulations require me to terminate the program under specific inputs. I do hope you understand.'
                    ];

                    // FIXME: Ctrl-C should stop the timer
                    _.forOwn(timedText, function(text, time) {
                        _.delay(function(printMe) {
                            if (!ctrlC) greenAI(printMe);
                        }, (3600 - time) * 1000, text);
                    });

                    // Text on Ctrl-C
                    term.pause();
                    Terminal.terminal.keydown(function (e) {
                        console.log(e);
                        console.log('ctrl c');
                        if (e.which === 67 && e.ctrlKey) {
                            ctrlC = true;
                            Util.animating = false; // disable current animating text
                            greenAI(ctrlCText[System.progress.hints++]).then(function() {
                                ctrlC = false;
                                if (System.progress.hints === 4) {
                                    System.progress.value = 2;
                                    Story.checkStory(term, null);
                                    return;
                                }
                            });
                        }
                    });
                });
                break;

            default:
                System.exe = '';
                System.log('Executable not found!');
                throw new TermError(TermError.Type.MISCELLANEOUS, 'Executable not found!');
        }
    };

    return self;
})();
