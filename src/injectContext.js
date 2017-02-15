import React from 'react';
import { inputSelectSource, inputSource, oneOfMatchingSchema }  from './utils';

export default function injectContext(FormComponent) {
    const Injector = (props) => {
        const fields = injectContext(props.schema.properties, props.fields, props.context);
        return <FormComponent {...props} fields={fields} />;
    };

    function interceptChangesAndInject(schemaProperties, key, fields, context) {
        if (inputSelectSource(schemaProperties) && fields[key]) {
            // Get the source
            let source = inputSource(schemaProperties);

            // Source will either be an array of objects with field and property, or a
            // string that is both the field and property. To make things simpler, if
            // the source is a string, convert it to the array of objects format
            if (!Array.isArray(source)) {
                source = [{
                    field: source,
                    property: source
                }];
            }

            source.map((sourceItem) => {
                // Save the original onChange as _originalOnChange, so we can call it later.
                // Only do this is the original onChange isn't set (otherwise we'll be saving)
                // a non-original onChange
                if (fields[key][sourceItem.field]._originalOnChange === undefined) {
                    fields[key][sourceItem.field]._originalOnChange = fields[key][sourceItem.field].onChange;
                }

                fields[key][sourceItem.field].onChange = (newValue) => {
                    // Take the string the user selected and get the object in context it belongs to
                    const selectedObject = context[inputSelectSource(schemaProperties)].find(f => f[sourceItem.property] === newValue);

                    if (selectedObject) {
                        Object.keys(selectedObject).map(selectedObjectKey => {
                            if (selectedObjectKey !== '_keyIndex' && fields[key][selectedObjectKey]) {
                                fields[key][selectedObjectKey]._originalOnChange(selectedObject[selectedObjectKey]);
                            }
                        });
                    }
                };

                // If the source exists in context: add that item of context as the comboData.
                if (context[inputSelectSource(schemaProperties)]) {
                    fields[key][sourceItem.field].comboData = context[inputSelectSource(schemaProperties)].map(f => f[sourceItem.property]);
                }
            });
        }
    }

    function injectContext(schemaProperties, fields, context) {
        function loop(schemaProperties, fields) {
            fields && Object.keys(schemaProperties).map(key => {
                if (schemaProperties[key].type === 'object') {
                    loop(schemaProperties[key].properties, fields[key]);
                    if (schemaProperties[key].oneOf) {
                        schemaProperties[key].oneOf.map(oneOf => {
                            loop(oneOf.properties, fields[key]);
                        });
                    }
                }
                else if (schemaProperties[key].type === 'array') {
                    if (schemaProperties[key].items.type === "object") {
                        fields[key] && fields[key].map(f => {
                            loop(schemaProperties[key].items.properties, f);
                        });

                        fields[key] && fields[key].map((field, index) => {
                            interceptChangesAndInject(schemaProperties[key].items,  index, fields[key], context);
                        });

                        if(schemaProperties[key].items.oneOf) {
                            fields[key].map(f => {
                                let values = Object.keys(f).reduce((acc, k) => {
                                    acc[k] = f[k].value; return acc;
                                }, {});

                                let result = oneOfMatchingSchema(schemaProperties[key].items, values);

                                if (result) {
                                     loop(result.properties, f);
                                }
                            });
                        }
                    }
                }

                interceptChangesAndInject(schemaProperties[key], key, fields, context)
            });

            return fields;
        }

        return loop(schemaProperties, fields);
    }

    return Injector;
}
