'use strict';
var Promise = require('pinkie-promise');
var Route = require('./route');
var methods = [
	'HEAD',
	'OPTIONS',
	'GET',
	'PUT',
	'PATCH',
	'POST',
	'DELETE'
];

function Router() {
	if (!(this instanceof Router)) {
		return new Router();
	}

	this._stack = [];
}

methods.forEach(function (method) {
	method = method.toLowerCase();

	Router.prototype[method] = function (path) {
		var middleware = Array.prototype.slice.call(arguments, 1);

		this.register(path, [method], middleware);
		return this;
	};
});

Router.prototype.del = Router.prototype.delete;

Router.prototype.register = function (path, methods, middleware) {
	var stack = this._stack;
	var route = new Route(path, methods, middleware);

	if (methods.length || !stack.length) {
		var added = false;

		if (!route.paramNames.length) {
			var routeNestingLevel = route.path.toString().split('/').length;

			added = stack.some(function (m, i) {
				var mNestingLevel = m.path.toString().split('/').length;
				var isParamRoute = Boolean(m.paramNames.length);
				if (routeNestingLevel === mNestingLevel && isParamRoute) {
					return stack.splice(i, 0, route);
				}
			});
		}

		if (!added) {
			stack.push(route);
		}
	} else {
		stack.some(function (m, i) {
			if (!m.methods.length && i === stack.length - 1) {
				return stack.push(route);
			} else if (m.methods.length) {
				if (stack[i - 1]) {
					return stack.splice(i, 0, route);
				}

				stack.unshift(route);
			}
		});
	}

	return route;
};

Router.prototype.routes = function () {
	var router = this;

	return function () {
		var path = this.path;
		var matched = router.match(path, this.method.toLowerCase());
		var next = Promise.resolve();

		this.matched = matched.path;

		if (matched.pathAndMethod.length) {
			var i = matched.pathAndMethod.length;

			while (matched.route && i--) {
				var route = matched.pathAndMethod[i];

				for (var j = 0; j < route.stack.length; j++) {
					next = next.then(Promise.resolve(route.stack[j].call(this)));
				}
			}
		}

		return next;
	};
};

Router.prototype.match = function (path, method) {
	var stack = this._stack;
	var matched = {
		path: [],
		pathAndMethod: [],
		route: false
	};

	stack.forEach(function (route) {
		if (route.match(path)) {
			matched.path.push(route);

			if (route.methods.length === 0 || route.methods.indexOf(method) !== -1) {
				matched.pathAndMethod.push(route);

				if (route.methods.length) {
					matched.route = true;
				}
			}
		}
	});

	return matched;
};

module.exports = Router;
