import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ScanLine } from "lucide-react";
import api from "../../Api";
import QrScanner from "./QrScanner";
import { apiMessage, codeOfScan, formatCode, normalizeCode } from "./packageUtils";

// Book package step of registration / payment / admin edit, shown when the fees get cleared.
// Asks the server which package the student needs (own standard, package flow students only);
// nothing is shown when no package is needed. The scanned (or typed) code is checked against
// the counsellor's stock before it is accepted.
//
//   active        — fees cleared with this submit
//   studentId     — existing student (payment / edit)
//   standardId, branch — registration (or the new standard / Med/Grp on edit)
//   value / onChange(code) — accepted package code ("" = none yet)
//   onRequiredChange(bool) — parent blocks submit while required && !value
const PackageScanField = ({ active, studentId, standardId, branch, value, onChange, onRequiredChange }) => {
  const [required, setRequired] = useState(null); // { label } | null
  const [given, setGiven] = useState(null);
  const [error, setError] = useState("");
  const [typed, setTyped] = useState("");
  const [checking, setChecking] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [accepted, setAccepted] = useState(null); // package from the check
  const reqKey = useRef("");

  // Which package (if any) is needed
  useEffect(() => {
    const key = active ? `${studentId || ""}|${standardId || ""}|${branch || ""}` : "";
    if (key === reqKey.current) return;
    reqKey.current = key;
    setError("");
    setAccepted(null);
    onChange("");
    if (!active || (!studentId && (!standardId || !branch))) {
      setRequired(null);
      setGiven(null);
      onRequiredChange(false);
      return;
    }
    api
      .post("/packages/requirement", { studentId, standardId, branch })
      .then((r) => {
        setRequired(r.data.required);
        setGiven(r.data.given);
        onRequiredChange(!!r.data.required);
      })
      .catch((e) => {
        setRequired(null);
        onRequiredChange(false);
        setError(apiMessage(e, "Couldn't check the book package"));
      });
    // onChange / onRequiredChange are parent setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, studentId, standardId, branch]);

  const check = async (input) => {
    const code = codeOfScan(input);
    if (code.length !== 12) {
      setError("The code has 12 characters (XXXX-XXXX-XXXX)");
      return;
    }
    setChecking(true);
    setError("");
    try {
      const r = await api.post("/packages/check-distribute", { code, studentId, standardId, branch });
      setAccepted(r.data.package);
      onChange(code);
      setTyped("");
    } catch (e) {
      setAccepted(null);
      onChange("");
      setError(apiMessage(e, "This package can't be given"));
    } finally {
      setChecking(false);
    }
  };

  if (!active) return null;
  if (given) {
    return <p className="text-sm text-green-700">Book package already given: {given.label} ({formatCode(given.code)})</p>;
  }
  if (!required) return error ? <p className="text-sm text-red-600">{error}</p> : null;

  return (
    <div className="border-2 border-dashed border-primary/40 rounded-lg p-3 space-y-3 bg-blue-50/40">
      <div>
        <p className="font-semibold text-gray-800">
          Book Package <span className="text-red-500">*</span>
        </p>
        <p className="text-sm text-gray-600">
          Scan the sticker of a <b>{required.label}</b> package from your stock.
        </p>
      </div>

      {value && accepted ? (
        <div className="flex items-center justify-between gap-2 bg-green-50 border border-green-300 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle2 size={22} />
            <div>
              <p className="font-mono font-semibold">{formatCode(value)}</p>
              <p className="text-xs">{accepted.label}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setAccepted(null);
              onChange("");
            }}
            className="text-sm text-red-600 underline"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setScanning(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-lg py-3 font-medium hover:bg-blue-700"
          >
            <ScanLine size={20} /> Scan Package QR
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value.toUpperCase())}
              placeholder="or type code XXXX-XXXX-XXXX"
              maxLength={16}
              autoCapitalize="characters"
              className="w-full p-2 border border-gray-300 rounded-lg font-mono tracking-wider text-sm"
            />
            <button
              type="button"
              disabled={checking || !normalizeCode(typed)}
              onClick={() => check(typed)}
              className="shrink-0 bg-gray-700 text-white px-4 rounded-lg disabled:opacity-50"
            >
              {checking ? "..." : "Check"}
            </button>
          </div>
        </>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {scanning && <QrScanner onScan={check} onClose={() => setScanning(false)} title="Scan book package" />}
    </div>
  );
};

export default PackageScanField;
