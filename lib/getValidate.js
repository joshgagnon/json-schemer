'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = getValidate;

var _utils = require('./utils');

function getValidate(schema) {
    return function (values) {
        var globalErrors = [];
        function loop(props, values, required) {
            return Object.keys(props).reduce(function (acc, key) {
                if (props[key].type === 'object') {
                    var matching = (0, _utils.oneOfMatchingSchema)(props[key], values[key]);
                    var _required = props[key].required || [];
                    var properties = props[key].properties;
                    if (matching && matching.required) {
                        _required = _required.concat(matching.required);
                    }
                    if (matching && matching.properties) {
                        properties = _extends({}, properties, matching.properties);
                    }
                    acc[key] = loop(properties, values[key], _required);
                }
                if (props[key].type === 'array') {
                    acc[key] = values[key].map(function (v) {
                        var required = props[key].items.required || [];
                        var matching = (0, _utils.oneOfMatchingSchema)(props[key].items, v);
                        var properties = props[key].items.properties;
                        if (matching && matching.required) {
                            required = required.concat(matching.required);
                        }
                        if (matching && matching.properties) {
                            properties = _extends({}, properties, matching.properties);
                        }
                        return loop(properties, v, required);
                    });
                    if (props[key].minItems && (!values[key] || values[key].length < props[key].minItems)) {
                        globalErrors.push(['At least ' + props[key].minItems + ' \'' + (props[key].title || props[key].validationTitle) + '\' required.']);
                    }
                }
                if (required.indexOf(key) >= 0 && (!values || values[key] === undefined || values[key] === null || values[key] === '')) {
                    acc[key] = ['Required.'];
                }
                return acc;
            }, {});
        }
        var errors = loop(schema.properties, values, schema.required || []);
        if (globalErrors.length) {
            errors._error = globalErrors;
        }
        return errors;
    };
}