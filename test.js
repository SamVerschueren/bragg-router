import test from 'ava';
import m from '.';

test.beforeEach(t => {
	t.context.router = m();
});

test('create', t => {
	t.deepEqual(t.context.router._stack, []);
});

test('error', t => {
	const router = t.context.router;
	t.throws(() => router.get('/', 'foo'), 'get `/`: middleware must be a function, not `string`');
});

test('add get middleware', t => {
	const router = t.context.router;
	const handler = () => { };

	router.get('/', handler);

	t.is(router._stack.length, 1);
	t.is(router._stack[0].path, '/');
	t.deepEqual(router._stack[0].methods, ['get']);
	t.deepEqual(router._stack[0].paramNames, []);
});

test('add post middleware', t => {
	const router = t.context.router;
	const handler = () => { };

	router.post('/{version}/user/{id}', handler);

	t.is(router._stack.length, 1);
	t.is(router._stack[0].path, '/{version}/user/{id}');
	t.deepEqual(router._stack[0].methods, ['post']);
	t.deepEqual(router._stack[0].paramNames, ['version', 'id']);
});

test('put route without params before route with params', t => {
	const router = t.context.router;
	const handler = () => { };

	router.get('/{version}', handler);
	router.get('/user', handler);
	router.get('/user/v1', handler);

	t.is(router._stack.length, 3);
	t.is(router._stack[0].path, '/user');
	t.is(router._stack[1].path, '/{version}');
	t.is(router._stack[2].path, '/user/v1');
});

test('multiple handlers', async t => {
	const router = t.context.router;

	router.get('/',
		() => 'Foo',
		(ctx, result) => Promise.resolve(`${result} Bar`),
		(ctx, result) => {
			ctx.body = `${result} Baz`;
		}
	);

	const ctx = {
		path: '/',
		method: 'GET',
		request: {}
	};

	await router.routes()(ctx);

	t.is(ctx.body, 'Foo Bar Baz');
});

test('regex path', async t => {
	const router = t.context.router;

	router.get('fo*', ctx => {
		ctx.body = ctx.path;
	});

	const ctx = {path: 'fo', method: 'GET', request: {}};
	const ctx2 = {path: 'foo', method: 'GET', request: {}};

	await router.routes()(ctx);
	await router.routes()(ctx2);

	t.is(ctx.body, 'fo');
	t.is(ctx2.body, 'foo');
});

test('extracting parameters', async t => {
	const router = t.context.router;

	router.get('/{version}', () => { });

	const ctx = {
		path: '/v1',
		method: 'GET',
		request: { }
	};

	await router.routes()(ctx);

	t.deepEqual(ctx.request, {
		params: {
			version: 'v1'
		}
	});
});

test('extracting multiple parameters', async t => {
	const router = t.context.router;

	router.get('/{version}/foo/{id}', () => { });

	const ctx = {
		path: '/v1/foo/123',
		method: 'GET',
		request: { }
	};

	await router.routes()(ctx);

	t.deepEqual(ctx.request, {
		params: {
			version: 'v1',
			id: '123'
		}
	});
});

test('merge route params with request params', async t => {
	const router = t.context.router;

	router.get('/{version}/foo/{id}', () => { });

	const ctx = {
		path: '/v1/foo/123',
		method: 'GET',
		request: {
			params: {
				name: 'foo'
			}
		}
	};

	await router.routes()(ctx);

	t.deepEqual(ctx.request, {
		params: {
			name: 'foo',
			version: 'v1',
			id: '123'
		}
	});
});
