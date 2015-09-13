'use strict';
let Promise = require('bluebird');

/**
 * Wraps all static and instance methods whose name ends with Async. Any
 * GeneratorFunction is wrapped with bluebird.coroutine(), and others with
 * bluebird.method().
 *
 * @param {function} klass The class to wrap
 */
function wrap(klass) {
  [klass, klass.prototype].forEach(wrapFunctions);
}

module.exports = {
  wrap
};

function wrapFunctions(target) {
  Object.getOwnPropertyNames(target).forEach(function(key) {
    if (!key.endsWith('Async') || typeof target[key] !== 'function') return;

    if (target[key].constructor.name === 'GeneratorFunction') {
      target[key] = Promise.coroutine(target[key]);
    } else {
      target[key] = Promise.method(target[key]);
    }
  });
}
