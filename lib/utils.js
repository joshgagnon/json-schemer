"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.componentType = componentType;
exports.addItem = addItem;
exports.inputSelectSource = inputSelectSource;
exports.defaultSource = defaultSource;
exports.inputSource = inputSource;
exports.oneOfMatchingSchema = oneOfMatchingSchema;
function getIn(obj, fields) {
    return fields.reduce(function (obj, f) {
        return obj ? obj[f] : null;
    }, obj);
}

function oneOfField(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "selector"]);
}

function componentType(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "inputComponent"]);
}

function addItem(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "addItem"]) || 'Add Item';
}

function inputSelectSource(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "selectFromSource"]);
}

function defaultSource(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "defaultSource"]);
}

function inputSource(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "source"]);
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