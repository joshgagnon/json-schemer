function getIn(obj, fields){
    return fields.reduce((obj, f) => {
        return obj ? obj[f] : null
    }, obj);
}

const oneOfField = fieldProps => getIn(fieldProps, ['x-hints', "form", "selector"]);

export const componentType = fieldProps => getIn(fieldProps, ['x-hints', "form", "inputComponent"]);
export const addItem = fieldProps => getIn(fieldProps, ['x-hints', "form", "addItem"]) || 'Add Item';
export const inputSelectSource = fieldProps => getIn(fieldProps, ['x-hints', "form", "selectFromSource"]);
export const defaultSource = fieldProps => getIn(fieldProps, ['x-hints', "form", "defaultSource"]);
export const inputSource = fieldProps => getIn(fieldProps, ['x-hints', "form", "source"]);
export const mapTo = fieldProps => getIn(fieldProps, ['x-hints', "form", "mapTo"]);
export const conditionalDefault = fieldProps => getIn(fieldProps, ['x-hints', "form", "conditionalDefault"]);
export const fieldDisplayLevel = fieldProps => getIn(fieldProps, ['x-hints', "form", "display"]);

export function oneOfMatchingSchema(fieldProps, values){
    const field = oneOfField(fieldProps);
    if(!field || !fieldProps.oneOf){
        return false;
    }
    return fieldProps.oneOf.filter(f => {
        return f.properties[field].enum[0] === values[field];
    })[0];
}
