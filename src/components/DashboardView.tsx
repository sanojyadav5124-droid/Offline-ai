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
} from "lucide-react";
import {
  EquipmentKnowledgeItem,
  TroubleshootingEntry,
  EmergencyChecklist,
  MaritimeDepartment,
  WatchMode,
  PhotoAttachment,
} from "../types";
import { ActiveTab } from "./Sidebar";

interface DashboardViewProps {
  equipment: EquipmentKnowledgeItem[];
  troubleshooting: TroubleshootingEntry[];
  checklists: EmergencyChecklist[];
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedDepartment: (dept: MaritimeDepartment | "All") => void;
  onOpenAddModal: () => void;
  onOpenAiModal: () => void;
  onSelectPhoto: (photo: PhotoAttachment) => void;
  onSelectEquipment: (id: string) => void;
  onSelectTroubleshooting: (id: string) => void;
  watchMode: WatchMode;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  equipment,
  troubleshooting,
  checklists,
  setActiveTab,
  setSelectedDepartment,
  onOpenAddModal,
  onOpenAiModal,
  onSelectPhoto,
  onSelectEquipment,
  onSelectTroubleshooting,
  watchMode,
}) => {
  const [triageInput, setTriageInput] = useState("");

  // Urgent triage filtered items
  const matchedTriage = triageInput.trim()
    ? troubleshooting.filter(
        (t) =>
          t.symptomOrAlarm.toLowerCase().includes(triageInput.toLowerCase()) ||
          t.rootCause.toLowerCase().includes(triageInput.toLowerCase()) ||
          t.equipmentName.toLowerCase().includes(triageInput.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(triageInput.toLowerCase()))
      )
    : [];

  const matchedEquipment = triageInput.trim()
    ? equipment.filter(
        (e) =>
          e.equipmentName.toLowerCase().includes(triageInput.toLowerCase()) ||
          e.maker.toLowerCase().includes(triageInput.toLowerCase()) ||
          e.statutoryRequirement.regulationCode.toLowerCase().includes(triageInput.toLowerCase())
      )
    : [];

  // Compliance metrics
  const compliantCount = equipment.filter((e) => e.currentReading.status === "Compliant").length;
  const cautionCount = equipment.filter((e) => e.currentReading.status === "Caution").length;
  const nonCompliantCount = equipment.filter((e) => e.currentReading.status === "Non-Compliant").length;

  const allPhotos: { photo: PhotoAttachment; equipmentName: string }[] = [];
  equipment.forEach((eq) => {
    eq.photos.forEach((p) => allPhotos.push({ photo: p, equipmentName: eq.equipmentName }));
  });
  troubleshooting.forEach((tr) => {
    tr.photos.forEach((p) => allPhotos.push({ photo: p, equipmentName: tr.equipmentName }));
  });

  const isNight = watchMode === "bridge_night";
  const isEngine = watchMode === "engine";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero / Rapid Triage Bar */}
      <div
        className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden ${
          isNight
            ? "bg-stone-900/90 border-red-900/60 text-red-200"
            : isEngine
            ? "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800 text-slate-100"
            : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border-slate-800 text-white"
        }`}
      >
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>Zero-Latency Offline Maritime Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Instant Moment-of-Need Retrieval
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mb-5 leading-relaxed">
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
              No direct past experience found for &quot;{triageInput}&quot;. Try generic keywords (e.g. &quot;purifier&quot;, &quot;injector&quot;, &quot;generator&quot;) or open the{" "}
              <button onClick={onOpenAiModal} className="text-amber-400 font-bold underline">
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
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Critical Systems
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{equipment.length}</span>
            <span className="text-xs text-slate-500">Tracked Units</span>
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
              Statutory Health
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{compliantCount}</span>
            <span className="text-xs text-slate-500">
              / {equipment.length} Compliant ({cautionCount > 0 ? `${cautionCount} Caution` : "All Safe"})
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
            <span className="text-2xl font-black text-slate-900 dark:text-white">{troubleshooting.length}</span>
            <span className="text-xs text-slate-500">Documented Fixes</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("checklists")}
          className={`p-4 rounded-xl border transition cursor-pointer group ${
            isNight
              ? "bg-stone-900 border-red-950 text-red-300"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-500 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Emergency Cards
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{checklists.length}</span>
            <span className="text-xs text-slate-500">Drills & Action Guides</span>
          </div>
        </div>
      </div>

      {/* Dual Section: Statutory Standards (Amber) vs Vessel Live Records (Emerald) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Statutory Law vs. Current Onboard Status</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                (Pre-filled official limits compared with live vessel parameters)
              </span>
            </h3>
          </div>
          <button
            onClick={() => setActiveTab("statutory")}
            className="text-xs font-bold text-amber-500 hover:text-amber-600 dark:text-amber-400 flex items-center gap-1"
          >
            Full Matrix <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {equipment.slice(0, 4).map((item) => (
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

      {/* Breakdown Experiences & Technical Photos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Incident Experiences */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-500" />
              <span>Recent Breakdown Experiences & Fixes</span>
            </h3>
            <button
              onClick={() => setActiveTab("troubleshooting")}
              className="text-xs font-bold text-amber-500 hover:text-amber-600 dark:text-amber-400 flex items-center gap-1"
            >
              View All ({troubleshooting.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {troubleshooting.slice(0, 3).map((tr) => (
              <div
                key={tr.id}
                onClick={() => onSelectTroubleshooting(tr.id)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/60 transition cursor-pointer shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {tr.department}
                    </span>
                    <span className="text-xs text-slate-500">{tr.area}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{tr.dateOfIncident}</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1.5">
                  {tr.symptomOrAlarm}
                </h4>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 text-xs space-y-1 mb-2.5">
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-amber-600 dark:text-amber-400">Root Cause:</strong> {tr.rootCause}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                    <strong className="text-emerald-600 dark:text-emerald-400">Solution Applied:</strong>{" "}
                    {tr.actionTakenAndFix}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Logged by:</span>
                    <span>{tr.seafarerRank}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {tr.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Technical Photos & Emergency Drills */}
        <div className="space-y-4">
          {/* Emergency Drills Quick Card */}
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Ready Emergency Cards
              </h4>
              <button
                onClick={() => setActiveTab("checklists")}
                className="text-[11px] font-bold text-rose-500 hover:underline"
              >
                Open All
              </button>
            </div>
            <div className="space-y-2">
              {checklists.map((chk) => (
                <div
                  key={chk.id}
                  onClick={() => setActiveTab("checklists")}
                  className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 transition cursor-pointer text-xs flex items-center justify-between"
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate mr-2">
                    {chk.title}
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 font-bold">
                    {chk.steps.length} Steps
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Photos & Nameplates Vault */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-sky-400" /> Attached Nameplates & Schematics
              </h4>
              <span className="text-xs text-slate-400">{allPhotos.length} images</span>
            </div>

            {allPhotos.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-lg">
                No photos attached yet. You can attach small nameplate images, diagrams, or damaged parts when logging an entry.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {allPhotos.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectPhoto(item.photo)}
                    className="group relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-video cursor-pointer hover:opacity-90 transition"
                  >
                    <img
                      src={item.photo.dataUrl}
                      alt={item.photo.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                      <p className="text-[10px] text-white font-medium truncate">{item.photo.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
