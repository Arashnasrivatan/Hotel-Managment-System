const yup = require("yup");

const loginSchema = yup.object().shape({
  email: yup.string("لطفا ایمیل را صحیح وارد کنید").email("لطفا ایمیل را صحیح وارد کنید").required("لطفا ایمیل را وارد کنید"),
  password: yup
    .string()
    .required("لطفا رمز عبور را وارد کنید")
    .min(8, "رمز عبور نمی تواند کمتر از 8 کاراکتر باشد")
    .max(24, "رمز عبور نمی تواند بیشتر از 24 کاراکتر باشد")
    .required("لطفا رمز عبور را وارد کنید"),
});

module.exports = loginSchema;
