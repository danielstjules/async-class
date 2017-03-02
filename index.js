'use strict';
let Promise = require('bluebird');

/**
 * Wraps static and instance methods whose name ends with Async, or are
 * GeneratorFunctions. Any GeneratorFunction is wrapped with
 * bluebird.coroutine(), and others with bluebird.method(). Accepts an optional
 * array of method names, wrapping only those found in the array, and disabling
 * the Async suffix check. Returns the class.
 *
 * @param   {function} klass         The class to wrap
 * @param   {string[]} [methodNames] Optional array of method names
 * @param   {Object}   [options]     Optional options
 * @returns {function} The supplied class
 * @throws  {Error}    If methodNames is provided, but is not an array
 */
function wrap(klass, methodNames, options) {
  options = _conformOptions(methodNames, options);
  wrapStaticMethods(klass, options);
  wrapInstanceMethods(klass, options);
  return klass;
}

/**
 * Wraps static methods whose name ends with Async or are GeneratorFunctions.
 * Any GeneratorFunction is wrapped with bluebird.coroutine(), and others with
 * bluebird.method(). Accepts an optional array of method names, wrapping only
 * those found in the array, and disabling the Async suffix check. Returns the
 * class.
 *
 * @param   {function} klass         The class to wrap
 * @param   {string[]} [methodNames] Optional array of method names
 * @param   {Object}   [options]     Optional options
 * @returns {function} The supplied class
 * @throws  {Error}    If methodNames is provided, but is not an array
 */
function wrapStaticMethods(klass, methodNames, options) {
  options = _conformOptions(methodNames, options);
  _wrapFunctions(klass, options);
  return klass;
}

/**
 * Wraps instance methods whose name ends with Async, or are GeneratorFunctions.
 * Any GeneratorFunction is wrapped with bluebird.coroutine(), and others with
 * bluebird.method(). Accepts an optional array of method names, wrapping only
 * those found in the array, and disabling the Async suffix check. Returns the
 * class.
 *
 * @param   {function} klass         The class to wrap
 * @param   {string[]} [methodNames] Optional array of method names
 * @param   {Object}   [options]     Optional options
 * @returns {function} The supplied class
 * @throws  {Error}    If methodNames is provided, but is not an array
 */
function wrapInstanceMethods(klass, methodNames, options) {
  options = _conformOptions(methodNames, options);
  _wrapFunctions(klass.prototype, methodNames);
  return klass;
}

/**
 * Helper function that conforms input arguments to a single options object.
 *
 * @param   {string[]} [methodNames] Optional array of method names
 * @param   {Object}   [options]     Optional options
 * @returns {Object}   options       Options object
 * @throws  {Error}    If methodNames is provided, but is not an array,
 *                     or options is provided, but is not an object,
 *                     or wrapper is provided, but is not a function,
 *                     or asyncWrapper is provided, but is not a function
 */
function _conformOptions(methodNames, options) {
  if (!options && methodNames && !(methodNames instanceof Array)) {
    options = methodNames;
    methodNames = null;
  }

  if (!options) options = {};
  if (typeof options !== 'object' || options instanceof Array) {
    throw new Error('Options should be an object');
  }

  options = _clone(options);

  if (methodNames) {
    options.methodNames = methodNames;
    if (!(methodNames instanceof Array)) {
      throw new Error('Optional methodNames should be an array');
    }
  }

  if (!options.wrapper) options.wrapper = Promise.coroutine;
  if (options.wrapper && typeof options.wrapper !== 'function') {
    throw new Error('Optional wrapper should be a function');
  }

  if (!options.asyncWrapper) options.asyncWrapper = Promise.method;
  if (options.asyncWrapper && typeof options.asyncWrapper !== 'function') {
    throw new Error('Optional asyncWrapper should be a function');
  }

  return options;
}

/**
 * Helper function that performs a shallow clone of an object.
 *
 * @param   {Object} options Options object
 * @returns {Object} Shallow clone of options object
 */
function _clone(obj) {
  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }

  return res;
}

/**
 * Wrap methods on `target` object, according to provided `options`.
 *
 * @param {Object} target Target object
 * @param {Object} options Options object
 * @returns {undefined}
 */
function _wrapFunctions(target, options, isStatic) {
  _actualMethodKeys(target).forEach(function(key) {
    let isGeneratorFn = (target[key].constructor.name === 'GeneratorFunction');

    if (options.methodNames) {
      if (options.methodNames.indexOf(key) === -1) return;
    } else if (!key.endsWith('Async') || !(target[key] instanceof Function)) {
      return;
    }

    if (isGeneratorFn) {
      if (options.wrapper) target[key] = options.wrapper(target[key]);
    } else {
      if (options.asyncWrapper) target[key] = options.asyncWrapper(target[key]);
    }
  });
}

function _actualMethodKeys(target) {
  return Object.getOwnPropertyNames(target)
    .filter(key => {
      var propertyDescriptor = Object.getOwnPropertyDescriptor(target, key);
      return !propertyDescriptor.get && !propertyDescriptor.set;
    })
    .filter(key => typeof target[key] === 'function');
}

module.exports = {
  wrap,
  wrapStaticMethods,
  wrapInstanceMethods
};
