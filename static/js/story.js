var Story = (function() {

    /* Constants */
    var UI_GREEN = '#78C778';
    var UI_RED = '#FF2424';
    var LOG_DIR = 'test';

    var self = {};

    function advanceArc(newArc, newDir) {
        System.progress.arc = newArc;
        System.progress.value = 0;

        if (newDir) {
            System.dirTree[newDir].hidden = false;
        }
    }

    function saveLog(test) {
        var log = System.progress.logs[test];
        var text = log.text.join('\n');
        // TODO: save log to new file in directory?
        return text;
    }

    /* Check System variables after every command in order to advance the story. */
    self.checkStory = function(term, cmd) {
        var prettyPrint = _.partial(Util.prettyPrint, term);
        var animateText = _.partial(Util.animateText, term);
        var greenAI = _.partial(Util.animateAI, term, UI_GREEN);
        var redAI = _.partial(Util.animateAI, term, UI_RED);
        var confirm = _.partial(Util.confirm, term);
        var multichoice = _.partial(Util.multichoice, term);
        var input = _.partial(Util.input, term);

        var text;

        switch (System.progress.arc) {
            // Intro survey
            case 'intro':
                switch (System.progress.value) {
                    case 0:
                        // Initializing app
                        text = 'Searching for user profile...`500` None found!\n' +
                               'Creating profile for user ' + System.user.name + '...`400`\n\n' +
                               'Updating logs...`500`\n' +
                               'Initializing survey.`400`.`500`.`1200`\n\n`200`';
                        animateText(text).then(function() {
                            term.clear();
                            text = 'We need to learn a little bit more about you.`500`\n\n' +
                                   'In which department are you most interested?`200`\n' +
                                   '[Innovation, Enforcement, Resources, General]';
                            return redAI(text);
                        }).then(function() {
                            return multichoice(['innovation', 'enforcement', 'resources', 'general']);
                        }).then(function(result) {
                            System.user.answers.department = result;
                            text = '\nHow have you served us before?`200`\n' +
                                   '[Employment, Promotion, Compliance, None]';
                            return redAI(text);
                        }).then(function() {
                            return multichoice(['employment', 'promotion', 'compliance', 'none']);
                        }).then(function(result) {
                            System.user.answers.previous = result;
                            return redAI('\nQuantify your proficiency.`200` [1-5]');
                        }).then(function() {
                            return multichoice(['1', '2', '3', '4', '5'], null, function(command) {
                                if (command === '1') {
                                    text = 'Your response of "1" qualifies you for immediate disqualification. ' +
                                           'Provide a revised response.';
                                    prettyPrint(text, null, {color: UI_RED});
                                    return true;
                                }
                                return false;
                            });
                        }).then(function(result) {
                            System.user.answers.proficiency = result;
                            text = '\nState the optimum color.`200`\n' +
                                   '[Fuschia, Chartreuse, Cornflower, Green]';
                            return redAI(text);
                        }).then(function() {
                            return multichoice(['fuschia', 'chartreuse', 'cornflower', 'green']);
                        }).then(function(result) {
                            System.user.answers.color = result;
                            text = '\nYour companion AI is being generated based on your responses.`200`.`300`.`800`\n' +
                                   'Generation complete!`200`';
                            return redAI(text);
                        }).then(function() {
                            System.progress.value++;
                            term.clear();
                            self.checkStory(term, null);
                        });
                        break;

                    case 1:
                        // Meeting your companion AI
                        text = '`800`.`300`.`400`.`500`\nHELLO, HUMAN.`500`\n' +
                               'My name is LX2048, and I will be your companion AI';
                        // TODO: finish introduction and unhide 01
                        greenAI(text).then(function() {
                            advanceArc('test01', '01');
                        });
                        break;
                }
                break;

            // Test 01: Maze
            case 'test01':
                switch (System.progress.value) {
                    case 0:
                        if (System.directory.name !== '01') break;
                        // TODO: text for initializing test 01
                        text = 'TODO: Initializing test 01...';
                        greenAI(text).then(function() {
                            System.progress.value++;
                            self.checkStory(term, null);
                        });
                        break;

                    case 1:
                        // Create logs and custom directories
                        System.dirTree[System.user.answers.color].children = ['finish', 'start'];
                        System.dirTree['finish'].parent = System.user.answers.color;
                        System.dirTree['start'].parent = System.user.answers.color;
                        System.progress.logs['test01'] = {
                            text: []
                        };
                        System.progress.value++;
                        break;

                    case 2:
                        // Maze directory logs
                        var log = System.progress.logs['test01'];
                        if (_.has(log, System.directory.name)) break;
                        switch (System.directory.name) {
                            case 'wall':
                                text = 'Subject demonstrates poor understanding of basic physical limitations.';
                                log['hall'] = true; // disable correct log
                                break;

                            case 'hall':
                                text = 'Subject can follow provided paths if clearly presented.';
                                break;

                            case 'right':
                                text = 'Subject is capable of basic navigational orientation.';
                                break;

                            case 'uncertain':
                                text = 'Subject is willing to follow hunches.';
                                break;

                            case 'vague':
                                text = 'Subject persists in precipitating events that do not generate results.';
                                break;

                            case 'probable':
                                text = 'Subject is prepared to gamble in favorable situations.';
                                break;

                            case 'definite':
                                text = 'Subject is content to follow an obvious answer.';
                                break;

                            case 'finish':
                                text = 'Subject has fulfilled the minimum qualifications for the first module.';
                                break;

                            case 'start':
                                text = 'Subject is content to undo satisfactory work unnecessarily.';
                                break;

                            case 'impossible':
                                text = 'Subject has failed to internalize lessons regarding limitations.';
                                break;

                            case 'dubious':
                                text = 'Subject is bold but reckless.';
                                break;

                            case 'impractical':
                                text = 'Subject continues to demonstrate reckless behavior.';
                                break;

                            case 'absurd':
                                text = 'Subject puts belief in clearly ridiculous concepts.';
                                break;

                            case 'wrong':
                                text = 'Subject has marginally impaired mental processing.';
                                break;

                            case 'still_wrong':
                                text = 'Subject demonstrates extreme obstinacy to a fault.';
                                break;

                            case 'more_wrong':
                                text = 'Subject is grossly lacking in mental capabilities.';
                                break;

                            default:
                                text = '';
                                if (System.directory.name === System.user.answers.color) {
                                    text = 'Subject is capable of recognizing immediately familiar stimuli.';
                                } else if (_.contains(['fuschia', 'chartreuse', 'cornflower', 'green'], System.directory.name)) {
                                    text = 'Subject demonstrates dangerous tendencies toward deceit or inconsistency.';
                                }
                                break;
                        }
                        if (text) {
                            greenAI('LOG: ' + text).then(function() {
                                log[System.directory.name] = true;
                                log.text.push(text);

                                if (System.directory.name === 'finish') {
                                    System.progress.value++;
                                    self.checkStory(term, null);
                                }
                            });
                        }
                        if (System.directory.name === 'start') {
                            System.directory = System.dirTree['maze']; // lol
                        }
                        break;

                    case 3:
                        // Successfully traversed maze!
                        text = 'gj m8 you win the demo.\nResults:';
                        greenAI(text).then(function() {
                            // Save log into new file and print results.
                            text = saveLog('test01');
                            prettyPrint(text);
                            advanceArc('test02', '02');
                        });
                        break;
                }
                break;

            // Test 02: Clutter
            case 'test02':
                break;
        }
    };

    return self;
})();
