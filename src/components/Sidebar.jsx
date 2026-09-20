import { useState } from "react";
import {
  Confetti,
  Book,
  ClockCounterClockwise,
  ChartLine,
  GearSix,
  CaretDown,
  CaretUp,
  FolderPlus,
  Share,
  Folder,
  FolderUser,
  SidebarSimple,
  X,
} from "@phosphor-icons/react";
import { colors } from "../lib/colors.js";

const TOP_NAV = [
  { key: "getstarted", label: "Get started", icon: Confetti },
  { key: "kb", label: "Knowledge base (KB)", icon: Book },
  { key: "history", label: "History", icon: ClockCounterClockwise },
  { key: "performance", label: "Performance", icon: ChartLine, disabled: true },
];

const STATUS_FOLDERS = [
  { key: "New", label: "New", icon: FolderPlus },
  { key: "Transferred", label: "Transferred", icon: Share },
  { key: "Closed", label: "Closed", icon: Folder },
  { key: "Waiting for Customer", label: "Waiting for Customer", icon: FolderUser },
];

function NavRow({ item, active, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={item.disabled ? undefined : onClick}
      disabled={item.disabled}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-normal text-left ${item.disabled ? "cursor-not-allowed" : ""}`}
      style={{ backgroundColor: active ? colors.lightGray : "transparent", color: item.disabled || !active ? colors.gray : colors.black }}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
    </button>
  );
}

function SidebarContent({ view, statusFilter, onNavigate, onSelectStatus, counts, collapsed, onToggleCollapse, showMobileClose, onCloseMobile }) {
  const [foldersOpen, setFoldersOpen] = useState(true);

  return (
    <div className={`flex flex-col h-full justify-between pt-[10px] pb-[60px] ${collapsed ? "px-[12px]" : "px-[20px]"}`}>
      <div className="flex flex-col gap-[20px] w-full">
        <div
          className={`flex items-center bg-[${colors.bg}] rounded-lg py-2 ${collapsed ? "justify-center px-2" : "justify-between pl-2 pr-3"}`}
          style={{ backgroundColor: colors.bg }}
        >
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-[28px] h-[28px] rounded-lg shrink-0" style={{ backgroundColor: colors.black }} />
              <span className="text-sm font-normal truncate" style={{ color: colors.black }}>Acme</span>
            </div>
          )}
          {collapsed && <div className="w-[28px] h-[28px] rounded-lg shrink-0" style={{ backgroundColor: colors.black }} />}
          {showMobileClose ? (
            <button onClick={onCloseMobile} className="rsv-icon-btn rounded-full p-1 shrink-0" style={{ color: colors.gray }}>
              <X className="w-[18px] h-[18px]" />
            </button>
          ) : (
            !collapsed && (
              <button onClick={onToggleCollapse} className="rsv-icon-btn rounded-full p-1 shrink-0" style={{ color: colors.gray }}>
                <SidebarSimple className="w-[18px] h-[18px]" />
              </button>
            )
          )}
        </div>
        {collapsed && (
          <button onClick={onToggleCollapse} className="rsv-icon-btn rounded-full p-1 self-center" style={{ color: colors.gray }}>
            <SidebarSimple className="w-[18px] h-[18px]" />
          </button>
        )}

        <nav className="flex flex-col gap-[9px] w-full">
          {TOP_NAV.map((item) => (
            <NavRow key={item.key} item={item} active={view === item.key} collapsed={collapsed} onClick={() => onNavigate(item.key)} />
          ))}
        </nav>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectStatus(null)}
              className="flex-1 flex items-center gap-1.5 text-sm font-normal text-left truncate"
              style={{ color: view === "cases" && !statusFilter ? colors.black : colors.sectionGray }}
            >
              {!collapsed && <span className="truncate">All Cases ({counts.all})</span>}
            </button>
            {!collapsed && (
              <button onClick={() => setFoldersOpen((o) => !o)} className="rsv-icon-btn rounded-full p-1 shrink-0" style={{ color: colors.sectionGray }}>
                {foldersOpen ? <CaretUp className="w-3 h-3" /> : <CaretDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          {foldersOpen && (
            <div className="flex flex-col gap-[4px] w-full">
              {STATUS_FOLDERS.map((f) => {
                const Icon = f.icon;
                const active = view === "cases" && statusFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => onSelectStatus(f.key)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-normal text-left"
                    style={{ backgroundColor: active ? colors.lightGray : "transparent", color: active ? colors.black : colors.gray }}
                    title={collapsed ? f.label : undefined}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {!collapsed && <span className="flex-1 truncate">{f.label}</span>}
                    {!collapsed && <span style={{ color: colors.gray }}>({counts[f.key] || 0})</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <NavRow item={{ key: "settings", label: "Settings", icon: GearSix }} active={view === "settings"} collapsed={collapsed} onClick={() => onNavigate("settings")} />
    </div>
  );
}

export default function Sidebar({ view, statusFilter, onNavigate, onSelectStatus, counts, mobileOpen, onCloseMobile }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <aside
        className={`hidden md:flex md:flex-col md:shrink-0 md:h-screen md:sticky md:top-0 transition-all duration-150 ${collapsed ? "md:w-[76px]" : "md:w-[280px]"}`}
        style={{ backgroundColor: colors.bg }}
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
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw]" style={{ backgroundColor: colors.bg }}>
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
