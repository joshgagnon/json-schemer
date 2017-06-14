'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = resolveReferences;

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resolveReferences(rootSchema) {
    var deepFind = function deepFind(schema, keys) {
        if (keys.length == 0) {
            throw new Exception('At least one key must be passed for deepFind()');
        }

        if (keys.length == 1) {
            return schema[keys[0]];
        }

        return deepFind(schema[keys[0]], keys.splice(1));
    };

    var resolveChildReferences = function resolveChildReferences(item) {
        // If this item is has a ref property: replace it with the reference it is pointing to
        if ((0, _isPlainObject2.default)(item) && item['$ref']) {
            var definitionKeys = item['$ref'].split('/');

            // # = root schema
            if (definitionKeys[0] === '#') {
                // Find the replacement value for the reference
                var refReplacement = deepFind(rootSchema, definitionKeys.splice(1));
                console.log(definitionKeys, refReplacement);

                // Apply overrides
                if ((0, _isPlainObject2.default)(refReplacement)) {
                    var itemWithoutRef = item;
                    delete itemWithoutRef['$ref'];

                    refReplacement = (0, _deepmerge2.default)(refReplacement, itemWithoutRef);
                }

                // Return fully resolved object
                return resolveChildReferences(refReplacement);
            } else {
                throw new Exception("Non-absolute references are not currently supported");
            }
        }

        // If this item is an array: loop it's values and recurse on them
        if (Array.isArray(item)) {
            item.map(function (innerItem, i) {
                item[i] = resolveChildReferences(innerItem);
            });
        }

        // If this item is a object: loop it's keys and recurse on them
        if ((0, _isPlainObject2.default)(item)) {
            Object.keys(item).map(function (key) {
                if ((0, _isPlainObject2.default)(item)) {
                    item[key] = resolveChildReferences(item[key]);
                }
            });
        }

        // Return the processed item
        return item;
    };

    return resolveChildReferences(rootSchema, []);
}