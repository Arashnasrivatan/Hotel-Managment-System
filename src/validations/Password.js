const yup = require("yup");

const forgotPassword = yup.object().shape({
  email: yup
    .string()
    .email("ایمیل نامعتبر است")
    .required("لطفا ایمیل خود را وارد کنید"),
});

const resetPassword = yup.object().shape({
  newPassword: yup
    .string()
    .required("لطفا رمز عبور را وارد کنید")
    .min(8, "رمز عبور نمی تواند کمتر از 8 کاراکتر باشد")
    .max(24, "رمز عبور نمی تواند بیشتر از 24 کاراکتر باشد"),
  confirmPassword: yup
    .string()
    .oneOf(
      [yup.ref("newPassword"), null],
      "تایید رمز عبور با رمز عبور جدید مطابقط ندارد"
    )
    .required("لطفا تأیید رمز عبور را وارد کنید"),
});

const changePassword = yup.object().shape({
  oldPassword: yup.string().required("لطفا رمز عبور فعلی خود را وارد کنید"),
  newPassword: yup
    .string()
    .required("لطفا رمز عبور جدید خود را وارد کنید")
    .min(8, "رمز عبور نمی تواند کمتر از 8 کاراکتر باشد")
    .max(24, "رمز عبور نمی تواند بیشتر از 24 کاراکتر باشد"),
  confirmPassword: yup
    .string()
    .oneOf(
      [yup.ref("newPassword"), null],
      "تایید رمز عبور با رمز عبور جدید مطابقط ندارد"
    )
    .required("لطفا تأیید رمز عبور را وارد کنید"),
});

module.exports = { resetPassword, forgotPassword, changePassword };
