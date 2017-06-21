import mergeSchemas from './mergeSchemas';
import resolveReferences from './resolveReferences';

export default function(...schemas) {
    return resolveReferences(
        mergeSchemas(...schemas)
    );
}