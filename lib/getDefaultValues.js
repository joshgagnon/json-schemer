'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = getDefaultValues;

var _getKey = require('./getKey');

var _getKey2 = _interopRequireDefault(_getKey);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Appears to not be populating default on list items
function getDefaultValues(schema) {
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    function loop(props, fields) {
        Object.keys(props).map(function (key) {
            if ((0, _utils.defaultSource)(props[key]) && context[(0, _utils.defaultSource)(props[key])]) {
                // debugger
                // const source = inputSource(schemaProperties);
                // fields[key][source] = context[defaultSource(schemaProperties)].map(f => f[source]);
                props[key].default = context[(0, _utils.defaultSource)(props[key])];
            }

            if (props[key].default) {
                fields[key] = props[key].default;
            } else if (props[key].type === 'object') {
                var obj = fields[key] || {};
                loop(props[key].properties, obj);
                fields[key] = obj;
            } else if (props[key].type === 'array') {
                if (props[key].items.type === "object") {
                    var _obj = fields[key] || [];
                    // TODO: add keyIndex default
                    loop(props[key].items.properties, _obj);

                    if (props[key].items.oneOf) {
                        _obj.map(function (o) {
                            return props[key].items.oneOf.map(function (oneOf) {
                                loop(oneOf.properties, o);
                            });
                        });
                    }

                    fields[key] = _obj;
                }
            }

            if (props[key].oneOf) {
                (function () {
                    var obj = fields[key] || {};
                    props[key].oneOf.map(function (o) {
                        loop(o.properties, obj);
                    });
                    fields[key] = obj;
                })();
            }
        });
        return fields;
    }

    var fields = {};
    var vals = loop(schema.properties, fields);
    console.log('dadada');
    console.log(vals);
    return vals;
}