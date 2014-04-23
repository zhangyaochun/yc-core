'use strict';

//node core lib of fs
var fs = require('fs');
var path = require('path');
var file = module.exports = {};

//exists
var exists = file.exists = function() {
	var filepath = path.join.apply(path, arguments);
	return fs.existsSync(filepath);
};

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




