import { useState } from "react";
import { CaretRight, CircleNotch, FolderPlus, Share, Folder, FolderUser, Tray, MagicWand } from "@phosphor-icons/react";
import { colors } from "../lib/colors.js";
import { truncate } from "../lib/kb.js";
import { Card, IconPill, OutlinePill, PrimaryButton, Banner, EmptyState } from "./ui.jsx";

const STATUS_ICON = {
  New: FolderPlus,
  Transferred: Share,
  Closed: Folder,
  "Waiting for Customer": FolderUser,
};

function GetNextCaseCard({ onGetNextCase }) {
  const [searching, setSearching] = useState(false);

  async function handleClick() {
    setSearching(true);
    await onGetNextCase();
    setSearching(false);
  }

  return (
    <Card className="p-5 sm:p-6 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium" style={{ color: colors.black }}>Get the next case</p>
        <p className="text-xs mt-1" style={{ color: colors.gray }}>
          Pulls the next case waiting to be worked. The assistant starts preparing a response right away.
        </p>
      </div>
      <PrimaryButton onClick={handleClick} disabled={searching} className="shrink-0">
        {searching ? (
          <>
            <CircleNotch className="w-4 h-4 animate-spin" /> Finding…
          </>
        ) : (
          <>
            <MagicWand className="w-4 h-4" /> Get next case
          </>
        )}
      </PrimaryButton>
    </Card>
  );
}

export function NewCaseForm({ onCreate, kbCount, onGoToKb, autoFocus }) {
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
      <label className="block text-sm font-medium mb-2" style={{ color: colors.black }}>Paste a case manually</label>
      <textarea
        autoFocus={autoFocus}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Paste what the customer wrote…"
        className="w-full rounded-lg p-3 text-sm resize-none rsv-input"
      />
      <input
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Extra context (optional) — order number, account type…"
        className="w-full rounded-lg p-3 text-sm rsv-input mt-3"
      />
      {error && <Banner kind="error" message={error} className="mt-3" />}
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
              <CircleNotch className="w-4 h-4 animate-spin" /> Starting…
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
      className="w-full text-left rounded-lg p-4 rsv-history-item"
      style={{ backgroundColor: colors.white, border: `1px solid ${selected ? colors.black : colors.border}` }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-sm font-normal" style={{ color: colors.ink }}>
          {truncate(item.message, 72)}
        </span>
        <CaretRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color: colors.gray }} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <IconPill icon={Icon} label={item.status} />
        {item.category && <OutlinePill label={item.category} />}
        {item.urgency && <OutlinePill label={`${item.urgency} urgency`} />}
      </div>
    </button>
  );
}

export default function CaseListView({ cases, statusFilter, selectedCaseId, onSelectCase, onGetNextCase, onCreateCase, kbCount, onGoToKb, focusForm }) {
  const [showManual, setShowManual] = useState(false);
  const filtered = statusFilter ? cases.filter((c) => c.status === statusFilter) : cases;

  return (
    <div className="flex flex-col gap-6">
      <GetNextCaseCard onGetNextCase={onGetNextCase} />

      {showManual ? (
        <NewCaseForm onCreate={onCreateCase} kbCount={kbCount} onGoToKb={onGoToKb} autoFocus={focusForm} />
      ) : (
        <button onClick={() => setShowManual(true)} className="text-xs font-medium underline self-start" style={{ color: colors.gray }}>
          Or paste a specific case manually
        </button>
      )}

      <div>
        <p className="text-xs font-medium mb-3" style={{ color: colors.gray }}>
          {statusFilter ? statusFilter : "All cases"}
        </p>
        {filtered.length === 0 ? (
          <EmptyState icon={Tray} title="No cases here yet" description={statusFilter ? `Nothing marked "${statusFilter}" yet.` : "Get the next case above to see it here."} />
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

