const { validate } = require('jsonschema');

/**
 *  req in this case is a request object in the clean architecture sense
 *  It is unrelated to an http request. Simply means the request (input) object
 *  being passed for validation
 */

function validateSchema(req, schema) {
    const result = validate(req, schema);
    if (!result.valid) {
        let error = {};
        error.message = result.errors.map(error => error.stack);
        error.type = "InvalidSchema";
        throw error;
    }
    return true;
}

module.exports = {
    validateSchema,
}