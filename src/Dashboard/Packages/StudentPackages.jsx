import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import api from "../../Api";
import { apiMessage } from "./packageUtils";

// Book packages given to one student (one card per package), with the challans that
// brought each package to the counsellor. Used in the registration table's book proof view.
const formatDate = (value) => (value ? new Date(value).toLocaleDateString("en-GB") : "-");

const StudentPackages = ({ studentId }) => {
  const [packages, setPackages] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    setPackages(null);
    setError("");
    api
      .get(`/packages/student/${studentId}`)
      .then((r) => setPackages(r.data.packages || []))
      .catch((e) => setError(apiMessage(e, "Couldn't load the book packages")));
  }, [studentId]);

  return (
    <div>
      <h3 className="text-base font-semibold text-primary mb-2 flex items-center gap-2">
        <Package size={18} /> Book Packages{packages ? ` (${packages.length})` : ""}
      </h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && packages === null && <p className="text-sm text-gray-500">Loading...</p>}
      {packages?.length === 0 && <p className="text-sm text-gray-500">No book package given to this student.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {packages?.map((p) => (
          <div key={p.id} className="border rounded-lg p-3 bg-white text-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-mono font-semibold">{p.displayCode}</span>
              <span className="bg-blue-50 text-primary border border-blue-200 rounded-full px-2 py-0.5 text-xs font-semibold">
                {p.label}
              </span>
            </div>
            <p className="text-gray-600">
              Given on: <span className="text-gray-800">{formatDate(p.distributedAt)}</span>
            </p>
            {p.distributedByName && (
              <p className="text-gray-600">
                Given by: <span className="text-gray-800">{p.distributedByName}</span>
              </p>
            )}
            {p.holderName && (
              <p className="text-gray-600">
                From stock of: <span className="text-gray-800">{p.holderName}</span>
              </p>
            )}
            {p.challans?.length > 0 && (
              <div className="mt-2 border-t pt-2">
                <p className="text-xs font-medium text-gray-500 mb-1">Received through challan</p>
                {p.challans.map((c) => (
                  <p key={c.challanNo} className="text-xs text-gray-700">
                    <span className="font-semibold">{c.challanNo}</span> · {c.from} → {c.to} · delivered {formatDate(c.deliveredAt)}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentPackages;
