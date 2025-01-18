const yup = require('yup');


const registerSchema = yup.object().shape({
       name: yup.string().min(3,"نام نمی تواند کمتر از 3 کاراکتر باشد").max(24,"نام نمی تواند بیشتر از 24 کاراکتر باشد").optional(),
       email: yup.string().email("ایمیل معتبر نیست").optional(),
     });


module.exports = registerSchema