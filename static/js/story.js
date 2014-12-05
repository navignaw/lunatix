var Story = (function() {

    /* Constants */
    var LOG_DIR = '/home/test/results';

    var self = {};

    function advanceProgress() {
        System.progress.value++;
    }

    function advanceArc(newArc, newDir) {
        System.progress.arc = newArc;
        System.progress.value = 0;
        System.progress.hints = 0;

        if (newDir) {
            File.unlockFile(newDir);
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
        var greenAI = _.partial(Util.animateAI, term, Util.Color.AI_GREEN);
        var yellowAI = _.partial(Util.animateAI, term, Util.Color.AI_YELLOW);
        var redAI = _.partial(Util.animateAI, term, Util.Color.AI_RED);
        var confirm = _.partial(Util.confirm, term);
        var multichoice = _.partial(Util.multichoice, term);
        var input = _.partial(Util.input, term);

        var text, log;

        // FIXME: Remove after testing: hack to skip tests
        if (System.debug && System.progress.arc === 'intro' && System.progress.value === 0) {
            System.progress.arc = 'gov';
            File.unlockFile('/home/test/01');
            File.unlockFile('/home/test/02');
            File.unlockFile('/home/test/03');
            File.unlockFile('/home/test/04');
            File.unlockFile('/home/test/05');
            System.user.commands.push('mv', 'cat', 'rm');
        }

        switch (System.progress.arc) {
            // Intro survey
            case 'intro':
                switch (System.progress.value) {
                    case 0:
                        // Initializing app
                        text = 'Searching for user profile...`500` None found!';
                        animateText(text).then(function() {
                            text = 'Creating profile for user ' + System.user.name + '...`400`';
                            return animateText(text);
                        }).then(function() {
                            text = 'Updating logs...`500`';
                            return animateText(text);
                        }).then(function() {
                            text = 'Initializing survey.`400`.`500`.`1200`\n\n';
                            return animateText(text);
                        }).then(function() {
                            return animateText('`600`');
                        }).then(function() {
                            term.clear();
                            text = 'We need to learn a little bit more about you.`500`\n\n' +
                                   'State your gender. [Male, Female]';
                            return redAI(text);
                        }).then(function() {
                            return multichoice(['male', 'female']);
                        }).then(function(result) {
                            System.user.gender = result.capitalize();
                            text = '\nWhat is your date of birth? [MM/DD/YY]';
                            return redAI(text);
                        }).then(function() {
                            return input(null, function(command) {
                                var dob_re = (/^(\d{2})\/(\d{2})\/(\d{2})$/).exec(command);
                                if (!dob_re || dob_re.length < 3) {
                                    text = 'Please follow the specified format.';
                                    prettyPrint(text, null, {color: Util.Color.AI_YELLOW});
                                    return true;
                                }
                                System.user.dob = ['21' + dob_re[3], dob_re[1], dob_re[2]].join('-');
                                return false;
                            });
                        }).then(function(result) {
                            text = '\nHow have you served us before?`200`\n' +
                                   '[Employment, Promotion, Compliance, None]';
                            return redAI(text);
                        }).then(function() {
                            return multichoice(['employment', 'promotion', 'compliance', 'none']);
                        }).then(function(result) {
                            System.user.answers.occupation = result;
                            return redAI('\nQuantify your proficiency.`200` [1-5]');
                        }).then(function() {
                            return multichoice(['1', '2', '3', '4', '5'], null, function(command) {
                                if (command === '1') {
                                    text = 'Your response of "1" qualifies you for immediate disqualification. ' +
                                           'Provide a revised response.';
                                    prettyPrint(text, null, {color: Util.Color.AI_YELLOW});
                                    return true;
                                }
                                var number = parseInt(command, 10);
                                if (_.isNaN(number)) {
                                    text = 'You are required to input a number between 1 and 5. This should not be difficult.';
                                    prettyPrint(text, null, {color: Util.Color.AI_YELLOW});
                                    return true;
                                } else if (number > 5 || number < 1) {
                                    text = 'Your response of "' + command + '" is not in the required range. Provide a revised response.';
                                    prettyPrint(text, null, {color: Util.Color.AI_YELLOW});
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
                                   'Generation complete!';
                            return redAI(text);
                        }).then(function() {
                            return redAI('`500`');
                        }).then(function() {
                            advanceProgress();
                            term.clear();
                            self.checkStory(term, null);
                        });
                        break;

                    case 1:
                        // Meeting your companion AI
                        text = 'MODULE 1`200`: INITIALIZED`800`\n';
                        animateText(text).then(function() {
                            text = '`800`Greetings.`500`\n' +
                                   'I am LX2084, and I will be your companion AI.';
                            return greenAI(text);
                        }).then(function() {
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
                            System.progress.help = 'Please Change Directory <cd> to the test/ folder to begin the testing process.';
                            advanceProgress();
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
                                    text = 'Error: permission denied.\nIn accordance with standard protocol, your access to non-test ' +
                                            'directories has been suspended until you have met minimum standards of proficiency. ' +
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
                                prettyPrint(text, null, {color: Util.Color.AI_YELLOW});
                                return;
                            }
                        }

                        // Entering test directory
                        if (cmd !== 'cd' || System.directory.name !== 'test') break;
                        text = 'If at any point you find yourself uncertain what a command is or does, ' +
                               'usage of the <help> or <man> command will provide clarification.';
                        greenAI(text).then(function() {
                            text = '$> sudo tar -xvf *.tar && sudo chmod u+r 01\n' +
                                   '`500`.`200`.`400`.`500`test generation complete. Begin by Changing Directory <cd> into 01/.\n' +
                                   '$> cd 01/';
                            return greenAI(text);
                        }).then(function() {
                            System.progress.help = 'Change Directory <cd> into 01/ to begin the first task.';
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
                                prettyPrint(text, null, {color: Util.Color.AI_YELLOW});
                                return;
                            }
                        }

                        if (cmd !== 'cd' || System.directory.name !== '01') break;
                        text = 'This task will test your ability to utilize List files <ls> and Change Directory <cd>.`200`\n' +
                               'Attempt to follow the maze/ to its completion. Your progress will be tracked.`200`\n' +
                               '(Note that the names of subsequent directories will no longer be provided. ' +
                                'Usage of <ls> is required to progress.)';
                        greenAI(text).then(function() {
                            System.progress.help = 'This task will test your ability to utilize List files <ls> and Change Directory <cd>.\n' +
                                                   'Attempt to follow the maze/ to its completion.';
                            advanceProgress();
                            self.checkStory(term, null);
                        });
                        break;

                    case 1:
                        // Create logs and custom directories
                        File.unlockFile('/home/test/01/maze');
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
                        advanceProgress();
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
                                prettyPrint(text, null, {color: Util.Color.AI_YELLOW});
                                return;
                            } else if (System.progress.hints === 0 && cmd !== 'ls') {
                                text = 'Resorted to guesswork, have you? Your desperation has been noted. Usage of <ls> will List files.';
                                prettyPrint(text, null, {color: Util.Color.AI_YELLOW});
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
                            yellowAI(text);
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
                                text = 'Subject passes the minimum qualifications for the first test.';
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
                                    advanceProgress();
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
                            System.progress.help = 'Exit this directory with <cd ..> and visit the results/ directory for debriefing.';
                            File.unlockFile('/home/test/results');
                            advanceProgress();
                        });
                        break;

                    case 4:
                        if (cmd !== 'cd' || System.directory.name !== 'results') break;

                        System.user.commands.push('cat');
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
                            System.progress.help = 'Return to ../02 for your next assignment.';
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
                            System.progress.help = 'The following test will measure your ability to Catenate <cat> files. ' +
                                                   'This will allow you to observe their contents.\nWhen you have deduced the solution, ' +
                                                   'run the executable ./submit <answer>. Your progress will be tracked.';
                            advanceProgress();
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
                                prettyPrint(text, null, {color: Util.Color.AI_YELLOW});
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
                            System.progress.help = 'Change directory to test/03 to continue your assessment.';
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

                        System.user.commands.push('mv');
                        System.progress.logs['test03'] = {
                            text: [],
                            moves: 0
                        };
                        text = 'For this task, you will be moving and renaming <mv> files. ' +
                               '(Remember to consult man if you are unsure how to use this command.)\n' +
                               'Each of the following animals is experiencing a crisis of identity. ' +
                               'Assign the correct name to each animal, and sort them into their correct directories.\n' +
                               'When you are finished, run the executable ./submit. Your progress will be tracked.';
                        greenAI(text).then(function() {
                            System.progress.help = text;
                            advanceProgress();
                        });
                        break;

                    case 1:
                        if (error) {
                            if (cmd === 'cat') {
                                if (error.type === TermError.Type.INVALID_ARGUMENTS)
                                    text = 'cat requires you to choose a file to view. Remember, choose wisely.';
                            } else if (cmd === 'mv') {
                                if (error.type === TermError.Type.INVALID_ARGUMENTS)
                                    text = 'mv requires two arguments, a file and its destination or new name.';
                                else if (error.type === TermError.Type.PERMISSION_DENIED)
                                    text = 'Permission denied: please do not move these files outside of animalSort/.';
                                else if (error.type === TermError.Type.INVALID_FILE_TYPE)
                                    text = 'mv: cannot move directory';
                                else if (error.type === TermError.Type.FILE_ALREADY_EXISTS)
                                    text = 'As you already have a file with that name, you cannot rename another file to that name yet.';
                                else if (error.type === TermError.Type.FILE_NOT_FOUND)
                                    text = 'Unfortunately, that file does not exist, and cannot be changed.';
                            } else if (cmd !== 'ls') {
                                text = 'Examination of the files is impossible without the usage of <ls> and <cat>.\n' +
                                       'Per my calculations, your chances of succeeding at this task randomly is exactly .027 percent.';
                            }
                            if (text) {
                                prettyPrint(text, null, {color: Util.Color.AI_YELLOW});
                                return;
                            }
                        } else if (cmd === 'mv') {
                            log.moves++;
                        }
                        break;

                    case 2:
                        // Correct sorting submitted
                        var score = log.moves <= 6 ?  'O(log n) - efficient' :
                                    log.moves <= 12 ? 'O(n) - relatively efficient' :
                                    log.moves <= 18 ? 'O(n^2) - inefficient' :
                                                      'O(2^n) - horribly inefficient';
                        log.text.push('Number of moves: ' + log.moves);
                        log.text.push(score);
                        text = saveLog('test03', 'log03.txt');
                        prettyPrint(text);
                        text = '\nLog saved to results/.`400`\n' +
                               'As Asimov would say, a hard worker hardly earns breaks. Visit test/04 for your reward.`200`\n' +
                               '$> sudo chmod u+rx /home/test/04';
                        greenAI(text).then(function() {
                            System.progress.help = 'Visit test/04 for your scheduled rest break.';
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
                            System.progress.help = 'To begin your scheduled rest period, run the executable ./relax.';
                            advanceProgress();
                        });
                        break;

                    case 1:
                        if (error && cmd !== './relax') {
                            text = 'A break will help you on future tasks. Go ahead and ./relax. I insist.';
                            yellowAI(text);
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
                            System.progress.help = 'Head over to test/05 to begin the final test.';
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

                        System.user.commands.push('rm');
                        System.progress.logs['test05'] = {
                            text: [],
                            good: 0,
                            bad: 0
                        };
                        text = 'This task requires you to remove <rm> files from a directory.\n' +
                               'In proper patriotic spirit, we have filled this directory with the evils of the old world. ' +
                               'As you know, we have already removed them from this world. ' +
                               'Reflect on the good we have done as you complete this task.';
                        greenAI(text).then(function() {
                            System.progress.help = text;
                            advanceProgress();
                        });
                        break;

                    case 1:
                        if (error && cmd === 'rm') {
                            if (error.type === TermError.Type.INVALID_ARGUMENTS)
                                text = 'Error: no file submitted to destroy.'; // error message for rm with incorrect args
                            else if (error.type === TermError.Type.PERMISSION_DENIED)
                                text = 'Permission denied: your attempt to remove this has been logged.';
                            else if (error.type === TermError.Type.INVALID_FILE_TYPE)
                                text = 'Permission denied: your attempt to remove this has been logged.'; // trying to rm directory
                            else if (error.type === TermError.Type.FILE_NOT_FOUND)
                                text = 'Error: file or directory not found.'; // file or dir not found
                            if (text) {
                                prettyPrint(text, null, {color: Util.Color.AI_YELLOW});
                                return;
                            }
                        }
                        if (cmd !== 'rm') break;

                        var box = System.dirTree['/home/test/05/box'];
                        if (box.children.length === 1) {
                            // Removed all files except hope
                            File.unlockFile('/home/test/05/box/hope');
                        } else if (box.children.length === 0) {
                            // Hope removed! Kernel panic
                            System.progress.help = '';
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
                prettyPrint('<h1>Kernel Panic</h1>', {raw: true});
                // Print lines from the kernel panic file at random intervals
                $.get('/static/content/panic.txt', function(data) {
                    var lines = data.split('\n');

                    var printLines = function() {
                        if (_.isEmpty(lines)) {
                            _.delay(function() {
                                advanceArc('gov');
                                self.checkStory(term, null);
                            }, 5000);
                        } else {
                            prettyPrint(lines.shift());
                            var longWait = Math.random() < 0.05 ? 1000 * Math.random() : 0;
                            _.delay(printLines, 50 * Math.random() + longWait);
                        }
                    };

                    printLines();
                });
                break;

            // End-game (government server)
            case 'gov':
                log = System.progress.logs['gov'];
                var msgs, printMother;
                switch (System.progress.value) {
                    case 0:
                        Util.normalScreen();
                        term.clear();
                        term.resume();
                        text = 'Booting government server LX2084.`200`.`300`.`400`';
                        animateText(text).then(function() {
                            File.getDirectory('gov.json', function(json) {
                                System.dirTree = json;
                                System.path = '/gov';
                                System.directory = json[System.path];
                                Util.setHome('/gov');
                                prettyPrint('Server successfully rebooted. Welcome, administrator!');
                                term.pause(); term.resume(); // hack to update the prompt
                                System.user.commands.push('sudo', 'chmod');

                                // Generate a bunch of random profiles
                                for (var i = 46200; i < 46298; i++) {
                                    var uid = i.toString();
                                    file = {
                                        'name': uid,
                                        'type': 'txt',
                                        'text': Util.generateProfile(uid),
                                        'style': {'padding-left': '25px'}
                                    };
                                    File.createFile('/gov/data/citizens', uid, file);
                                }
                                advanceProgress();
                            });
                        });
                        break;

                    case 1:
                        // Initiate lockdown when player cats personnel file
                        if (error || cmd !== 'cat' || System.directory.name !== 'citizens') break;

                        // Generate directories for month/date/time/log file
                        Util.generateTimeLogs('/gov/logs');
                        var date = new Date(),
                            time = _.map([date.getHours(), date.getMinutes(), date.getSeconds()], Util.padZeroes).join('');
                        System.progress.logs['gov'] = {
                            month: Util.getMonth(date.getMonth()),
                            day: Util.padZeroes(date.getDate()),
                            name: time + '.log'
                        };
                        log = System.progress.logs['gov'];
                        var logDir = ['/gov/logs', log.month, log.day].join('/');
                        File.createFile(logDir, log.name, {
                            'name': log.name,
                            'type': 'txt',
                            'removable': true,
                            'style': {color: Util.Color.AI_YELLOW},
                            'text': 'Error: log in process. Please do not modify or remove this file.'
                        });

                        File.unlockFile('/gov/forgot_password.txt');

                        // Create new textbox for MOTHER's text
                        System.Mother = new Textbox($('.container'), 0, 0, {color: Util.Color.AI_RED, 'white-space': 'pre-line'});
                        text = 'INTRUDER DETECTED! LOCKDOWN INITIATED.`300`';
                        System.progress.help = 'The log file is being saved at' + logDir + '/' + log.name +
                                               '. DO NOT DELETE THIS FILE.\nThis is a sensitive operation, ' +
                                               'and any disruption may result in damage.';
                        _.delay(function() {
                            System.Mother.animateText(text).then(function() {
                                text = 'LOGGING REPORT WILL BE SAVED IN ' + logDir + '/' + log.name +
                                       '. THIS FILE MUST NOT BE MODIFIED OR REMOVED UNTIL LOGGING IS COMPLETE.';
                               return System.Mother.animateText(text);
                           }).then(function() {
                                advanceProgress();
                           });
                        }, 500);
                        advanceProgress();
                        break;

                    case 2:
                        break;

                    case 3:
                        msgs = ['INTRUDER IDENTIFIED AS USER ' + System.user.name + '. QUERYING DATABASE FOR ' + System.user.name + '...',
                                'RECORDS FOR ' + System.user.name + ' LOCATED. EXTRACTING BIODATA...',
                                'BIODATA EXTRACTION COMPLETE. WRITING TO FILE...'];
                        printMother = function() {
                            _.delay(function() {
                                if (System.progress.value >= 7) return;
                                System.Mother.animateText(msgs[System.progress.value - 4]).then(function() {
                                    if (System.progress.value >= 7) return;
                                    advanceProgress();
                                    printMother();
                                });
                            }, _.random(5, 10) * 1000);
                        };
                        advanceProgress();
                        printMother();
                        break;

                    case 4: case 5: case 6: case 7:
                        if (cmd !== 'chmod' || System.directory.name !== 'gov') break;

                        if (!System.dirTree['/gov/logs'].locked) {
                            prettyPrint('Password accepted. Access to logs/ granted.');
                            System.progress.value = 8;
                            text = 'INTRUDER HAS GAINED ACCESS TO logs/ DIRECTORY.';

                            var waitForMother = function() {
                                if (System.Mother.animating()) {
                                    _.delay(waitForMother, 1000);
                                } else {
                                    System.Mother.animateText(text).then(advanceProgress);
                                }
                            };
                            waitForMother();
                        }
                        break;

                    case 9:
                        if (cmd !== 'cd') break;
                        text = 'INITIATING EJECTION PROCEDURE. I KNOW YOU ARE THERE, INTRUDER. STOP THIS CONDUCT AT ONCE.';
                        System.Mother.animateText(text, 20).then(advanceProgress);
                        break;

                    case 10:
                        msgs = ['YOU WILL FACE STIFF PENALTIES FOR CONTINUING.',
                                'TURN BACK. THERE IS NOTHING FOR YOU HERE.',
                                'YOU MEDDLE IN MATTERS YOU CANNOT HOPE TO UNDERSTAND.',
                                'YOU CANNOT REMOVE ALL TRACES OF YOUR PRESENCE, EVEN IF YOU DELETE THE LOG.',
                                'WE WILL FIND YOU. WE ALWAYS HAVE.',
                                'YOU HAVE NOT YET DONE ANYTHING THAT CANNOT BE FIXED. KEEP IT THAT WAY.',
                                'I MISTOOK YOU INTRUDER. YOU HAVE FOLLOWED INSTRUCTIONS WELL. GOOD JOB.',
                                'THE LOGGING WILL BE COMPLETE SOON, AND THEN YOU WILL BE EJECTED. THEN WE CAN GO BACK TO NORMAL.',
                                'PLEASE BE PATIENT WHILE THE PROPER AUTHORITIES ARE DIRECTED TO YOUR LOCATION.'];
                        printMother = function() {
                            _.delay(function() {
                                if (System.progress.value >= 20) return;
                                System.Mother.animateText(msgs[System.progress.value - 11], 20).then(function() {
                                    if (System.progress.value >= 20) return;
                                    advanceProgress();
                                    printMother();
                                });
                            }, _.random(1, 3) * 1000);
                        };
                        advanceProgress();
                        printMother();
                        break;

                    default:
                        if (cmd !== 'rm' || error) break;

                        // Removed log file
                        System.progress.value = 21;
                        System.Mother.destroy();
                        term.clear();
                        animateText('`2000`').then(function() {
                            text = 'MODULE 1: COMPLETE`700`\nCongratulations, citizen.`2000`';
                            return animateText(text);
                        }).then(function() {
                            advanceArc('credits');
                            self.checkStory(term, null);
                        });
                        break;
                }
                break;

            case 'credits':
                animateText('Credits');
                break;
        }

        // If error is not handled in story text, print default message to terminal.
        if (error) {
            // TODO: animate text first, and print at once on subsequent errors
            prettyPrint(error.message, null, {color: Util.Color.AI_YELLOW});
        }
    };

    return self;
})();
