'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = setKeys;

var _lodash = require('lodash.isplainobject');

var _lodash2 = _interopRequireDefault(_lodash);

var _getKey = require('./getKey');

var _getKey2 = _interopRequireDefault(_getKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setKeys(fields) {
    var recurse = function recurse(fields, arrayChild) {
        if (Array.isArray(fields)) {
            fields.map(function (fields) {
                return recurse(fields, true);
            });
        } else if ((0, _lodash2.default)(fields)) {
            if (arrayChild) {
                fields._keyIndex = (0, _getKey2.default)();
            }
            Object.keys(fields).map(function (k) {
                return recurse(fields[k]);
            });
        }

        return fields;
    };

    return recurse(fields);
}