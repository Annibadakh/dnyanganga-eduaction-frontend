import { useState, useEffect, useCallback } from "react";
import api from "../../Api";
import { useToast } from "../../useToast";
import Button from "../Generic/Button";
import { Save, Landmark } from "lucide-react";

const labelCls = "block mb-2 text-sm font-medium text-customblack";
const inputCls = "w-full p-2 border border-gray-300 rounded";

const emptyBankForm = {
  accountName: "",
  accountNum: "",
  ifscCode: "",
  accountType: "",
  bankName: "",
  branchName: "",
};

function GSTReceiptManagement() {
  const { successToast } = useToast();

  const [bankForm, setBankForm] = useState(emptyBankForm);
  const [bankLoader, setBankLoader] = useState(false);
  const [bankError, setBankError] = useState(null);

  const fetchBankDetail = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/receipt/bank");
      if (data?.data) {
        setBankForm({
          accountName: data.data.accountName || "",
          accountNum: data.data.accountNum || "",
          ifscCode: data.data.ifscCode || "",
          accountType: data.data.accountType || "",
          bankName: data.data.bankName || "",
          branchName: data.data.branchName || "",
        });
      }
    } catch {
      // leave form empty if nothing configured yet
    }
  }, []);

  useEffect(() => {
    fetchBankDetail();
  }, [fetchBankDetail]);

  // ---- Bank save ----
  const handleBankSave = async (e) => {
    e.preventDefault();
    setBankLoader(true);
    setBankError(null);
    try {
      await api.put("/admin/receipt/bank", bankForm);
      successToast("Bank details saved successfully");
      fetchBankDetail();
    } catch (err) {
      setBankError(err.response?.data?.message || "Failed to save bank details");
    } finally {
      setBankLoader(false);
    }
  };

  return (
    <div className="container mx-auto p-2">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Landmark size={24} className="text-primary" />
        <h1 className="text-3xl font-bold text-center text-primary">
          Bank Details
        </h1>
      </div>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Global bank account shown on every GST payment receipt (common for all
        standards). Receipt bills are configured per-standard under its
        Standard &amp; Subject page.
      </p>

      <div className="bg-white md:p-6 p-3 rounded shadow-custom max-w-2xl mx-auto">
        {bankError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {bankError}
          </div>
        )}
        <form onSubmit={handleBankSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Account Holder Name*</label>
            <input
              type="text"
              value={bankForm.accountName}
              onChange={(e) =>
                setBankForm({ ...bankForm, accountName: e.target.value })
              }
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Account Number*</label>
            <input
              type="text"
              value={bankForm.accountNum}
              onChange={(e) =>
                setBankForm({ ...bankForm, accountNum: e.target.value })
              }
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>IFSC Code*</label>
            <input
              type="text"
              value={bankForm.ifscCode}
              onChange={(e) =>
                setBankForm({ ...bankForm, ifscCode: e.target.value })
              }
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Account Type</label>
            <input
              type="text"
              value={bankForm.accountType}
              onChange={(e) =>
                setBankForm({ ...bankForm, accountType: e.target.value })
              }
              className={inputCls}
              placeholder="e.g. Corporate"
            />
          </div>
          <div>
            <label className={labelCls}>Bank Name*</label>
            <input
              type="text"
              value={bankForm.bankName}
              onChange={(e) =>
                setBankForm({ ...bankForm, bankName: e.target.value })
              }
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Branch Name*</label>
            <input
              type="text"
              value={bankForm.branchName}
              onChange={(e) =>
                setBankForm({ ...bankForm, branchName: e.target.value })
              }
              className={inputCls}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              type="submit"
              variant="primary"
              loading={bankLoader}
              startIcon={<Save size={16} />}
            >
              Save Bank Details
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GSTReceiptManagement;