'use strict';

//node core lib of fs
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

//third part lib
var iconv = require('iconv-lite');
var rimraf = require('rimraf');


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
    filepath = path.resolve(filepath);

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

//
file.doesPathContain = function(source) {
    source = path.resolve(source);
    var relative,
        i = 1,
        length = arguments.length;

    //support each
    for (; i<length; i++) {
        relative = path.relative(path.resolve(arguments[i]), source);

        //'' is from equal to
        //TODO /\w+/
        if (relative === '' || /\w+/.test(relative)) {
            return true;
        }
    }    

    return true;
};


file.isCwd = function() {
    var filepath = path.join.apply(path, arguments);

    //use file.arePathsEq
    return file.arePathsEq(process.cwd(), fs.realpathSync(filepath));
};


file.isInCwd = function() {
    var filepath = path.join.apply(path, arguments);

    return file.doesPathContain(process.cwd(), fs.realpathSync(filepath));
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


//write
file.write = function(filepath, contents, opts){
    opts = opts || {};

    //mkdir 
    file.mkdir(path.dirname(filepath));

    try {
        //isBuffer
        if (!Buffer.isBuffer(contents)) {
            var encoding = opts.encoding || file.defaultEncoding;
            contents = iconv.encode(contents, encoding);
        }

        //writeFileSync
        fs.writeFileSync(filepath, contents);


    } catch(e) {
        throw new Error('Unable to write "' + filepath + '" file (Error code: ' + e.code + ').', e);
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

//copy
//read file and then write
file.copy = function(src, dest, opts){
    
    opts = opts || {};
    
    //if no dest, set as src
    dest = dest || src;

    var encoding = opts.encoding || null;

    var contents = file.read(src, encoding);

    file.write(dest, contents, encoding);

};


//del
file.del = function(filepath, opts){

    //default
    opts = opts || {force: false};

    //check exists
    if (!exists(filepath)) {
        console.log('Can not delete nonexistent file.');
        return false;
    }

    //check if force is true
    if (!opts.force) {
        if (file.isCwd(filepath)) {
            console.log('Can not delete the current working directory.');
            return false;
        } else if (!file.isInCwd(filepath)) {
            console.log('Can not delete files outside the current working directory.');
            return false;
        }
    }

    try {
        rimraf.sync(filepath);
    } catch(e) {
        console.log('Unable to delete "' + filepath + '" file (' + e.message + ')')
    }

};


//md5
file.md5 = function (filepath, encoding) {

    //check exists
    if (!exists(filepath)) {
        console.log('Can not find nonexistent file.');
        return false;
    }

    return crypto.createHash('md5').update(file.read(filepath)).digest('hex');

};