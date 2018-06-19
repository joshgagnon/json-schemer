import getKey from './getKey';
import { defaultSource, mapTo, conditionalDefault } from './utils';
import deepmerge from 'deepmerge';

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

    function prepValues(args) {
        if(Array.isArray(args)){
            return args.map((arg) => {
                return {...arg, _keyIndex: getKey()};
            })
        }
        return ags;
    }

    function loop(props, fields, index=0) {
        Object.keys(props).map((key, propIndex) => {
            // Check we need to infer some king of default, then set it
            let defaultValue = inferDefault(props[key], context);
            if (defaultValue) {
                // If both default value and the definitions default are arrays, merge each object in the array
                // THis means we can set defaults in the definitions for properties that don't exist in the default source
                if (props[key].default) {
                    if (Array.isArray(defaultValue) && props[key].default.length === 1) {
                        defaultValue = defaultValue.map((value, i) => {
                            return { _keyIndex:  getKey(), ...props[key].default[0], ...value }
                        })
                    }
                }
                fields[key] = defaultValue;
            }
            else if(props[key].default){
                fields[key] = props[key].default;
            }
            // If this property has a default (inferred above or defined in schema), set it in the fields here

            if (props[key].type === 'object') {
                const nextFields = fields[key] || {};
                fields[key] = loop(props[key].properties, nextFields, index);
                if (props[key].default) {

                    fields[key] = deepmerge(prepValues(props[key].default), fields[key]);
                }

            }
            else if (props[key].type === 'array' && props[key].items.type === "object") {
                let obj = fields[key] || [];
                obj.map((o, i) => {

                    obj[i] = loop(props[key].items.properties, o, i);
                    if(props[key].items.default){
                        obj[i] = deepmerge(props[key].items.default, obj[i]);
                    }
                    if (props[key].items.oneOf) {
                        props[key].items.oneOf.map(oneOf => {

                            obj[i] = loop(oneOf.properties, obj[i], i);
                        });
                    }
                });

                fields[key] = obj;
            }
            else if(props[key].default){
                fields[key] = fields[key] || prepValues(props[key].default);
            }
            if (props[key].oneOf) {
                let obj = fields[key] || {};
                props[key].oneOf.map(o => {
                    loop(o.properties, obj, index);
                });
                fields[key]  = obj;
            }
        });
        return fields;
    }

    const fields = {};
    return loop(schema.properties, fields);
}
