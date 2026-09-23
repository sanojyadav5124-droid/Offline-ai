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
  Plus,
  Trash2,
  Edit3,
  Filter,
  Search,
  Sparkles,
} from "lucide-react";
import { EmergencyChecklist, MaritimeDepartment, WatchMode } from "../types";
import { AddEmergencyModal } from "./AddEmergencyModal";

interface EmergencyChecklistsViewProps {
  checklists: EmergencyChecklist[];
  onToggleStep: (checklistId: string, stepId: string) => void;
  onResetChecklist: (checklistId: string) => void;
  onAddChecklist: (checklist: EmergencyChecklist) => void;
  onUpdateChecklist: (checklist: EmergencyChecklist) => void;
  onDeleteChecklist: (checklistId: string) => void;
  watchMode: WatchMode;
  userRank: string;
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
}

export const EmergencyChecklistsView: React.FC<EmergencyChecklistsViewProps> = ({
  checklists,
  onToggleStep,
  onResetChecklist,
  onAddChecklist,
  onUpdateChecklist,
  onDeleteChecklist,
  watchMode,
  userRank,
  selectedDepartment,
  onDepartmentChange,
}) => {
  const [expandedId, setExpandedId] = useState<string>(checklists[0]?.id || "");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<EmergencyChecklist | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newStepText, setNewStepText] = useState<{ [chkId: string]: string }>({});
  const [targetPrintCard, setTargetPrintCard] = useState<EmergencyChecklist | null>(null);

  const activeCardForPrint = targetPrintCard || checklists.find((c) => c.id === expandedId) || checklists[0] || null;

  const handlePrint = () => {
    const cardToPrint = checklists.find((c) => c.id === expandedId) || filteredChecklists[0] || checklists[0];
    if (cardToPrint) {
      setTargetPrintCard(cardToPrint);
      setTimeout(() => {
        window.print();
      }, 50);
    } else {
      window.print();
    }
  };

  const handlePrintSpecificCard = (chk: EmergencyChecklist) => {
    setTargetPrintCard(chk);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const isNight = watchMode === "bridge_night";

  const handleAddInlineStep = (chk: EmergencyChecklist) => {
    const text = (newStepText[chk.id] || "").trim();
    if (!text) return;

    const updatedSteps = [
      ...chk.steps,
      {
        id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        stepNumber: chk.steps.length + 1,
        actionText: text,
        assignedRole: userRank || "Watch Officer",
        isChecked: false,
      },
    ];

    onUpdateChecklist({
      ...chk,
      steps: updatedSteps,
    });

    setNewStepText((prev) => ({ ...prev, [chk.id]: "" }));
  };

  const filteredChecklists = checklists.filter((chk) => {
    const matchDept = selectedDepartment === "All" || chk.department === selectedDepartment;
    const matchSearch =
      searchQuery === "" ||
      chk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chk.solasOrSmReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chk.steps.some((s) => s.actionText.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchDept && matchSearch;
  });

  return (
    <div>
      {/* Screen Interactive View (Hidden during physical paper print) */}
      <div className="space-y-6 pb-12 animate-in fade-in duration-200 print:hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <AlertOctagon className="w-6 h-6 text-rose-500" />
              <span>Emergency Action Cards & Drill Scenarios</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Mandatory step-by-step procedures for critical onboard situations. Add custom vessel scenarios, track steps live, and keep records audit-ready.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setEditingChecklist(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Emergency Scenario</span>
            </button>

            <button
              onClick={handlePrint}
              title="Print the active/open emergency action card"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-rose-500" />
              <span>{expandedId ? "Print Active Card" : "Print Sheet"}</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search emergency scenarios, SOLAS rules, actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-rose-500"
            >
              <option value="All">All Departments</option>
              <option value="Engine">Engine</option>
              <option value="Deck">Deck</option>
              <option value="Electrical">Electrical</option>
              <option value="Safety_ISM">Safety / ISM</option>
              <option value="Cargo">Cargo</option>
            </select>
          </div>
        </div>

        {/* Checklists List */}
        {filteredChecklists.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <AlertOctagon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Emergency Scenarios Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or department filter, or click "Add Emergency Scenario" to create one.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChecklists.map((chk) => {
              const isExpanded = expandedId === chk.id;
              const completedCount = chk.steps.filter((s) => s.isChecked).length;
              const isAllDone = chk.steps.length > 0 && completedCount === chk.steps.length;

              return (
                <div
                  key={chk.id}
                  className={`rounded-2xl border transition shadow-xs overflow-hidden ${
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
                        className={`p-2.5 rounded-xl shrink-0 ${
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
                          {chk.isCustom && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                              Vessel Custom
                            </span>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {chk.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">{chk.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold block text-slate-700 dark:text-slate-300">
                          {completedCount} / {chk.steps.length} Steps Done
                        </span>
                        <span className="text-[11px] text-rose-500 font-medium">{chk.criticalTimeWindow}</span>
                      </div>

                      <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Steps Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                        <span className="font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          Action Sequence ({completedCount}/{chk.steps.length})
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrintSpecificCard(chk);
                            }}
                            className="text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] border border-slate-200 dark:border-slate-700 shadow-2xs transition"
                            title="Print this specific emergency action card"
                          >
                            <Printer className="w-3.5 h-3.5 text-rose-500" />
                            <span>Print Card</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChecklist(chk);
                              setIsAddModalOpen(true);
                            }}
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold flex items-center gap-1 cursor-pointer px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" /> Edit Card
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onResetChecklist(chk.id);
                            }}
                            className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 cursor-pointer px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/30 text-[11px]"
                          >
                            <RotateCcw className="w-3 h-3" /> Reset
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete scenario "${chk.title}"?`)) {
                                onDeleteChecklist(chk.id);
                              }
                            }}
                            className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 cursor-pointer px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/30 text-[11px]"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
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

                      {/* Quick Inline Append Step */}
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Append additional vessel-specific drill action step..."
                          value={newStepText[chk.id] || ""}
                          onChange={(e) =>
                            setNewStepText({ ...newStepText, [chk.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddInlineStep(chk);
                          }}
                          className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-rose-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddInlineStep(chk)}
                          disabled={!(newStepText[chk.id] || "").trim()}
                          className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl disabled:opacity-40 transition"
                        >
                          + Add Step
                        </button>
                      </div>

                      {isAllDone && (
                        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-in zoom-in-95">
                          <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            All safety action steps executed and verified.
                          </span>
                          <span>Ready for Log entry / Handover</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add / Edit Emergency Modal */}
        <AddEmergencyModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingChecklist(null);
          }}
          onSave={(saved) => {
            if (editingChecklist) {
              onUpdateChecklist(saved);
            } else {
              onAddChecklist(saved);
            }
          }}
          initialData={editingChecklist || undefined}
          userRank={userRank}
        />
      </div>

      {/* DEDICATED MARITIME PRINT-ONLY DOCUMENT (Prints only the active relevant card) */}
      {activeCardForPrint && (
        <div className="hidden print:block w-full text-black font-sans bg-white p-2">
          {/* Official Marine Header */}
          <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="AnchorAI Official Seal"
                className="w-16 h-16 object-contain rounded-full border border-slate-400 shrink-0"
              />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                  ANCHOR AI • MARITIME SAFETY MANAGEMENT SYSTEM (SMS)
                </div>
                <h1 className="text-xl font-black text-black uppercase tracking-tight">
                  EMERGENCY ACTION CARD & DRILL SCENARIO
                </h1>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  Vessel: <span className="font-bold underline">{localStorage.getItem("anchor_ai_vessel_name") || "M/V PACIFIC VOYAGER"}</span> • SOLAS / Class Reference: <span className="font-mono font-bold">{activeCardForPrint.solasOrSmReference}</span>
                </div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="inline-block border border-black font-bold uppercase px-2 py-0.5 text-[10px] bg-slate-100">
                {activeCardForPrint.department} DEPARTMENT
              </div>
              <div className="text-[11px] font-bold text-slate-900 mt-1">
                Target Window: {activeCardForPrint.criticalTimeWindow}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                Printed: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Scenario Overview Box */}
          <div className="border border-slate-400 bg-slate-50 p-3 rounded mb-4 print-avoid-break">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Scenario / Alarm Title:
            </div>
            <div className="text-base font-black text-black">{activeCardForPrint.title}</div>
            <p className="text-xs text-slate-800 mt-1 leading-relaxed">{activeCardForPrint.description}</p>
          </div>

          {/* Action Sequence Table */}
          <div className="mb-4 print-avoid-break">
            <div className="text-xs font-bold uppercase tracking-wider text-black mb-1.5 flex items-center justify-between">
              <span>Mandatory Action Sequence ({activeCardForPrint.steps.length} Steps)</span>
              <span className="text-[10px] text-slate-600 font-normal">Execute in priority sequence without delay</span>
            </div>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-slate-200 text-black font-bold border-b border-black">
                  <th className="p-2 border border-black w-10 text-center">#</th>
                  <th className="p-2 border border-black w-14 text-center">Done</th>
                  <th className="p-2 border border-black text-left">Action Procedure & Safety Verification</th>
                  <th className="p-2 border border-black w-36 text-left">Assigned Role</th>
                  <th className="p-2 border border-black w-24 text-center">Initial / Time</th>
                </tr>
              </thead>
              <tbody>
                {activeCardForPrint.steps.map((step, idx) => (
                  <tr key={step.id} className="border-b border-slate-300">
                    <td className="p-2 border border-black text-center font-bold font-mono">{idx + 1}</td>
                    <td className="p-2 border border-black text-center">
                      <span className="inline-block w-4 h-4 border border-black text-center font-bold text-xs leading-4">
                        {step.isChecked ? "✓" : ""}
                      </span>
                    </td>
                    <td className="p-2 border border-black font-medium text-black">
                      <div>{step.actionText}</div>
                      {step.mandatoryRule && (
                        <div className="text-[10px] font-mono text-slate-600 mt-0.5 font-bold">
                          Mandate: {step.mandatoryRule}
                        </div>
                      )}
                    </td>
                    <td className="p-2 border border-black font-semibold text-slate-900 text-[11px]">
                      {step.assignedRole}
                    </td>
                    <td className="p-2 border border-black text-center text-slate-400 text-[10px]">
                      ____:____
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Verification & Sign-Off Block */}
          <div className="border border-black rounded p-3 mt-4 print-avoid-break">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-2">
              Official Drill / Emergency Response Verification & Command Sign-Off
            </div>
            <div className="grid grid-cols-3 gap-6 text-xs">
              <div className="border-t border-black pt-1">
                <div className="font-bold text-black">Officer on Duty / OOW</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Signature: ______________________</div>
                <div className="text-[10px] text-slate-600">Date/Time: ______________________</div>
              </div>
              <div className="border-t border-black pt-1">
                <div className="font-bold text-black">Chief Engineer / C/E</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Signature: ______________________</div>
                <div className="text-[10px] text-slate-600">Date/Time: ______________________</div>
              </div>
              <div className="border-t border-black pt-1">
                <div className="font-bold text-black">Master / Captain</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Signature: ______________________</div>
                <div className="text-[10px] text-slate-600">Date/Time: ______________________</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
