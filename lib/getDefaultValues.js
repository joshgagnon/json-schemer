'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = getDefaultValues;

var _getKey = require('./getKey');

var _getKey2 = _interopRequireDefault(_getKey);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Appears to not be populating default on list items
function getDefaultValues(schema) {
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    function loop(props, fields) {
        Object.keys(props).map(function (key) {
            // debugger;
            // If item has a default source, set the default from the correct source
            if ((0, _utils.defaultSource)(props[key]) && context[(0, _utils.defaultSource)(props[key])]) {
                props[key].default = context[(0, _utils.defaultSource)(props[key])];
            }

            // Map string fields directly to values in context
            if ((0, _utils.mapTo)(props[key]) && context[(0, _utils.mapTo)(props[key])]) {
                props[key].default = context[(0, _utils.mapTo)(props[key])];
            }

            if (props[key].default) {
                fields[key] = props[key].default;
            }

            if (props[key].type === 'object') {
                var nextFields = fields[key] || {};
                fields[key] = loop(props[key].properties, nextFields);
            } else if (props[key].type === 'array' && props[key].items.type === "object") {
                var obj = fields[key] || [];

                loop(props[key].items.properties, obj);

                if (props[key].items.oneOf) {
                    obj.map(function (o) {
                        return props[key].items.oneOf.map(function (oneOf) {
                            loop(oneOf.properties, o);
                        });
                    });
                }

                fields[key] = obj;
            }

            if (props[key].oneOf) {
                (function () {
                    var obj = fields[key] || {};
                    props[key].oneOf.map(function (o) {
                        loop(o.properties, obj);
                    });
                    fields[key] = obj;
                })();
            }
        });
        return fields;
    }

    var fields = {};
    return loop(schema.properties, fields);
}