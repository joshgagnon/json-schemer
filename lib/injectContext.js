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

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function injectContext(FormComponent) {
    var Injector = function Injector(props) {
        var fields = injectContext(props.schema.properties, props.fields, props.context);
        return _react2.default.createElement(FormComponent, _extends({}, props, { fields: fields }));
    };

    function interceptChangesAndInject(schemaProperties, key, fields, context) {
        if ((0, _utils.inputSelectSource)(schemaProperties) && fields[key]) {
            (function () {
                var source = (0, _utils.inputSource)(schemaProperties);
                var onChange = fields[key][source].onChange;
                fields[key][source].onChange = function (event) {
                    onChange(event);

                    var _context$inputSelectS = context[(0, _utils.inputSelectSource)(schemaProperties)].find(function (f) {
                        return f[source] === event;
                    }),
                        _keyIndex = _context$inputSelectS._keyIndex,
                        result = _objectWithoutProperties(_context$inputSelectS, ['_keyIndex']);

                    result && Object.keys(result).map(function (k) {
                        if (k !== source && fields[key][k]) {
                            fields[key][k].onChange(result[k]);
                        }
                    });
                };
                if (context[(0, _utils.inputSelectSource)(schemaProperties)]) {
                    fields[key][source].comboData = context[(0, _utils.inputSelectSource)(schemaProperties)].map(function (f) {
                        return f[source];
                    });
                }
            })();
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