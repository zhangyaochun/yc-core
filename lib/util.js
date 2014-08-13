'use strict';

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
