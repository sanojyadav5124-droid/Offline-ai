import React, { useState } from "react";
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  Edit2,
  Ship,
  Info,
  Plus,
} from "lucide-react";
import { EquipmentKnowledgeItem, WatchMode } from "../types";

interface StatutoryComplianceViewProps {
  equipmentList: EquipmentKnowledgeItem[];
  onUpdateReading: (eq: EquipmentKnowledgeItem) => void;
  onOpenAddStatutory: () => void;
  watchMode: WatchMode;
}

export const StatutoryComplianceView: React.FC<StatutoryComplianceViewProps> = ({
  equipmentList,
  onUpdateReading,
  onOpenAddStatutory,
  watchMode,
}) => {
  const [selectedBody, setSelectedBody] = useState<string>("All");
  const [search, setSearch] = useState("");

  const bodies = ["All", "IMO SOLAS", "IMO MARPOL", "STCW", "Class / IACS", "MLC 2006"];

  const filteredEquipment = equipmentList.filter((eq) => {
    const matchesBody =
      selectedBody === "All" || eq.statutoryRequirement.governingBody === selectedBody;
    const matchesSearch =
      search === "" ||
      eq.statutoryRequirement.regulationCode.toLowerCase().includes(search.toLowerCase()) ||
      eq.statutoryRequirement.requirementSummary.toLowerCase().includes(search.toLowerCase()) ||
      eq.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      eq.area.toLowerCase().includes(search.toLowerCase());
    return matchesBody && matchesSearch;
  });

  const compliantCount = equipmentList.filter((e) => e.currentReading.status === "Compliant").length;
  const isNight = watchMode === "bridge_night";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-indigo-500" />
            <span>Statutory Law & Regulatory Matrix</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official mandatory standards by maritime law (Amber) side-by-side with vessel live inspection records (Emerald).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenAddStatutory}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Statutory Rule</span>
          </button>

          {/* Compliance Banner */}
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>
              {compliantCount} of {equipmentList.length} Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
          {bodies.map((body) => (
            <button
              key={body}
              onClick={() => setSelectedBody(body)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedBody === body
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {body}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search regulations (e.g., SOLAS, MARPOL)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="space-y-4">
        {filteredEquipment.map((eq) => (
          <div
            key={eq.id}
            className={`rounded-xl border transition shadow-xs overflow-hidden ${
              isNight
                ? "bg-stone-900/90 border-red-950 text-red-200"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {eq.statutoryRequirement.governingBody}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {eq.statutoryRequirement.regulationCode}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {eq.equipmentName}
                </h3>
              </div>

              <button
                onClick={() => onUpdateReading(eq)}
                className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Log New Test</span>
              </button>
            </div>

            {/* Dual Panel Comparator */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Statutory Requirement (Official Amber Theme) */}
              <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Statutory Law Threshold</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300">
                    Interval: {eq.statutoryRequirement.testInterval}
                  </span>
                </div>

                <div className="text-lg font-black text-amber-900 dark:text-amber-200">
                  {eq.statutoryRequirement.statutoryLimitValue}
                </div>

                <p className="text-xs text-amber-950/80 dark:text-amber-100/80 leading-relaxed">
                  {eq.statutoryRequirement.requirementSummary}
                </p>

                <div className="pt-2 border-t border-amber-500/20 text-[11px] text-amber-900/70 dark:text-amber-300/70">
                  <strong>Standard Tolerance / Condition:</strong> {eq.statutoryRequirement.standardTolerance}
                </div>
              </div>

              {/* Right: Current Vessel Reading (Vessel Emerald/Teal Theme) */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Live Onboard Test Value</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                    Status: {eq.currentReading.status}
                  </span>
                </div>

                <div className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                  {eq.currentReading.measuredValue}
                </div>

                <p className="text-xs text-emerald-950/80 dark:text-emerald-100/80 leading-relaxed">
                  {eq.currentReading.notes || "Operational inspection verified with no outstanding deficiencies."}
                </p>

                <div className="pt-2 border-t border-emerald-500/20 text-[11px] text-emerald-900/70 dark:text-emerald-300/70 flex items-center justify-between">
                  <span>Last Test Date: {eq.currentReading.lastTestedDate}</span>
                  <span className="font-semibold">Inspector: {eq.currentReading.testedByRank}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
