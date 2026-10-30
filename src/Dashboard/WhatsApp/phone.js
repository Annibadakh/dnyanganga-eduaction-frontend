// A phone number must be exactly 10 digits, nothing else.
// Same rule as normalizePhone in Backend/controllers/jobController.js — keep them in step,
// or the backend skips rows the page counted and the job is refused.
export const normalizePhone = (raw) => {
  const value = String(raw ?? "").trim();
  return /^\d{10}$/.test(value) ? value : null;
};

// Problem with each row's phone: "" (fine), "Missing", "Invalid number" or "Duplicate"
// (the same number appears in an earlier row).
export const phoneProblems = (rows, phoneField) => {
  const seen = new Set();
  return rows.map((row) => {
    const raw = row[phoneField];
    if (raw === undefined || raw === null || String(raw).trim() === "") return "Missing";
    const phone = normalizePhone(raw);
    if (!phone) return "Invalid number";
    if (seen.has(phone)) return "Duplicate";
    seen.add(phone);
    return "";
  });
};
