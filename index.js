'use strict';
let Promise = require('bluebird');

/**
 * Wraps all static and instance methods whose name ends with Async. Any
 * GeneratorFunction is wrapped with bluebird.coroutine(), and others with
 * bluebird.method(). Accepts an optional array of method names, wrapping
 * only those found in the array, and disabling the Async suffix check.
 *
 * @param  {function} klass         The class to wrap
 * @param  {string[]} [methodNames] Optional array of method names
 * @throws {Error}    If methodNames is provided, but is not an array
 */
function wrap(klass, methodNames) {
  validateMethodNames(methodNames);

  wrapStaticMethods(klass, methodNames);
  wrapInstanceMethods(klass, methodNames);
}

/**
 * Wraps all static methods whose name ends with Async. Any GeneratorFunction
 * is wrapped with bluebird.coroutine(), and others with bluebird.method().
 * Accepts an optional array of method names, wrapping only those found in the
 * array, and disabling the Async suffix check.
 *
 * @param  {function} klass         The class to wrap
 * @param  {string[]} [methodNames] Optional array of method names
 * @throws {Error}    If methodNames is provided, but is not an array
 */
function wrapStaticMethods(klass, methodNames) {
  validateMethodNames(methodNames);
  wrapFunctions(klass, methodNames);
}

/**
 * Wraps all instance methods whose name ends with Async. Any GeneratorFunction
 * is wrapped with bluebird.coroutine(), and others with bluebird.method().
 * Accepts an optional array of method names, wrapping only those found in the
 * array, and disabling the Async suffix check.
 *
 * @param  {function} klass         The class to wrap
 * @param  {string[]} [methodNames] Optional array of method names
 * @throws {Error}    If methodNames is provided, but is not an array
 */
function wrapInstanceMethods(klass, methodNames) {
  validateMethodNames(methodNames);
  wrapFunctions(klass.prototype, methodNames);
}

/**
 * Helper function that validates the methodNames parameter.
 *
 * @param {string[]} [methodNames] Optional array of method names
 * @throws {Error}   If methodNames is provided, but is not an array
 */
function validateMethodNames(methodNames) {
  if (methodNames && !(methodNames instanceof Array)) {
    throw new Error('Optional methodNames should be an array if provided');
  }
}

function wrapFunctions(target, methodNames) {
  Object.getOwnPropertyNames(target).forEach(function(key) {
    if (methodNames) {
      if (methodNames.indexOf(key) === -1) return;
    } else if (!key.endsWith('Async')) {
      return;
    }

    if (typeof target[key] !== 'function') return;

    if (target[key].constructor.name === 'GeneratorFunction') {
      target[key] = Promise.coroutine(target[key]);
    } else {
      target[key] = Promise.method(target[key]);
    }
  });
}

module.exports = {
  wrap,
  wrapStaticMethods,
  wrapInstanceMethods
};
