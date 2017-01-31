import isPlainObject from 'lodash/isPlainObject';
import getKey from './getKey';

export default function setKeys(fields){
    const recurse = (fields, arrayChild) => {
        if (Array.isArray(fields)) {
            fields.map((fields) => recurse(fields, true));
        }
        else if (isPlainObject(fields)) {
            if (arrayChild) {
                fields._keyIndex = getKey();
            }
            Object.keys(fields).map(k => recurse(fields[k]))
        }

        return fields;
    }

    return recurse(fields);
}
