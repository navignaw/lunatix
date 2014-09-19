function File(name, type, permissions, parent) {
    this.name = name || '';
    this.type = type || '';                    // filetype, one of dir, txt, exe, png, jpg
    this.permissions = permissions || (1 + 2); // read and writeable by default
    this.parent = parent || null;              // parent directory File (..)
    this.children = [];                        // list of Files (if type === "dir")
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
};

/* TODO: Define overall directory structure of entire game!
 * It may be prudent to define it as JSON, and write a function
 * to map the JSON into a nested File object. */
File.LUNATIX_DIRECTORY = new File('~', 'dir');