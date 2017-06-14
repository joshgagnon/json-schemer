import React from 'react';
import { getSourceLocation, inputSource, oneOfMatchingSchema, getIn }  from './utils';

export default function injectContext(FormComponent) {
    let allFields;

    const Injector = (props) => {
        allFields = props.fields;

        const fields = injectContext(props.schema.properties, props.fields, props.context);
        return <FormComponent {...props} fields={fields} />;
    };

    function getSourceValues(sourceLocation, context, fieldPath) {
        const splitPath = sourceLocation.split('../');

        // If the length of split path is more than one, the source location is relative
        if (splitPath.length > 1) {
            const levelsBack = splitPath.length - 1;
            const fieldSource = splitPath[splitPath.length -1]; // Field source is the last item in split path
            const parentSource = fieldPath.splice(0, fieldPath.length - levelsBack);
            const sourcePath = parentSource.concat(fieldSource, 'value');

            return getIn(allFields, sourcePath);
        }

        return context[sourceLocation];
    }

    function interceptChangesAndInject(schemaProperties, field, context, fieldPath) {
        const sourceLocation = getSourceLocation(schemaProperties);
        if (sourceLocation && field) {
            // Get the source
            let sources = inputSource(schemaProperties);

            // Source will either be an array of objects with field and property, or a
            // string that is both the field and property. To make things simpler, if
            // the source is a string, convert it to the array of objects format
            if (!Array.isArray(sources)) {
                sources = [{
                    field: sources,
                    property: sources
                }];
            }
            sources.map((sourceItem) => {
                const sourceValues = getSourceValues(sourceLocation, context, fieldPath);
                // Save the original onChange as _originalOnChange, so we can call it later.
                // Only do this is the original onChange isn't set (otherwise we'll be saving)
                // a non-original onChange
                if (field[sourceItem.field]._originalOnChange === undefined) {
                    field[sourceItem.field]._originalOnChange = field[sourceItem.field].onChange;
                }

                field[sourceItem.field].onChange = (newValue) => {
                    // We call the changed field's _originalOnChange with the newValue instead of
                    // the object that the 'newValue' maps to, because the newValue might not map
                    // to anything - causing the changed field onChange to not do anything
                    field[sourceItem.field]._originalOnChange(newValue);

                    if (sourceValues) {
                        // Take the string the user selected and get the object in context it belongs to
                        const selectedObject = sourceValues.find(f => f[sourceItem.property] === newValue);

                        // Call the original onChange() for all siblings, so they
                        // can all update with the change to their sibling
                        if (selectedObject) {
                            Object.keys(selectedObject).map(key => {
                                if (key !== '_keyIndex' && key !== sourceItem.field && field[key]) {
                                    if (field[key]._originalOnChange === undefined) {
                                        field[key]._originalOnChange = field[key].onChange;
                                    }

                                    field[key]._originalOnChange(selectedObject[key]);
                                }
                            });
                        }
                    }
                };

                // If the source exists in context: add that item of context as the comboData.
                if (sourceValues) {
                    field[sourceItem.field].comboData = sourceValues.map(f => f[sourceItem.property]);
                }
            });
        }
    }

    function injectContext(schemaProperties, fields, context) {
        function loop(schemaProperties, fields, parentPath) {
            fields && Object.keys(schemaProperties).map(key => {
                const currentPath = parentPath.concat(key);

                if (schemaProperties[key].type === 'object') {
                    loop(schemaProperties[key].properties, fields[key], currentPath);
                    if (schemaProperties[key].oneOf) {
                        schemaProperties[key].oneOf.map((oneOf) => {
                            loop(oneOf.properties, fields[key], currentPath);
                        });
                    }
                }
                else if (schemaProperties[key].type === 'array' && schemaProperties[key].items.type === "object") {
                    fields[key] && fields[key].map((f, index) => {
                        loop(schemaProperties[key].items.properties, f, currentPath.concat(index));
                    });

                    fields[key] && fields[key].map((field, index) => {
                        interceptChangesAndInject(schemaProperties[key].items, fields[key][index], context, currentPath.concat(index));
                    });

                    if (schemaProperties[key].items.oneOf) {
                        fields[key].map((f, index) => {
                            let values = Object.keys(f).reduce((acc, k) => {
                                acc[k] = f[k].value; return acc;
                            }, {});

                            let result = oneOfMatchingSchema(schemaProperties[key].items, values);

                            if (result) {
                                loop(result.properties, f, currentPath.concat(index));
                            }
                        });
                    }
                }

                interceptChangesAndInject(schemaProperties[key], fields[key], context, currentPath)
            });

            return fields;
        }

        return loop(schemaProperties, fields, []);
    }

    return Injector;
}
