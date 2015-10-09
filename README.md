# async-class

Cleaner ES6 async class methods for Node 4.0.0+. A solution to using promises
and coroutines with classes without the overhead of babel, or the need to adopt
unimplemented syntax and features, until v8/node supports ES7 async/await.

[![Build Status](https://travis-ci.org/danielstjules/async-class.svg?branch=master)](https://travis-ci.org/danielstjules/async-class)

## Installation

```
npm install --save async-class
```

## Overview

Using only ES6 features, how would you achieve a class like the following?

``` javascript
'use strict';

class FakeDataStore {
  constructor() {
    this.store = new Map();
  }

  async setAsync(key, value) {
    this.store.set(key, value);
    return await Promise.resolve(key);
  }
}
```

You'd use libraries that offer coroutine functionality like `co` or `bluebird`.
However, there's no way to decorate those methods with ES6. Without the ES6
class sugar, we'd like to achieve the following:

``` javascript
'use strict';
let Promise = require('bluebird');

function FakeDataStore {
  this.store = new Map();
}

FakeDataStore.prototype.setAsync = Promise.coroutine(function*(key, value) {
  this.store.set(key, value);
  return yield Promise.resolve(key);
};
```

That's where this library comes in. Using it is simple:

``` javascript
'use strict';
let wrap = require('async-class').wrap;

class FakeDataStore {
  constructor() {
    this.store = new Map();
  }

  *setAsync(key, value) {
    this.store.set(key, value);
    return yield Promise.resolve(key);
  }
}

module.exports = wrap(FakeDataStore);
```

Clean ES6 classes and async methods!

## API

#### async-class.wrap(klass [, methodNames])

Wraps static and instance methods whose name ends with Async, or are
GeneratorFunctions. Any GeneratorFunction is wrapped with
bluebird.coroutine(), and others with bluebird.method(). Accepts an optional
array of method names, wrapping only those found in the array, and disabling
the Async suffix check. Returns the class.

#### async-class.wrapStaticMethods(klass [, methodNames])

Wraps static methods whose name ends with Async or are GeneratorFunctions.
Any GeneratorFunction is wrapped with bluebird.coroutine(), and others with
bluebird.method(). Accepts an optional array of method names, wrapping only
those found in the array, and disabling the Async suffix check. Returns the
class.

#### async-class.wrapInstanceMethods(klass [, methodNames])

Wraps instance methods whose name ends with Async, or are GeneratorFunctions.
Any GeneratorFunction is wrapped with bluebird.coroutine(), and others with
bluebird.method(). Accepts an optional array of method names, wrapping only
those found in the array, and disabling the Async suffix check. Returns the
class.
