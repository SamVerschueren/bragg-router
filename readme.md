# bragg-router [![Build Status](https://travis-ci.org/SamVerschueren/bragg-router.svg?branch=master)](https://travis-ci.org/SamVerschueren/bragg-router)

> Router middleware for [bragg](https://github.com/SamVerschueren/bragg).


## Install

```
$ npm install --save bragg-router
```


## Usage

```js
var app = require('bragg')();
var router = require('bragg-router')();

router.get('/', function (ctx) {
    ctx.body = 'Home';
});

router.get('/user/{id}', function (ctx) {
    ctx.body = 'Retrieve user with id ' + ctx.request.params.id;
});

app.use(router.routes());

exports.handler = app.listen();
```

### Multiple handlers

When a handler returns a promise, that promise will be resolved first. The result of following example will be `Foo Bar`.

```js
var app = require('bragg')();
var router = require('bragg-router')();

router.get('/', function () {
    return Promise.resolve('Foo');
}, function (ctx, result) {
    ctx.body = result + ' Bar';
});

app.use(router.routes());

exports.handler = app.listen();
```

## Mapping template

In order for you to use the router, you will have to add extra properties to your [mapping template](https://github.com/SamVerschueren/bragg#mapping-template).

```json
{
    "resource-path": "$context.resourcePath",
    "http-method": "$context.httpMethod"
}
```

[Bragg](https://github.com/SamVerschueren/bragg) will detect these properties and expose them as `path` and `method` properties in the middlewares.


## API

### *verb*(path, ...middlewares)

#### verb

Type: `string`  
Values: `get` `post` `put` `delete` `patch` `head` `update`

HTTP-method to listen to.

#### path

Type: `string`

Action of the request. Accepts a [matcher](https://github.com/sindresorhus/matcher) pattern.

#### middlewares

Type: `function`

Functions to be executed the request matches the `path`.

### routes()

Returns a middleware function that can be used by [bragg](https://github.com/SamVerschueren/bragg).


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)
