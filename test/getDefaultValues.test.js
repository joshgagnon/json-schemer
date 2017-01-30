const chai = require('chai');
import getDefaultValues from '../src/getDefaultValues';

describe('Get Default Values', function() {
    it('should set string defaults', function(done) {
        const schema = {
            "properties": {
                "string": {
                    "type": "string",
                    "default": "default"
                }
            }
        };

        const expected = {
            "string": "default"
        };

        const actual = getDefaultValues(schema);

        actual.should.be.deep.equal(expected);
        done();
    });

    it('should set number defaults', function(done) {
        const schema = {
            "properties": {
                "number": {
                    "type": "number",
                    "default": 23
                }
            }
        };

        const expected = {
            "number": 23
        };

        const actual = getDefaultValues(schema);

        actual.should.be.deep.equal(expected);
        done();
    });

    it('should set object defaults', function(done) {
        const schema = {
            "properties": {
                "object": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "default": "Tane"
                        }
                    }
                }
            }
        };

        const expected = {
            "object": {
                "name": "Tane"
            }
        };

        const actual = getDefaultValues(schema);

        actual.should.be.deep.equal(expected);
        done();
    });

    it('should set scalar array defaults', function(done) {
        const schema = {
            "properties": {
                "scalarArray": {
                    "type": "array",
                    "items": {
                        "type": "number"
                    },
                    "default": [1, 2, 3],
                }
            }
        };

        const expected = {
            "scalarArray": [1, 2, 3]
        };

        const actual = getDefaultValues(schema);

        actual.should.be.deep.equal(expected);
        done();
    });

    it('should set object array defaults', function(done) {
        const schema = {
            "properties": {
                "objectArray": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": { "type": "string" }
                        }
                    },
                    "default": [{"name": "Harry"}, {"name": "Mark"}, {"name": "John"}],
                }
            }
        };

        const expected = {
            "objectArray": [
                {"name": "Harry"},
                {"name": "Mark"},
                {"name": "John"}
            ]
        };

        const actual = getDefaultValues(schema);

        actual.should.be.deep.equal(expected);
        done();
    });
});
