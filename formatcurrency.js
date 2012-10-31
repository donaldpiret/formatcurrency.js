/*!
 * formatcurrency.js v0.0.1
 * Copyright 2012, Donald Piret
 *
 * Freely distributable under the MIT license.
 * Portions of formatcurrency.js are inspired or borrowed from accounting.js
 *
 * Full details and documentation:
 * http://github.com/donaldpiret/formatcurrency.js/
 */

(function(root, undefined) {
  
  /* --- Setup --- */

  // Create the local library object, to be exported or referenced globally later
  var lib = {};

  // Current version
  lib.version = '0.0.1';
  
  
  /* --- Exposed settings --- */

  // The library's settings configuration object. Contains default parameters for
  // currency and number formatting as well as all localized formats for currencies
  lib.settings = {
    default_currency: 'usd',
    currencies: {
      usd: {
        format: "%u%n",
        unit: "$",
        separator: ".",
        delimiter: ",",
        precision: 2,
        significant: false,
        strip_insignificant_zeros: false
      }
    },
    default_number: 'en',
    numbers: {
      en: {
        precision : 0,
        grouping : 3,
        thousand : ",",
        decimal : "."
      }
    }
  };
  
  /* --- Internal Helper Methods --- */

  // Store reference to possibly-available ECMAScript 5 methods for later
  var nativeMap = Array.prototype.map,
    nativeIsArray = Array.isArray,
    toString = Object.prototype.toString;

  /**
   * Tests whether supplied parameter is a string
   * from underscore.js
   */
  function isString(obj) {
    return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
  }

  /**
   * Tests whether supplied parameter is a string
   * from underscore.js, delegates to ECMA5's native Array.isArray
   */
  function isArray(obj) {
    return nativeIsArray ? nativeIsArray(obj) : toString.call(obj) === '[object Array]';
  }

  /**
   * Tests whether supplied parameter is a true object
   */
  function isObject(obj) {
    return obj && toString.call(obj) === '[object Object]';
  }

  /**
   * Extends an object with a defaults object, similar to underscore's _.defaults
   *
   * Used for abstracting parameter handling from API methods
   */
  function defaults(object, defs) {
    var key;
    object = object || {};
    defs = defs || {};
    // Iterate over object non-prototype properties:
    for (key in defs) {
      if (defs.hasOwnProperty(key)) {
        // Replace values with defaults only if undefined (allow empty/zero values):
        if (object[key] == null) object[key] = defs[key];
      }
    }
    return object;
  }

  /**
   * Implementation of `Array.map()` for iteration loops
   *
   * Returns a new Array as a result of calling `iterator` on each array value.
   * Defers to native Array.map if available
   */
  function map(obj, iterator, context) {
    var results = [], i, j;

    if (!obj) return results;

    // Use native .map method if it exists:
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);

    // Fallback for native .map:
    for (i = 0, j = obj.length; i < j; i++ ) {
      results[i] = iterator.call(context, obj[i], i, obj);
    }
    return results;
  }
  
  
  
  /* --- API Methods --- */
  
  /**
    * Takes a string/array of strings, removes all formatting/cruft and returns the raw float value
    * alias: formatcurrency.`parse(string)`
    *
    * Decimal must be included in the regular expression to match floats (defaults to
    * formatcurrency.settings.number.decimal), so if the number uses a non-standard decimal 
    * separator, provide it as the second argument.
    *
    * Also matches bracketed negatives (eg. "$ (1.99)" => -1.99)
    *
    * Doesn't throw any errors (`NaN`s become 0) but this may change in future
    */
  var unformat = lib.unformat = lib.parse = function(value, decimal) {
    // Recursively unformat arrays:
    if (isArray(value)) {
      return map(value, function(val) {
        return unformat(val, decimal);
      });
    }

    // Fails silently (need decent errors):
    value = value || 0;

    // Return the value as-is if it's already a number:
    if (typeof value === "number") return value;

    // Default decimal point comes from settings, but could be set to eg. "," in opts:
    decimal = decimal || lib.settings.numbers[lib.settings.default_number].decimal;

    // Build regex to strip out everything except digits, decimal point and minus sign:
    var regex = new RegExp("[^0-9-" + decimal + "]", ["g"]),
      unformatted = parseFloat(
        ("" + value)
        .replace(/\((.*)\)/, "-$1") // replace bracketed values with negatives
        .replace(regex, '')         // strip out any cruft
        .replace(decimal, '.')      // make sure decimal point is standard
    );

    // This will fail silently which may cause trouble, let's wait and see:
    return !isNaN(unformatted) ? unformatted : 0;
  };
  
  
  /**
    * Formats a number into a currency
    *
    */
  var numberToCurrency = lib.numberToCurrency = function(number, options) {
    return number;
  };
  
  /* --- Module Definition --- */

  // Export formatcurrency for CommonJS. If being loaded as an AMD module, define it as such.
  // Otherwise, just add `formatcurrency` to the global object
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = lib;
    }
    exports.formatcurrency = lib;
  } else if (typeof define === 'function' && define.amd) {
    // Return the library as an AMD module:
    define([], function() {
      return lib;
    });
  } else {
    // Use formatcurrency.noConflict to restore `formatcurrency` back to its original value.
    // Returns a reference to the library's `formatcurrency` object;
    // e.g. `var numbers = formatcurrency.noConflict();`
    lib.noConflict = (function(oldFormatcurrency) {
      return function() {
        // Reset the value of the root's `formatcurrency` variable:
        root.formatcurrency = oldFormatcurrency;
        // Delete the noConflict method:
        lib.noConflict = undefined;
        // Return reference to the library to re-assign it:
        return lib;
      };
    })(root.formatcurrency);

    // Declare `formatcurrency` on the root (global/window) object:
    root['formatcurrency'] = lib;
  }

  // Root will be `window` in browser or `global` on the server:
}(this));