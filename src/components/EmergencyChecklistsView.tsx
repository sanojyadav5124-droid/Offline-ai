import React, { useState } from "react";
import {
  AlertOctagon,
  CheckSquare,
  Square,
  RotateCcw,
  Printer,
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { EmergencyChecklist, WatchMode } from "../types";

interface EmergencyChecklistsViewProps {
  checklists: EmergencyChecklist[];
  onToggleStep: (checklistId: string, stepId: string) => void;
  onResetChecklist: (checklistId: string) => void;
  watchMode: WatchMode;
}

export const EmergencyChecklistsView: React.FC<EmergencyChecklistsViewProps> = ({
  checklists,
  onToggleStep,
  onResetChecklist,
  watchMode,
}) => {
  const [expandedId, setExpandedId] = useState<string>(checklists[0]?.id || "");

  const handlePrint = () => {
    window.print();
  };

  const isNight = watchMode === "bridge_night";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 text-rose-500" />
            <span>Emergency Action Cards & Drills</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mandatory step-by-step procedures for critical onboard situations. Keep track of actions taken in real time.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print Checklist Sheet</span>
        </button>
      </div>

      {/* Checklists List */}
      <div className="space-y-4">
        {checklists.map((chk) => {
          const isExpanded = expandedId === chk.id;
          const completedCount = chk.steps.filter((s) => s.isChecked).length;
          const isAllDone = completedCount === chk.steps.length;

          return (
            <div
              key={chk.id}
              className={`rounded-xl border transition shadow-xs overflow-hidden ${
                isNight
                  ? "bg-stone-900/90 border-red-950 text-red-200"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? "" : chk.id)}
                className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-950/80 transition"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isAllDone
                        ? "bg-emerald-500/20 text-emerald-500"
                        : "bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        {chk.department}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        {chk.solasOrSmReference}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {chk.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{chk.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold block text-slate-700 dark:text-slate-300">
                      {completedCount} / {chk.steps.length} Steps
                    </span>
                    <span className="text-[11px] text-rose-500 font-medium">{chk.criticalTimeWindow}</span>
                  </div>

                  <div className="p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Steps Body */}
              {isExpanded && (
                <div className="p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                    <span className="font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Mandatory Step Sequence
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResetChecklist(chk.id);
                      }}
                      className="text-amber-500 hover:text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Checklist
                    </button>
                  </div>

                  <div className="space-y-2">
                    {chk.steps.map((step) => (
                      <div
                        key={step.id}
                        onClick={() => onToggleStep(chk.id, step.id)}
                        className={`p-3 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                          step.isChecked
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100"
                            : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-400"
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-slate-400 hover:text-emerald-500 transition shrink-0"
                        >
                          {step.isChecked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex-1 text-xs sm:text-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-slate-900 dark:text-white">
                              Step {step.stepNumber}
                            </span>
                            <div className="flex items-center gap-2">
                              {step.mandatoryRule && (
                                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                  {step.mandatoryRule}
                                </span>
                              )}
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                👤 {step.assignedRole}
                              </span>
                            </div>
                          </div>
                          <p
                            className={`leading-relaxed ${
                              step.isChecked ? "line-through opacity-80" : "font-medium"
                            }`}
                          >
                            {step.actionText}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isAllDone && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-in zoom-in-95">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        All safety action steps executed and verified.
                      </span>
                      <span>Ready for Handover</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
