import getKey from './getKey';
import { defaultSource, mapTo, conditionalDefault } from './utils';

function inferDefault(prop, context) {
    // If item has a default source, set the default from the correct source
    if (defaultSource(prop) && context[defaultSource(prop)]) {
        return context[defaultSource(prop)];
    }

    // Map string fields directly to values in context
    if (mapTo(prop) && context[mapTo(prop)]) {
        return context[mapTo(prop)];
    }
    
    // Conditional map to
    if (conditionalDefault(prop) && typeof context[conditionalDefault(prop).conditional] === 'boolean') {
        if (context[conditionalDefault(prop).conditional]) {
            return conditionalDefault(prop).trueValue;
        } else {
            return conditionalDefault(prop).falseValue;
        }
    }

    return false;
}

// Appears to not be populating default on list items
export default function getDefaultValues(schema, context={}) {
    function loop(props, fields) {
        Object.keys(props).map(key => {
            // Check we need to infer some king of default, then set it
            const defaultValue = inferDefault(props[key], context);
            if (defaultValue) {
                props[key].default = defaultValue;
            }
            
            // If this property has a default (inferred above or defined in schema), set it in the fields here
            if (props[key].default) {
                fields[key] = props[key].default;
            }
            
            if (props[key].type === 'object') {
                const nextFields = fields[key] || {};
                fields[key] = loop(props[key].properties, nextFields);
            }
            else if (props[key].type === 'array' && props[key].items.type === "object") {
                let obj = fields[key] || [];

                loop(props[key].items.properties, obj);
                
                if (props[key].items.oneOf) {
                    obj.map(o => props[key].items.oneOf.map(oneOf => {
                        loop(oneOf.properties, o);
                    }));
                }
                
                fields[key] = obj;
            }

            if (props[key].oneOf) {
                let obj = fields[key] || {};
                props[key].oneOf.map(o => {
                    loop(o.properties, obj);
                });
                fields[key]  = obj;
            }
        });
        return fields;
    }

    const fields = {};
    return loop(schema.properties, fields);
}
