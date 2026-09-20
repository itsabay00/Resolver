import { useState } from "react";
import { Menu } from "lucide-react";
import { colors } from "./lib/colors.js";
import { loadJSON, saveJSON } from "./lib/storage.js";
import { getRelevantKb } from "./lib/kb.js";
import { callClaude, buildCaseSystemPrompt, buildOpeningUserMessage, parseOpening } from "./lib/api.js";
import Sidebar from "./components/Sidebar.jsx";
import GetStarted from "./components/GetStarted.jsx";
import CaseListView from "./components/CaseListView.jsx";
import HistoryView from "./components/HistoryView.jsx";
import KnowledgeBaseView from "./components/KnowledgeBaseView.jsx";
import SettingsView from "./components/SettingsView.jsx";
import ChatPanel from "./components/ChatPanel.jsx";

const KB_KEY = "resolve-kb-entries";
const CASES_KEY = "resolve-cases";

export default function App() {
  const [view, setView] = useState("getstarted");
  const [statusFilter, setStatusFilter] = useState(null);
  const [kb, setKb] = useState(() => loadJSON(KB_KEY, []));
  const [cases, setCases] = useState(() => loadJSON(CASES_KEY, []));
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  function updateKb(newKb) {
    setKb(newKb);
    saveJSON(KB_KEY, newKb);
  }

  function updateCases(newCases) {
    setCases(newCases);
    saveJSON(CASES_KEY, newCases);
  }

  async function handleCreateCase(message, context) {
    const relevant = getRelevantKb(message, context, kb, 10);
    const system = buildCaseSystemPrompt(message, context, relevant);
    const openingUserMessage = buildOpeningUserMessage();

    const raw = await callClaude({
      system,
      messages: [{ role: "user", content: openingUserMessage }],
      maxTokens: 1000,
    });
    const parsed = parseOpening(raw);

    const newCase = {
      id: `case-${Date.now()}`,
      message,
      context,
      category: parsed.category,
      urgency: parsed.urgency,
      sentiment: parsed.sentiment,
      status: "New",
      chat: [
        { role: "user", content: openingUserMessage, hidden: true },
        { role: "assistant", content: parsed.message },
      ],
      createdAt: new Date().toISOString(),
    };

    updateCases([newCase, ...cases]);
    setSelectedCaseId(newCase.id);
  }

  async function handleSendMessage(caseId, userText) {
    const current = cases.find((c) => c.id === caseId);
    if (!current) return;

    const relevant = getRelevantKb(current.message, current.context, kb, 10);
    const system = buildCaseSystemPrompt(current.message, current.context, relevant);
    const newMessages = [...current.chat, { role: "user", content: userText }];

    const raw = await callClaude({ system, messages: newMessages, maxTokens: 1000 });

    const updated = { ...current, chat: [...newMessages, { role: "assistant", content: raw }] };
    updateCases(cases.map((c) => (c.id === caseId ? updated : c)));
  }

  async function handleRefreshCase(caseId) {
    const current = cases.find((c) => c.id === caseId);
    if (!current) return;

    const relevant = getRelevantKb(current.message, current.context, kb, 10);
    const system = buildCaseSystemPrompt(current.message, current.context, relevant);
    const openingUserMessage = buildOpeningUserMessage();

    const raw = await callClaude({
      system,
      messages: [{ role: "user", content: openingUserMessage }],
      maxTokens: 1000,
    });
    const parsed = parseOpening(raw);

    const updated = {
      ...current,
      category: parsed.category,
      urgency: parsed.urgency,
      sentiment: parsed.sentiment,
      chat: [
        { role: "user", content: openingUserMessage, hidden: true },
        { role: "assistant", content: parsed.message },
      ],
    };
    updateCases(cases.map((c) => (c.id === caseId ? updated : c)));
  }

  function handleChangeStatus(caseId, newStatus) {
    updateCases(cases.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c)));
  }

  function handleResetAll() {
    updateKb([]);
    updateCases([]);
    setSelectedCaseId(null);
    setView("getstarted");
    setStatusFilter(null);
  }

  function handleNavigate(key) {
    setView(key);
    setSelectedCaseId(null);
  }

  function handleSelectStatus(status) {
    setView("cases");
    setStatusFilter(status);
    setSelectedCaseId(null);
  }

  const selectedCase = selectedCaseId ? cases.find((c) => c.id === selectedCaseId) : null;
  const counts = {
    all: cases.length,
    New: cases.filter((c) => c.status === "New").length,
    Transferred: cases.filter((c) => c.status === "Transferred").length,
    Closed: cases.filter((c) => c.status === "Closed").length,
    "Waiting for Customer": cases.filter((c) => c.status === "Waiting for Customer").length,
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans" style={{ backgroundColor: colors.bg }}>
      <style>{`
        .rsv-input {
          background: #FAFAFA;
          border: 1px solid #EDEDED;
          color: #171717;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .rsv-input::placeholder { color: #A3A3A3; }
        .rsv-input:focus, .rsv-input:focus-within {
          outline: none;
          border-color: #171717;
          box-shadow: 0 0 0 3px rgba(23,23,23,0.08);
          background: #fff;
        }
        .rsv-btn-primary {
          background: #000000;
          color: #ffffff;
          transition: opacity 0.15s ease, transform 0.1s ease;
        }
        .rsv-btn-primary:hover:not(:disabled) { opacity: 0.85; }
        .rsv-btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .rsv-btn-ghost {
          background: transparent;
          color: #171717;
          border: 1px solid #EDEDED;
          transition: background 0.15s ease;
        }
        .rsv-btn-ghost:hover:not(:disabled) { background: #F0F0F0; }
        .rsv-icon-btn { transition: background 0.15s ease; }
        .rsv-icon-btn:hover { background: #F0F0F0; }
        .rsv-history-item { transition: border-color 0.15s ease; }
        .rsv-history-item:hover { border-color: #D4D4D4 !important; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <Sidebar
        view={view}
        statusFilter={statusFilter}
        onNavigate={handleNavigate}
        onSelectStatus={handleSelectStatus}
        counts={counts}
        mobileOpen={sidebarMobileOpen}
        onCloseMobile={() => setSidebarMobileOpen(false)}
      />

      {/* Middle: list-type views */}
      <div
        className={`${selectedCaseId ? "hidden" : "flex"} md:flex flex-col w-full md:w-96 md:shrink-0 overflow-y-auto h-screen`}
        style={{ borderRight: `1px solid ${colors.border}` }}
      >
        <div className="md:hidden flex items-center gap-3 px-4 py-4 shrink-0" style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.white }}>
          <button onClick={() => setSidebarMobileOpen(true)} className="p-1 rounded-full rsv-icon-btn" style={{ color: colors.gray }}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold" style={{ color: colors.black }}>Resolve</h1>
        </div>
        <div className="p-4 sm:p-6 flex-1">
          {view === "getstarted" && <GetStarted onStart={() => handleSelectStatus(null)} />}
          {view === "cases" && (
            <CaseListView
              cases={cases}
              statusFilter={statusFilter}
              selectedCaseId={selectedCaseId}
              onSelectCase={setSelectedCaseId}
              onCreateCase={handleCreateCase}
              kbCount={kb.length}
              onGoToKb={() => handleNavigate("kb")}
            />
          )}
          {view === "history" && <HistoryView cases={cases} selectedCaseId={selectedCaseId} onSelectCase={setSelectedCaseId} />}
          {view === "kb" && <KnowledgeBaseView kb={kb} onUpdateKb={updateKb} />}
          {view === "settings" && <SettingsView onResetAll={handleResetAll} />}
        </div>
      </div>

      {/* Right: AI Assistant */}
      <div className={`${selectedCaseId ? "flex" : "hidden"} md:flex flex-1 min-w-0`}>
        <ChatPanel
          item={selectedCase}
          onSendMessage={handleSendMessage}
          onChangeStatus={handleChangeStatus}
          onRefresh={handleRefreshCase}
          onClose={() => setSelectedCaseId(null)}
        />
      </div>
    </div>
  );
}
