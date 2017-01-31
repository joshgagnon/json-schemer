import isPlainObject from 'lodash/isPlainObject';
import getKey from './getKey';
import deepmerge from 'deepmerge';
import getDefaultValues from './getDefaultValues';

export getDefaultValues from './getDefaultValues';
export getFields from './getFields';
export getKey from './getKey';
export getValidate from './getValidate';
export injectContext from './injectContext';
export resolveReferences from './resolveReferences';
export * from './utils';


const arrayMerge = (destinationArray, sourceArray, options) => {
    return sourceArray;
}

export function setDefaults(templateSchema, context, values) {
    const merged = deepmerge(getDefaultValues(templateSchema, context), values, { arrayMerge: arrayMerge });
    return addKeys(merged);
}

function addKeys(obj){
    const recurse = (obj, arrayChild) => {
        if(Array.isArray(obj)){
            obj.map((obj) => recurse(obj, true));
        }
        else if(isPlainObject(obj)){
            if (arrayChild) {
                obj._keyIndex = getKey();
            }
            Object.keys(obj).map(k => recurse(obj[k]))
        }
        return obj;
    }
    return recurse(obj);
}
