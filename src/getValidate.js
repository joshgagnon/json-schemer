import { oneOfMatchingSchema, getIn } from './utils';
import moment from 'moment';

function getRef(obj, values){
    if(obj && obj.$data){
        return values[obj.$data];
    }
}

const emptyArray = [];
const emptyObject = {};


export default function getValidate(schema) {
    return (values) => {
        let globalErrors = [];
        function loop(props, values, required){
            return Object.keys(props).reduce((acc, key) => {
                if(props[key].type === 'object'){
                    const matching = oneOfMatchingSchema(props[key], (values || emptyObject)[key]);
                    let required = props[key].required || [];
                    let properties = props[key].properties
                    if(matching && matching.required){
                        required = required.concat(matching.required);
                    }
                    if(matching && matching.properties){
                        properties = {...properties, ...matching.properties}
                    }

                    acc[key] = loop(properties, (values || emptyObject)[key], required)
                }
                if(props[key].type === 'array'){
                    acc[key] = (values[key] || emptyArray).map(v => {
                        const matching = oneOfMatchingSchema(props[key].items, v);
                        let properties = props[key].items.properties;
                        if(properties){
                            let required = props[key].items.required || [];
                            if(matching && matching.required){
                                required = required.concat(matching.required);
                            }
                            if(matching && matching.properties){
                                properties = {...properties, ...matching.properties}
                            }
                            return loop(properties, v,  required);
                        }
                        // else, just a list
                        else{
                            if(!v && props[key].items.required){
                                return ['Required.'];
                            }
                        }
                    });
                    if(props[key].minItems && (!values[key] || values[key].length < props[key].minItems)){
                        acc[key]._error = [`At least ${props[key].minItems} '${props[key].title || props[key].validationTitle}' required.`];
                    }
                }
                if(required.indexOf(key) >= 0 && (!values || values[key] === undefined || values[key] === null || values[key] === '')){
                    acc[key] = ['Required.']
                }
                if(props[key].formatMinimum && values[key]){
                    const min = getRef(props[key].formatMinimum, values);
                    let  value = values[key];
                    if(props[key].format && props[key].formatDate){
                        value = moment(value, props[key].formatDate);
                    }
                    if(min && value < min){
                        acc[key] = [props[key].errorMessage.formatMinimum]
                    }
                }
                return acc;
            }, {})
        }
        const errors = loop(schema.properties, values, schema.required || []);
        if(globalErrors.length){
            errors._error = globalErrors;
        }
        return errors;
    }
}
