const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        next(error); // Chuyển lỗi cho errorHandler xử lý (ZodError)
    }
};

module.exports = validate;
