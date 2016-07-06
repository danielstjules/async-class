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
  options = conformOptions(methodNames, options);
  _wrapStaticMethods(klass, options);
  _wrapInstanceMethods(klass, options);
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
  options = conformOptions(methodNames, options);
  _wrapStaticMethods(klass, options);
  return klass;
}

function _wrapStaticMethods(klass, options) {
  wrapFunctions(klass, options, true);
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
  options = conformOptions(methodNames, options);
  _wrapInstanceMethods(klass, options);
  return klass;
}

function _wrapInstanceMethods(klass, options) {
  wrapFunctions(klass.prototype, options, false);
}

/**
 * Helper function that conforms input arguments to a single options object.
 *
 * @param   {string[]} [methodNames] Optional array of method names
 * @param   {Object}   [options] Optional options
 * @returns {Object}   options Options object
 * @throws  {Error}    If methodNames is provided, but is not an array,
 *                     or options is provided, but is not an object,
 *                     or wrapper is provided, but is not a function,
 *                     or asyncWrapper is provided, but is not a function
 */
function conformOptions(methodNames, options) {
  if (!options && methodNames && !(methodNames instanceof Array)) {
    options = methodNames;
    methodNames = undefined;
  }

  if (!options) options = {};
  if (typeof options != 'object' || options instanceof Array || options instanceof Date) throw new Error('Optional options should be an object if provided');
  options = cloneOptions(options);

  if (methodNames) options.methodNames = methodNames;
  if (options.methodNames && !(options.methodNames instanceof Array)) throw new Error('Optional methodNames should be an array if provided');

  if (options.wrapper === undefined) options.wrapper = Promise.coroutine;
  if (options.wrapper && typeof options.wrapper != 'function') throw new Error('Optional wrapper should be a function if provided');

  if (options.asyncWrapper === undefined) options.asyncWrapper = Promise.method;
  if (options.asyncWrapper && typeof options.asyncWrapper != 'function') throw new Error('Optional asyncWrapper should be a function if provided');

  if (options.asyncWrapCondition === undefined) options.asyncWrapCondition = asyncWrapCondition;
  if (options.asyncWrapCondition && typeof options.asyncWrapCondition != 'function') throw new Error('Optional asyncWrapCondition should be a function if provided');

  return options;
}

/**
 * Helper function that clones options object.
 *
 * @param   {Object} options Options object
 * @returns {Object} Shallow clone of options object
 */
function cloneOptions(options) {
  var out = {};
  for (var key in options) {
    out[key] = options[key];
  }
  return out;
}

/**
 * Default asyncWrapCondition function.
 * Returns `true` if method should be wrapped, `false` if not.
 *
 * @param {string} key Method name
 * @returns {boolean}
 */
function asyncWrapCondition(key) {
    return key.endsWith('Async');
}

function wrapFunctions(target, options, isStatic) {
  _actualMethodKeys(target).forEach(function(key) {
    let isGeneratorFunction = (target[key].constructor.name === 'GeneratorFunction');

    if (options.methodNames) {
      if (options.methodNames.indexOf(key) === -1) return;
    } else if (!isGeneratorFunction && options.asyncWrapCondition && !options.asyncWrapCondition(key, target, isStatic)) {
      return;
    }

    if (isGeneratorFunction) {
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
