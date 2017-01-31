'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resolveReferences = exports.injectContext = exports.getValidate = exports.getKey = exports.getFields = exports.getDefaultValues = undefined;

var _utils = require('./utils');

Object.keys(_utils).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function get() {
            return _utils[key];
        }
    });
});
exports.setDefaults = setDefaults;

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _getKey2 = require('./getKey');

var _getKey3 = _interopRequireDefault(_getKey2);

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _getDefaultValues2 = require('./getDefaultValues');

var _getDefaultValues3 = _interopRequireDefault(_getDefaultValues2);

var _getFields2 = require('./getFields');

var _getFields3 = _interopRequireDefault(_getFields2);

var _getValidate2 = require('./getValidate');

var _getValidate3 = _interopRequireDefault(_getValidate2);

var _injectContext2 = require('./injectContext');

var _injectContext3 = _interopRequireDefault(_injectContext2);

var _resolveReferences2 = require('./resolveReferences');

var _resolveReferences3 = _interopRequireDefault(_resolveReferences2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.getDefaultValues = _getDefaultValues3.default;
exports.getFields = _getFields3.default;
exports.getKey = _getKey3.default;
exports.getValidate = _getValidate3.default;
exports.injectContext = _injectContext3.default;
exports.resolveReferences = _resolveReferences3.default;


var arrayMerge = function arrayMerge(destinationArray, sourceArray, options) {
    return sourceArray;
};

function setDefaults(templateSchema, context, values) {
    var merged = (0, _deepmerge2.default)((0, _getDefaultValues3.default)(templateSchema, context), values, { arrayMerge: arrayMerge });
    return addKeys(merged);
}

function addKeys(obj) {
    var recurse = function recurse(obj, arrayChild) {
        if (Array.isArray(obj)) {
            obj.map(function (obj) {
                return recurse(obj, true);
            });
        } else if ((0, _isPlainObject2.default)(obj)) {
            if (arrayChild) {
                obj._keyIndex = (0, _getKey3.default)();
            }
            Object.keys(obj).map(function (k) {
                return recurse(obj[k]);
            });
        }
        return obj;
    };
    return recurse(obj);
}