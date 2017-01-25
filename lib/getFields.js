'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = getFields;
function getFields(schema) {
    var fields = [];
    function loop(props, path) {
        Object.keys(props).map(function (key) {
            if (props[key].type === 'object') {
                loop(props[key].properties, path + key + '.');
                if (props[key].oneOf) {
                    props[key].oneOf.map(function (oneOf) {
                        loop(oneOf.properties, path + key + '.');
                    });
                }
            } else if (props[key].type === 'array') {
                fields.push(path + key + '[]._keyIndex');
                if (props[key].items.type === "object") {
                    loop(props[key].items.properties, path + key + '[].');
                    if (props[key].items.oneOf) {
                        props[key].items.oneOf.map(function (oneOf) {
                            loop(oneOf.properties, path + key + '[].');
                        });
                    }
                } else {
                    fields.push(path + key + '[]');
                }
            } else {
                fields.push(path + key);
            }
        });
    }
    loop(schema.properties, '');
    return fields;
}