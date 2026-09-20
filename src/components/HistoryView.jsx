import { useState } from "react";
import { Search, History as HistoryIcon } from "lucide-react";
import { colors } from "../lib/colors.js";
import { EmptyState } from "./ui.jsx";
import { CaseCard } from "./CaseListView.jsx";

export default function HistoryView({ cases, selectedCaseId, onSelectCase }) {
  const [search, setSearch] = useState("");

  const filtered = cases.filter((c) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return c.message.toLowerCase().includes(s) || (c.category || "").toLowerCase().includes(s) || (c.context || "").toLowerCase().includes(s);
  });

  return (
    <div>
      <h2 className="text-base font-semibold mb-4" style={{ color: colors.black }}>History</h2>

      <div className="relative mb-5">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4" style={{ color: colors.gray }} />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search every case…"
          className="w-full rounded-full pl-11 pr-4 py-3 text-sm rsv-input"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title={cases.length === 0 ? "No cases yet" : "No matches"}
          description={cases.length === 0 ? "Cases you start will show up here." : "Try a different search term."}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((c) => (
            <CaseCard key={c.id} item={c} selected={c.id === selectedCaseId} onClick={() => onSelectCase(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
