'use strict';
const Route = require('./route');

const methods = [
	'HEAD',
	'OPTIONS',
	'GET',
	'PUT',
	'PATCH',
	'POST',
	'DELETE'
];

class Router {
	constructor() {
		this._stack = [];
	}

	register(path, methods, middleware) {
		const stack = this._stack;
		const route = new Route(path, methods, middleware);

		if (methods.length > 0 || stack.length === 0) {
			// If we don't have parameters, put before any with same route nesting level but with parameters
			let added = false;

			if (route.paramNames.length === 0) {
				const routeNestingLevel = route.path.toString().split('/').length;

				added = stack.some((m, i) => {
					const mNestingLevel = m.path.toString().split('/').length;
					const isParamRoute = Boolean(m.paramNames.length);
					if (routeNestingLevel === mNestingLevel && isParamRoute) {
						return stack.splice(i, 0, route);
					}
					return false;
				});
			}

			if (!added) {
				stack.push(route);
			}
		}

		return route;
	}

	routes() {
		return ctx => {
			const path = ctx.path;
			const matched = this.match(path, ctx.method.toLowerCase());
			let next;

			ctx.matched = matched.path;

			if (matched.pathAndMethod.length > 0) {
				let i = matched.pathAndMethod.length;

				while (matched.route && i--) {
					const route = matched.pathAndMethod[i];

					const params = ctx.request.params || {};

					// Extract the `params` from the route
					Object.defineProperty(ctx.request, 'params', {enumerable: true, writable: true, value: Object.assign(params, route.getParams(path))});

					next = route.stack.reduce((promise, fn) => {
						return promise.then(result => fn(ctx, result));
					}, Promise.resolve());
				}
			}

			return next;
		};
	}

	match(path, method) {
		const stack = this._stack;
		const matched = {
			path: [],
			pathAndMethod: [],
			route: false
		};

		for (const route of stack) {
			if (route.match(path)) {
				matched.path.push(route);

				if (route.methods.length === 0 || route.methods.indexOf(method) !== -1) {
					matched.pathAndMethod.push(route);

					if (route.methods.length > 0) {
						matched.route = true;
					}
				}
			}
		}

		return matched;
	}
}

methods.forEach(method => {
	method = method.toLowerCase();

	Router.prototype[method] = function (path) {
		const middleware = Array.prototype.slice.call(arguments, 1);
		this.register(path, [method], middleware);
		return this;
	};
});

Router.prototype.del = Router.prototype.delete;

module.exports = () => new Router();
