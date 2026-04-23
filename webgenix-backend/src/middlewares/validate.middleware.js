import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        const message = error.errors?.map(e => e.message).join(', ') || 'Validation failed';
        next(new ApiError(400, message));
    }
};