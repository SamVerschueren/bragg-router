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

	/**
	 * Extract the params out of the path.
	 * If the path of the route is `/foo/{id}` and the request path is `/foo/1`, this will result in `{foo: 1}`
	 */
	getParams(path) {
		const params = Object.create({});

		const parts = this.path.split('/');
		const pathParams = path.split('/');
		const regex = new RegExp('^{(\\w+)}$', 'g');

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const res = regex.exec(part);

			if (res !== null) {
				params[res[1]] = pathParams[i];
			}
		}

		return params;
	}

	match(path) {
		return matcher.isMatch(path, this.path.replace(/{\w+}/g, '*'));
	}
}

module.exports = Route;
