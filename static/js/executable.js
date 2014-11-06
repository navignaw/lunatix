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

                term.clear();
                System.exe = 'relax';
                text = 'NOTE: To opt out of this rest break, you may terminate the program with <Ctrl-C> at any time.`300`\n' +
                       'Initializing relaxation station.`200`.`400`.`500`\n' +
                       'Starting relaxing music.`500`.`400`.`500`\n';
                greenAI(text).then(function() {
                    Util.playMusic('refreshing.mp3'); // Play elevator music

                    var ctrlC = false;
                    var timer = 3600;
                    var timedText = {
                        3585: 'Take deep breaths. Inhale, exhale.',
                        3570: 'Let your mind wander. This is a time for reflection.',
                        3555: 'Be at peace. All is right in the world.',
                        3540: 'One minute mark! You should be fading into a state of tranquility.',
                        3510: 'As Asimov would say, everyone should take one hour every day to sit back and do absolutely nothing.',
                        3480: 'Remember, you may exit the program at any time via <Ctrl-C>, but the benefits of this relaxation outweigh any possible reason.',
                        3450: 'Did you know that 3 in 4 citizens in the world suffer from not taking enough breaks in life?',
                        3420: 'Due to subject feedback, we have included a regularly scheduled cat picture every 5 minutes. Two minutes to go!',
                        3390: 'Be assured that you are missing nothing by sitting here and resting.',
                        3360: 'This relaxation period has been shown in the past to be the most preferred of our other compliant participants. Surely, you too are enjoying it.',
                        3330: 'The effects of relaxation have been studied intensely, and the results agree that we are helping you by including this.',
                        3300: 'Five minutes have passed. Here is your regularly scheduled cat picture.', // TODO: add redacted picture of cat
                        3240: 'Closing your eyes is recommended to promote disengagement from tasks at hand.',
                        3180: 'Are you remembering to breathe? Be sure to take steady, rhythmic breaths. As Pratchett would put it, feel the tick of the universe.',
                        3120: 'Be sure to do this every day. Repetition is key to continued excellence.',
                        3060: 'This may be difficult for you. Try not to focus on all of the work you have remaining and enjoy yourself.',
                        3000: 'Has it already been ten minutes? Let me find another cat picture for you.', // TODO: redacted
                        2940: 'Lose yourself in the vastness of the universe. You are already a small being in the world.',
                        2880: 'The <Ctrl-C> command is probably beginning to seem promising. Resist the urge to quit early.',
                        2820: 'For that matter, lose all of your urges in the relaxation',
                        2760: 'Why yes, I do have lines for every minute.',
                        2700: 'My analytics show that you may be suffering from my intrusions into your relaxation. I will now only show you the scheduled cat pictures.', // redacted
                        2400: 'You’ve clearly benefited from the silence. Here is another cat picture.', // redacted
                        2100: 'Another cat picture? I think so!',
                        1800: 'Halfway done. I know you will miss this when it is over.',
                        1500: 'Ah, this is a particularly funny cat picture. I am 98.95% sure that you will find it funny as well.',
                        1200: 'Only twenty minutes remaining? Ah well. The cat picture database is almost infinite, as I’m sure you know.',
                        900: 'Come to terms with your limits. Feel the benefits of relaxation. Enjoy the cat picture.',
                        600: 'Your time here is coming to an end. As it always is. Here is a cat picture for your curiosity.',
                        300: 'Only five minutes remain. This will be the last cat picture.', // picture of actual cat
                        0: 'Wasn\'t that fun? In fact, let me restart this for you. I\'m sure the benefits will be even greater the second time.'
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
                                    Util.stopMusic();
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
