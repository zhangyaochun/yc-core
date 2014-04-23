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