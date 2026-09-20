import { useState, useRef, useEffect } from "react";
import { RefreshCw, X, Send, Loader2, AtSign, Paperclip, MessagesSquare, Copy, Check } from "lucide-react";
import { colors } from "../lib/colors.js";
import { OutlinePill, GhostButton, ErrorBanner, EmptyState } from "./ui.jsx";

const QUICK_PROMPTS = ["More empathetic", "More concise", "More formal", "What policy applies here?"];
const STATUS_OPTIONS = ["New", "Transferred", "Waiting for Customer", "Closed"];

function Bubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap"
        style={
          isUser
            ? { backgroundColor: colors.black, color: colors.white }
            : { backgroundColor: colors.lightGray, color: colors.ink }
        }
      >
        {content}
      </div>
    </div>
  );
}

export default function ChatPanel({ item, onSendMessage, onChangeStatus, onRefresh, onClose }) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setInput("");
    setError(null);
  }, [item?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [item?.chat?.length, sending]);

  async function handleSend(text) {
    const value = (text ?? input).trim();
    if (!value || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSendMessage(item.id, value);
      setInput("");
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleRefreshClick() {
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      await onRefresh(item.id);
    } catch (err) {
      setError(err.message || "Couldn't refresh this case. Try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleCopyLast() {
    const lastAssistant = [...(item?.chat || [])].reverse().find((m) => m.role === "assistant" && !m.hidden);
    if (!lastAssistant) return;
    try {
      await navigator.clipboard.writeText(lastAssistant.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // clipboard not available — nothing more we can do silently
    }
  }

  const visibleMessages = (item?.chat || []).filter((m) => !m.hidden);

  return (
    <div className="flex flex-col h-screen w-full" style={{ backgroundColor: colors.white }}>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div>
          <h2 className="text-base font-bold" style={{ color: colors.black }}>AI Assistant</h2>
          <p className="text-xs" style={{ color: colors.gray }}>Customer support</p>
        </div>
        {item && (
          <div className="flex items-center gap-1">
            <button onClick={handleRefreshClick} className="p-2 rounded-full rsv-icon-btn" style={{ color: colors.gray }} aria-label="Start over" title="Start this case's chat over">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-full rsv-icon-btn" style={{ color: colors.gray }} aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {!item ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState icon={MessagesSquare} title="No case selected" description="Pick a case from the list, or start a new one." />
        </div>
      ) : (
        <>
          {/* Case context strip */}
          <div className="shrink-0 px-5 py-3" style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.bg }}>
            <p className="text-sm font-medium line-clamp-2" style={{ color: colors.ink }}>{item.message}</p>
            {item.context && <p className="text-xs mt-1" style={{ color: colors.gray }}>Context: {item.context}</p>}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {item.category && <OutlinePill label={item.category} />}
              {item.urgency && <OutlinePill label={`${item.urgency} urgency`} />}
              <select
                value={item.status}
                onChange={(e) => onChangeStatus(item.id, e.target.value)}
                className="text-xs font-medium rounded-full px-3 py-1 rsv-input"
                style={{ backgroundColor: colors.white }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <GhostButton onClick={handleCopyLast}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy last reply"}
              </GhostButton>
            </div>
          </div>

          {/* Message thread */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
            {visibleMessages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 text-sm inline-flex items-center gap-2" style={{ backgroundColor: colors.lightGray, color: colors.gray }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
            {error && <ErrorBanner message={error} onRetry={() => handleSend(input || undefined)} />}
          </div>
        </>
      )}

      {/* Instructional banner + input — matches the reference, shown regardless of case state */}
      <div className="shrink-0 px-5 pb-5 pt-2">
        <div className="flex justify-center mb-3">
          <span className="text-xs font-medium px-4 py-2 rounded-full" style={{ backgroundColor: colors.black, color: colors.white }}>
            Give context, review responses, and send to customers.
          </span>
        </div>

        {item && (
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_PROMPTS.map((p) => (
              <GhostButton key={p} onClick={() => handleSend(p)} disabled={sending}>
                {p}
              </GhostButton>
            ))}
          </div>
        )}

        <div className="rounded-2xl p-2 rsv-input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={!item}
            rows={1}
            placeholder="Chat with AI…"
            className="w-full bg-transparent px-2 py-1.5 text-sm resize-none focus:outline-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-full opacity-40 cursor-not-allowed" title="Mention — coming soon" disabled>
                <AtSign className="w-4 h-4" style={{ color: colors.gray }} />
              </button>
              <button className="p-1.5 rounded-full opacity-40 cursor-not-allowed" title="Attach a file — coming soon" disabled>
                <Paperclip className="w-4 h-4" style={{ color: colors.gray }} />
              </button>
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!item || !input.trim() || sending}
              className="rsv-btn-primary rounded-full p-2.5 disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: colors.mutedGray }}>
          AI can make mistakes, always check for clarity.
        </p>
      </div>
    </div>
  );
}
