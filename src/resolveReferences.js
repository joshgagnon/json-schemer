import merge from 'deepmerge';
import isPlainObject from 'lodash/isPlainObject';

export default function resolveReferences(rootSchema) {
    const deepFind = (schema, keys) => {
        if (keys.length == 0) {
            throw new Exception('At least one key must be passed for deepFind()');
        }

        if (keys.length == 1) {
            return schema[keys[0]];
        }

        return deepFind(schema[keys[0]], keys.splice(1));
    }

    const resolveChildReferences = (item) => {
        // If this item is has a ref property: replace it with the reference it is pointing to
        if (isPlainObject(item) && item['$ref']) {
            const definitionKeys = item['$ref'].split('/');

            // # = root schema
            if (definitionKeys[0] === '#') {
                // Find the replacement value for the reference
                let refReplacement = deepFind(rootSchema, definitionKeys.splice(1));
                // Apply overrides
                if (isPlainObject(refReplacement)) {
                    let itemWithoutRef = item;
                    delete itemWithoutRef['$ref'];

                    refReplacement = merge(refReplacement, itemWithoutRef);
                }

                // Return fully resolved object
                return resolveChildReferences(refReplacement);
            } else {
                throw new Exception("Non-absolute references are not currently supported");
            }
        }

        // If this item is an array: loop it's values and recurse on them
        if (Array.isArray(item)) {
            item.map((innerItem, i) => {
                item[i] = resolveChildReferences(innerItem);
            });
        }

        // If this item is a object: loop it's keys and recurse on them
        if (isPlainObject(item)) {
            Object.keys(item).map((key) => {
                if (isPlainObject(item)) {
                    item[key] = resolveChildReferences(item[key]);
                }
            });
        }

        // Return the processed item
        return item;
    }

    return resolveChildReferences(rootSchema, []);
}
