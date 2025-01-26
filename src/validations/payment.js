const yup = require("yup");

const createPayment = yup.object().shape({
  amount: yup.number().required("لطفا مقدار پرداخت را وارد کنید"),
  payment_status: yup
    .string()
    .optional("لطفا وضعیت پرداخت را وارد کنید")
    .enum(
      ["paid", "pending", "failed"],
      "وضعیت پرداخت باید یکی از موارد paid pending failed باشد"
    ),
  payment_type: yup
    .string()
    .optional("لطفا نوع پرداخت را وارد کنید")
    .enum(
      ["normal", "return"],
      "نوع پرداخت باید یکی از موارد normal return باشد"
    ),
  booking_id: yup.number().required("لطفا شناسه رزرو را وارد کنید"),
});

const updatePayment = yup.object().shape({
  amount: yup.number().optional("لطفا مقدار پرداخت را وارد کنید"),
  payment_status: yup
    .string()
    .optional("لطفا وضعیت پرداخت را وارد کنید")
    .enum(
      ["paid", "pending", "failed"],
      "وضعیت پرداخت باید یکی از موارد paid pending failed باشد"
    ),
  payment_type: yup
    .string()
    .optional("لطفا نوع پرداخت را وارد کنید")
    .enum(
      ["normal", "return"],
      "نوع پرداخت باید یکی از موارد normal return باشد"
    ),
  booking_id: yup.number().optional("لطفا شناسه رزرو را وارد کنید"),
});

module.exports = { createPayment, updatePayment };
