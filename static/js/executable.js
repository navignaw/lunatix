var Executable = (function() {

    var EXECUTABLES = {
        "submit": function(cmd) {
            return 'you submitted: ' + cmd.rest;
        }
    };

    var self = {};

    /* Execute a file by name. */
    self.executeFile = function(file, cmd) {
        if (_.has(EXECUTABLES, file)) {
            return EXECUTABLES[file](cmd);
        } else {
            System.log('Executable not found!');
            return new TermError(TermError.Type.MISCELLANEOUS, 'Executable not found!');
        }
    };

    return self;
})();
