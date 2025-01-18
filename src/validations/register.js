const yup = require('yup');


const registerSchema = yup.object().shape({
       name: yup.string().min(3,"نام نمی تواند کمتر از 3 کاراکتر باشد").max(24,"نام نمی تواند بیشتر از 24 کاراکتر باشد").required("نام الزامی است"),
       email: yup.string().email("ایمیل معتبر نیست").required("ایمیل الزامی است"),
       password: yup.string().min(8,"رمز عبور نمی تواند کمتر از 8 کاراکتر باشد").max(24,"رمز عبور نمی تواند بیشتر از 24 کاراکتر باشد").required("رمز عبور الزامی است"),
     });


module.exports = registerSchema