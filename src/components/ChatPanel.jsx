import { useState, useRef, useEffect } from "react";
import { ArrowClockwise, Plus, At, Paperclip, ArrowUp, Info, ChatsCircle, Copy, Check } from "@phosphor-icons/react";
import { colors, semantic } from "../lib/colors.js";
import { OutlinePill, GhostButton, Banner, EmptyState } from "./ui.jsx";

const QUICK_PROMPTS = ["More empathetic", "More concise", "More formal", "What policy applies here?"];
const STATUS_OPTIONS = ["New", "Transferred", "Waiting for Customer", "Closed"];

function Bubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[85%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap"
        style={isUser ? { backgroundColor: colors.black, color: colors.white } : { backgroundColor: colors.lightGray, color: colors.ink }}
      >
        {content}
      </div>
    </div>
  );
}

export default function ChatPanel({ item, onSendMessage, onChangeStatus, onRefresh, onNewCase, resizeHandleProps }) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
    if (!value || sending || !item) return;
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
    if (!item || refreshing) return;
    setRefreshing(true);
    setError(null);
    try {
      await onRefresh(item.id);
    } catch (err) {
      setError(err.message || "Couldn't refresh this case. Try again.");
    } finally {
      setRefreshing(false);
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
      // clipboard unavailable — nothing more to do silently
    }
  }

  const visibleMessages = (item?.chat || []).filter((m) => !m.hidden);

  return (
    <div className="rsv-chat-panel relative flex flex-col h-screen" style={{ backgroundColor: colors.white }}>
      <div {...resizeHandleProps} className="hidden md:block absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10" style={{ marginLeft: "-2px" }} />

      {/* Top Navigation */}
      <div className="shrink-0 flex items-center justify-between px-[16px] py-[12px]" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <p className="text-[16px] font-medium" style={{ color: colors.black }}>AI Assistant</p>
        <div className="flex items-center gap-[8px]">
          <button
            onClick={handleRefreshClick}
            disabled={!item}
            className="flex items-center justify-center w-[24px] h-[24px] rounded-full disabled:opacity-40"
            style={{ backgroundColor: colors.bg }}
            title="Start this case's chat over"
          >
            <ArrowClockwise className="w-[16px] h-[16px]" style={{ color: colors.ink }} />
          </button>
          <button
            onClick={onNewCase}
            className="flex items-center justify-center w-[24px] h-[24px] rounded-full"
            style={{ backgroundColor: colors.bg }}
            title="Start a new case"
          >
            <Plus className="w-[16px] h-[16px]" style={{ color: colors.ink }} />
          </button>
        </div>
      </div>

      {!item ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState icon={ChatsCircle} title="No case selected" description="Pick a case from the list, or start a new one." />
        </div>
      ) : (
        <>
          <div className="shrink-0 px-[16px] py-3" style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.bg }}>
            <p className="text-sm font-normal line-clamp-2" style={{ color: colors.ink }}>{item.message}</p>
            {item.context && <p className="text-xs mt-1" style={{ color: colors.gray }}>Context: {item.context}</p>}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {item.category && <OutlinePill label={item.category} />}
              {item.urgency && <OutlinePill label={`${item.urgency} urgency`} />}
              <select
                value={item.status}
                onChange={(e) => onChangeStatus(item.id, e.target.value)}
                className="text-xs font-normal rounded-full px-3 py-1 rsv-input"
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

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-[16px] py-5 flex flex-col gap-3">
            {visibleMessages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: colors.lightGray, color: colors.gray }}>
                  Thinking…
                </div>
              </div>
            )}
            {error && <Banner kind="error" message={error} onRetry={() => handleSend(input || undefined)} />}
          </div>

          <div className="shrink-0 px-[16px]">
            <div className="flex flex-wrap gap-2 pb-3">
              {QUICK_PROMPTS.map((p) => (
                <GhostButton key={p} onClick={() => handleSend(p)} disabled={sending}>
                  {p}
                </GhostButton>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Instructional banner + input — always shown, matches reference */}
      <div className="shrink-0 flex flex-col gap-[12px] px-[20px] pb-[10px] pt-2">
        <div className="flex items-start gap-2 rounded-lg p-[10px] w-full" style={{ backgroundColor: semantic.info.fg }}>
          <Info className="w-4 h-4 mt-0.5 shrink-0" weight="fill" style={{ color: colors.white }} />
          <p className="text-[12px] font-normal" style={{ color: colors.white }}>
            Give context, review responses, and send to customers.
          </p>
        </div>

        <div className="rounded-lg p-[10px] min-h-[61px] flex flex-col justify-between" style={{ backgroundColor: colors.bg }}>
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
            className="w-full bg-transparent text-[12px] resize-none focus:outline-none disabled:opacity-50"
            style={{ color: colors.ink }}
          />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button className="opacity-40 cursor-not-allowed" title="Mention — coming soon" disabled>
                <At className="w-[18px] h-[18px]" style={{ color: colors.gray }} />
              </button>
              <button className="opacity-40 cursor-not-allowed" title="Attach a file — coming soon" disabled>
                <Paperclip className="w-[18px] h-[18px]" style={{ color: colors.gray }} />
              </button>
            </div>
            <button onClick={() => handleSend()} disabled={!item || !input.trim() || sending} className="disabled:opacity-30" aria-label="Send">
              <ArrowUp className="w-[18px] h-[18px]" style={{ color: colors.ink }} />
            </button>
          </div>
        </div>

        <p className="text-[8px] font-normal text-center" style={{ color: colors.gray }}>
          AI can make mistakes, double check for clarity.
        </p>
      </div>
    </div>
  );
}
