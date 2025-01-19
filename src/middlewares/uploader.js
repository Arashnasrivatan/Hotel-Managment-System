const multer = require("multer");

const filefilter = (req, file, cb) => {
  if (
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploader = (fieldName, isMultiple = false) => {

  const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: filefilter,
  });

  if (isMultiple) {
    return upload.array(fieldName);
  }

  return upload.single(fieldName);
};

module.exports = uploader;
