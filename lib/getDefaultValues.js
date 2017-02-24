'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = getDefaultValues;

var _getKey = require('./getKey');

var _getKey2 = _interopRequireDefault(_getKey);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function inferDefault(prop, context) {
    // If item has a default source, set the default from the correct source
    if ((0, _utils.defaultSource)(prop) && context[(0, _utils.defaultSource)(prop)]) {
        // debugger;
        return context[(0, _utils.defaultSource)(prop)];
    }

    // Map string fields directly to values in context
    if ((0, _utils.mapTo)(prop) && context[(0, _utils.mapTo)(prop)]) {
        return context[(0, _utils.mapTo)(prop)];
    }

    // Conditional map to
    if ((0, _utils.conditionalDefault)(prop) && typeof context[(0, _utils.conditionalDefault)(prop).conditional] === 'boolean') {
        if (context[(0, _utils.conditionalDefault)(prop).conditional]) {
            return (0, _utils.conditionalDefault)(prop).trueValue;
        } else {
            return (0, _utils.conditionalDefault)(prop).falseValue;
        }
    }

    return false;
}

// Appears to not be populating default on list items
function getDefaultValues(schema) {
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    function loop(props, fields) {
        Object.keys(props).map(function (key) {
            // Check we need to infer some king of default, then set it
            var defaultValue = inferDefault(props[key], context);

            if (defaultValue) {
                // If both default value and the definitions default are arrays, merge each object in the array
                // THis means we can set defaults in the definitions for properties that don't exist in the default source
                if (props[key].default) {
                    if (Array.isArray(defaultValue) && props[key].default.length === 1) {
                        defaultValue = defaultValue.map(function (value) {
                            return _extends({}, props[key].default[0], value);
                        });
                    }
                }

                props[key].default = defaultValue;
            }

            // If this property has a default (inferred above or defined in schema), set it in the fields here
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