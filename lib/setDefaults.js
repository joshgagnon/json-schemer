'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = setDefaults;

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _getDefaultValues = require('./getDefaultValues');

var _getDefaultValues2 = _interopRequireDefault(_getDefaultValues);

var _setKeys = require('./setKeys');

var _setKeys2 = _interopRequireDefault(_setKeys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setDefaults(templateSchema, context, values) {
    var arrayMerge = function arrayMerge(destinationArray, sourceArray, options) {
        return sourceArray;
    };

    var fields = (0, _deepmerge2.default)((0, _getDefaultValues2.default)(templateSchema, context), values, { arrayMerge: arrayMerge });
    return (0, _setKeys2.default)(fields);
}