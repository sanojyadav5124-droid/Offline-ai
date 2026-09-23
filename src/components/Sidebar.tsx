import React from "react";
import {
  Compass,
  Anchor,
  Wrench,
  BookOpen,
  FileCheck2,
  AlertOctagon,
  HardDriveDownload,
  PlusCircle,
  Sun,
  Moon,
  Eye,
  ShieldCheck,
  Ship,
  Sparkles,
  Zap,
  StickyNote,
  History,
  UserCheck,
} from "lucide-react";
import { MaritimeDepartment, WatchMode, SeafarerProfile } from "../types";

export type ActiveTab =
  | "dashboard"
  | "notes"
  | "equipment"
  | "troubleshooting"
  | "statutory"
  | "checklists"
  | "changelog"
  | "backup"
  | "ai_advisor";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedDepartment: MaritimeDepartment | "All";
  setSelectedDepartment: (dept: MaritimeDepartment | "All") => void;
  watchMode: WatchMode;
  setWatchMode: (mode: WatchMode) => void;
  vesselName: string;
  setVesselName: (name: string) => void;
  onOpenAddModal: () => void;
  onOpenGuideManual?: () => void;
  onOpenProfileModal?: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  equipmentCount: number;
  troubleshootingCount: number;
  notesCount: number;
  changeLogCount: number;
  userRank: string;
  setUserRank?: (rank: string) => void;
  userProfile?: SeafarerProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedDepartment,
  setSelectedDepartment,
  watchMode,
  setWatchMode,
  vesselName,
  setVesselName,
  onOpenAddModal,
  onOpenGuideManual,
  onOpenProfileModal,
  isOpenMobile,
  setIsOpenMobile,
  equipmentCount,
  troubleshootingCount,
  notesCount,
  changeLogCount,
  userRank,
  setUserRank,
  userProfile,
}) => {
  const departments: { id: MaritimeDepartment | "All"; label: string; icon: string }[] = [
    { id: "All", label: "All Departments", icon: "🌐" },
    { id: "Engine", label: "Engine Room", icon: "⚙️" },
    { id: "Deck", label: "Deck & Bridge", icon: "🧭" },
    { id: "Electrical", label: "Electrical / ETO", icon: "⚡" },
    { id: "Safety_ISM", label: "Safety / ISM / MLC", icon: "🛡️" },
    { id: "Cargo", label: "Cargo Operations", icon: "📦" },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  const isBridgeNight = watchMode === "bridge_night";
  const isEngineDark = watchMode === "engine";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        } ${
          isBridgeNight
            ? "bg-stone-950 text-red-300 border-r border-red-900/40"
            : isEngineDark
            ? "bg-slate-950 text-slate-200 border-r border-slate-800"
            : "bg-slate-900 text-slate-100 border-r border-slate-800"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md shadow-amber-500/10 border border-slate-700 bg-slate-950 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="AnchorAI Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to anchor icon if image fails to render
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <Anchor className="w-5 h-5 text-amber-500 absolute stroke-[2.5] pointer-events-none -z-10" />
              </div>
              <div>
                <h1 className="font-black text-lg tracking-tight flex items-center gap-1.5 text-white">
                  ANCHOR AI
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Offline
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">Seafarer Knowledge & Audit Vault</p>
              </div>
            </div>
          </div>

          {/* Vessel Name Badge */}
          <div className="mt-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Ship className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="text"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                placeholder="Vessel Name..."
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none w-full truncate"
                title="Click to edit vessel name"
              />
            </div>
            <span className="flex h-2 w-2 relative" title="100% Offline Active">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          {/* Active Seafarer Profile Card */}
          <div className="mt-2 p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-amber-500/30 flex items-center justify-between transition">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider">
                  Logged In As
                </p>
                <p className="text-xs font-bold text-white truncate" title={userRank}>
                  {userRank}
                </p>
              </div>
            </div>
            {onOpenProfileModal && (
              <button
                type="button"
                onClick={() => {
                  onOpenProfileModal();
                  setIsOpenMobile(false);
                }}
                className="px-2 py-1 text-[11px] font-bold rounded-md bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 transition cursor-pointer shrink-0"
                title="Change Rank / Edit Seafarer Profile"
              >
                Switch
              </button>
            )}
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={() => {
              onOpenAddModal();
              setIsOpenMobile(false);
            }}
            className="w-full py-2.5 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>+ Log Entry / Machinery</span>
          </button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Core Views */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Shipboard Modules
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick("dashboard")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === "dashboard"
                    ? "bg-amber-500/15 text-amber-300 font-semibold border-l-3 border-amber-500"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Anchor className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="flex-1 text-left">Dashboard & Triage</span>
              </button>

              <button
                onClick={() => handleNavClick("notes")}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === "notes"
                    ? "bg-amber-500/15 text-amber-300 font-semibold border-l-3 border-amber-500"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <StickyNote className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-left">Watch Scratchpad</span>
                </div>
                {notesCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    {notesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick("equipment")}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === "equipment"
                    ? "bg-amber-500/15 text-amber-300 font-semibold border-l-3 border-amber-500"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-left">Equipment & Specs</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {equipmentCount}
                </span>
              </button>

              <button
                onClick={() => handleNavClick("troubleshooting")}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === "troubleshooting"
                    ? "bg-amber-500/15 text-amber-300 font-semibold border-l-3 border-amber-500"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-left">Breakdown Experience</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {troubleshootingCount}
                </span>
              </button>

              <button
                onClick={() => handleNavClick("statutory")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === "statutory"
                    ? "bg-amber-500/15 text-amber-300 font-semibold border-l-3 border-amber-500"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <FileCheck2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="flex-1 text-left">Statutory Law Matrix</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                  SOLAS
                </span>
              </button>

              <button
                onClick={() => handleNavClick("checklists")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === "checklists"
                    ? "bg-amber-500/15 text-amber-300 font-semibold border-l-3 border-amber-500"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="flex-1 text-left">Emergency Action Cards</span>
              </button>

              <button
                onClick={() => handleNavClick("changelog")}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === "changelog"
                    ? "bg-amber-500/15 text-amber-300 font-semibold border-l-3 border-amber-500"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-left">Change Log & Audit</span>
                </div>
                {changeLogCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                    {changeLogCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick("ai_advisor")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === "ai_advisor"
                    ? "bg-amber-500/15 text-amber-300 font-semibold border-l-3 border-amber-500"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="flex-1 text-left">Maritime Technical AI</span>
              </button>
            </nav>
          </div>

          {/* Departments Quick Filter */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Department Filter
            </p>
            <div className="space-y-1">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => {
                    setSelectedDepartment(dept.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    selectedDepartment === dept.id
                      ? "bg-slate-800 text-amber-400 font-bold border border-slate-700"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{dept.icon}</span>
                    <span>{dept.label}</span>
                  </span>
                  {selectedDepartment === dept.id && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Backup & Portability */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Data & Documentation
            </p>
            <button
              onClick={() => handleNavClick("backup")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition ${
                activeTab === "backup"
                  ? "bg-amber-500/15 text-amber-300 font-semibold border-l-3 border-amber-500"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <HardDriveDownload className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="flex-1 text-left">USB Backup & Sync</span>
            </button>

            {onOpenGuideManual && (
              <button
                onClick={() => {
                  onOpenGuideManual();
                  setIsOpenMobile(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg text-amber-300/90 hover:bg-slate-800/60 hover:text-amber-200 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="flex-1 text-left font-bold">Guide & Instruction Manual</span>
              </button>
            )}
          </div>
        </div>

        {/* Watch Mode Selector (Day, Engine, Bridge Red) & Attribution */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2.5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
              Watch Lighting Mode
            </p>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setWatchMode("day")}
                className={`flex items-center justify-center gap-1 py-1 rounded-md transition ${
                  watchMode === "day"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Day Nautical Mode"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[11px]">Day</span>
              </button>

              <button
                onClick={() => setWatchMode("engine")}
                className={`flex items-center justify-center gap-1 py-1 rounded-md transition ${
                  watchMode === "engine"
                    ? "bg-slate-800 text-amber-400 font-bold border border-slate-700 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Engine Room Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[11px]">Engine</span>
              </button>

              <button
                onClick={() => setWatchMode("bridge_night")}
                className={`flex items-center justify-center gap-1 py-1 rounded-md transition ${
                  watchMode === "bridge_night"
                    ? "bg-red-950 text-red-400 font-bold border border-red-800 shadow-xs"
                    : "text-slate-400 hover:text-red-300"
                }`}
                title="Night Bridge Red-Vision Mode"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[11px]">Bridge</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Made by: <strong className="text-slate-200">SKYadav</strong></span>
            <span className="text-emerald-400 font-semibold">Fully offline</span>
          </div>
        </div>
      </aside>
    </>
  );
};
