'use strict';
const matcher = require('matcher');

function extractPathParams(path) {
	const paramNames = [];

	const regex = new RegExp('{(\\w+)}', 'g');
	let res = regex.exec(path);

	while (res !== null) {
		paramNames.push(res[1]);
		res = regex.exec(path);
	}

	return paramNames;
}

class Route {

	constructor(path, methods, middleware, opts) {
		this.path = path;
		this.opts = opts || {};
		this.methods = methods;
		this.paramNames = [];
		this.stack = Array.isArray(middleware) ? middleware : [middleware];

		for (const fn of this.stack) {
			const type = typeof fn;
			if (type !== 'function') {
				throw new Error(`${methods.toString()} \`${path}\`: middleware must be a function, not \`${type}\``);
			}
		}

		if (!(path instanceof RegExp)) {
			this.paramNames = extractPathParams(path);
		}
	}

	match(path) {
		return matcher.isMatch(path, this.path);
	}
}

module.exports = Route;
