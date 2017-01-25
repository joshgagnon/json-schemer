const chai = require('chai');
const merge = require('deepmerge');
import resolveReferences from '../src/resolveReferences';

const should = chai.should();

const definitions = {"definitions": {
    "string": "someRandomText",
    "number": 62,
    "array": ["one", "two", "three"],
    "object": { "object": "objectDefinedInDefinitions" }
}};

const jsonWithoutReferences = {
    "array": ["one", "two", "three"],
    "number": 15,
    "$notARef": "testing",
    "object": {
        "child": "childValue",
        "childObject":  {
            "testing": 17
        }
    }
};

const jsonWithStringReference = {
    "number": 15,
    "string": {"$ref": "#/definitions/string"},
    "object": {
        "child": "childValue",
        "childObject": {
            "testing": 17
        }
    }
};

const jsonWithResolvedStringReferences = {
    "number": 15,
    "string": "someRandomText",
    "object": {
        "child": "childValue",
        "childObject": {
            "testing": 17
        }
    }
};

const jsonWithNumberReference = {
    "object": {
        "number": {"$ref": "#/definitions/number"},
        "childObject": {
            "testing": 17
        }
    }
};

const jsonWithResolvedNumberReference = {
    "object": {
        "number": 62,
        "childObject": {
            "testing": 17
        }
    }
};

const jsonWithArrayReference = {
    "object": {
        "item one": 66,
        "innerArray": {"$ref": "#/definitions/array"}
    }
};

const jsonWithResolvedArrayReference = {
    "object": {
        "item one": 66,
        "innerArray": ["one", "two", "three"]
    }
};

const jsonArrayWithReference = {
    "array": [
        {
            "objectOne": 1911,
            "testRef": {"$ref": "#/definitions/string"}
        }
    ]
}

const jsonArrayWithResolvedReference = {
    "array": [
        {
            "objectOne": 1911,
            "testRef": "someRandomText"
        }
    ]
}

const jsonWithObjectReference = {
    "anObject": {"$ref": "#/definitions/object"}
};

const jsonWithResolvedObjectReference = {
    "anObject": {"object": "objectDefinedInDefinitions"}
};

const jsonWithMultipleReferences = {
    "anObject": {"$ref": "#/definitions/object"},
    "nonReference": 72,
    "stringReference": {"$ref": "#/definitions/string"},
    "numberReference": {"$ref": "#/definitions/number"},
    "arrayReference": {"$ref": "#/definitions/array"}
};

const jsonWithMultipleResolvedReferences = {
    "anObject": {"object": "objectDefinedInDefinitions"},
    "nonReference": 72,
    "stringReference": "someRandomText",
    "numberReference": 62,
    "arrayReference": ["one", "two", "three"]
};

const nestedReferences = {"definitions": {
    "string": "someRandomText",
    "array": ["one", "two", "three"],
    "straightRef": { "$ref": "#/definitions/string" },
    "objectWithRef": {
        "something": 21,
        "childRef": { "$ref": "#/definitions/array" }
    },
}};

describe('JSON Schema', function() {
    describe('Resolve references in root schema', function() {
        describe('Objects without references', function() {
            it('Should not change schema without references', function(done) {
                const mergedWithReferences = merge(definitions, jsonWithoutReferences);
                const mergedWithResolvedReferences = merge(definitions, jsonWithoutReferences);

                resolveReferences(mergedWithReferences).should.be.deep.equal(mergedWithResolvedReferences);
                done();
            });
        });

        describe('Objects with a single reference', function() {
            it('Should replace string references', function(done) {
                const mergedWithReferences = merge(definitions, jsonWithStringReference);
                const mergedWithResolvedReferences = merge(definitions, jsonWithResolvedStringReferences);

                resolveReferences(mergedWithReferences).should.be.deep.equal(mergedWithResolvedReferences);
                done();
            });

            it('Should replace number references', function(done) {
                const mergedWithReferences = merge(definitions, jsonWithNumberReference);
                const mergedWithResolvedReferences = merge(definitions, jsonWithResolvedNumberReference);

                resolveReferences(mergedWithReferences).should.be.deep.equal(mergedWithResolvedReferences);
                done();
            });

            it('Should replace array references', function(done) {
                const mergedWithReferences = merge(definitions, jsonWithArrayReference);
                const mergedWithResolvedReferences = merge(definitions, jsonWithResolvedArrayReference);

                resolveReferences(mergedWithReferences).should.be.deep.equal(mergedWithResolvedReferences);
                done();
            });

            it('Should replace references in array', function(done) {
                const mergedWithReferences = merge(definitions, jsonArrayWithReference);
                const mergedWithResolvedReferences = merge(definitions, jsonArrayWithResolvedReference);

                resolveReferences(mergedWithReferences).should.be.deep.equal(mergedWithResolvedReferences);
                done();
            });

            it('Should replace object references', function(done) {
                const mergedWithReferences = merge(definitions, jsonWithObjectReference);
                const mergedWithResolvedReferences = merge(definitions, jsonWithResolvedObjectReference);

                resolveReferences(mergedWithReferences).should.be.deep.equal(mergedWithResolvedReferences);
                done();
            });
        });

        describe('Objects with multiple references', function() {
            it('Should replace all references', function(done) {
                const mergedWithReferences = merge(definitions, jsonWithMultipleReferences);
                const mergedWithResolvedReferences = merge(definitions, jsonWithMultipleResolvedReferences);

                resolveReferences(mergedWithReferences).should.be.deep.equal(mergedWithResolvedReferences);
                done();
            });
        });

        describe('Resolve references of references', function() {
            it('Should resolve reference of reference', function(done) {
                const mergedWithReferences = merge(nestedReferences, {"testing": {"$ref": "#/definitions/straightRef"}});
                const mergedWithResolvedReferences = merge(nestedReferences, {"testing": "someRandomText"});

                resolveReferences(mergedWithReferences).should.be.deep.equal(mergedWithResolvedReferences);
                done();
            });

            it('Should resolve reference of object with reference', function(done) {
                const mergedWithReferences = merge(nestedReferences, {"testing": {"$ref": "#/definitions/objectWithRef"}});
                const mergedWithResolvedReferences = merge(nestedReferences, {"testing": {"something": 21, "childRef": ["one", "two", "three"]}});

                resolveReferences(mergedWithReferences).should.be.deep.equal(mergedWithResolvedReferences);
                done();
            });
        });
    });
});
