'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = injectContext;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function injectContext(FormComponent) {
    var Injector = function Injector(props) {
        var fields = injectContext(props.schema.properties, props.fields, props.context);
        return _react2.default.createElement(FormComponent, _extends({}, props, { fields: fields }));
    };

    function interceptChangesAndInject(schemaProperties, key, fields, context) {
        if ((0, _utils.inputSelectSource)(schemaProperties) && fields[key]) {
            // Get the source
            var source = (0, _utils.inputSource)(schemaProperties);

            // Source will either be an array of objects with field and property, or a
            // string that is both the field and property. To make things simpler, if
            // the source is a string, convert it to the array of objects format
            if (!Array.isArray(source)) {
                source = [{
                    field: source,
                    property: source
                }];
            }

            source.map(function (sourceItem) {
                // Save the original onChange as _originalOnChange, so we can call it later.
                // Only do this is the original onChange isn't set (otherwise we'll be saving)
                // a non-original onChange
                if (fields[key][sourceItem.field]._originalOnChange === undefined) {
                    fields[key][sourceItem.field]._originalOnChange = fields[key][sourceItem.field].onChange;
                }

                fields[key][sourceItem.field].onChange = function (newValue) {
                    // Take the string the user selected and get the object in context it belongs to
                    var selectedObject = context[(0, _utils.inputSelectSource)(schemaProperties)].find(function (f) {
                        return f[sourceItem.property] === newValue;
                    });

                    if (selectedObject) {
                        Object.keys(selectedObject).map(function (selectedObjectKey) {
                            if (selectedObjectKey !== '_keyIndex' && fields[key][selectedObjectKey]) {
                                fields[key][selectedObjectKey]._originalOnChange(selectedObject[selectedObjectKey]);
                            }
                        });
                    }
                };

                // If the source exists in context: add that item of context as the comboData.
                if (context[(0, _utils.inputSelectSource)(schemaProperties)]) {
                    fields[key][sourceItem.field].comboData = context[(0, _utils.inputSelectSource)(schemaProperties)].map(function (f) {
                        return f[sourceItem.property];
                    });
                }
            });
        }
    }

    function injectContext(schemaProperties, fields, context) {
        function loop(schemaProperties, fields) {
            fields && Object.keys(schemaProperties).map(function (key) {
                if (schemaProperties[key].type === 'object') {
                    loop(schemaProperties[key].properties, fields[key]);
                    if (schemaProperties[key].oneOf) {
                        schemaProperties[key].oneOf.map(function (oneOf) {
                            loop(oneOf.properties, fields[key]);
                        });
                    }
                } else if (schemaProperties[key].type === 'array') {
                    if (schemaProperties[key].items.type === "object") {
                        fields[key] && fields[key].map(function (f) {
                            loop(schemaProperties[key].items.properties, f);
                        });

                        fields[key] && fields[key].map(function (field, index) {
                            interceptChangesAndInject(schemaProperties[key].items, index, fields[key], context);
                        });

                        if (schemaProperties[key].items.oneOf) {
                            fields[key].map(function (f) {
                                var values = Object.keys(f).reduce(function (acc, k) {
                                    acc[k] = f[k].value;return acc;
                                }, {});

                                var result = (0, _utils.oneOfMatchingSchema)(schemaProperties[key].items, values);

                                if (result) {
                                    loop(result.properties, f);
                                }
                            });
                        }
                    }
                }

                interceptChangesAndInject(schemaProperties[key], key, fields, context);
            });

            return fields;
        }

        return loop(schemaProperties, fields);
    }

    return Injector;
}