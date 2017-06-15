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

    describe('mapTo', function() {
        it('should set default with value in context using the index from mapTo', function(done) {
            const schema = {
                "properties": {
                    "string": {
                        "type": "string",
                        "x-hints": {
                            "form": {
                                "mapTo": "stringMap"
                            }
                        }
                    }
                }
            };

            const context = {
                "stringMap": "testing string"
            };

            const expected = {
                "string": "testing string"
            };

            const actual = getDefaultValues(schema, context);

            actual.should.be.deep.equal(expected);
            done();
        });
    });

    describe('conditionalDefault', function() {
        it('conditional is true', function(done) {
            const schema = {
                "properties": {
                    "val": {
                        "type": "string",
                        "x-hints": {
                            "form": {
                                "conditionalDefault": {
                                    "conditional": "conditional",
                                    "trueValue": "true",
                                    "falseValue": "false"
                                }
                            }
                        }
                    }
                }
            };

            const context = {
                "conditional": true
            };

            const expected = {
                "val": "true"
            };

            const actual = getDefaultValues(schema, context);

            actual.should.be.deep.equal(expected);
            done();
        });

        it('conditional is false', function(done) {
            const schema = {
                "properties": {
                    "val": {
                        "type": "string",
                        "x-hints": {
                            "form": {
                                "conditionalDefault": {
                                    "conditional": "conditional",
                                    "trueValue": "true",
                                    "falseValue": "false"
                                }
                            }
                        }
                    }
                }
            };

            const context = {
                "conditional": false
            };

            const expected = {
                "val": "false"
            };

            const actual = getDefaultValues(schema, context);

            actual.should.be.deep.equal(expected);
            done();
        });
    });

    it('should set object array deep defaults', function(done) {
        const schema = {
            "properties": {
                "objectArray": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "object",
                                "properties": {
                                    "firstName": { "type": "string" },
                                    "lastName": { "type": "string" }
                                }
                            }
                        }
                    },
                    "default": [{
                        "name": {
                            "firstName": "x",
                            "lastName": "y"
                        }
                    }],
                    "x-hints": {
                        "form": {
                            "defaultSource": "key"
                        }
                    }
                }
            }
        };

        const expected = {
            "objectArray": [
                { "name": { "firstName": "x", "lastName": "y"} },
                { "name": { "firstName": "x", "lastName": "y"} },
                { "name": { "firstName": "x", "lastName": "y"} }
            ]
        };

        const context = {
            "key": [{}, {}, {}]
        }

        const actual = getDefaultValues(schema, context);

        console.log(actual);

        actual.should.be.deep.equal(expected);
        done();
    });
});
