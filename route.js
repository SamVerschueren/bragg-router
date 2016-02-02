'use strict';

function extractPathParams(path) {
	var paramNames = [];

	var regex = new RegExp('\{(\\w+)\}', 'g');
	var res = regex.exec(path);

	while (res !== null) {
		paramNames.push(res[1]);
		res = regex.exec(path);
	}

	return paramNames;
}

function Route(path, methods, middleware, opts) {
	this.path = path;
	this.opts = opts || {};
	this.methods = methods;
	this.paramNames = [];
	this.stack = Array.isArray(middleware) ? middleware : [middleware];

	this.stack.forEach(function (fn) {
		var type = (typeof fn);
		if (type !== 'function') {
			throw new Error(methods.toString() + ' `' + path + '`: `middleware` must be a function, not `' + type + '`');
		}
	});

	if (!(path instanceof RegExp)) {
		this.paramNames = extractPathParams(path);
	}
}

Route.prototype.match = function (path) {
	if (this.path instanceof RegExp) {
		return this.path.test(path);
	}

	return this.path === path;
};

module.exports = Route;
