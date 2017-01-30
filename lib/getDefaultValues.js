'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = getDefaultValues;

var _getKey = require('./getKey');

var _getKey2 = _interopRequireDefault(_getKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Appears to not be populating default on list items
function getDefaultValues(schema) {
    var defaults = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    function loop(props, fields, suppliedDefaults) {
        Object.keys(props).map(function (key) {
            if (suppliedDefaults[key]) {
                fields[key] = suppliedDefaults[key];
            } else if (props[key].default) {
                fields[key] = props[key].default;
            }

            if (props[key].type === 'object') {
                var obj = fields[key] || {};
                loop(props[key].properties, obj, suppliedDefaults[key] || {});
                fields[key] = obj;
            } else if (props[key].type === 'array') {
                if (props[key].items.type === "object") {
                    var _obj = fields[key] || [];

                    loop(props[key].items.properties, _obj, _extends({}, suppliedDefaults[key] || {}, { _keyIndex: (0, _getKey2.default)() }));

                    if (props[key].items.oneOf) {
                        _obj.map(function (o) {
                            return props[key].items.oneOf.map(function (oneOf) {
                                loop(oneOf.properties, o, suppliedDefaults[key] || {});
                            });
                        });
                    }

                    fields[key] = _obj;
                }
            }

            if (props[key].oneOf) {
                (function () {
                    var obj = fields[key] || {};
                    props[key].oneOf.map(function (o) {
                        loop(o.properties, obj, suppliedDefaults[key] || {});
                    });
                    fields[key] = obj;
                })();
            }
        });
        return fields;
    }

    var fields = {};
    var val = loop(schema.properties, fields, defaults);
    debugger;
    return val;
}