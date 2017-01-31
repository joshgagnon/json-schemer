import deepmerge from 'deepmerge';
import getDefaultValues from './getDefaultValues';
import setKeys from './setKeys';

export default function setDefaults(templateSchema, context, values) {
    const arrayMerge = (destinationArray, sourceArray, options) => sourceArray;

    const fields = deepmerge(getDefaultValues(templateSchema, context), values, { arrayMerge: arrayMerge });
    return setKeys(fields);
}
