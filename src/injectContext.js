import React from 'react';
import { inputSelectSource, inputSource, oneOfMatchingSchema }  from './utils';

export default function injectContext(FormComponent) {
    const Injector = (props) => {
        const fields = injectContext(props.schema.properties, props.fields, props.context);
        return <FormComponent {...props} fields={fields} />;
    }

    function interceptChangesAndInject(schemaProperties, key, fields, context){
        if (inputSelectSource(schemaProperties) && fields[key]) {
            const source = inputSource(schemaProperties);
            const onChange = fields[key][source].onChange;
            fields[key][source].onChange = (event) => {
                onChange(event);
                const { _keyIndex, ...result } = context[inputSelectSource(schemaProperties)].find(f => f[source] === event);
                result && Object.keys(result).map(k => {
                    if(k !== source && fields[key][k]){
                        fields[key][k].onChange(result[k]);
                    }
                });
            }
            if(context[inputSelectSource(schemaProperties)]){
                fields[key][source].comboData = context[inputSelectSource(schemaProperties)].map(f => f[source]);
            }
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
                } else if (schemaProperties[key].type === 'array') {
                    if (schemaProperties[key].items.type === "object") {
                        fields[key] && fields[key].map(f => {
                            loop(schemaProperties[key].items.properties, f);
                        })
                        fields[key] && fields[key].map((field, index) => {
                            interceptChangesAndInject(schemaProperties[key].items,  index, fields[key], context);
                        });
                        if(schemaProperties[key].items.oneOf) {
                            fields[key].map(f => {
                                let values = Object.keys(f).reduce((acc, k) => { acc[k] = f[k].value; return acc;}, {});
                                let result = oneOfMatchingSchema(schemaProperties[key].items, values);
                                if(result){
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
