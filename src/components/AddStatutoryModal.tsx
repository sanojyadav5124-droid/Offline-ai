import React, { useState } from "react";
import { X, ShieldCheck, Scale, AlertCircle, Plus } from "lucide-react";
import { MaritimeDepartment, StatutoryRequirement } from "../types";

interface AddStatutoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (req: {
    code: string;
    title: string;
    governing: StatutoryRequirement["governingBody"];
    limit: string;
    interval: StatutoryRequirement["testInterval"];
    category: MaritimeDepartment;
  }) => void;
  userRank: string;
}

const DEPARTMENTS: { value: MaritimeDepartment; label: string }[] = [
  { value: "Engine", label: "Engine Department" },
  { value: "Deck", label: "Deck Department" },
  { value: "Electrical", label: "Electrical / Automation" },
  { value: "Safety_ISM", label: "Safety & ISM Management" },
  { value: "Cargo", label: "Cargo & Ballast Operations" },
];

export const AddStatutoryModal: React.FC<AddStatutoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userRank,
}) => {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [governing, setGoverning] = useState<StatutoryRequirement["governingBody"]>("IMO SOLAS");
  const [limit, setLimit] = useState("");
  const [interval, setInterval] = useState<StatutoryRequirement["testInterval"]>("Monthly");
  const [category, setCategory] = useState<MaritimeDepartment>("Engine");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    const cleanTitle = title.trim();
    const cleanLimit = limit.trim();

    if (!cleanCode && !cleanTitle && !cleanLimit) {
      setError("Please provide at least a Regulation Code or Requirement Title.");
      return;
    }

    onSave({
      code: cleanCode || "SOLAS / Class Mandatory Standard",
      title: cleanTitle || "Statutory Operational Requirement",
      governing,
      limit: cleanLimit || "Nominal design baseline per maker / flag state standard",
      interval,
      category,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Statutory Rule to Matrix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define mandatory IMO / Class limits & test intervals
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaritimeDepartment)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Governing Body
              </label>
              <select
                value={governing}
                onChange={(e) =>
                  setGoverning(e.target.value as StatutoryRequirement["governingBody"])
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
              >
                <option value="IMO SOLAS">IMO SOLAS</option>
                <option value="IMO MARPOL">IMO MARPOL</option>
                <option value="STCW">STCW</option>
                <option value="MLC 2006">MLC 2006</option>
                <option value="Class / IACS">Class / IACS</option>
                <option value="Maker Standard">Maker Standard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Regulation Code / Standard *
            </label>
            <input
              type="text"
              placeholder="e.g. SOLAS II-2 Reg 10, MARPOL Annex VI Reg 14"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Requirement Title / System *
            </label>
            <input
              type="text"
              placeholder="e.g. Emergency Fire Pump Starting & Minimum Pressure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Statutory Limit / Standard Value
              </label>
              <input
                type="text"
                placeholder="e.g. ≥ 2.5 bar at 2 jets, ≤ 15.0 PPM"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mandatory Test Interval
              </label>
              <select
                value={interval}
                onChange={(e) =>
                  setInterval(e.target.value as StatutoryRequirement["testInterval"])
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="3-Monthly">3-Monthly</option>
                <option value="Annual">Annual</option>
                <option value="Prior Departure">Prior Departure</option>
                <option value="Continuous">Continuous</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Statutory Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
