'use strict';


var crypto = require('crypto');
var buf    = require('buffer');
var Buffer = buf.Buffer;


var util = module.exports = {};

//check is win32
var isWin32 = util.isWin32 = process.platform === 'win32';

//normalize \\ to /
util.unixifyPath = function(filepath) {
    if (isWin32) {
        return filepath.replace(/\\/g,'/');
    }

    return filepath;
};

//pad
util.pad = function (source, length){
    //private api so i don't handle source such as Math.asb(source) or ..
    var len = Math.max(0, length - source.length);
    return source + new Array(len + 1).join(' ');
};

//homeDir
util.homeDir = function () {
    var dir = isWin32 ? 'USERPROFILE' : 'HOME';
    //wind32: 'C:\\Users\\***'
    //darwin: '/Users/***' 
    return process.env[dir];
};


//isBuffer
util.isBuffer = function (source) {
    //TODO someone may say why not useBuffer.isBuffer
    //checkout https://github.com/joyent/node/commit/02729d4af7b17ea4c7272a0d0d99f6f7418e3237
    //now isBuffer is set in utils.js
    //https://github.com/joyent/node/blob/master/lib/util.js
    return typeof source === 'object' && source instanceof Buffer;
};

//isStream
util.isStream = function (source) {
    return !!source && source instanceof Stream;
};