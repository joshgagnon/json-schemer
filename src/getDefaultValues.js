import getKey from './getKey';
import { defaultSource, mapTo } from './utils';

// Appears to not be populating default on list items
export default function getDefaultValues(schema, context={}) {
    function loop(props, fields) {
        Object.keys(props).map(key => {
            // If item has a default source, set the default from the correct source
            if (defaultSource(props[key]) && context[defaultSource(props[key])]) {
                props[key].default = context[defaultSource(props[key])];
            }

            // Map string fields directly to values in context
            if (mapTo(props[key]) && context[mapTo(props[key])]) {
                props[key].default = context[mapTo(props[key])];
            }
            
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
