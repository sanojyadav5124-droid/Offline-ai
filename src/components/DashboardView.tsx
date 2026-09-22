import React, { useState } from "react";
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  BookOpen,
  ArrowUpRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Camera,
  Layers,
  ChevronRight,
  Ship,
  Info,
  StickyNote,
  Plus,
  History,
  AlertOctagon,
  Scale,
  ArrowRight,
  FileCheck2,
  Filter,
  ShieldAlert,
  HelpCircle,
  Download,
} from "lucide-react";
import {
  EquipmentKnowledgeItem,
  TroubleshootingEntry,
  EmergencyChecklist,
  QuickNote,
  ChangeLogEntry,
  MaritimeDepartment,
  WatchMode,
  PhotoAttachment,
} from "../types";
import { ActiveTab } from "./Sidebar";
import { PWAInstallBanner } from "./PWAInstallBanner";

interface DashboardViewProps {
  equipment: EquipmentKnowledgeItem[];
  troubleshooting: TroubleshootingEntry[];
  checklists: EmergencyChecklist[];
  quickNotes: QuickNote[];
  changeLogs: ChangeLogEntry[];
  selectedDepartment: MaritimeDepartment | "All";
  setSelectedDepartment: (dept: MaritimeDepartment | "All") => void;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenAiModal: () => void;
  onOpenAddEmergencyModal: () => void;
  onOpenGuideManual?: () => void;
  onSelectPhoto: (photo: PhotoAttachment) => void;
  onSelectEquipment: (id: string) => void;
  onSelectTroubleshooting: (id: string) => void;
  onAddQuickNote: (note: QuickNote) => void;
  onConvertToLog: (note: QuickNote) => void;
  watchMode: WatchMode;
  userRank: string;
}

const DEPARTMENTS: { id: MaritimeDepartment | "All"; label: string; icon: string; color: string }[] = [
  { id: "All", label: "All Departments", icon: "🌐", color: "bg-slate-800 text-slate-200" },
  { id: "Engine", label: "Engine Room", icon: "⚙️", color: "bg-amber-500/20 text-amber-700 dark:text-amber-300" },
  { id: "Deck", label: "Deck & Bridge", icon: "🧭", color: "bg-blue-500/20 text-blue-700 dark:text-blue-300" },
  { id: "Electrical", label: "Electrical / ETO", icon: "⚡", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300" },
  { id: "Safety_ISM", label: "Safety / ISM", icon: "🛡️", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" },
  { id: "Cargo", label: "Cargo Operations", icon: "📦", color: "bg-purple-500/20 text-purple-700 dark:text-purple-300" },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  equipment,
  troubleshooting,
  checklists,
  quickNotes,
  changeLogs,
  selectedDepartment,
  setSelectedDepartment,
  setActiveTab,
  onOpenAddModal,
  onOpenAiModal,
  onOpenAddEmergencyModal,
  onOpenGuideManual,
  onSelectPhoto,
  onSelectEquipment,
  onSelectTroubleshooting,
  onAddQuickNote,
  onConvertToLog,
  watchMode,
  userRank,
}) => {
  const [triageInput, setTriageInput] = useState("");
  const [fastNoteText, setFastNoteText] = useState("");

  // Department-filtered datasets to prevent clutter for specific watches
  const filteredEquipment = equipment.filter(
    (e) => selectedDepartment === "All" || e.department === selectedDepartment
  );

  const filteredTroubleshooting = troubleshooting.filter(
    (t) => selectedDepartment === "All" || t.department === selectedDepartment
  );

  const filteredChecklists = checklists.filter(
    (c) => selectedDepartment === "All" || c.department === selectedDepartment
  );

  const filteredNotes = quickNotes.filter(
    (n) => selectedDepartment === "All" || n.department === selectedDepartment
  );

  const filteredChangeLogs = changeLogs.filter(
    (l) => selectedDepartment === "All" || l.department === selectedDepartment
  );

  // Urgent triage filtered items
  const matchedTriage = triageInput.trim()
    ? filteredTroubleshooting.filter(
        (t) =>
          t.symptomOrAlarm.toLowerCase().includes(triageInput.toLowerCase()) ||
          t.rootCause.toLowerCase().includes(triageInput.toLowerCase()) ||
          t.equipmentName.toLowerCase().includes(triageInput.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(triageInput.toLowerCase()))
      )
    : [];

  const matchedEquipment = triageInput.trim()
    ? filteredEquipment.filter(
        (e) =>
          e.equipmentName.toLowerCase().includes(triageInput.toLowerCase()) ||
          e.maker.toLowerCase().includes(triageInput.toLowerCase()) ||
          e.statutoryRequirement.regulationCode.toLowerCase().includes(triageInput.toLowerCase())
      )
    : [];

  // Compliance metrics based on filtered department
  const compliantCount = filteredEquipment.filter((e) => e.currentReading.status === "Compliant").length;
  const cautionCount = filteredEquipment.filter((e) => e.currentReading.status === "Caution").length;
  const nonCompliantCount = filteredEquipment.filter((e) => e.currentReading.status === "Non-Compliant").length;

  const activeNotesCount = filteredNotes.filter((n) => !n.isResolved).length;

  const isNight = watchMode === "bridge_night";
  const isEngine = watchMode === "engine";

  const handlePostQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    const text = fastNoteText.trim();
    if (!text) return;

    const newNote: QuickNote = {
      id: `qn-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title: text.length > 35 ? text.substring(0, 35) + "..." : text,
      content: text,
      department: selectedDepartment === "All" ? "Engine" : selectedDepartment,
      authorRank: userRank || "Watch Officer",
      priority: "Routine",
      colorTag: "amber",
      createdAt: new Date().toISOString(),
      isResolved: false,
    };

    onAddQuickNote(newNote);
    setFastNoteText("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* PWA Offline App Install Banner with Screen Add Button & Guide */}
      <PWAInstallBanner onOpenGuide={onOpenGuideManual} />

      {/* Department Quick Filter Bar + Guide & Manual Launch */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Department Focus:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full lg:w-auto">
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDepartment === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-500/30"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{dept.icon}</span>
                <span>{dept.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dedicated Guide & Manual Button accessible from Dashboard */}
        {onOpenGuideManual && (
          <button
            onClick={onOpenGuideManual}
            className="w-full lg:w-auto px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Guide & Instruction Manual</span>
          </button>
        )}
      </div>

      {/* Hero / Rapid Triage Bar */}
      <div
        className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden ${
          isNight
            ? "bg-stone-900/90 border-red-900/60 text-red-200"
            : isEngine
            ? "bg-linear-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800 text-slate-100"
            : "bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 border-slate-800 text-white"
        }`}
      >
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>Zero-Latency Offline Retrieval</span>
            {selectedDepartment !== "All" && (
              <span className="font-mono text-amber-200">• Filtered to {selectedDepartment}</span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Instant Moment-of-Need Triage
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mb-5 leading-relaxed">
            Find the exact fix, maker tolerances, or SOLAS/MARPOL requirements in seconds without internet. Type any alarm code, symptom, or machinery name:
          </p>

          {/* High-Contrast Triage Search Bar */}
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-amber-400" />
            <input
              type="text"
              value={triageInput}
              onChange={(e) => setTriageInput(e.target.value)}
              placeholder="e.g. '15 PPM high', 'exhaust temperature deviation', 'hunting steering', 'blackout'..."
              className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-slate-950/90 border-2 border-amber-500/60 text-white placeholder:text-slate-400 text-sm sm:text-base font-medium shadow-inner focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/20"
            />
            {triageInput ? (
              <button
                onClick={() => setTriageInput("")}
                className="absolute right-4 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                Clear
              </button>
            ) : (
              <div className="absolute right-3 hidden sm:flex items-center gap-1 text-[11px] text-amber-400/80 font-mono bg-amber-500/10 px-2 py-1 rounded">
                Instant match
              </div>
            )}
          </div>
        </div>

        {/* Ambient watermark */}
        <div className="absolute -right-8 -bottom-10 opacity-5 pointer-events-none">
          <Ship className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Immediate Triage Results Area (if search active) */}
      {triageInput.trim().length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 space-y-4 animate-in slide-in-from-top-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Immediate Triage Matches for &quot;{triageInput}&quot;
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              {matchedTriage.length + matchedEquipment.length} found
            </span>
          </div>

          {matchedTriage.length === 0 && matchedEquipment.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400 bg-slate-900/60 rounded-xl">
              No direct past experience found for &quot;{triageInput}&quot; in {selectedDepartment}. Try broader keywords or open the{" "}
              <button onClick={onOpenAiModal} className="text-amber-400 font-bold underline cursor-pointer">
                Maritime Technical AI Advisor
              </button>
              .
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Past Incident Solutions */}
              {matchedTriage.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectTroubleshooting(item.id)}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 cursor-pointer transition shadow-md group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      Past Verified Fix
                    </span>
                    <span className="text-xs text-slate-400">{item.dateOfIncident}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition mb-1.5">
                    {item.symptomOrAlarm}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-2">
                    <strong className="text-amber-400">Root Cause:</strong> {item.rootCause}
                  </p>
                  <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
                    <span>{item.equipmentName}</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                      View Procedure <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}

              {/* Machinery & Statutory matches */}
              {matchedEquipment.map((eq) => (
                <div
                  key={eq.id}
                  onClick={() => onSelectEquipment(eq.id)}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-400 cursor-pointer transition shadow-md group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                      Technical Spec & Law
                    </span>
                    <span className="text-xs font-mono text-amber-300 font-bold">
                      {eq.statutoryRequirement.regulationCode}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition mb-1">
                    {eq.equipmentName}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-2">
                    <strong className="text-amber-400">Statutory Requirement:</strong>{" "}
                    {eq.statutoryRequirement.statutoryLimitValue} — {eq.statutoryRequirement.requirementSummary}
                  </p>
                  <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
                    <span>Maker: {eq.maker}</span>
                    <span className="text-sky-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                      Inspect Specs <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab("equipment")}
          className={`p-4 rounded-xl border transition cursor-pointer group ${
            isNight
              ? "bg-stone-900 border-red-950 text-red-300"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-500 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {selectedDepartment === "All" ? "Tracked Systems" : `${selectedDepartment} Units`}
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{filteredEquipment.length}</span>
            <span className="text-xs text-slate-500">Machinery Specs</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("statutory")}
          className={`p-4 rounded-xl border transition cursor-pointer group ${
            isNight
              ? "bg-stone-900 border-red-950 text-red-300"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Statutory Compliance
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{compliantCount}</span>
            <span className="text-xs text-slate-500">
              / {filteredEquipment.length} Compliant ({cautionCount > 0 ? `${cautionCount} Caution` : "All Safe"})
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("troubleshooting")}
          className={`p-4 rounded-xl border transition cursor-pointer group ${
            isNight
              ? "bg-stone-900 border-red-950 text-red-300"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Breakdown Experiences
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{filteredTroubleshooting.length}</span>
            <span className="text-xs text-slate-500">Documented Fixes</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("notes")}
          className={`p-4 rounded-xl border transition cursor-pointer group ${
            isNight
              ? "bg-stone-900 border-red-950 text-red-300"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Watch Scratchpad
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <StickyNote className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{activeNotesCount}</span>
            <span className="text-xs text-slate-500">Pending Handover</span>
          </div>
        </div>
      </div>

      {/* Sticky Notes Quick Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Watch Handover Scratchpad & Quick Sticky Notes
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Quick memos for when you don&apos;t have time to complete a full log. Convert to incident log anytime.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("notes")}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            All Notes ({filteredNotes.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Post Box */}
        <form onSubmit={handlePostQuickNote} className="flex gap-2">
          <input
            type="text"
            placeholder="Jot down immediate note (e.g. DG #1 fuel rack sticking slightly, clean OWS sensor tomorrow)..."
            value={fastNoteText}
            onChange={(e) => setFastNoteText(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!fastNoteText.trim()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pin Note</span>
          </button>
        </form>

        {/* Active Notes Mini Grid */}
        {filteredNotes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {filteredNotes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                className="p-3.5 rounded-xl border border-amber-400/30 bg-amber-500/10 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                      {note.department}
                    </span>
                    <span className="text-[10px] text-slate-500">{note.authorRank}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1 line-clamp-1">{note.title}</h4>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>
                </div>
                <div className="pt-2.5 mt-2 border-t border-amber-500/20 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <button
                    type="button"
                    onClick={() => onConvertToLog(note)}
                    className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Convert to Log <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dual Section: Statutory Standards (Amber) vs Vessel Live Records (Emerald) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Statutory Law vs. Current Onboard Status</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                (Official pre-filled law limits & live readings)
              </span>
            </h3>
          </div>
          <button
            onClick={() => setActiveTab("statutory")}
            className="text-xs font-bold text-amber-500 hover:text-amber-600 dark:text-amber-400 flex items-center gap-1 cursor-pointer"
          >
            Full Matrix <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEquipment.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectEquipment(item.id)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-amber-500/60 transition cursor-pointer flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.department}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.area}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                    {item.equipmentName}
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  {item.maker} {item.model}
                </span>
              </div>

              {/* Dual-Color Comparison Grid */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                {/* Statutory Law Section (Gold / Amber Theme) */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Requirement by Law
                      </span>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        {item.statutoryRequirement.regulationCode}
                      </span>
                    </div>
                    <div className="text-sm font-black text-amber-800 dark:text-amber-300 my-1">
                      {item.statutoryRequirement.statutoryLimitValue}
                    </div>
                    <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 line-clamp-2 leading-relaxed">
                      {item.statutoryRequirement.requirementSummary}
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-amber-500/20 text-[10px] text-amber-800/70 dark:text-amber-400/70 font-semibold">
                    Test Interval: {item.statutoryRequirement.testInterval}
                  </div>
                </div>

                {/* Live Vessel Actuals Section (Emerald / Green Theme) */}
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Vessel Actual Reading
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        {item.currentReading.status}
                      </span>
                    </div>
                    <div className="text-sm font-black text-emerald-800 dark:text-emerald-300 my-1">
                      {item.currentReading.measuredValue}
                    </div>
                    <p className="text-[11px] text-emerald-900/80 dark:text-emerald-200/80 line-clamp-2 leading-relaxed">
                      {item.currentReading.notes || "Recorded under normal operational parameters."}
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-emerald-500/20 text-[10px] text-emerald-800/70 dark:text-emerald-400/70 flex items-center justify-between">
                    <span>Tested: {item.currentReading.lastTestedDate}</span>
                    <span className="font-medium">{item.currentReading.testedByRank}</span>
                  </div>
                </div>
              </div>

              {/* Quick Spares bar */}
              {item.criticalSparesOnboard.length > 0 && (
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 overflow-hidden">
                  <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">Spares:</span>
                  <span className="truncate">{item.criticalSparesOnboard.join(" • ")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Action Scenarios & Change Log Audit Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Scenarios */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Emergency Action Scenarios</h3>
                <p className="text-[11px] text-slate-500">Action cards & drills ready for immediate execution</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddEmergencyModal}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span>+ Scenario</span>
              </button>
              <button
                onClick={() => setActiveTab("checklists")}
                className="text-xs font-bold text-rose-500 hover:underline"
              >
                View All ({filteredChecklists.length})
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredChecklists.slice(0, 3).map((chk) => {
              const doneCount = chk.steps.filter((s) => s.isChecked).length;
              return (
                <div
                  key={chk.id}
                  onClick={() => setActiveTab("checklists")}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-rose-400 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        {chk.department}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{chk.solasOrSmReference}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{chk.title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {doneCount}/{chk.steps.length}
                    </span>
                    <span className="text-[10px] block text-rose-500">{chk.criticalTimeWindow}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Change Log / Audit Trail Stream */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Trail & Change Log</h3>
                <p className="text-[11px] text-slate-500">Live event logs for class and SMS inspection</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("changelog")}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Full Trail ({filteredChangeLogs.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredChangeLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 uppercase">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">{log.entityType}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{log.entityTitle}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{log.summary}</p>
                </div>
                <div className="text-right text-[10px] text-slate-400 shrink-0">
                  <span>{new Date(log.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                  <span className="block font-semibold text-slate-600 dark:text-slate-300">{log.authorRank}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maritime Footer with Disclaimer & Author Attribution */}
      <div className="mt-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Ship className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-slate-900 dark:text-white">ANCHOR AI</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Fully offline
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Made by : <strong className="text-slate-800 dark:text-slate-200">SKYadav</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenGuideManual && (
              <button
                onClick={onOpenGuideManual}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>Guide & Manual</span>
              </button>
            )}
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-3 pt-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
            <span className="text-amber-500">⚠️</span>
            <span className="uppercase tracking-wider">Disclaimer & Terms of Use</span>
          </div>

          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">For Reference Only: </span>
            <span>This app is for personal use and general reference only. It is not a substitute for official maritime resources.</span>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Data Accuracy & Verification:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400 pl-1 text-[11px]">
              <li><strong className="text-slate-700 dark:text-slate-300">No Warranties:</strong> Data is provided &quot;as is.&quot; It may be incomplete, outdated, or contain errors.</li>
              <li><strong className="text-slate-700 dark:text-slate-300">Mandatory Check:</strong> Always verify data against official publications, company manuals, and statutory regulations before making navigational or operational decisions.</li>
              <li><strong className="text-slate-700 dark:text-slate-300">Seamanship:</strong> Never substitute this app for professional judgment and standard safe seamanship.</li>
            </ul>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Limitation of Liability:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400 pl-1 text-[11px]">
              <li><strong className="text-slate-700 dark:text-slate-300">No Liability:</strong> The developer accepts no legal liability (direct or indirect) for any loss, damage, injury, or mishap resulting from the use of this app.</li>
              <li><strong className="text-slate-700 dark:text-slate-300">User Risk:</strong> You use this application entirely at your own risk.</li>
            </ul>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Permitted Use & Feedback:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400 pl-1 text-[11px]">
              <li><strong className="text-slate-700 dark:text-slate-300">Usage:</strong> Feel free to use and copy this app to make your workflow at sea smoother.</li>
              <li><strong className="text-slate-700 dark:text-slate-300">Feedback:</strong> Please send your improvements and suggestions via email - <a href="mailto:sanojyadav14@gmail.com" className="text-sky-600 dark:text-sky-400 hover:underline font-mono">sanojyadav14@gmail.com</a></li>
            </ul>
          </div>

          <p className="italic font-serif text-amber-600 dark:text-amber-400 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            &ldquo;May you always have smooth seas, following winds, and enough water under your keel.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
