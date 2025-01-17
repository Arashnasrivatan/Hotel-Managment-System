const multer = require("multer");
const response = require("./../utils/response");

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
  // پیکربندی multer بر اساس تعداد فایل‌ها
  const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // حداکثر حجم فایل
    fileFilter: filefilter,
  });

  // اگر فایل‌ها باید multiple باشند
  if (isMultiple) {
    return upload.fields([{ name: fieldName }]);  // برای آپلود چند فایل
  }

  // اگر فایل‌ها باید single باشند
  return upload.single(fieldName);  // برای آپلود تنها یک فایل
};

module.exports = uploader;
