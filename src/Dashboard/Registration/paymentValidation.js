import * as yup from "yup";

export const PAYMENT_MODES = ["Cash", "Online", "Cheque"];

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Recollection payment — same rules as the payment part of the registration form.
// Context: { pending } = amount still pending before this payment.
export const paymentSchema = yup.object({
  amountPaid: yup
    .number()
    .transform((v, orig) => (orig === "" || orig === null ? undefined : v))
    .typeError("Enter a valid amount")
    .required("Amount is required")
    .min(1, "Amount must be at least ₹1")
    .test("max-pending", "Amount cannot be more than the pending amount", function (v) {
      return v === undefined || v <= Number(this.options.context?.pending || 0);
    }),
  modeOfPayment: yup
    .string()
    .required("Please select payment mode")
    .oneOf(PAYMENT_MODES, "Please select payment mode"),
  dueDate: yup.string().test("due-date", "", function (v) {
    const pending = Number(this.options.context?.pending || 0);
    const paid = Number(this.parent.amountPaid) || 0;
    if (pending - paid <= 0) return true; // fees cleared → no due date
    if (!v) return this.createError({ message: "Due date is required for pending fees" });
    if (new Date(v) < todayStart()) return this.createError({ message: "Due date cannot be in the past" });
    return true;
  }),
});

// Validate → { fieldName: message } (empty object when valid)
export const validatePayment = async (formData, pending) => {
  try {
    await paymentSchema.validate(formData, { abortEarly: false, context: { pending } });
    return {};
  } catch (err) {
    const errors = {};
    (err.inner || []).forEach((e) => {
      if (e.path && !errors[e.path]) errors[e.path] = e.message;
    });
    return errors;
  }
};
