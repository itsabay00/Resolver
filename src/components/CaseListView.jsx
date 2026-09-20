import { useState } from "react";
import { ChevronRight, Loader2, FolderPlus, Share2, Clock, FolderCheck, Inbox } from "lucide-react";
import { colors } from "../lib/colors.js";
import { truncate } from "../lib/kb.js";
import { Card, IconPill, OutlinePill, PrimaryButton, ErrorBanner, EmptyState } from "./ui.jsx";

const STATUS_ICON = {
  New: FolderPlus,
  Transferred: Share2,
  "Waiting for Customer": Clock,
  Closed: FolderCheck,
};

function NewCaseForm({ onCreate, kbCount, onGoToKb }) {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await onCreate(message.trim(), context.trim());
      setMessage("");
      setContext("");
    } catch (err) {
      setError(err.message || "Couldn't start that case. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <label className="block text-sm font-medium mb-2" style={{ color: colors.black }}>New case</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Paste what the customer wrote…"
        className="w-full rounded-xl p-3 text-sm resize-none rsv-input"
      />
      <input
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Extra context (optional) — order number, account type…"
        className="w-full rounded-xl p-3 text-sm rsv-input mt-3"
      />
      {error && <ErrorBanner message={error} className="mt-3" />}
      {kbCount === 0 && (
        <p className="text-xs mt-3" style={{ color: colors.gray }}>
          Tip: add a few entries to your{" "}
          <button onClick={onGoToKb} className="underline font-medium" style={{ color: colors.gray }}>
            knowledge base
          </button>{" "}
          so replies can reference your policies.
        </p>
      )}
      <div className="flex justify-end mt-4">
        <PrimaryButton onClick={handleSubmit} disabled={!message.trim() || submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Starting…
            </>
          ) : (
            <>Start case →</>
          )}
        </PrimaryButton>
      </div>
    </Card>
  );
}

export function CaseCard({ item, selected, onClick }) {
  const Icon = STATUS_ICON[item.status] || FolderPlus;
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 rsv-history-item"
      style={{
        backgroundColor: colors.white,
        border: selected ? `1px solid ${colors.black}` : "1px solid transparent",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-sm font-medium" style={{ color: colors.ink }}>
          {truncate(item.message, 72)}
        </span>
        <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color: colors.gray }} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <IconPill icon={Icon} label={item.status} />
        {item.category && <OutlinePill label={item.category} />}
        {item.urgency && <OutlinePill label={`${item.urgency} urgency`} />}
      </div>
    </button>
  );
}

export default function CaseListView({ cases, statusFilter, selectedCaseId, onSelectCase, onCreateCase, kbCount, onGoToKb }) {
  const filtered = statusFilter ? cases.filter((c) => c.status === statusFilter) : cases;

  return (
    <div className="flex flex-col gap-6">
      <NewCaseForm onCreate={onCreateCase} kbCount={kbCount} onGoToKb={onGoToKb} />

      <div>
        <p className="text-xs font-medium mb-3" style={{ color: colors.gray }}>
          {statusFilter ? statusFilter : "All cases"}
        </p>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No cases here yet"
            description={statusFilter ? `Nothing marked "${statusFilter}" yet.` : "Start one above to see it here."}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((c) => (
              <CaseCard key={c.id} item={c} selected={c.id === selectedCaseId} onClick={() => onSelectCase(c.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
