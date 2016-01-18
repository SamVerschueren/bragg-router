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

router.get('/', function () {
    this.body = 'Home';
});

router.get('/user/{id}', function () {
    this.body = 'Retrieve user with id ' + this.request.params.id;
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
}, function () {
    this.body = result + ' Bar';
});

app.use(router.routes());

exports.handler = app.listen();
```

### Mapping template

In order for you to use the router, you will have to add extra properties to your [mapping template](https://github.com/SamVerschueren/bragg#mapping-template).

```json
{
    "resource-path": "$context.resourcePath",
    "http-method": "$context.httpMethod"
}
```

[Bragg](https://github.com/SamVerschueren/bragg) will detect these properties and expose them as `path` and `method` properties in the middlewares.


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)
