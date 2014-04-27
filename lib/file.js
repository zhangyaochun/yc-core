'use strict';

//node core lib of fs
var fs = require('fs');
var path = require('path');

//third part lib
var iconv = require('iconv-lite');


var file = module.exports = {};

//exists
var exists = file.exists = function() {
    var filepath = path.join.apply(path, arguments);
    return fs.existsSync(filepath);
};


//defaultEncoding
file.defaultEncoding = 'utf8';

//isDir
file.isDir = function() {
    var filepath = path.join.apply(path, arguments);
    return exists(filepath) && fs.statSync(filepath).isDirectory();
};

//isFile
file.isFile = function() {
    var filepath = path.join.apply(path, arguments);
    return exists(filepath) && fs.statSync(filepath).isFile();
};

//rename(old, new)
file.rename = function() {
    return fs.renameSync.apply(this, arguments);
};

//arePathsEq
//check if filepathA filepathB filepathC ... is eq
file.arePathsEq = function(filepath) {
    filepath = filepath.resolve(filepath);

    //support list
    var i = 1;
    var len = arguments.length;

    for (; i < len; i++) {
        if (filepath !== path.resolve(arguments[i])) {
            return false;
        }
    }

    return true;
};


file.isCwd = function() {
    var filepath = path.join.apply(path, arguments);

    //use file.arePathsEq
    return file.arePathsEq(process.cwd(), fs.realpathSycn(filepath));
};


//read
file.read = function(filepath, opts) {
    opts = opts || {};

    var result;

    //yo == grunt
    try {
        result = fs.readFileSync(String(filepath));

        if (opts.encoding !== null) {
            result = iconv.decode(result, opts.encoding || file.defaultEncoding);
        
            //direct rm BOM
            if (result.charCodeAt(0) === 0xFEFF) {
                //use slice instead of substring for person prefer
                result = result.slice(1);
            }
        }

        return result;

    } catch(e) {
        throw new Error('Unable to read "' + filepath + '" file (Error code: ' + e.code + ').', e);
    }
};


//readJSON
file.readJSON = function(filepath, opts) {
    var result = file.read(filepath, opts);

    try {

        result = JSON.parse(result);
        return result;

    } catch(e) {
        throw new Error('Unable to parse "' + filepath + '" file (' + e.message + ').', e);
    }
};


//mkdir
file.mkdir = function(dirpath, mode) {
    //parseInt('0777', 8) === 511
    mode = mode || parseInt('0777', 8) & (~process.umask());

    //fix dirpath like a/b/c
    //you can see more about reduce from mdn 
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
    dirpath.split(/[\/\\]/g).reduce(function(parts, part) {
        
        parts += part + '/';

        var subpath = path.resolve(parts);
        
        //just handle no exist path
        if (!exists(subpath)) {
            fs.mkdirSync(subpath, mode);
        }

        //important
        return parts;

    }, '');
};