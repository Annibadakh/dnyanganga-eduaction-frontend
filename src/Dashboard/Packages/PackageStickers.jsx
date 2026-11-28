import { useEffect, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import api from "../../Api";
import { useToast } from "../../useToast";
import Button from "../Generic/Button";
import { apiMessage, loadPackageStandards } from "./packageUtils";

// Admin / logistics: print QR stickers for book packages — 20 per A4 page (4 x 5).
// Codes come from the server (unique, never stored); a code enters the system only when it
// is scanned into a challan.
const COLS = 4;
const ROWS = 5;
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 8;

const branchWord = (standard) => (standard?.branchType === "MEDIUM" ? "Medium" : "Group");

const buildStickerPdf = async ({ standard, branch, stickers }) => {
  // compress: keeps a 50-page sheet small enough to download on a phone
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
  const cellW = (PAGE_W - MARGIN * 2) / COLS;
  const cellH = (PAGE_H - MARGIN * 2) / ROWS;
  const qrSize = 30;
  const typeText =
    standard.packageType === "COMMON" ? "Common package" : `${branchWord(standard)} wise package`;

  for (let i = 0; i < stickers.length; i += 1) {
    const onPage = i % (COLS * ROWS);
    if (i > 0 && onPage === 0) pdf.addPage();
    const x = MARGIN + (onPage % COLS) * cellW;
    const y = MARGIN + Math.floor(onPage / COLS) * cellH;
    const cx = x + cellW / 2;

    // cut line
    pdf.setDrawColor(190);
    pdf.setLineWidth(0.2);
    pdf.rect(x, y, cellW, cellH);

    pdf.setTextColor(20);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(`Std: ${standard.normalizeName || standard.name}`, cx, y + 6, { align: "center" });
    pdf.setFontSize(10);
    pdf.text(branch ? `${branchWord(standard)}: ${branch}` : "All groups / mediums", cx, y + 11, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(typeText, cx, y + 15.5, { align: "center" });

    const qr = await QRCode.toDataURL(stickers[i].qr, { margin: 0, errorCorrectionLevel: "M", width: 240 });
    pdf.addImage(qr, "PNG", cx - qrSize / 2, y + 18, qrSize, qrSize, undefined, "FAST");

    pdf.setFont("courier", "bold");
    pdf.setFontSize(11);
    pdf.text(stickers[i].displayCode, cx, y + 18 + qrSize + 5, { align: "center" });
  }
  return pdf;
};

const PackageStickers = () => {
  const { successToast, errorToast } = useToast();
  const [standards, setStandards] = useState([]);
  const [standardId, setStandardId] = useState("");
  const [branch, setBranch] = useState("");
  const [sheets, setSheets] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadPackageStandards()
      .then(setStandards)
      .catch((e) => errorToast(apiMessage(e, "Couldn't load standards")));
  }, [errorToast]);

  const standard = standards.find((s) => String(s.id) === String(standardId));

  const generate = async (e) => {
    e.preventDefault();
    if (!standard) return errorToast("Select a standard");
    if (standard.packageType === "BRANCH" && !branch) return errorToast(`Select the ${branchWord(standard).toLowerCase()}`);
    const n = Number(sheets);
    if (!Number.isInteger(n) || n < 1 || n > 50) return errorToast("Sheets must be between 1 and 50");

    setBusy(true);
    try {
      const res = await api.post("/packages/codes", {
        standardId: standard.id,
        branch: standard.packageType === "BRANCH" ? branch : null,
        sheets: n,
      });
      const pdf = await buildStickerPdf({ standard: res.data.standard, branch: res.data.branch, stickers: res.data.stickers });
      const name = `stickers_${standard.normalizeName}_${res.data.branch || "common"}_${res.data.stickers[0].code}.pdf`;
      pdf.save(name.replace(/[^\w.-]+/g, "_"));
      successToast(`${res.data.stickers.length} stickers ready`);
    } catch (err) {
      errorToast(apiMessage(err, "Couldn't create the stickers"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-1 container mx-auto">
      <h1 className="text-3xl text-center font-bold text-primary mb-6">Package Stickers</h1>

      <form onSubmit={generate} className="bg-white shadow-lg rounded-lg md:p-6 p-3 mb-6 border max-w-xl mx-auto space-y-4">
        <p className="text-sm text-gray-600">
          Each A4 page has 20 QR stickers. Every sticker has a new unique code — print, stick one on each book
          package, then scan them while creating the challan.
        </p>

        <div>
          <label className="block mb-2 font-medium text-gray-700">Standard</label>
          <select
            value={standardId}
            onChange={(e) => {
              setStandardId(e.target.value);
              setBranch("");
            }}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select standard</option>
            {standards.map((s) => (
              <option key={s.id} value={s.id}>
                {s.normalizeName} ({s.name})
              </option>
            ))}
          </select>
          {standards.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              No standard has a book package yet. Set the package type in Standard management.
            </p>
          )}
        </div>

        {standard?.packageType === "BRANCH" && (
          <div>
            <label className="block mb-2 font-medium text-gray-700">{branchWord(standard)}</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select {branchWord(standard).toLowerCase()}</option>
              {standard.branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        )}
        {standard?.packageType === "COMMON" && (
          <p className="text-sm text-green-700">Common package: one package for every group / medium of {standard.name}.</p>
        )}

        <div>
          <label className="block mb-2 font-medium text-gray-700">Number of pages (20 stickers each)</label>
          <input
            type="number"
            min={1}
            max={50}
            value={sheets}
            onChange={(e) => setSheets(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">{(Number(sheets) || 0) * 20} stickers</p>
        </div>

        <Button type="submit" loading={busy} fullWidth>
          Download Sticker PDF
        </Button>
      </form>
    </div>
  );
};

export default PackageStickers;
