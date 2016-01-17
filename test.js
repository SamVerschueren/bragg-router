import test from 'ava';
import m from './';

test.beforeEach(t => {
	t.context.router = m();
});

test('create', t => {
	t.is(t.context.router.constructor, m);
	t.same(t.context.router._stack, []);
});

test('add middleware', t => {
	const router = t.context.router;
	const handler = () => { };

	router.get('/', handler);

	t.is(router._stack.length, 1);
	t.is(router._stack[0].path, '/');
	t.same(router._stack[0].methods, ['get']);
	t.same(router._stack[0].paramNames, []);
});

test('add middleware', t => {
	const router = t.context.router;
	const handler = () => { };

	router.post('/{version}/user/{id}', handler);

	t.is(router._stack.length, 1);
	t.is(router._stack[0].path, '/{version}/user/{id}');
	t.same(router._stack[0].methods, ['post']);
	t.same(router._stack[0].paramNames, ['version', 'id']);
});

test('multiple handlers', async t => {
	const router = t.context.router;

	router.get('/', function () {
		this.body = 'Foo';
	}, function () {
		this.body += ' Bar';
	}, function () {
		this.body += ' Baz';
	});

	var ctx = {
		path: '/',
		method: 'GET'
	};

	await router.routes().call(ctx);

	t.is(ctx.body, 'Foo Bar Baz');
});

