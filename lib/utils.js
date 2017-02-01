"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.oneOfMatchingSchema = oneOfMatchingSchema;
function getIn(obj, fields) {
    return fields.reduce(function (obj, f) {
        return obj ? obj[f] : null;
    }, obj);
}

var oneOfField = function oneOfField(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "selector"]);
};

var componentType = exports.componentType = function componentType(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "inputComponent"]);
};
var addItem = exports.addItem = function addItem(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "addItem"]) || 'Add Item';
};
var inputSelectSource = exports.inputSelectSource = function inputSelectSource(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "selectFromSource"]);
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

function oneOfMatchingSchema(fieldProps, values) {
    var field = oneOfField(fieldProps);
    if (!field || !fieldProps.oneOf) {
        return false;
    }
    return fieldProps.oneOf.filter(function (f) {
        return f.properties[field].enum[0] === values[field];
    })[0];
}