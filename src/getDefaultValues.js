import getKey from './getKey';

// Appears to not be populating default on list items
export default function getDefaultValues(schema, defaults={}) {
    function loop(props, fields, suppliedDefaults) {
        Object.keys(props).map(key => {
            if (suppliedDefaults[key]) {
                fields[key] = suppliedDefaults[key];
            } else if (props[key].default) {
                fields[key] = props[key].default;
            }

            if (props[key].type === 'object') {
                let obj = fields[key] || {};
                loop(props[key].properties, obj, suppliedDefaults[key] || {});
                fields[key] = obj;
            } else if (props[key].type === 'array') {
                if (props[key].items.type === "object") {
                    let obj = fields[key] || [];

                    loop(props[key].items.properties, obj, {...(suppliedDefaults[key] || {}), _keyIndex: getKey()});
                    
                    if (props[key].items.oneOf) {
                        obj.map(o => props[key].items.oneOf.map(oneOf => {
                            loop(oneOf.properties, o, suppliedDefaults[key] || {});
                        }));
                    }
                    
                    fields[key] = obj;
                }
            }

            if (props[key].oneOf) {
                let obj = fields[key] || {};
                props[key].oneOf.map(o => {
                    loop(o.properties, obj, suppliedDefaults[key] || {});
                });
                fields[key]  = obj;
            }
        });
        return fields;
    }

    const fields = {};
    let val = loop(schema.properties, fields, defaults);
    debugger;
    return val;
}
