function getIn(obj, fields){
    return fields.reduce((obj, f) => {
        return obj ? obj[f] : null
    }, obj);
}

function oneOfField(fieldProps){
    return getIn(fieldProps, ['x-hints', "form", "selector"])
}

export function componentType(fieldProps){
    return getIn(fieldProps, ['x-hints', "form", "inputComponent"])
}

export function addItem(fieldProps){
    return getIn(fieldProps, ['x-hints', "form", "addItem"]) || 'Add Item';
}

export function inputSelectSource(fieldProps){
    return getIn(fieldProps, ['x-hints', "form", "selectFromSource"]);
}

export function defaultSource(fieldProps) {
    return getIn(fieldProps, ['x-hints', "form", "defaultSource"]);
}

export function inputSource(fieldProps){
    return getIn(fieldProps, ['x-hints', "form", "source"]);
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
