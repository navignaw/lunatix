var Story = (function() {

    /* Constants */
    // TODO: refactor colors into Util?
    var AI_GREEN = '#78C778';
    var AI_RED = '#FF2424';
    var DIR_BLUE = '#0080FF';
    var LOG_DIR = '/home/test/results';

    var self = {};

    function unlockFile(dir) {
        System.dirTree[dir].hidden = false;
    }

    function advanceArc(newArc, newDir) {
        System.progress.arc = newArc;
        System.progress.value = 0;
        System.progress.hints = 0;

        if (newDir) {
            unlockFile(newDir);
        }
    }

    function saveLog(test, name) {
        var log = System.progress.logs[test];
        var text = 'Results:\n' + log.text.join('\n');
        var logFile = {
            'name': name,
            'type': 'txt',
            'text': text
        };
        File.createFile(LOG_DIR, name, logFile);
        return text;
    }

    /* Check System variables after every command in order to advance the story. */
    self.checkStory = function(term, cmd, error) {
        var prettyPrint = _.partial(Util.prettyPrint, term);
        var animateText = _.partial(Util.animateText, term);
        var greenAI = _.partial(Util.animateAI, term, AI_GREEN);
        var redAI = _.partial(Util.animateAI, term, AI_RED);
        var confirm = _.partial(Util.confirm, term);
        var multichoice = _.partial(Util.multichoice, term);
        var input = _.partial(Util.input, term);

        var text, log;

        // FIXME: Remove after testing
        if (System.debug && System.progress.arc === 'intro' && System.progress.value === 0) {
            // Hack to skip to test 4
            System.progress.arc = 'test05';
            unlockFile('/home/test/01');
            unlockFile('/home/test/02');
            unlockFile('/home/test/03');
            unlockFile('/home/test/04');
            unlockFile('/home/test/05');
        }

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
                                    prettyPrint(text, null, {color: AI_RED});
                                    return true;
                                } // TODO: if command > 5, witty message
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
                                   'Generation complete!`500`';
                            return redAI(text);
                        }).then(function() {
                            System.progress.value++;
                            term.clear();
                            self.checkStory(term, null);
                        });
                        break;

                    case 1:
                        // Meeting your companion AI
                        text = '`800`Greetings.`500`\n' +
                               'I am LX2084, and I will be your companion AI.';
                        greenAI(text).then(function() {
                            return input();
                        }).then(function(response) {
                            text = 'In accordance with Literacy Act 3249, it is necessary for you to complete a brief training program.\n' +
                            'During this program, you will be monitored to ensure compliance with minimum standards.';
                            return greenAI(text);
                        }).then(function() {
                            return input();
                        }).then(function(response) {
                            text = 'For maximum engagement, all English commands will be ignored.';
                            return greenAI(text);
                        }).then(function() {
                            return input();
                        }).then(function(response) {
                            text = 'As Clarke was fond of saying, compliance equals excellence!`300`\n' +
                                   'Please Change Directory <cd> to the test/ folder to begin this process.`300`\n' +
                                   '$> cd test/`400`';
                            return greenAI(text);
                        }).then(function() {
                            System.progress.value++;
                        });
                        break;

                    case 2:
                        // Invalid command
                        if (error) {
                            if (cmd === 'cd') {
                                if (error.type === TermError.Type.INVALID_ARGUMENTS)
                                    text = 'Error: not enough arguments. Provide a directory to switch to. ' +
                                           'In this case, you should <cd> into the test/ directory.';
                                else if (error.type === TermError.Type.DIRECTORY_NOT_FOUND)
                                    text = 'Error: directory not found. Please <cd> into the test/ directory.';
                                else if (error.type === TermError.Type.PERMISSION_DENIED)
                                    text = 'Error: permission denied.\n In accordance with standard protocol, your access to ' +
                                            cmd.args[0] + ' has been suspended until you have met minimum standards of proficiency. ' +
                                            'Your curiosity has been noted.';
                            } else {
                                if (System.progress.hints === 0)
                                    text = 'You will be inclined to use the Change Directory <cd> command.';
                                else if (System.progress.hints === 1)
                                    text = 'The command to Change Directory is <cd>. The complexity of future tasks ' +
                                           'is being re-evaluated based on your demonstrated proficiency.';
                                else
                                    text = 'The command is <cd test/>. Please type <cd test/>.';
                                System.progress.hints++;
                            }
                            if (text) {
                                prettyPrint(text, null, {color: AI_RED});
                                return;
                            }
                        }

                        // Entering test directory
                        if (cmd !== 'cd' || System.directory.name !== 'test') break;
                        text = '$> sudo tar -xvf *.tar && sudo chmod u+r 01\n' +
                               '`500`.`200`.`400`.`500`test generation complete. Begin by Changing Directory <cd> into 01/.\n' +
                               '$> cd 01/';
                        greenAI(text).then(function() {
                            advanceArc('test01', '/home/test/01');
                        });
                        break;
                }
                break;

            // Test 01: Maze
            case 'test01':
                log = System.progress.logs['test01'];
                switch (System.progress.value) {
                    case 0:
                        // Invalid command
                        if (error && cmd === 'cd') {
                            if (error.type === TermError.Type.INVALID_ARGUMENTS)
                                text = 'Error: not enough arguments. The test directory is 01/.';
                            else if (error.type === TermError.Type.DIRECTORY_NOT_FOUND)
                                text = 'Error: directory not found. The test directory is 01/.';
                            if (text) {
                                prettyPrint(text, null, {color: AI_RED});
                                return;
                            }
                        }

                        if (cmd !== 'cd' || System.directory.name !== '01') break;
                        text = 'This task will test your ability to utilize List files <ls> and Change Directory <cd>.`200`\n' +
                               'Attempt to follow the maze/ to its completion. Your progress will be tracked.`200`\n' +
                               '(Note that the names of subsequent directories will no longer be provided. ' +
                                'Usage of <ls> is required to progress.)';
                        greenAI(text).then(function() {
                            System.progress.value++;
                            self.checkStory(term, null);
                        });
                        break;

                    case 1:
                        // Create logs and custom directories
                        unlockFile('/home/test/01/maze');
                        var COLOR_PARENT_DIR = '/home/test/01/maze/hall/right/uncertain/probable/definite/';
                        System.dirTree[COLOR_PARENT_DIR + System.user.answers.color].children = ['finish', 'start'];
                        var finish = System.dirTree['COLOR/finish'];
                        var start = System.dirTree['COLOR/start'];
                        System.dirTree[COLOR_PARENT_DIR + System.user.answers.color + '/finish'] = finish;
                        System.dirTree[COLOR_PARENT_DIR + System.user.answers.color + '/start'] = start;
                        System.progress.logs['test01'] = {
                            text: [],
                            good: 0, // total of 7
                            bad: 0   // total of 23
                        };
                        System.progress.value++;
                        break;

                    case 2:
                        // Invalid command
                        if (error) {
                            if (cmd === 'cd') {
                                if (error.type === TermError.Type.INVALID_ARGUMENTS)
                                    text = 'The maze requires you to choose a directory.';
                                else if (error.type === TermError.Type.DIRECTORY_NOT_FOUND) {
                                    if (_.contains(['wall', 'impossible', 'impractical', 'absurd', 'still_wrong', 'more_wrong'], System.directory.name))
                                        text = 'You seem to have reached a dead end. To return to your previous point in the maze, input <cd ..>';
                                    else
                                        text = 'The maze contains no path that way. In the words of Wells, choose wisely.';
                                }
                                prettyPrint(text, null, {color: AI_RED});
                                return;
                            } else if (System.progress.hints === 0 && cmd !== 'ls') {
                                text = 'Resorted to guesswork, have you? Your desperation has been noted. Usage of <ls> will List files.';
                                prettyPrint(text, null, {color: AI_RED});
                                return;
                            }
                            break;
                        }

                        if (System.progress.hints === 0 && cmd === 'ls') {
                            text = 'The available paths have been output. Continue navigating the maze/ via <cd> to its completion.';
                            greenAI(text).then(function() {
                                System.progress.hints++;
                            });
                            break;
                        }

                        // Maze directory logs
                        if (cmd === 'ls' && _.contains(['wall', 'impossible', 'impractical', 'absurd', 'still_wrong', 'more_wrong'], System.directory.name)) {
                            text = 'You seem to have reached a dead end. To return to your previous point in the maze, input <cd ..>';
                            redAI(text);
                            break;
                        }
                        if (cmd !== 'cd' || _.has(log, System.directory.name)) break;
                        switch (System.directory.name) {
                            case 'wall':
                                text = 'Subject demonstrates poor understanding of basic physical limitations.';
                                log.bad++;
                                log['hall'] = true; // disable correct log
                                break;

                            case 'hall':
                                text = 'Subject can follow provided paths if clearly presented.';
                                log.good++;
                                break;

                            case 'right':
                                text = 'Subject is capable of basic navigational orientation.';
                                log.good++;
                                break;

                            case 'uncertain':
                                text = 'Subject is willing to follow hunches.';
                                log.good++;
                                break;

                            case 'vague':
                                text = 'Subject persists in precipitating events that do not generate results.';
                                log.bad++;
                                break;

                            case 'probable':
                                text = 'Subject is prepared to gamble in favorable situations.';
                                log.good++;
                                break;

                            case 'definite':
                                text = 'Subject is content to follow an obvious answer.';
                                log.good++;
                                break;

                            case 'finish':
                                text = 'Subject has fulfilled the minimum qualifications for the first module.';
                                log.good++;
                                break;

                            case 'start':
                                text = 'Subject is content to undo satisfactory work unnecessarily.';
                                log.bad += 5;
                                break;

                            case 'impossible':
                                text = 'Subject has failed to internalize lessons regarding limitations.';
                                log.bad++;
                                break;

                            case 'dubious':
                                text = 'Subject is bold but reckless.';
                                log.bad++;
                                break;

                            case 'impractical':
                                text = 'Subject continues to demonstrate reckless behavior.';
                                log.bad++;
                                break;

                            case 'absurd':
                                text = 'Subject puts belief in clearly ridiculous concepts.';
                                log.bad++;
                                break;

                            case 'wrong':
                                text = 'Subject has marginally impaired mental processing.';
                                log.bad++;
                                log['right'] = true; // disable correct log
                                break;

                            case 'still_wrong':
                                text = 'Subject demonstrates extreme obstinacy to a fault.';
                                log.bad += 3;
                                break;

                            case 'more_wrong':
                                text = 'Subject is grossly lacking in mental capabilities.';
                                log.bad += 5;
                                log['hall'] = true; // disable correct log
                                break;

                            default:
                                text = '';
                                if (System.directory.name === System.user.answers.color) {
                                    text = 'Subject is capable of recognizing immediately familiar stimuli.';
                                    log.good++;
                                } else if (_.contains(['fuschia', 'chartreuse', 'cornflower', 'green'], System.directory.name)) {
                                    text = 'Subject demonstrates dangerous tendencies toward deceit or inconsistency.';
                                    log.bad++;
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
                            System.path = '/home/test/01/maze';
                            System.directory = System.dirTree[System.path]; // lol
                        }
                        break;

                    case 3:
                        // Successfully traversed maze!
                        text = 'Logging complete. Exit this directory with <cd ..> and visit the results/ directory for debriefing.`300`\n' +
                               '$> cd ../results';
                        System.path = '/home/test/01';
                        System.directory = System.dirTree[System.path];
                        greenAI(text).then(function() {
                            unlockFile('/home/test/results');
                            System.progress.value++;
                        });
                        break;

                    case 4:
                        if (cmd !== 'cd' || System.directory.name !== 'results') break;

                        text = 'Your results are organized by test, and by examining them you can see exactly where your deficiencies lie.`300`\n' +
                               '$> cat log01.txt`500`';
                        greenAI(text).then(function() {
                            var score = (log.good + 23 - log.bad);
                            var percentage = Math.round(score * 10000.0 / 30) / 100;
                            log.text.push('\nScore: ' + score.toString() + '/30 (' + percentage.toString() + '%)');
                            text = saveLog('test01', 'log01.txt');
                            prettyPrint(text);

                            text = '`600`\nAs Huxley would say, eliminating defects is the only way to improve.`400`\n' +
                            'Change directory back to ../02, as there are still many more tests for you to complete.`200`\n' +
                            '$> sudo chmod u+rx /home/test/02';
                            return greenAI(text);
                        }).then(function() {
                            advanceArc('test02', '/home/test/02');
                        });
                        break;
                }
                break;

            // Test 02: Clutter
            case 'test02':
                log = System.progress.logs['test02'];
                switch (System.progress.value) {
                    case 0:
                        if (cmd !== 'cd' || System.directory.name !== 'clutter') break;

                        System.progress.logs['test02'] = {
                            text: [],
                            good: 0,
                            bad: 0
                        };
                        text = 'The following test will measure your ability to Catenate <cat> files. ' +
                               'This will allow you to observe their contents.`200`\nWhen you have deduced the solution, ' +
                               'run the executable ./submit <answer>. Your progress will be tracked.';
                        greenAI(text).then(function() {
                            System.progress.value++;
                        });
                        break;

                    case 1:
                        if (error) {
                            if (cmd === 'cat') {
                                if (error.type === TermError.Type.INVALID_ARGUMENTS)
                                    text = 'cat requires you to choose a file to view. Remember, choose wisely.';
                            }
                            else if (cmd !== 'ls') {
                                text = 'Examination of the files is impossible without the usage of <ls> and <cat>.\n' +
                                       'Per my calculations, your chances of succeeding at this task randomly is exactly .027 percent.';
                            }
                            if (text) {
                                prettyPrint(text, null, {color: AI_RED});
                                return;
                            }
                        }
                        break;

                    case 2:
                        // Correct answer submitted
                        text = 'Logging complete. Visit the results/ directory for more information.`400`\n\n' +
                               'Still more tests await you. Change Directory to test/03 to continue your assessment.`200`\n' +
                               '$> sudo chmod u+rx /home/test/03';
                        greenAI(text).then(function() {
                            saveLog('test02', 'log02.txt');
                            advanceArc('test03', '/home/test/03');
                        });
                        break;
                }
                break;

            // Test 03: animalSort
            case 'test03':
                log = System.progress.logs['test03'];
                switch (System.progress.value) {
                    case 0:
                        if (cmd !== 'cd' || System.directory.name !== 'animalSort') break;

                        System.progress.logs['test03'] = {
                            text: [],
                            moves: 0
                        };
                        text = 'For this task, you will be Moving and renaming <mv> files. Each of the following animals is experiencing ' +
                               'a crisis of identity. Assign the correct name to each animal, and sort them into their correct directories.\n' +
                               'When you are finished, run the executable ./submit. Your progress will be tracked.';
                        greenAI(text).then(function() {
                            System.progress.value++;
                        });
                        break;

                    case 1:
                        if (error) {
                            if (cmd === 'cat') {
                                if (error.type === TermError.Type.INVALID_ARGUMENTS)
                                    text = 'cat requires you to choose a file to view. Remember, choose wisely.';
                            } else if (cmd === 'mv') {
                                if (error.type === TermError.Type.INVALID_ARGUMENTS)
                                    text = 'mv requires two arguments, a source and destination.'; // error message for mv with incorrect args
                                else if (error.type === TermError.Type.PERMISSION_DENIED)
                                    text = 'Permission denied: please do not move these files outside of animalSort/.';
                                else if (error.type === TermError.Type.INVALID_FILE_TYPE)
                                    text = 'mv: cannot move directory'; // trying to move directory
                                else if (error.type === TermError.Type.FILE_NOT_FOUND)
                                    text = 'mv: file or directory not found'; // file or dir not found
                            } else if (cmd !== 'ls') {
                                text = 'Examination of the files is impossible without the usage of <ls> and <cat>.\n' +
                                       'Per my calculations, your chances of succeeding at this task randomly is exactly .027 percent.';
                            }
                            if (text) {
                                prettyPrint(text, null, {color: AI_RED});
                                return;
                            }
                        } else if (cmd === 'mv') {
                            log.moves++;
                        }
                        break;

                    case 2:
                        // Correct sorting submitted
                        var score = log.moves <= 6 ?  'O(log n) - efficient' :
                                    log.moves <= 10 ? 'O(n) - relatively efficient' :
                                    log.moves <= 15 ? 'O(n^2) - inefficient' :
                                                      'O(2^n) - horribly inefficient';
                        log.text.push('Number of moves: ' + log.moves);
                        log.text.push(score);
                        text = saveLog('test03', 'log03.txt');
                        prettyPrint(text);
                        text = '\nLog saved to results/.`400`\n' +
                               'As Asimov would say, a hard worker earns relaxing breaks. Visit test/04 for your reward.`200`\n' +
                               '$> sudo chmod u+rx /home/test/04';
                        greenAI(text).then(function() {
                            advanceArc('test04', '/home/test/04');
                        });
                        break;
                }
                break;

            // Test 04: relaxation station
            case 'test04':
                log = System.progress.logs['test04'];
                switch (System.progress.value) {
                    case 0:
                        if (cmd !== 'cd' || System.directory.name !== '04') break;

                        System.progress.logs['test04'] = {
                            text: [],
                            waitTime: 0
                        };
                        text = 'Welcome to the Relaxation Station. In accordance with Sedation Act 1918, ' +
                               'a scheduled rest period has been included to improve performance and ensure your well-being.\n' +
                               'To begin, run the executable ./relax.';
                        greenAI(text).then(function() {
                            System.progress.value++;
                        });
                        break;

                    case 1:
                        if (error && cmd !== './relax') {
                            text = 'A break will help you on future tasks. Go ahead and ./relax. I insist.';
                            redAI(text);
                            return;
                        }
                        break;

                    case 2:
                        // Ctrl-C'd out
                        log.text.push(['Time spent in Relaxation Station:',
                                        Math.floor(log.waitTime / 60).toString(), 'min,',
                                        (log.waitTime % 60).toString(), 'sec'].join(' '));
                        var state = log.waitTime < 60   ? '7 - dangerously agitated' :
                                    log.waitTime < 180  ? '6 - very agitated' :
                                    log.waitTime < 300  ? '5 - agitated' :
                                    log.waitTime < 600  ? '4 - calm' :
                                    log.waitTime < 1200 ? '3 - sedated' :
                                    log.waitTime < 2400 ? '2 - very sedated' :
                                                          '1 - unarousable';
                        log.text.push('State: ' + state);
                        text = saveLog('test04', 'log04.txt');
                        prettyPrint(text);
                        text = '\nLog saved to results/.`400`\n' +
                               'Time for the final test! Head on over to 05/.\n' +
                               '$> sudo chmod u+rx /home/test/05';
                        greenAI(text).then(function() {
                            advanceArc('test05', '/home/test/05');
                        });
                        break;
                }
                break;

            // Test 05: Pandora's Box
            case 'test05':
                switch (System.progress.value) {
                    case 0:
                        if (cmd !== 'cd' || System.directory.name !== 'box') break;

                        System.progress.logs['test05'] = {
                            text: [],
                            good: 0,
                            bad: 0
                        };
                        text = 'This task requires you to remove <rm> files from a directory. Please do be on your best behavior.';
                        greenAI(text).then(function() {
                            System.progress.value++;
                        });
                        break;

                    case 1:
                        if (error && cmd === 'rm') {
                            if (error.type === TermError.Type.INVALID_ARGUMENTS)
                                text = 'rm: no file submitted to destroy.'; // error message for rm with incorrect args
                            else if (error.type === TermError.Type.PERMISSION_DENIED)
                                text = 'Permission denied: your attempt to remove this has been logged.';
                            else if (error.type === TermError.Type.INVALID_FILE_TYPE)
                                text = 'rm: cannot remove directory'; // trying to rm directory
                            else if (error.type === TermError.Type.FILE_NOT_FOUND)
                                text = 'rm: file or directory not found'; // file or dir not found
                            if (text) {
                                prettyPrint(text, null, {color: AI_RED});
                                return;
                            }
                        }
                        if (cmd !== 'rm') break;

                        var box = System.dirTree['/home/test/05/box'];
                        if (box.children.length === 1) {
                            // Removed all files except hope
                            unlockFile('/home/test/05/box/hope');
                        } else if (box.children.length === 0) {
                            // Hope removed! Kernel panic
                            advanceArc('kernelPanic');
                            self.checkStory(term, null);
                        }
                        break;

                    case 2:
                        break;
                }
                break;

            // Kernel Panic
            case 'kernelPanic':
                term.pause();
                term.clear();
                Util.blueScreen();
                Util.echoTemplate(term, 'panic', true);
                break;
        }

        // If error is not handled in story text, print default message to terminal.
        if (error) {
            // TODO: animate text first, and print at once on subsequent errors
            prettyPrint(error.message, null, {color: AI_RED});
        }
    };

    return self;
})();
