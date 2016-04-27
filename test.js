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

	t.is(router._stack.length, 2);
	t.is(router._stack[0].path, '/user');
	t.is(router._stack[1].path, '/{version}');
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
		method: 'GET'
	};

	await router.routes()(ctx);

	t.is(ctx.body, 'Foo Bar Baz');
});

test('regex path', async t => {
	const router = t.context.router;

	router.get('fo*', ctx => {
		ctx.body = ctx.path;
	});

	const ctx = {path: 'fo', method: 'GET'};
	const ctx2 = {path: 'foo', method: 'GET'};

	await router.routes()(ctx);
	await router.routes()(ctx2);

	t.is(ctx.body, 'fo');
	t.is(ctx2.body, 'foo');
});
