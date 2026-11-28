import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { ScanLine, Trash2 } from "lucide-react";
import api from "../../Api";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../useToast";
import Button from "../Generic/Button";
import FileUpload from "../FileUpload/FileUpload";
import { FileUploadHook } from "../FileUpload/FileUploadHook";
import QrScanner from "./QrScanner";
import { apiMessage, codeOfScan, formatCode, loadPackageStandards, normalizeCode, todayISO } from "./packageUtils";

// Create / edit a delivery challan in two steps:
//   1. challan details (receiver, date, manual no, remarks, pamphlets, sender receipt)
//   2. scan the package stickers (camera) or type the code (fallback)
// Head office (admin / logistics) scans new stickers; a sub-admin scans packages from own stock.
const inputClass =
  "w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const ChallanForm = () => {
  const { id } = useParams(); // edit when set
  const navigate = useNavigate();
  const { user } = useAuth();
  const { successToast, errorToast } = useToast();
  const isHeadOffice = ["admin", "logistics"].includes(user?.role);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [receivers, setReceivers] = useState([]);
  const [standards, setStandards] = useState([]);
  const [myPamphlets, setMyPamphlets] = useState(null); // sub-admin: pamphlets in stock

  const [details, setDetails] = useState({
    toUserId: "",
    challanDate: todayISO(),
    manualChallanNo: "",
    remarks: "",
    pamphletCount: "",
    senderReceiptUrl: "",
  });
  const [originalPamphlets, setOriginalPamphlets] = useState(0);
  const senderReceipt = FileUploadHook();

  // scanned packages: [{ code, standardId, branch, label, standardName }]
  const [packages, setPackages] = useState([]);
  const codesRef = useRef(new Set()); // added + being checked (avoids double adds while scanning fast)
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState({ code: "", standardId: "", branch: "" });
  const [checking, setChecking] = useState(false);

  const setField = (name, value) => setDetails((p) => ({ ...p, [name]: value }));

  useEffect(() => {
    api
      .get("/packages/receivers")
      .then((r) => setReceivers(r.data.users || []))
      .catch((e) => errorToast(apiMessage(e, "Couldn't load counsellors")));
    if (isHeadOffice) loadPackageStandards().then(setStandards).catch(() => setStandards([]));
    else
      api
        .get("/packages/stock")
        .then((r) => setMyPamphlets(r.data.pamphlets?.inStock ?? 0))
        .catch(() => setMyPamphlets(null));
  }, [isHeadOffice, errorToast]);

  // Edit: load the challan
  useEffect(() => {
    if (!id) return;
    api
      .get(`/packages/challans/${id}`)
      .then((r) => {
        const c = r.data.challan;
        if (c.status !== "DISPATCHED" || !c.canManage) {
          errorToast("Only a dispatched challan can be edited by its sender");
          navigate("/dashboard/chalan");
          return;
        }
        setDetails({
          toUserId: c.toUserId,
          challanDate: c.challanDate,
          manualChallanNo: c.manualChallanNo || "",
          remarks: c.remarks || "",
          pamphletCount: c.pamphletCount ? String(c.pamphletCount) : "",
          senderReceiptUrl: c.senderReceiptUrl || "",
        });
        setOriginalPamphlets(c.pamphletCount || 0);
        const list = (r.data.packages || []).map((p) => ({
          code: p.code,
          standardId: p.standardId,
          branch: p.branch,
          label: p.label,
          standardName: p.standardName,
        }));
        codesRef.current = new Set(list.map((p) => p.code));
        setPackages(list);
      })
      .catch((e) => {
        errorToast(apiMessage(e, "Couldn't load the challan"));
        navigate("/dashboard/chalan");
      })
      .finally(() => setLoading(false));
  }, [id, navigate, errorToast]);

  const receiverOptions = useMemo(
    () =>
      receivers.map((u) => ({
        value: u.uuid,
        label: `${u.name}${u.role === "sub-admin" ? " (Sub-admin)" : ""}${u.counsellorBranch ? ` - ${u.counsellorBranch}` : ""}`,
      })),
    [receivers],
  );

  const goToScan = () => {
    if (!details.toUserId) return errorToast("Select the receiver");
    if (!details.challanDate) return errorToast("Select the challan date");
    const p = details.pamphletCount === "" ? 0 : Number(details.pamphletCount);
    if (!Number.isInteger(p) || p < 0) return errorToast("Pamphlets must be 0 or more");
    if (!isHeadOffice && myPamphlets !== null && p > myPamphlets + originalPamphlets) {
      return errorToast(`You have only ${myPamphlets + originalPamphlets} pamphlet(s) in stock`);
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  // Check one package with the server, then add it to the list.
  // Returns { ok, message }; fromScanner: the scanner shows the message (no toast behind it).
  const addPackage = async (body, code, fromScanner = false) => {
    const fail = (message) => {
      if (!fromScanner) errorToast(message);
      return { ok: false, message };
    };
    if (!code) return fail(fromScanner ? "Not a package QR. Scan the sticker on the package" : "Enter the package code");
    if (codesRef.current.has(code)) return fail(`${formatCode(code)} is already in this challan`);
    codesRef.current.add(code);
    setChecking(true);
    try {
      const r = await api.post("/packages/check-challan", { ...body, challanId: id || undefined });
      const p = r.data.package;
      setPackages((list) => [
        { code: p.code, standardId: p.standardId, branch: p.branch, label: p.label, standardName: p.standardName },
        ...list,
      ]);
      const message = `✓ Added ${formatCode(p.code)} (${p.label}). Scan the next package`;
      if (!fromScanner) successToast(`Added ${formatCode(p.code)} (${p.label})`);
      return { ok: true, message };
    } catch (err) {
      codesRef.current.delete(code);
      return fail(`✗ ${apiMessage(err, "Couldn't add the package")}`);
    } finally {
      setChecking(false);
    }
  };

  const onScan = (text) => addPackage({ scan: text }, codeOfScan(text), true);

  const addManual = async (e) => {
    e.preventDefault();
    const code = normalizeCode(manual.code);
    if (code.length !== 12) return errorToast("The code has 12 characters (XXXX-XXXX-XXXX)");
    const ok = await addPackage(
      isHeadOffice ? { code, standardId: manual.standardId, branch: manual.branch } : { code },
      code,
    );
    if (ok.ok) setManual((m) => ({ ...m, code: "" }));
  };

  const removePackage = (code) => {
    codesRef.current.delete(code);
    setPackages((list) => list.filter((p) => p.code !== code));
  };

  // counts per standard + Med/Grp
  const summary = useMemo(() => {
    const m = new Map();
    packages.forEach((p) => m.set(p.label, (m.get(p.label) || 0) + 1));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [packages]);

  const submit = async () => {
    const pamphletCount = details.pamphletCount === "" ? 0 : Number(details.pamphletCount);
    if (!packages.length && !pamphletCount) return errorToast("Scan at least one package or add pamphlets");
    setSaving(true);
    try {
      const body = {
        ...details,
        pamphletCount,
        packages: packages.map((p) => ({ code: p.code, standardId: p.standardId, branch: p.branch })),
      };
      const r = id ? await api.put(`/packages/challans/${id}`, body) : await api.post("/packages/challans", body);
      successToast(r.data.message);
      navigate("/dashboard/chalan");
    } catch (err) {
      errorToast(apiMessage(err, "Couldn't save the challan"));
    } finally {
      setSaving(false);
    }
  };

  const manualStandard = standards.find((s) => String(s.id) === String(manual.standardId));
  const receiverName = receiverOptions.find((o) => o.value === details.toUserId)?.label;

  if (loading) return <p className="text-center text-gray-500 py-10">Loading...</p>;

  return (
    <div className="p-1 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-2">{id ? "Edit Challan" : "Create Challan"}</h1>
      <p className="text-center text-sm text-gray-600 mb-6">
        Step {step} of 2 — {step === 1 ? "Challan details" : "Scan packages"}
      </p>

      {step === 1 && (
        <div className="bg-white shadow-lg rounded-lg md:p-6 p-3 mb-6 border max-w-2xl mx-auto space-y-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Send To</label>
            <Select
              options={receiverOptions}
              value={receiverOptions.find((o) => o.value === details.toUserId) || null}
              onChange={(o) => setField("toUserId", o?.value || "")}
              placeholder={isHeadOffice ? "Search counsellor / sub-admin" : "Search your counsellor"}
              isSearchable
              noOptionsMessage={() => "No one found"}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">Challan Date</label>
            <input type="date" value={details.challanDate} onChange={(e) => setField("challanDate", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Manual Challan No. <span className="text-gray-400 font-normal text-sm">(optional)</span>
            </label>
            <input
              type="text"
              maxLength={50}
              placeholder="Physical / manual challan number"
              value={details.manualChallanNo}
              onChange={(e) => setField("manualChallanNo", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Remarks <span className="text-gray-400 font-normal text-sm">(optional)</span>
            </label>
            <input
              type="text"
              maxLength={255}
              placeholder="e.g. sent by courier / by hand"
              value={details.remarks}
              onChange={(e) => setField("remarks", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Pamphlets <span className="text-gray-400 font-normal text-sm">(optional)</span>
            </label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={details.pamphletCount}
              onChange={(e) => setField("pamphletCount", e.target.value)}
              className={inputClass}
            />
            {!isHeadOffice && myPamphlets !== null && (
              <p className="text-xs text-gray-500 mt-1">In your stock: {myPamphlets + originalPamphlets}</p>
            )}
          </div>
          <FileUpload
            title="Sender Receipt (optional)"
            imageUrl={senderReceipt.imageUrl}
            error={senderReceipt.error}
            loader={senderReceipt.loader}
            isSaved={senderReceipt.isSaved}
            imageType="challan"
            onFileUpload={senderReceipt.handleFileUpload}
            onUploadImage={async (type) => {
              const url = await senderReceipt.uploadImage(type);
              if (url) setField("senderReceiptUrl", url);
            }}
            onRemovePhoto={() => {
              senderReceipt.removePhoto();
              setField("senderReceiptUrl", "");
            }}
          />
          {id && details.senderReceiptUrl && !senderReceipt.imageUrl && (
            <p className="text-xs text-green-700">A sender receipt is already saved. Upload a new one to replace it.</p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/dashboard/chalan")} fullWidth>
              Cancel
            </Button>
            <Button onClick={goToScan} fullWidth>
              Next: Scan Packages
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-white shadow-lg rounded-lg md:p-6 p-3 border">
            <p className="text-sm text-gray-600">
              To: <span className="font-semibold text-gray-800">{receiverName}</span> · Date {details.challanDate}
              {Number(details.pamphletCount) > 0 && ` · Pamphlets ${details.pamphletCount}`}
            </p>
            <Button className="mt-3 py-3 text-lg" fullWidth onClick={() => setScanning(true)} startIcon={<ScanLine size={22} />}>
              Scan Package QR
            </Button>

            <form onSubmit={addManual} className="mt-4 border-t pt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Sticker not scanning? Type the code</p>
              {isHeadOffice && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={manual.standardId}
                    onChange={(e) => setManual((m) => ({ ...m, standardId: e.target.value, branch: "" }))}
                    className={inputClass}
                  >
                    <option value="">Standard</option>
                    {standards.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.normalizeName} ({s.name})
                      </option>
                    ))}
                  </select>
                  {manualStandard?.packageType === "BRANCH" ? (
                    <select value={manual.branch} onChange={(e) => setManual((m) => ({ ...m, branch: e.target.value }))} className={inputClass}>
                      <option value="">Med/Grp</option>
                      {manualStandard.branches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 text-sm text-gray-500">{manualStandard ? "Common package" : ""}</div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manual.code}
                  onChange={(e) => setManual((m) => ({ ...m, code: e.target.value.toUpperCase() }))}
                  placeholder="XXXX-XXXX-XXXX"
                  maxLength={16}
                  autoCapitalize="characters"
                  className={`${inputClass} font-mono tracking-wider`}
                />
                <Button type="submit" loading={checking} className="shrink-0">
                  Add
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-white shadow-lg rounded-lg md:p-6 p-3 border">
            <h2 className="text-lg font-semibold text-primary mb-2">Packages ({packages.length})</h2>
            {summary.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {summary.map(([label, n]) => (
                  <span key={label} className="bg-blue-50 text-primary border border-blue-200 rounded-full px-3 py-1 text-sm">
                    {label}: <b>{n}</b>
                  </span>
                ))}
              </div>
            )}
            {packages.length === 0 && <p className="text-sm text-gray-500">No packages scanned yet.</p>}
            <ul className="divide-y max-h-[45vh] overflow-y-auto">
              {packages.map((p) => (
                <li key={p.code} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-mono font-semibold">{formatCode(p.code)}</p>
                    <p className="text-xs text-gray-500">{p.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePackage(p.code)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    aria-label={`Remove ${formatCode(p.code)}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 pb-6">
            <Button variant="outline" onClick={() => setStep(1)} fullWidth>
              Back
            </Button>
            <Button variant="success" onClick={submit} loading={saving} fullWidth>
              {id ? "Save Challan" : "Dispatch Challan"}
            </Button>
          </div>
        </div>
      )}

      {scanning && <QrScanner continuous onScan={onScan} count={packages.length} onClose={() => setScanning(false)} title="Scan packages" />}
    </div>
  );
};

export default ChallanForm;
