import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  Shield,
  Anchor,
  Compass,
  Wrench,
  Zap,
  CheckCircle2,
  Clock,
  IdCard,
  Building,
} from "lucide-react";
import {
  SeafarerProfile,
  MaritimeDepartment,
  MARITIME_RANKS,
  ALL_MARITIME_RANKS,
} from "../types";

interface SeafarerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SeafarerProfile;
  onSaveProfile: (profile: SeafarerProfile) => void;
  watchMode?: string;
}

export const SeafarerProfileModal: React.FC<SeafarerProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [selectedRank, setSelectedRank] = useState(profile.rank || "Chief Engineer");
  const [name, setName] = useState(profile.name || "Officer on Duty");
  const [seafarerId, setSeafarerId] = useState(profile.seafarerId || "CDC-IND-784291");
  const [department, setDepartment] = useState<MaritimeDepartment>(
    profile.department || "Engine"
  );
  const [watchSchedule, setWatchSchedule] = useState(
    profile.watchSchedule || "0800-1200 / Day Worker"
  );
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("All");

  useEffect(() => {
    if (isOpen) {
      setSelectedRank(profile.rank || "Chief Engineer");
      setName(profile.name || "Officer on Duty");
      setSeafarerId(profile.seafarerId || "CDC-IND-784291");
      setDepartment(profile.department || "Engine");
      setWatchSchedule(profile.watchSchedule || "0800-1200 / Day Worker");
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleRankSelect = (rankValue: string, rankDept: MaritimeDepartment) => {
    setSelectedRank(rankValue);
    setDepartment(rankDept);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SeafarerProfile = {
      rank: selectedRank,
      name: name.trim() || "Officer on Duty",
      seafarerId: seafarerId.trim() || "CDC-OFFSHORE",
      department,
      watchSchedule,
    };
    onSaveProfile(updated);
    onClose();
  };

  const getDeptIcon = (dept: MaritimeDepartment) => {
    switch (dept) {
      case "Engine":
        return <Wrench className="w-3.5 h-3.5 text-amber-500" />;
      case "Deck":
        return <Compass className="w-3.5 h-3.5 text-blue-500" />;
      case "Electrical":
        return <Zap className="w-3.5 h-3.5 text-cyan-500" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-amber-500/10 via-blue-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Officer & Seafarer Profile Setup
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                  {selectedRank}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your maritime rank for all newly created logs, tests & records
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Active Status Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
            <Anchor className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">
                Active Profile: <span className="text-amber-600 dark:text-amber-400 underline font-black">{selectedRank}</span>
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                When you switch rank, all subsequent machinery readings, defect logs, scratchpad notes, and statutory tests will be tagged under this officer profile.
              </p>
            </div>
          </div>

          {/* Quick Rank Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Select Your Officer / Crew Rank
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                {["All", "Engine", "Deck", "Electrical"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryTab(cat)}
                    className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                      activeCategoryTab === cat
                        ? "bg-slate-900 dark:bg-slate-700 text-amber-400 font-bold"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
              {(activeCategoryTab === "All"
                ? ALL_MARITIME_RANKS
                : ALL_MARITIME_RANKS.filter((r) => r.department === activeCategoryTab)
              ).map((rankItem) => {
                const isSelected = selectedRank === rankItem.value;
                return (
                  <button
                    key={rankItem.value}
                    type="button"
                    onClick={() => handleRankSelect(rankItem.value, rankItem.department)}
                    className={`p-2.5 rounded-lg border text-left transition flex items-start justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 dark:bg-amber-500/20 border-amber-500 text-slate-900 dark:text-white shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/50"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        {getDeptIcon(rankItem.department)}
                        <span className="font-bold text-xs">{rankItem.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {rankItem.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Officer Details (Name, CDC, Watch Schedule) */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              2. Personnel & Watch Details (Optional)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  Officer / Seafarer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. S. K. Yadav, Capt. J. Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <IdCard className="w-3.5 h-3.5 text-slate-400" />
                  Seafarer ID / CDC Book No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. CDC-IND-784291"
                  value={seafarerId}
                  onChange={(e) => setSeafarerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  Primary Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as MaritimeDepartment)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Engine">Engine Department</option>
                  <option value="Deck">Deck Department</option>
                  <option value="Electrical">Electrical / Automation</option>
                  <option value="Safety_ISM">Safety & ISM Management</option>
                  <option value="Cargo">Cargo & Ballast Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Watch / Duty Schedule
                </label>
                <select
                  value={watchSchedule}
                  onChange={(e) => setWatchSchedule(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500"
                >
                  <option value="0800-1200 & 2000-2400 (3/E & 3/O)">0800-1200 & 2000-2400 (3rd Officer / 3rd Eng)</option>
                  <option value="0000-0400 & 1200-1600 (2/E & 2/O)">0000-0400 & 1200-1600 (2nd Officer / 2nd Eng)</option>
                  <option value="0400-0800 & 1600-2000 (C/O & 2/E)">0400-0800 & 1600-2000 (Chief Officer / 2nd Eng)</option>
                  <option value="0800-1700 Day Worker (Master, C/E, ETO)">0800-1700 Day Worker (Master, C/E, ETO)</option>
                  <option value="Cargo / Port Watch Cycle">Cargo / Port Watch Cycle</option>
                  <option value="UMS Unattended Machinery Space Duty">UMS Duty Engineer</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="text-xs text-slate-500">
            Selected Rank: <strong className="text-slate-800 dark:text-slate-200">{selectedRank}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Set Active Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
