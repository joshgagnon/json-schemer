"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.formatString = formatString;
exports.getIn = getIn;
exports.oneOfMatchingSchema = oneOfMatchingSchema;
exports.getSubSchema = getSubSchema;
exports.getFieldsFromErrors = getFieldsFromErrors;
var oneOfField = function oneOfField(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "selector"]);
};

var componentType = exports.componentType = function componentType(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "inputComponent"]);
};
var addItem = exports.addItem = function addItem(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "addItem"]) || 'Add Item';
};
var controlStyle = exports.controlStyle = function controlStyle(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "controls"]);
};
var getSourceLocation = exports.getSourceLocation = function getSourceLocation(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "sourceLocation"]);
};
var defaultSource = exports.defaultSource = function defaultSource(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "defaultSource"]);
};
var inputSource = exports.inputSource = function inputSource(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "source"]);
};
var mapTo = exports.mapTo = function mapTo(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "mapTo"]);
};
var conditionalDefault = exports.conditionalDefault = function conditionalDefault(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "conditionalDefault"]);
};
var fieldDisplayLevel = exports.fieldDisplayLevel = function fieldDisplayLevel(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "display"]);
};
function formatString(formatted) {
    for (var i = 1; i < arguments.length; i++) {
        var regexp = new RegExp('\\{' + (i - 1) + '\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};
function getIn(obj, fields) {
    return fields.reduce(function (obj, f) {
        return obj ? obj[f] : null;
    }, obj);
}

function oneOfMatchingSchema(fieldProps, values) {
    var field = oneOfField(fieldProps);
    if (!field || !fieldProps.oneOf) {
        return false;
    }
    return fieldProps.oneOf.filter(function (f) {
        return f.properties[field].enum[0] === values[field];
    })[0];
}

function getSubSchema(schema, stepIndex) {
    var fields = schema.wizard.steps[stepIndex].items;
    var properties = Object.keys(schema.properties).reduce(function (acc, key) {
        if (fields.indexOf(key) >= 0) {
            acc[key] = schema.properties[key];
        }
        return acc;
    }, {});
    return _extends({}, schema, { properties: properties });
}

function getFieldsFromErrors(errors) {
    var fields = [];
    (function loop(path, errors) {
        if (!errors) {
            return;
        } else if (Array.isArray(errors)) {
            return errors.map(function (key, index) {
                fields.push(path + "[" + index + "]");
                loop(path + "[" + index + "]", errors[index]);
            }, {});
        } else {
            return Object.keys(errors).map(function (key) {
                var newPath = path ? path + "." + key : key;
                fields.push(newPath);
                loop(newPath, errors[key]);
            }, {});
        }
    })('', errors);
    return fields;
}