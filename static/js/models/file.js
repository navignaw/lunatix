/*function File(name, type, permissions, parent, children) {
    this.name = name;
    this.type = type || '';                    // filetype, one of dir, txt, exe, png, jpg
    this.permissions = permissions || (1 + 2); // read and writeable by default
    this.parent = parent || null;              // parent directory File (..)
    this.children = children || [];            // list of Files (if type === "dir")

    // TODO: store parent ID and children ID instead of actual File object
    // save all files in an object {ID -> File}

    this.storyProgress = function(progress) {

    };
}

File.PERMISSIONS = Object.freeze({
    'R': 1 << 0,
    'W': 1 << 1,
    'X': 1 << 2
});

File.prototype.isReadable = function() {
    return (this.permissions >> 0) % 2 === 1;
};
File.prototype.isWriteable = function() {
    return (this.permissions >> 1) % 2 === 1;
};
File.prototype.isExecutable = function() {
    return (this.permissions >> 2) % 2 === 1;
};*/

var File = {};
File.getDirectory = function(name, callback) {
    $.ajax({
        type: 'GET',
        url: $app.SCRIPT_ROOT + '/static/dirtrees/' + name,
        success: function(json) {
            callback($.parseJSON(json));
        },
    }).fail(function(jqXHR, textStatus, error) {
        console.error(error);
    });
};