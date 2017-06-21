'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = mergeSchemas;

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cloneDeep = require('lodash.clonedeep');

function mergeSchemas() {
    for (var _len = arguments.length, schemas = Array(_len), _key = 0; _key < _len; _key++) {
        schemas[_key] = arguments[_key];
    }

    schemas = schemas.map(function (schema) {
        return cloneDeep(schema);
    });

    if (schemas.length === 1) {
        return schemas[0];
    }

    return _deepmerge2.default.all(schemas);
}