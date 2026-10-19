import { useState } from "react";
import api from "../../Api";
import { FileUploadHook } from "../FileUpload/FileUploadHook";
import FileUpload from "../FileUpload/FileUpload";
import { useToast } from "../../useToast";
import { PAYMENT_MODES, validatePayment } from "./paymentValidation";

// Inline field error (same as the registration form)
const FieldError = ({ msg }) =>
  msg ? <p className="text-red-500 text-xs sm:text-sm mt-1">{msg}</p> : null;

const formatAmount = (v) => Number(v || 0).toLocaleString("en-IN");

const PaymentForm = ({ paymentData, setShowPayment }) => {
  const student = paymentData;
  const { successToast, errorToast } = useToast();

  // File upload hooks (receipt upload temporarily disabled — kept for restore)
  const receiptPhoto = FileUploadHook();
  const bookPhoto = FileUploadHook();

  const [formData, setFormData] = useState({
    amountPaid: "",
    modeOfPayment: "",
    dueDate: "",
    receiptNo: "",
    receiptPhoto: "",
    bookPhoto: "",
  });
  const [errors, setErrors] = useState({});
  const [submitLoader, setSubmitLoader] = useState(false);

  if (!student) {
    return <p className="text-red-500">No student selected for payment.</p>;
  }

  const pending = Number(student.amountRemaining) || 0;
  const paidNow = Number(formData.amountPaid) || 0;
  const newRemaining = Math.max(pending - paidNow, 0);
  const clearsFees = paidNow > 0 && paidNow === pending;

  const sectionCls = "mb-4 sm:mb-6 w-full border rounded-lg shadow-sm p-2 sm:p-4 lg:p-6";
  const readOnlyCls =
    "w-full px-3 py-2 border rounded bg-gray-100 focus:outline-none cursor-not-allowed text-sm sm:text-base";
  const errAttr = (name) => (errors[name] ? { "data-error": "true" } : {});
  const inputCls = (name, extra = "") =>
    `w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm sm:text-base ${
      errors[name] ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-300"
    } ${extra}`;

  const clearError = (name) =>
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearError(name);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // TEMPORARILY UNUSED — receipt upload commented out; keep for restore
  // eslint-disable-next-line no-unused-vars
  const handleReceiptPhotoUpload = async (type) => {
    const imageUrl = await receiptPhoto.uploadImage(type);
    if (imageUrl) setFormData((prev) => ({ ...prev, receiptPhoto: imageUrl }));
  };

  const handleBookPhotoUpload = async (type) => {
    const imageUrl = await bookPhoto.uploadImage(type);
    if (imageUrl) {
      setFormData((prev) => ({ ...prev, bookPhoto: imageUrl }));
      clearError("bookPhoto");
    }
  };

  const showErrors = (fieldErrors) => {
    setErrors(fieldErrors);
    errorToast("Please correct the highlighted fields");
    setTimeout(() => {
      document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldErrors = await validatePayment(formData, pending);
    if (clearsFees && (!bookPhoto.isSaved || !formData.bookPhoto)) {
      fieldErrors.bookPhoto = "Please upload and save the book distribution proof";
    }
    if (Object.keys(fieldErrors).length > 0) return showErrors(fieldErrors);

    setSubmitLoader(true);
    try {
      await api.post("/counsellor/makePayment", {
        studentId: student.studentId,
        receiptNo: formData.receiptNo,
        amountPaid: paidNow,
        paymentMode: formData.modeOfPayment,
        newDueDate: clearsFees ? "" : formData.dueDate,
        receiptPhoto: formData.receiptPhoto,
        bookPhoto: clearsFees ? formData.bookPhoto : "",
      });
      successToast("Payment submitted successfully!");
      setShowPayment(false);
    } catch (err) {
      console.error("Payment failed:", err);
      errorToast(err.response?.data?.message || "Failed to process payment. Please try again.");
    } finally {
      setSubmitLoader(false);
    }
  };

  return (
    <div className="w-full bg-white">
      <div className="container w-full">
        <div className="bg-primary text-white text-center py-4">
          <h2 className="text-2xl font-bold">Student Payment Form</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 w-full">
          {/* All payment fields in one section */}
          <div className={sectionCls}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
              {[
                ["Student ID", student.studentId],
                ["Student Name", student.studentName],
                ["Total Amount", formatAmount(student.totalAmount)],
                ["Amount Paid", formatAmount(student.amountPaid)],
              ].map(([label, value]) => (
                <div key={label} className="w-full flex flex-row items-center gap-1">
                  <label className="min-w-[130px] md:text-[17px] text-md mr-2 text-gray-600">{label}:</label>
                  <input type="text" value={value ?? "-"} className={readOnlyCls} disabled readOnly />
                </div>
              ))}

              <div className="w-full" {...errAttr("amountPaid")}>
                <input
                  type="number"
                  inputMode="numeric"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onWheel={(e) => e.target.blur()}
                  onChange={handleChange}
                  placeholder="Enter Amount Paid"
                  className={inputCls("amountPaid")}
                  min="1"
                  max={pending}
                />
                <FieldError msg={errors.amountPaid} />
              </div>

              <div className="w-full flex flex-row items-center gap-1">
                <label className="min-w-[130px] md:text-[17px] text-md mr-2 text-gray-600">New Remaining:</label>
                <input type="text" value={formatAmount(newRemaining)} className={readOnlyCls} disabled readOnly />
              </div>

              {/* TEMPORARILY COMMENTED — receipt number field disabled
              <input
                type="number"
                name="receiptNo"
                value={formData.receiptNo}
                onWheel={(e) => e.target.blur()}
                onChange={handleChange}
                placeholder="Enter Fees Receipt Number"
                className={inputCls("receiptNo")}
              />
              */}

              <div className="w-full" {...errAttr("modeOfPayment")}>
                <select
                  name="modeOfPayment"
                  value={formData.modeOfPayment}
                  onChange={handleChange}
                  className={inputCls("modeOfPayment")}
                >
                  <option value="">Select Payment Mode</option>
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <FieldError msg={errors.modeOfPayment} />
              </div>

              <div className="w-full" {...errAttr("dueDate")}>
                <div className="w-full flex flex-row items-center gap-1">
                  <label className="min-w-fit md:text-[17px] text-md mr-2 text-black">Due Date:</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={clearsFees ? "" : formData.dueDate}
                    disabled={clearsFees}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={inputCls("dueDate", "disabled:opacity-50")}
                  />
                </div>
                {clearsFees ? (
                  <p className="text-green-600 text-xs sm:text-sm mt-1">Fees cleared — due date not required</p>
                ) : (
                  <FieldError msg={errors.dueDate} />
                )}
              </div>

              {/* TEMPORARILY COMMENTED — receipt photo upload disabled
              <div className="lg:col-span-2">
                <FileUpload
                  title="Fees Receipt Photo"
                  imageUrl={receiptPhoto.imageUrl}
                  error={receiptPhoto.error}
                  loader={receiptPhoto.loader}
                  isSaved={receiptPhoto.isSaved}
                  imageType="receipt"
                  onFileUpload={receiptPhoto.handleFileUpload}
                  onUploadImage={handleReceiptPhotoUpload}
                  onRemovePhoto={receiptPhoto.removePhoto}
                />
              </div>
              */}

              {/* Book proof — only when this payment clears the fees */}
              {clearsFees && (
                <div className="lg:col-span-2" {...errAttr("bookPhoto")}>
                  <FileUpload
                    title="Book Distribution Proof"
                    imageUrl={bookPhoto.imageUrl}
                    error={bookPhoto.error}
                    loader={bookPhoto.loader}
                    isSaved={bookPhoto.isSaved}
                    imageType="books"
                    onFileUpload={bookPhoto.handleFileUpload}
                    onUploadImage={handleBookPhotoUpload}
                    onRemovePhoto={bookPhoto.removePhoto}
                  />
                  <FieldError msg={errors.bookPhoto} />
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
            <button
              type="button"
              onClick={() => setShowPayment(false)}
              disabled={submitLoader}
              className="w-full sm:w-1/3 py-3 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white rounded transition text-sm sm:text-base"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitLoader}
              className="w-full py-3 bg-primary disabled:opacity-50 grid place-items-center text-white rounded hover:bg-opacity-90 transition text-sm sm:text-base"
            >
              {submitLoader ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                "Submit Payment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
