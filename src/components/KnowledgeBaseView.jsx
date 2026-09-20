import { useState } from "react";
import { MagnifyingGlass, Plus, PencilSimple, Trash, Book } from "@phosphor-icons/react";
import { colors } from "../lib/colors.js";
import { truncate } from "../lib/kb.js";
import { Card, EmptyState, IconButton, PrimaryButton, GhostButton } from "./ui.jsx";

function KbEntryForm({ initialTitle, initialContent, onSave, onCancel, saveLabel = "Save entry" }) {
  const [title, setTitle] = useState(initialTitle || "");
  const [content, setContent] = useState(initialContent || "");
  const canSave = title.trim() && content.trim();

  return (
    <Card className="p-6 sm:p-8">
      <label className="block text-sm font-medium mb-2" style={{ color: colors.black }}>Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Refund policy for digital goods"
        className="w-full rounded-lg p-3 text-sm rsv-input mb-4"
      />
      <label className="block text-sm font-medium mb-2" style={{ color: colors.black }}>Answer or policy</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        placeholder="What should the advisor say or do?"
        className="w-full rounded-lg p-3 text-sm resize-none rsv-input"
      />
      <div className="flex justify-end gap-2 mt-4">
        <GhostButton onClick={onCancel}>Cancel</GhostButton>
        <PrimaryButton onClick={() => canSave && onSave({ title: title.trim(), content: content.trim() })} disabled={!canSave}>
          {saveLabel}
        </PrimaryButton>
      </div>
    </Card>
  );
}

export default function KnowledgeBaseView({ kb, onUpdateKb }) {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const editingEntry = editingId ? kb.find((e) => e.id === editingId) : null;
  const filtered = kb.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q);
  });

  function openNew() {
    setEditingId(null);
    setFormOpen(true);
  }
  function startEdit(id) {
    setEditingId(id);
    setFormOpen(true);
  }
  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
  }
  function handleSave(data) {
    if (editingId) {
      onUpdateKb(kb.map((e) => (e.id === editingId ? { ...e, ...data } : e)));
    } else {
      onUpdateKb([{ id: `kb-${Date.now()}`, ...data, createdAt: new Date().toISOString() }, ...kb]);
    }
    closeForm();
  }
  function handleDelete(id) {
    onUpdateKb(kb.filter((e) => e.id !== id));
  }

  return (
    <div>
      <h2 className="text-base font-medium mb-4" style={{ color: colors.black }}>Knowledge base</h2>

      {formOpen ? (
        <KbEntryForm
          initialTitle={editingEntry ? editingEntry.title : ""}
          initialContent={editingEntry ? editingEntry.content : ""}
          onCancel={closeForm}
          onSave={handleSave}
          saveLabel={editingEntry ? "Save changes" : "Add entry"}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <MagnifyingGlass className="w-4 h-4" style={{ color: colors.gray }} />
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entries…"
                className="w-full rounded-full pl-11 pr-4 py-3 text-sm rsv-input"
              />
            </div>
            <PrimaryButton onClick={openNew} className="whitespace-nowrap">
              <Plus className="w-4 h-4" /> New entry
            </PrimaryButton>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Book}
              title={kb.length === 0 ? "No entries yet" : "No matches"}
              description={kb.length === 0 ? "Add your first FAQ or policy so drafts can reference it." : "Try a different search term."}
              action={kb.length === 0 ? { label: "Add entry", onClick: openNew } : null}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((entry) => (
                <Card key={entry.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium" style={{ color: colors.black }}>{entry.title}</h3>
                      <p className="text-sm mt-1" style={{ color: colors.gray }}>{truncate(entry.content, 140)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <IconButton onClick={() => startEdit(entry.id)}>
                        <PencilSimple className="w-4 h-4" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(entry.id)}>
                        <Trash className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
