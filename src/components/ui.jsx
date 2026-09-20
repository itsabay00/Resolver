import { AlertCircle, Plus } from "lucide-react";
import { colors, SHADOW } from "../lib/colors.js";

export function Card({ children, className = "", style = {} }) {
  return (
    <div className={`rounded-2xl ${className}`} style={{ backgroundColor: colors.white, boxShadow: SHADOW, ...style }}>
      {children}
    </div>
  );
}

export function IconPill({ icon: Icon, label, muted = false }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0"
      style={{ backgroundColor: colors.lightGray, color: muted ? colors.gray : colors.ink }}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {label}
    </span>
  );
}

export function OutlinePill({ label }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shrink-0"
      style={{ border: `1px solid ${colors.border}`, color: colors.ink }}
    >
      {label}
    </span>
  );
}

export function BlackBadge({ children }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
      style={{ backgroundColor: colors.black, color: colors.white }}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({ children, onClick, disabled, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rsv-btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, disabled, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rsv-btn-ghost inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, onClick, className = "", ariaLabel }) {
  return (
    <button onClick={onClick} aria-label={ariaLabel} className={`p-2 rounded-full rsv-icon-btn ${className}`} style={{ color: colors.gray }}>
      {children}
    </button>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: colors.lightGray }}>
        <Icon className="w-6 h-6" style={{ color: colors.ink }} />
      </div>
      <h3 className="text-sm font-semibold" style={{ color: colors.black }}>{title}</h3>
      <p className="text-sm mt-1 max-w-xs" style={{ color: colors.gray }}>{description}</p>
      {action && (
        <PrimaryButton onClick={action.onClick} className="mt-5">
          <Plus className="w-4 h-4" />
          {action.label}
        </PrimaryButton>
      )}
    </div>
  );
}

export function ErrorBanner({ message, onRetry, className = "" }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl p-4 ${className}`} style={{ backgroundColor: colors.lightGray }}>
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: colors.ink }} />
      <div className="flex-1">
        <p className="text-sm" style={{ color: colors.ink }}>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-sm font-semibold mt-1 underline" style={{ color: colors.ink }}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
