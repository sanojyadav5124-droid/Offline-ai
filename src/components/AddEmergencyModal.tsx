import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, ShieldAlert, Clock, BookOpen, UserCheck, AlertTriangle } from "lucide-react";
import { EmergencyChecklist, MaritimeDepartment } from "../types";

interface AddEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (checklist: EmergencyChecklist) => void;
  initialData?: EmergencyChecklist | null;
  userRank: string;
}

const DEPARTMENTS: { value: MaritimeDepartment; label: string }[] = [
  { value: "Engine", label: "Engine Department" },
  { value: "Deck", label: "Deck Department" },
  { value: "Electrical", label: "Electrical / Automation" },
  { value: "Safety_ISM", label: "Safety & ISM Management" },
  { value: "Cargo", label: "Cargo & Ballast Operations" },
];

export const AddEmergencyModal: React.FC<AddEmergencyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  userRank,
}) => {
  const [department, setDepartment] = useState<MaritimeDepartment>("Engine");
  const [title, setTitle] = useState("");
  const [solasOrSmReference, setSolasOrSmReference] = useState("");
  const [description, setDescription] = useState("");
  const [criticalTimeWindow, setCriticalTimeWindow] = useState("< 3 minutes");
  const [steps, setSteps] = useState<
    { id: string; stepNumber: number; actionText: string; mandatoryRule?: string; isChecked: boolean; assignedRole: string }[]
  >([
    {
      id: "step-1",
      stepNumber: 1,
      actionText: "",
      mandatoryRule: "",
      isChecked: false,
      assignedRole: "Duty Engineer / OOW",
    },
  ]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setDepartment(initialData.department);
      setTitle(initialData.title);
      setSolasOrSmReference(initialData.solasOrSmReference);
      setDescription(initialData.description);
      setCriticalTimeWindow(initialData.criticalTimeWindow);
      setSteps(
        initialData.steps && initialData.steps.length > 0
          ? initialData.steps
          : [
              {
                id: "step-1",
                stepNumber: 1,
                actionText: "",
                mandatoryRule: "",
                isChecked: false,
                assignedRole: "Duty Engineer / OOW",
              },
            ]
      );
    } else {
      setDepartment("Engine");
      setTitle("");
      setSolasOrSmReference("");
      setDescription("");
      setCriticalTimeWindow("< 3 minutes");
      setSteps([
        {
          id: "step-1",
          stepNumber: 1,
          actionText: "",
          mandatoryRule: "",
          isChecked: false,
          assignedRole: "Duty Engineer / OOW",
        },
      ]);
    }
    setError("");
  }, [initialData, isOpen]);

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        id: `step-${Date.now()}-${prev.length + 1}`,
        stepNumber: prev.length + 1,
        actionText: "",
        mandatoryRule: "",
        isChecked: false,
        assignedRole: "Duty Engineer / OOW",
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    });
  };

  const handleStepChange = (index: number, field: "actionText" | "mandatoryRule" | "assignedRole", value: string) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();

    // Flexible saving check: at least title or description or a step must exist
    const hasAnyStep = steps.some((s) => s.actionText.trim().length > 0);
    if (!cleanTitle && !cleanDesc && !hasAnyStep) {
      setError("Please provide at least a Scenario Title or a brief action step to save.");
      return;
    }

    const finalTitle = cleanTitle || "Untitled Emergency Action Plan";
    const finalRef = solasOrSmReference.trim() || "SOLAS II-1 / ISM SMS Sec. 8";
    const finalDesc = cleanDesc || "Standard operational emergency sequence and mitigation protocol.";
    const finalTime = criticalTimeWindow.trim() || "Immediate (< 5 mins)";

    // Clean steps, remove completely blank ones or fill fallback
    const validSteps = steps
      .filter((s) => s.actionText.trim().length > 0)
      .map((s, idx) => ({
        ...s,
        stepNumber: idx + 1,
        actionText: s.actionText.trim(),
        mandatoryRule: s.mandatoryRule?.trim() || undefined,
        assignedRole: s.assignedRole.trim() || "Assigned Duty Officer",
      }));

    const finalSteps =
      validSteps.length > 0
        ? validSteps
        : [
            {
              id: `step-1`,
              stepNumber: 1,
              actionText: "Verify alarm, announce situation via PA, and notify Master/Chief Engineer.",
              mandatoryRule: "SOLAS Reg III/6",
              isChecked: false,
              assignedRole: "Officer of the Watch",
            },
          ];

    const emergencyCard: EmergencyChecklist = {
      id: initialData?.id || `emg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      department,
      title: finalTitle,
      solasOrSmReference: finalRef,
      description: finalDesc,
      criticalTimeWindow: finalTime,
      steps: finalSteps,
      isCustom: true,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    onSave(emergencyCard);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative max-w-3xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-red-600/10 via-amber-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {initialData ? "Edit Emergency Action Card" : "New Emergency Scenario & Action Card"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define standardized SOLAS/ISM critical response sequence and assigned role drills
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Department & Time Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as MaritimeDepartment)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Critical Time Window (Execution limit)
              </label>
              <input
                type="text"
                placeholder="e.g. < 2 minutes, Immediate, < 10 minutes"
                value={criticalTimeWindow}
                onChange={(e) => setCriticalTimeWindow(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Scenario / Emergency Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Total Blackout & Dead Ship Quick Recovery Protocol"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
            />
          </div>

          {/* Reference & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-500" />
                SOLAS / SMS Reference
              </label>
              <input
                type="text"
                placeholder="e.g. SOLAS II-1 Reg 43 / SMS Contingency Sec 8.2"
                value={solasOrSmReference}
                onChange={(e) => setSolasOrSmReference(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Scenario Summary / Context
              </label>
              <input
                type="text"
                placeholder="e.g. Actions when both auxiliary engines fail and bus trips"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Steps Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                Actionable Drill & Response Steps ({steps.length})
              </label>
              <button
                type="button"
                onClick={handleAddStep}
                className="px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Step
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Assigned Role (e.g. Duty Engineer, OOW, ETO)"
                        value={step.assignedRole}
                        onChange={(e) => handleStepChange(idx, "assignedRole", e.target.value)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-amber-500 w-44"
                      />
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="Remove Step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Specific actionable order (e.g. Verify Emergency Switchboard is energized via Emergency D/G)"
                    value={step.actionText}
                    onChange={(e) => handleStepChange(idx, "actionText", e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
                  />

                  <input
                    type="text"
                    placeholder="Optional regulatory / SOLAS sub-rule note (e.g. SOLAS II-1 Reg 43 - Max 45 sec auto-transfer)"
                    value={step.mandatoryRule || ""}
                    onChange={(e) => handleStepChange(idx, "mandatoryRule", e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recorded by: <span className="font-semibold text-slate-700 dark:text-slate-300">{userRank}</span>
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              {initialData ? "Save Changes" : "Create Emergency Scenario Card"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
