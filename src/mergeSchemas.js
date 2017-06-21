import merge from 'deepmerge';
const cloneDeep = require('lodash.clonedeep');

export default function mergeSchemas(...schemas) {
    schemas = schemas.map(schema => cloneDeep(schema));

    if (schemas.length === 1) {
        return schemas[0];
    }

    return merge.all(schemas);
}