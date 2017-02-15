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
    var allFields = void 0;

    var Injector = function Injector(props) {
        allFields = props.fields;

        var fields = injectContext(props.schema.properties, props.fields, props.context);
        return _react2.default.createElement(FormComponent, _extends({}, props, { fields: fields }));
    };

    function getSourceValues(sourceLocation, context, fieldPath) {
        var splitPath = sourceLocation.split('../');

        // If the length of split path is more than one, the source location is relative
        if (splitPath.length > 1) {
            var levelsBack = splitPath.length - 1;
            var fieldSource = splitPath[splitPath.length - 1]; // Field source is the last item in split path
            var parentSource = fieldPath.splice(0, fieldPath.length - levelsBack);
            var sourcePath = parentSource.concat(fieldSource, 'value');

            return (0, _utils.getIn)(allFields, sourcePath);
        }

        return context[sourceLocation];
    }

    function interceptChangesAndInject(schemaProperties, field, context, fieldPath) {
        var sourceLocation = (0, _utils.getSourceLocation)(schemaProperties);

        if (sourceLocation && field) {
            // Get the source
            var sources = (0, _utils.inputSource)(schemaProperties);

            // Source will either be an array of objects with field and property, or a
            // string that is both the field and property. To make things simpler, if
            // the source is a string, convert it to the array of objects format
            if (!Array.isArray(sources)) {
                sources = [{
                    field: sources,
                    property: sources
                }];
            }

            sources.map(function (sourceItem) {
                var sourceValues = getSourceValues(sourceLocation, context, fieldPath);

                // Save the original onChange as _originalOnChange, so we can call it later.
                // Only do this is the original onChange isn't set (otherwise we'll be saving)
                // a non-original onChange
                if (field[sourceItem.field]._originalOnChange === undefined) {
                    field[sourceItem.field]._originalOnChange = field[sourceItem.field].onChange;
                }

                field[sourceItem.field].onChange = function (newValue) {
                    // We call the changed field's _originalOnChange with the newValue instead of
                    // the object that the 'newValue' maps to, because the newValue might not map
                    // to anything - causing the changed field onChange to not do anything
                    field[sourceItem.field]._originalOnChange(newValue);

                    if (sourceValues) {
                        (function () {
                            // Take the string the user selected and get the object in context it belongs to
                            var selectedObject = sourceValues.find(function (f) {
                                return f[sourceItem.property] === newValue;
                            });

                            // Call the original onChange() for all siblings, so they
                            // can all update with the change to their sibling
                            if (selectedObject) {
                                Object.keys(selectedObject).map(function (key) {
                                    if (key !== '_keyIndex' && key !== sourceItem.field && field[key]) {
                                        field[key]._originalOnChange(selectedObject[key]);
                                    }
                                });
                            }
                        })();
                    }
                };

                // If the source exists in context: add that item of context as the comboData.
                if (sourceValues) {
                    // if (field.name.name.startsWith('resolutionOptions.signatures[0].signatories')) debugger;
                    field[sourceItem.field].comboData = sourceValues.map(function (f) {
                        return f[sourceItem.property];
                    });
                }
            });
        }
    }

    function injectContext(schemaProperties, fields, context) {
        function loop(schemaProperties, fields, parentPath) {
            fields && Object.keys(schemaProperties).map(function (key) {
                var currentPath = parentPath.concat(key);

                if (schemaProperties[key].type === 'object') {
                    loop(schemaProperties[key].properties, fields[key], currentPath);
                    if (schemaProperties[key].oneOf) {
                        schemaProperties[key].oneOf.map(function (oneOf) {
                            loop(oneOf.properties, fields[key], currentPath);
                        });
                    }
                } else if (schemaProperties[key].type === 'array' && schemaProperties[key].items.type === "object") {
                    fields[key] && fields[key].map(function (f, index) {
                        loop(schemaProperties[key].items.properties, f, currentPath.concat(index));
                    });

                    fields[key] && fields[key].map(function (field, index) {
                        interceptChangesAndInject(schemaProperties[key].items, fields[key][index], context, currentPath.concat(index));
                    });

                    if (schemaProperties[key].items.oneOf) {
                        fields[key].map(function (f, index) {
                            var values = Object.keys(f).reduce(function (acc, k) {
                                acc[k] = f[k].value;return acc;
                            }, {});

                            var result = (0, _utils.oneOfMatchingSchema)(schemaProperties[key].items, values);

                            if (result) {
                                loop(result.properties, f, currentPath.concat(index));
                            }
                        });
                    }
                }

                interceptChangesAndInject(schemaProperties[key], fields[key], context, currentPath);
            });

            return fields;
        }

        return loop(schemaProperties, fields, []);
    }

    return Injector;
}