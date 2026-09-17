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
} from "lucide-react";
import { MaritimeDepartment, WatchMode } from "../types";

export type ActiveTab =
  | "dashboard"
  | "equipment"
  | "troubleshooting"
  | "statutory"
  | "checklists"
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
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  equipmentCount: number;
  troubleshootingCount: number;
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
  isOpenMobile,
  setIsOpenMobile,
  equipmentCount,
  troubleshootingCount,
}) => {
  const departments: { id: MaritimeDepartment | "All"; label: string; icon: string; count?: number }[] = [
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
                <Compass className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight flex items-center gap-1.5 text-white">
                  Blueprint
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    At Sea
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">Maritime Knowledge Vault</p>
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
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" title="100% Offline Active"></span>
            </span>
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
            <span>Log Experience / Specs</span>
          </button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Core Views */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Workspace & Hub
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
                onClick={() => handleNavClick("equipment")}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === "equipment"
                    ? "bg-amber-500/15 text-amber-300 font-semibold border-l-3 border-amber-500"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-left">Equipment & Maker Specs</span>
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
                  SOLAS/MARPOL
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
              Shipboard Departments
            </p>
            <div className="space-y-1">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => {
                    setSelectedDepartment(dept.id);
                    if (activeTab === "dashboard") {
                      setActiveTab("equipment");
                    }
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
                </button>
              ))}
            </div>
          </div>

          {/* Backup & Portability */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Data & Handover
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
              <span className="flex-1 text-left">USB Drive Backup & Sync</span>
            </button>
          </div>
        </div>

        {/* Watch Mode Selector (Day, Engine, Bridge Red) */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
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
      </aside>
    </>
  );
};
