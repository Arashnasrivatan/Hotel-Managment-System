const yup = require("yup");

const bookingValidateSchema = yup.object().shape({
  room_id: yup
    .number()
    .integer("شماره اتاق باید یک عدد صحیح باشد")
    .required("شماره اتاق الزامی است")
    .typeError("شماره اتاق باید یک عدد معتبر باشد")
    .positive("شماره اتاق باید مثبت باشد"),
  check_in_date: yup
    .date()
    .required("تاریخ ورود معتبر نیست")
    .typeError("تاریخ ورود باید یک تاریخ معتبر باشد"),
  check_out_date: yup
    .date()
    .required("تاریخ خروج معتبر نیست")
    .typeError("تاریخ خروج باید یک تاریخ معتبر باشد")
    .min(
      yup.ref("check_in_date"),
      "تاریخ خروج نمی تواند قبل از تاریخ ورود باشد"
    ),
});

const updatebookingValidateSchema = yup.object().shape({
  room_id: yup
    .number()
    .integer("شماره اتاق باید یک عدد صحیح باشد")
    .optional("شماره اتاق الزامی است")
    .typeError("شماره اتاق باید یک عدد معتبر باشد")
    .positive("شماره اتاق باید مثبت باشد"),
  check_in_date: yup
    .date()
    .optional("تاریخ ورود معتبر نیست")
    .typeError("تاریخ ورود باید یک تاریخ معتبر باشد"),
  check_out_date: yup
    .date()
    .optional("تاریخ خروج معتبر نیست")
    .typeError("تاریخ خروج باید یک تاریخ معتبر باشد")
});

const availabilityValidateSchema = yup.object().shape({
  check_in_date: yup
    .date()
    .optional("تاریخ ورود معتبر نیست")
    .typeError("تاریخ ورود باید یک تاریخ معتبر باشد"),
  check_out_date: yup
    .date()
    .optional("تاریخ خروج معتبر نیست")
    .typeError("تاریخ خروج باید یک تاریخ معتبر باشد")
    .min(
      yup.ref("check_in_date"),
      "تاریخ خروج نمی تواند قبل از تاریخ ورود باشد"
    ),
});

module.exports = {
  bookingValidateSchema,
  updatebookingValidateSchema,
  availabilityValidateSchema,
};
