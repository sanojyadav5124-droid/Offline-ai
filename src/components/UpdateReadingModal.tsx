import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ShieldCheck, Edit2, Calendar, User, UserCheck } from "lucide-react";
import { EquipmentKnowledgeItem, CurrentReading, MARITIME_RANKS } from "../types";

interface UpdateReadingModalProps {
  equipment: EquipmentKnowledgeItem | null;
  onClose: () => void;
  onSave: (updatedEquipment: EquipmentKnowledgeItem) => void;
  userRank?: string;
}

export const UpdateReadingModal: React.FC<UpdateReadingModalProps> = ({
  equipment,
  onClose,
  onSave,
  userRank,
}) => {
  const [measuredValue, setMeasuredValue] = useState("");
  const [testedDate, setTestedDate] = useState(new Date().toISOString().split("T")[0]);
  const [testedByRank, setTestedByRank] = useState(userRank || "Chief Engineer");
  const [status, setStatus] = useState<CurrentReading["status"]>("Compliant");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (equipment) {
      setMeasuredValue(equipment.currentReading.measuredValue || "");
      setTestedDate(equipment.currentReading.lastTestedDate || new Date().toISOString().split("T")[0]);
      // Prioritize the user's active rank when logging a live test reading
      setTestedByRank(userRank || equipment.currentReading.testedByRank || "Chief Engineer");
      setStatus(equipment.currentReading.status || "Compliant");
      setNotes(equipment.currentReading.notes || "");
    }
  }, [equipment, userRank]);

  if (!equipment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: EquipmentKnowledgeItem = {
      ...equipment,
      currentReading: {
        ...equipment.currentReading,
        measuredValue,
        lastTestedDate: testedDate,
        testedByRank: testedByRank.trim() || userRank || "Chief Engineer",
        status,
        notes,
      },
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Edit2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">Log Live Vessel Test Reading</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{equipment.equipmentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Statutory Reference Banner (Amber) */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Statutory Rule Limit ({equipment.statutoryRequirement.regulationCode}):</span>
            </div>
            <div className="font-black text-sm text-amber-950 dark:text-amber-200">
              {equipment.statutoryRequirement.statutoryLimitValue}
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
              {equipment.statutoryRequirement.requirementSummary}
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              New Measured Reading / Test Value *
            </label>
            <input
              type="text"
              required
              value={measuredValue}
              onChange={(e) => setMeasuredValue(e.target.value)}
              placeholder="e.g. 2.8 PPM or 21.2 Seconds"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Compliance Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Compliant">Compliant</option>
                <option value="Caution">Caution / Trending</option>
                <option value="Non-Compliant">Non-Compliant</option>
                <option value="Pending Test">Pending Test</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date Tested</label>
              <input
                type="date"
                value={testedDate}
                onChange={(e) => setTestedDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Tested & Verified By (Rank)
              </label>
              {userRank && (
                <button
                  type="button"
                  onClick={() => setTestedByRank(userRank)}
                  className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  title="Use currently active profile rank"
                >
                  <UserCheck className="w-3 h-3" />
                  Use My Profile ({userRank})
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={testedByRank}
                onChange={(e) => setTestedByRank(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                {MARITIME_RANKS.map((group) => (
                  <optgroup key={group.category} label={group.category} className="bg-slate-900 text-amber-400 font-bold">
                    {group.ranks.map((r) => (
                      <option key={r.value} value={r.value} className="bg-slate-900 text-white font-normal">
                        {r.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <input
                type="text"
                value={testedByRank}
                onChange={(e) => setTestedByRank(e.target.value)}
                placeholder="Or type custom rank / name..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Operational Notes & Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Solenoid valve response test OK, fresh water flushing cycle performed."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Live Reading</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
