/**
 * @module deprecate
 */

/**
 * Prints out a deprecation warning to the console.warn with the format:
 * `name` is deprecated, use `alternative` instead.
 * It can also print out a stack trace with the line numbers.
 * @param {String} name - Name of the thing that is deprecated.
 * @param {String} alternative - Name of alternative that should be used instead.
 * @param {Number} [stackTraceLimit] - depth of the stack trace to print out. Set to falsy value to disable stack.
 */
exports.deprecationWarning = function deprecationWarning(name, alternative, stackTraceLimit) {
    if (stackTraceLimit) {
        var depth = Error.stackTraceLimit;
        Error.stackTraceLimit = stackTraceLimit;
    }
    if (typeof console !== "undefined" && typeof console.warn === "function") {
        var stack = (stackTraceLimit ? new Error("").stack : "") ;
        if(alternative) {
            console.warn(name + " is deprecated, use " + alternative + " instead.", stack);
        } else {
            //name is a complete message
            console.warn(name, stack);
        }
    }
    if (stackTraceLimit) {
        Error.stackTraceLimit = depth;
    }
}

/**
 * Provides a function that can replace a method that has been deprecated.
 * Prints out a deprecation warning to the console.warn with the format:
 * `name` is deprecated, use `alternative` instead.
 * It will also print out a stack trace with the line numbers.
 * @param {Object} scope - The object that will be used as the `this` when the `deprecatedFunction` is applied.
 * @param {Function} deprecatedFunction - The function object that is deprecated.
 * @param {String} name - Name of the method that is deprecated.
 * @param {String} alternative - Name of alternative method that should be used instead.
 * @returns {Function} deprecationWrapper
 */
exports.deprecateMethod = function deprecate(scope, deprecatedFunction, name, alternative) {
    var deprecationWrapper = function () {
        // stackTraceLimit = 3 // deprecationWarning + deprecate + caller of the deprecated method
        deprecationWarning(name, alternative, 3);
        return deprecatedFunction.apply(scope ? scope : this, arguments);
    };
    deprecationWrapper.deprecatedFunction = deprecatedFunction;
    return deprecationWrapper;
}
