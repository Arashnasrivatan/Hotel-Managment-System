const yup = require("yup");

const roomValidationSchema = yup.object().shape({
  room_number: yup
    .number()
    .required("شماره اتاق الزامی است")
    .positive("شماره اتاق باید مثبت باشد")
    .integer("شماره اتاق باید یک عدد صحیح باشد")
    .typeError("شماره اتاق باید یک عدد معتبر باشد"),
  floor: yup
    .number()
    .required("طبقه الزامی است")
    .positive("طبقه باید مثبت باشد")
    .integer("طبقه باید یک عدد صحیح باشد")
    .typeError("طبقه باید یک عدد معتبر باشد"),
  room_type: yup
    .string()
    .required("نوع اتاق الزامی است")
    .oneOf(
      ["single", "double", "suite"],
      "نوع اتاق باید یکی از موارد 'single', 'double' یا 'suite' باشد"
    ),
  capacity: yup
    .number()
    .required("ظرفیت الزامی است")
    .positive("ظرفیت باید مثبت باشد")
    .integer("ظرفیت باید یک عدد صحیح باشد")
    .min(1, "ظرفیت نمی تواند کمتر از 1 باشد")
    .max(10, "ظرفیت نمی تواند بیشتر از 10 باشد")
    .typeError("ظرفیت باید یک عدد معتبر باشد"),
  price_per_night: yup
    .number()
    .required("قیمت هر شب الزامی است")
    .positive("قیمت هر شب باید مثبت باشد")
    .integer("قیمت هر شب باید یک عدد صحیح باشد")
    .typeError("قیمت هر شب باید یک عدد معتبر باشد"),
  amenities: yup
    .array()
    .transform((value, originalValue) => {
      if (typeof originalValue === "string") {
        try {
          return JSON.parse(originalValue);
        } catch (err) {
          return value;
        }
      }
      return value;
    })
    .of(yup.string().required("هر امکانات باید یک رشته معتبر باشد"))
    .min(1, "حداقل یک امکانات باید وارد شود")
    .required("امکانات الزامی است")
    .typeError("امکانات باید یک آرایه از رشته ها باشد"),
});

module.exports = roomValidationSchema;
