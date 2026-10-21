import { useState } from "react";
import { Lock, X } from "lucide-react";

// Chip input for a standard's groups / mediums.
//  - type a name and press Enter or comma (or leave the field) to add it
//  - duplicates (any letter case) are refused
//  - a group used by students or subjects is locked (no ×, hover shows the counts)
//    because removing or renaming it would break existing data
// value: string[]   usage: { [groupLower]: { students, subjects } }
const GroupChipsInput = ({ value = [], onChange, usage = {}, placeholder = "Type a group and press Enter", error }) => {
  const [draft, setDraft] = useState("");
  const [hint, setHint] = useState("");

  const usageOf = (g) => usage[String(g).trim().toLowerCase()] || { students: 0, subjects: 0 };
  const isLocked = (g) => {
    const u = usageOf(g);
    return u.students > 0 || u.subjects > 0;
  };

  const addDraft = () => {
    const name = draft.trim().replace(/,+$/, "").trim();
    if (!name) return;
    if (value.some((g) => g.toLowerCase() === name.toLowerCase())) {
      setHint(`"${name}" is already added`);
      return;
    }
    onChange([...value, name]);
    setDraft("");
    setHint("");
  };

  const remove = (g) => {
    if (isLocked(g)) return;
    onChange(value.filter((x) => x !== g));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addDraft();
    } else if (e.key === "Backspace" && !draft && value.length) {
      const last = value[value.length - 1];
      if (!isLocked(last)) remove(last);
    }
  };

  return (
    <div>
      <div
        className={`w-full min-h-[42px] p-1.5 border rounded bg-white flex flex-wrap items-center gap-1.5 focus-within:ring-2 ${
          error ? "border-red-500 focus-within:ring-red-300" : "border-gray-300 focus-within:ring-blue-300"
        }`}
      >
        {value.map((g) => {
          const u = usageOf(g);
          const locked = isLocked(g);
          return (
            <span
              key={g}
              title={
                locked
                  ? `${g} is used by ${u.students} student(s) and ${u.subjects} subject(s) — it can't be removed`
                  : undefined
              }
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs sm:text-sm ${
                locked ? "bg-blue-50 text-blue-800 border border-blue-200" : "bg-gray-100 text-gray-800 border border-gray-200"
              }`}
            >
              <span className="font-semibold">{g}</span>
              {locked ? (
                <Lock size={12} className="text-blue-500" />
              ) : (
                <button
                  type="button"
                  onClick={() => remove(g)}
                  className="text-gray-500 hover:text-red-600"
                  aria-label={`Remove ${g}`}
                >
                  <X size={13} />
                </button>
              )}
            </span>
          );
        })}
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setHint("");
          }}
          onKeyDown={handleKeyDown}
          onBlur={addDraft}
          placeholder={value.length ? "" : placeholder}
          className="flex-1 min-w-[120px] px-1 py-1 text-sm outline-none bg-transparent"
        />
      </div>
      {hint && <p className="text-amber-600 text-xs mt-1">{hint}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default GroupChipsInput;
