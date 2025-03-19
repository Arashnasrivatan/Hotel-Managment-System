const response = require("../utils/response");

module.exports = (validator) => {return async (req, res, next) => {
        try {
          await validator.validate(req.body, { abortEarly: false });
          next();
        } catch (err) {
          return response(res, 400, err.errors);
        }
      }};
      