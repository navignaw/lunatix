function TermError(type, message) {
    this.type = type;  // type of error message
    this.message = message || 'Error! Something bad happened :(';  // default error message to print to console
}
TermError.prototype.isError = true;

TermError.Type = Object.freeze({
    'COMMAND_NOT_FOUND': 0,
    'INVALID_COMMAND': 1,
    'INVALID_ARGUMENTS': 2,
    'INVALID_FILE_TYPE': 3,
    'FILE_ALREADY_EXISTS': 4,
    'PERMISSION_DENIED': 403,
    'DIRECTORY_NOT_FOUND': 404,
    'FILE_NOT_FOUND': 405,
    'MISCELLANEOUS': 999
});
