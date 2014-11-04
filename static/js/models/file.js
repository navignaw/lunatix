// TODO: Refactor to util.js?

var File = {};
File.getDirectory = function(name, callback) {
    $.ajax({
        type: 'GET',
        url: [$app.SCRIPT_ROOT, '/static/dirs/', name].join(''),
        success: function(json) {
            callback(_.isString(json) ? $.parseJSON(json) : json);
        },
    }).fail(function(jqXHR, textStatus, error) {
        console.error(error);
    });
};

File.createFile = function(dir, name, file) {
    Util.log('Creating ' + name + ' in ' + dir);
    System.dirTree[dir].children.push(name);
    System.dirTree[dir + '/' + name] = file;
};

File.removeFile = function(dir, name) {
    Util.log('Removing ' + name + ' from ' + dir);
    _.pull(System.dirTree[dir].children, name);
    System.dirTree = _.omit(System.dirTree, dir + '/' + name);
};
