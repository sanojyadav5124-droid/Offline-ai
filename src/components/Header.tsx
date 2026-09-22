import React, { useState, useEffect } from "react";
import {
  Search,
  Menu,
  Plus,
  Wifi,
  WifiOff,
  Sparkles,
  Command,
  FileText,
  Wrench,
  BookOpen,
  AlertTriangle,
  X,
  UserCheck,
  ChevronDown,
  User,
} from "lucide-react";
import {
  EquipmentKnowledgeItem,
  TroubleshootingEntry,
  WatchMode,
  MaritimeDepartment,
  MARITIME_RANKS,
  SeafarerProfile,
} from "../types";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAddModal: () => void;
  onOpenAiModal: () => void;
  onOpenBackupModal: () => void;
  onOpenGuideManual?: () => void;
  onOpenProfileModal?: () => void;
  setIsOpenMobile: (open: boolean) => void;
  watchMode: WatchMode;
  equipmentList: EquipmentKnowledgeItem[];
  troubleshootingList: TroubleshootingEntry[];
  onSelectItem: (type: "equipment" | "troubleshooting", id: string) => void;
  userRank: string;
  setUserRank: (rank: string) => void;
  userProfile?: SeafarerProfile;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  onOpenAiModal,
  onOpenBackupModal,
  onOpenGuideManual,
  onOpenProfileModal,
  setIsOpenMobile,
  watchMode,
  equipmentList,
  troubleshootingList,
  onSelectItem,
  userRank,
  setUserRank,
  userProfile,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Quick matches for dropdown
  const filteredEquipment = searchQuery.trim()
    ? equipmentList.filter(
        (eq) =>
          eq.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eq.maker.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eq.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eq.statutoryRequirement.regulationCode.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredLogs = searchQuery.trim()
    ? troubleshootingList.filter(
        (tr) =>
          tr.symptomOrAlarm.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tr.rootCause.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tr.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tr.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const hasQuickResults = searchQuery.trim().length > 0 && (filteredEquipment.length > 0 || filteredLogs.length > 0);

  return (
    <header
      className={`sticky top-0 z-30 px-4 lg:px-8 py-3.5 border-b backdrop-blur-md transition-colors ${
        watchMode === "bridge_night"
          ? "bg-stone-950/95 border-red-950 text-red-300"
          : watchMode === "engine"
          ? "bg-slate-950/95 border-slate-800 text-slate-100"
          : "bg-white/95 border-slate-200 text-slate-800 shadow-xs"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Mobile Hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpenMobile(true)}
            className="p-2 rounded-lg hover:bg-slate-800/10 lg:hidden text-slate-600 dark:text-slate-300"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Online / Offline Connectivity Badge */}
          {isOnline ? (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold"
              title="Online connection active. ANCHOR AI is fully offline-first."
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online</span>
            </div>
          ) : (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold"
              title="Operating in 100% offline ocean mode with zero latency."
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              <span>Offline Mode</span>
            </div>
          )}
        </div>

        {/* Global Instant Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search alarm, symptom, SOLAS/MARPOL code, or machinery..."
              className={`w-full pl-9.5 pr-8 py-2 rounded-xl text-sm transition focus:outline-none ${
                watchMode === "bridge_night"
                  ? "bg-stone-900 border border-red-900 text-red-200 placeholder:text-red-800 focus:border-red-500"
                  : watchMode === "engine"
                  ? "bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  : "bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Instant Dropdown Results */}
          {isSearchFocused && hasQuickResults && (
            <div
              className={`absolute left-0 right-0 top-full mt-2 rounded-xl shadow-2xl border overflow-hidden max-h-96 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150 ${
                watchMode === "bridge_night"
                  ? "bg-stone-950 border-red-900 text-red-200"
                  : "bg-slate-900 border-slate-700 text-slate-100"
              }`}
            >
              <div className="p-2 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Instant Retrieval Matches</span>
                <span>ESC to close</span>
              </div>

              <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-80">
                {/* Equipment Matches */}
                {filteredEquipment.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3" /> Machinery & Technical Specs ({filteredEquipment.length})
                    </p>
                    {filteredEquipment.slice(0, 4).map((eq) => (
                      <button
                        key={eq.id}
                        onClick={() => {
                          onSelectItem("equipment", eq.id);
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-100">{eq.equipmentName}</p>
                          <p className="text-slate-400 text-[11px]">
                            {eq.maker} • {eq.area}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          {eq.statutoryRequirement.regulationCode}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Troubleshooting / Incident Matches */}
                {filteredLogs.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                      <Wrench className="w-3 h-3" /> Verified Past Fixes & Symptoms ({filteredLogs.length})
                    </p>
                    {filteredLogs.slice(0, 4).map((tr) => (
                      <button
                        key={tr.id}
                        onClick={() => {
                          onSelectItem("troubleshooting", tr.id);
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-100 line-clamp-1">{tr.symptomOrAlarm}</p>
                          <p className="text-slate-400 text-[11px] line-clamp-1">Root: {tr.rootCause}</p>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                          Fix Available
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Officer Rank & Profile Control (Accessible on all screens) */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Mobile Compact Profile Pill (<sm) */}
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="sm:hidden flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold transition cursor-pointer"
              title={`Active Profile: ${userRank}. Tap to change profile & rank.`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="max-w-[70px] truncate">{userRank.split(" ")[0]}</span>
            </button>

            {/* Tablet & Desktop Rank Selector & Profile Trigger */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                title="Open Seafarer Profile & Watch Setup"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Profile:</span>
              </button>
              <select
                value={userRank}
                onChange={(e) => setUserRank(e.target.value)}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[130px] lg:max-w-[170px] truncate"
                title="Switch active officer rank"
              >
                {MARITIME_RANKS.map((group) => (
                  <optgroup
                    key={group.category}
                    label={group.category}
                    className="bg-slate-900 text-amber-400 font-bold"
                  >
                    {group.ranks.map((r) => (
                      <option
                        key={r.value}
                        value={r.value}
                        className="bg-slate-900 text-white font-normal"
                      >
                        {r.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {onOpenGuideManual && (
            <button
              onClick={onOpenGuideManual}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition cursor-pointer"
              title="Guide & Instruction Manual / Legal Disclaimer"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden xl:inline">Guide & Manual</span>
            </button>
          )}

          <button
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
            title="Maritime Technical Diagnostic Advisor"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Maritime AI</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Entry</span>
          </button>
        </div>
      </div>
    </header>
  );
};
