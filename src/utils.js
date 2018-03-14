const oneOfField = fieldProps => getIn(fieldProps, ['x-hints', "form", "selector"]);

export const componentType = fieldProps => getIn(fieldProps, ['x-hints', "form", "inputComponent"]);
export const addItem = fieldProps => getIn(fieldProps, ['x-hints', "form", "addItem"]) || 'Add Item';
export const controlStyle = fieldProps => getIn(fieldProps, ['x-hints', "form", "controls"]);
export const getSourceLocation = fieldProps => getIn(fieldProps, ['x-hints', "form", "sourceLocation"]);
export const defaultSource = fieldProps => getIn(fieldProps, ['x-hints', "form", "defaultSource"]);
export const inputSource = fieldProps => getIn(fieldProps, ['x-hints', "form", "source"]);
export const mapTo = fieldProps => getIn(fieldProps, ['x-hints', "form", "mapTo"]);
export const conditionalDefault = fieldProps => getIn(fieldProps, ['x-hints', "form", "conditionalDefault"]);
export const fieldDisplayLevel = fieldProps => getIn(fieldProps, ['x-hints', "form", "display"]);
export function formatString(formatted) {
    for (var i = 1; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+(i-1)+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};
export function getIn(obj, fields){
    return fields.reduce((obj, f) => {
        return obj ? obj[f] : null
    }, obj);
}

export function oneOfMatchingSchema(fieldProps, values){
    const field = oneOfField(fieldProps);
    if(!field || !fieldProps.oneOf){
        return false;
    }
    return fieldProps.oneOf.filter(f => {
        return f.properties[field].enum[0] === values[field];
    })[0];
}
