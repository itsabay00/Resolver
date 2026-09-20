import { useState } from "react";
import {
  Sparkles,
  BookOpen,
  History,
  TrendingUp,
  Settings,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Share2,
  Clock,
  FolderCheck,
  Folders,
  PanelLeft,
  X,
} from "lucide-react";
import { colors } from "../lib/colors.js";
import { BlackBadge } from "./ui.jsx";

const TOP_NAV = [
  { key: "getstarted", label: "Get started", icon: Sparkles },
  { key: "kb", label: "Knowledge base (KB)", icon: BookOpen },
  { key: "history", label: "History", icon: History },
  { key: "performance", label: "Performance", icon: TrendingUp, disabled: true, badge: "Coming soon" },
];

const STATUS_FOLDERS = [
  { key: "New", label: "New", icon: FolderPlus },
  { key: "Transferred", label: "Transferred", icon: Share2 },
  { key: "Closed", label: "Closed", icon: FolderCheck },
  { key: "Waiting for Customer", label: "Waiting for Customer", icon: Clock },
];

function NavRow({ item, active, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={item.disabled ? undefined : onClick}
      disabled={item.disabled}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition ${item.disabled ? "cursor-not-allowed" : ""}`}
      style={{
        backgroundColor: active ? colors.white : "transparent",
        color: item.disabled ? colors.mutedGray : active ? colors.black : colors.gray,
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
      }}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge && <BlackBadge>{item.badge}</BlackBadge>}
    </button>
  );
}

function SidebarContent({ view, statusFilter, onNavigate, onSelectStatus, counts, collapsed, onToggleCollapse, showMobileClose, onCloseMobile }) {
  const [foldersOpen, setFoldersOpen] = useState(true);

  return (
    <div className="flex flex-col h-full py-5">
      <div className={`flex items-center ${collapsed ? "justify-center px-3" : "justify-between px-4"} pb-5`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg shrink-0" style={{ backgroundColor: colors.black }} />
            <span className="text-sm font-semibold truncate" style={{ color: colors.black }}>Resolve</span>
          </div>
        )}
        {collapsed && <div className="w-7 h-7 rounded-lg shrink-0" style={{ backgroundColor: colors.black }} />}
        {showMobileClose ? (
          <button onClick={onCloseMobile} className="p-1 rounded-full rsv-icon-btn shrink-0" style={{ color: colors.gray }}>
            <X className="w-5 h-5" />
          </button>
        ) : (
          !collapsed && (
            <button onClick={onToggleCollapse} className="p-1 rounded-full rsv-icon-btn shrink-0" style={{ color: colors.gray }}>
              <PanelLeft className="w-4 h-4" />
            </button>
          )
        )}
      </div>

      {collapsed && (
        <div className="px-3 pb-3 flex justify-center">
          <button onClick={onToggleCollapse} className="p-1.5 rounded-full rsv-icon-btn" style={{ color: colors.gray }}>
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      <nav className="flex flex-col gap-1 px-3">
        {TOP_NAV.map((item) => (
          <NavRow key={item.key} item={item} active={view === item.key} collapsed={collapsed} onClick={() => onNavigate(item.key)} />
        ))}
      </nav>

      <div className="px-3 mt-4">
        <div className="w-full flex items-center gap-2 px-1">
          <button
            onClick={() => onSelectStatus(null)}
            className="flex-1 flex items-center gap-2 px-2 py-2 text-xs font-medium rounded-lg text-left"
            style={{
              color: view === "cases" && !statusFilter ? colors.black : colors.gray,
              backgroundColor: view === "cases" && !statusFilter ? colors.white : "transparent",
            }}
          >
            <Folders className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span className="truncate">All cases ({counts.all})</span>}
          </button>
          {!collapsed && (
            <button onClick={() => setFoldersOpen((o) => !o)} className="p-1.5 rounded-full rsv-icon-btn shrink-0" style={{ color: colors.gray }}>
              {foldersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {foldersOpen && (
          <div className="flex flex-col gap-1 mt-1">
            {STATUS_FOLDERS.map((f) => {
              const Icon = f.icon;
              const active = view === "cases" && statusFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => onSelectStatus(f.key)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition"
                  style={{
                    backgroundColor: active ? colors.white : "transparent",
                    color: active ? colors.black : colors.gray,
                    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                  title={collapsed ? f.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{f.label}</span>}
                  {!collapsed && <span style={{ color: colors.mutedGray }}>({counts[f.key] || 0})</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-auto px-3 pt-4">
        <NavRow
          item={{ key: "settings", label: "Settings", icon: Settings }}
          active={view === "settings"}
          collapsed={collapsed}
          onClick={() => onNavigate("settings")}
        />
      </div>
    </div>
  );
}

export default function Sidebar({ view, statusFilter, onNavigate, onSelectStatus, counts, mobileOpen, onCloseMobile }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <aside
        className={`hidden md:flex md:flex-col md:shrink-0 md:h-screen md:sticky md:top-0 transition-all duration-200 ${collapsed ? "md:w-[72px]" : "md:w-64"}`}
        style={{ backgroundColor: colors.bg, borderRight: `1px solid ${colors.border}` }}
      >
        <SidebarContent
          view={view}
          statusFilter={statusFilter}
          onNavigate={onNavigate}
          onSelectStatus={onSelectStatus}
          counts={counts}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[80vw]" style={{ backgroundColor: colors.bg }}>
            <SidebarContent
              view={view}
              statusFilter={statusFilter}
              onNavigate={(key) => {
                onNavigate(key);
                onCloseMobile();
              }}
              onSelectStatus={(key) => {
                onSelectStatus(key);
                onCloseMobile();
              }}
              counts={counts}
              collapsed={false}
              showMobileClose
              onCloseMobile={onCloseMobile}
            />
          </aside>
        </div>
      )}
    </>
  );
}
