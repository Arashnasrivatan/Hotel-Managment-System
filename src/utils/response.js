const response = (res, statusCode, message = null, data = null) => {
  const success = statusCode >= 200 && statusCode < 300;
  const responseObject = { success, statusCode };

  if (message) {
    responseObject.message = message;
  }

  if (data) {
    responseObject.data = data;
  }

  return res.status(statusCode).json(responseObject);
};

module.exports = response;
