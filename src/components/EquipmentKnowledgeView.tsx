import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Wrench,
  ChevronDown,
  ChevronUp,
  Edit2,
  Sliders,
  Trash2,
} from "lucide-react";
import {
  EquipmentKnowledgeItem,
  MaritimeDepartment,
  TroubleshootingEntry,
  PhotoAttachment,
  WatchMode,
} from "../types";

export const VAULT_DEPARTMENTS: {
  id: MaritimeDepartment | "All";
  label: string;
  icon: string;
  color: string;
  badgeClass: string;
}[] = [
  { id: "All", label: "All Departments", icon: "🌐", color: "bg-slate-800 text-slate-200", badgeClass: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30" },
  { id: "Engine", label: "Engine Room", icon: "⚙️", color: "bg-amber-500/20 text-amber-700 dark:text-amber-300", badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  { id: "Deck", label: "Deck & Bridge", icon: "🧭", color: "bg-blue-500/20 text-blue-700 dark:text-blue-300", badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30" },
  { id: "Electrical", label: "Electrical / ETO", icon: "⚡", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300", badgeClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30" },
  { id: "Safety_ISM", label: "Safety / ISM", icon: "🛡️", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300", badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  { id: "Cargo", label: "Cargo Operations", icon: "📦", color: "bg-purple-500/20 text-purple-700 dark:text-purple-300", badgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30" },
];

interface EquipmentKnowledgeViewProps {
  equipmentList: EquipmentKnowledgeItem[];
  troubleshootingList: TroubleshootingEntry[];
  selectedDepartment: MaritimeDepartment | "All";
  setSelectedDepartment: (dept: MaritimeDepartment | "All") => void;
  onOpenAddModal: (prefillEquipmentName?: string) => void;
  onEditEquipment: (equipment: EquipmentKnowledgeItem) => void;
  onDeleteEquipment: (equipmentId: string) => void;
  onSelectPhoto: (photo: PhotoAttachment) => void;
  onUpdateReading: (equipment: EquipmentKnowledgeItem) => void;
  watchMode: WatchMode;
  targetEquipmentId?: string | null;
}

export const EquipmentKnowledgeView: React.FC<EquipmentKnowledgeViewProps> = ({
  equipmentList,
  troubleshootingList,
  selectedDepartment,
  setSelectedDepartment,
  onOpenAddModal,
  onEditEquipment,
  onDeleteEquipment,
  onSelectPhoto,
  onUpdateReading,
  watchMode,
  targetEquipmentId,
}) => {
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    if (targetEquipmentId) {
      return { [targetEquipmentId]: true };
    }
    return {};
  });
  const [itemToDelete, setItemToDelete] = useState<EquipmentKnowledgeItem | null>(null);

  useEffect(() => {
    if (targetEquipmentId) {
      setExpandedIds((prev) => ({ ...prev, [targetEquipmentId]: true }));
      const el = document.getElementById(`eq-${targetEquipmentId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [targetEquipmentId]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filtered = equipmentList.filter((eq) => {
    const matchesDept = selectedDepartment === "All" || eq.department === selectedDepartment;
    const matchesSearch =
      search.trim() === "" ||
      eq.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      eq.maker.toLowerCase().includes(search.toLowerCase()) ||
      eq.area.toLowerCase().includes(search.toLowerCase()) ||
      eq.statutoryRequirement.regulationCode.toLowerCase().includes(search.toLowerCase()) ||
      eq.makerDesignSpecs.some((s) => s.label.toLowerCase().includes(search.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const isNight = watchMode === "bridge_night";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Department Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-sky-500" />
            <span>Equipment & Statutory Technical Vault</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Standard maker tolerances and statutory rules (amber) juxtaposed with current onboard vessel readings (emerald).
          </p>
        </div>

        <button
          onClick={() => onOpenAddModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-sm shadow-sm transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Machinery / Spec</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Department Chips with matching Dashboard symbols */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none">
          {VAULT_DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              type="button"
              onClick={() => setSelectedDepartment(dept.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedDepartment === dept.id
                  ? "bg-amber-500 text-slate-950 shadow-xs font-bold"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>{dept.icon}</span>
              <span>{dept.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by maker, area, or rule..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Equipment Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500">
            <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-sm">No equipment records found matching the filter.</p>
            <p className="text-xs text-slate-400 mt-1">Try switching departments or clear your search query.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isExpanded = !!expandedIds[item.id];
            const linkedLogs = troubleshootingList.filter(
              (t) =>
                t.equipmentId === item.id ||
                t.equipmentName.toLowerCase().includes(item.equipmentName.toLowerCase())
            );

            // Match exact department symbol and color style from dashboard
            const deptInfo = VAULT_DEPARTMENTS.find((d) => d.id === item.department) || {
              id: item.department,
              label: item.department,
              icon: "⚙️",
              color: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
              badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
            };

            return (
              <div
                key={item.id}
                id={`eq-${item.id}`}
                className={`rounded-xl border transition shadow-xs overflow-hidden ${
                  isNight
                    ? "bg-stone-900/90 border-red-950 text-red-200"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition"
                >
                  <div className="flex items-start gap-3">
                    {/* Dedicated Department Symbol Box matching Dashboard */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 mt-0.5 border ${deptInfo.badgeClass} shadow-xs`}
                      title={`${deptInfo.label} Department`}
                    >
                      <span>{deptInfo.icon}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${deptInfo.badgeClass}`}>
                          <span>{deptInfo.icon}</span>
                          <span>{deptInfo.label}</span>
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          📍 {item.area}
                        </span>
                        {item.installedLocation && (
                          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                            [{item.installedLocation}]
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {item.equipmentName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Maker: <strong className="text-slate-700 dark:text-slate-300">{item.maker}</strong> • Model:{" "}
                        <span className="font-mono text-slate-700 dark:text-slate-300">{item.model}</span>{" "}
                        {item.serialNo && `• S/N: ${item.serialNo}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Expand Toggle */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-wrap items-center gap-2 self-end md:self-center"
                  >
                    {/* Log Reading */}
                    <button
                      type="button"
                      onClick={() => onUpdateReading(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Log a new test reading / verification"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Log Reading</span>
                    </button>

                    {/* Log Incident */}
                    <button
                      type="button"
                      onClick={() => onOpenAddModal(item.equipmentName)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Log a breakdown experience for this machinery"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Log Incident</span>
                    </button>

                    {/* Edit Specifications & Regulatory Standards */}
                    <button
                      type="button"
                      onClick={() => onEditEquipment(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Edit specifications, maker parameters, or statutory regulatory standards"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Edit Specs</span>
                    </button>

                    {/* Delete Technical Record */}
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center cursor-pointer"
                      title="Delete this technical vault entry"
                      aria-label="Delete equipment record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Fixed & Fully Working Details / Specs Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isExpanded
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-400 dark:border-slate-600 shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                      aria-expanded={isExpanded}
                      title={isExpanded ? "Collapse machinery details" : "Expand maker specs, spares, photos & breakdown logs"}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
                          <span>Hide Specs</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
                          <span>View Specs</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Core Dual-Color Statutory vs Live Reading Section */}
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Amber Section: Statutory Law & International Code Requirements */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 text-xs flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>Pre-filled Requirement by Law</span>
                        </div>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30">
                          {item.statutoryRequirement.regulationCode}
                        </span>
                      </div>

                      <div className="my-2.5">
                        <div className="text-[11px] uppercase tracking-wider text-amber-900/70 dark:text-amber-300/70 font-bold">
                          Statutory Standard / Tolerance Limit
                        </div>
                        <div className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-200 my-0.5">
                          {item.statutoryRequirement.statutoryLimitValue}
                        </div>
                        <p className="text-xs text-amber-950/80 dark:text-amber-100/80 leading-relaxed">
                          {item.statutoryRequirement.requirementSummary}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-amber-900/80 dark:text-amber-300/80">
                      <span>
                        <strong>Tolerance:</strong> {item.statutoryRequirement.standardTolerance}
                      </span>
                      <span className="font-semibold px-2 py-0.5 rounded bg-amber-500/20">
                        {item.statutoryRequirement.testInterval} Test
                      </span>
                    </div>
                  </div>

                  {/* Emerald Section: Current Live Onboard Vessel Readings */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 text-xs flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Current Onboard Vessel Record</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.currentReading.status === "Compliant"
                              ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-800 dark:text-rose-200 border border-rose-500/30"
                          }`}
                        >
                          {item.currentReading.status}
                        </span>
                      </div>

                      <div className="my-2.5">
                        <div className="text-[11px] uppercase tracking-wider text-emerald-900/70 dark:text-emerald-300/70 font-bold">
                          Last Measured Value / Test Result
                        </div>
                        <div className="text-base sm:text-lg font-black text-emerald-900 dark:text-emerald-200 my-0.5">
                          {item.currentReading.measuredValue}
                        </div>
                        <p className="text-xs text-emerald-950/80 dark:text-emerald-100/80 leading-relaxed">
                          {item.currentReading.notes || "Logged and verified within nominal tolerances."}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-900/80 dark:text-emerald-300/80">
                      <span>
                        <strong>Tested:</strong> {item.currentReading.lastTestedDate}
                      </span>
                      <span className="font-semibold">By: {item.currentReading.testedByRank}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Maker Specs, Spares, Photos, and Linked Incidents */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-5 animate-in slide-in-from-top-2">
                    {/* Maker Specs Table */}
                    {item.makerDesignSpecs.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-sky-500" /> Maker Design Parameters & Safe Operating Bands
                        </h4>
                        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold">
                              <tr>
                                <th className="p-2.5">Operating Parameter</th>
                                <th className="p-2.5">Nominal / Running Band</th>
                                <th className="p-2.5">Safety Alarm / Trip Threshold</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 font-mono">
                              {item.makerDesignSpecs.map((spec, i) => (
                                <tr key={i}>
                                  <td className="p-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">
                                    {spec.label}
                                  </td>
                                  <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                    {spec.nominalValue}
                                  </td>
                                  <td className="p-2.5 text-rose-600 dark:text-rose-400 font-bold">
                                    {spec.alarmLimit}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Quick Advice / Operational notes */}
                    {item.quickNotes && (
                      <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-900 dark:text-sky-200">
                        <strong>Chief Engineer / Maker Operational Note:</strong> {item.quickNotes}
                      </div>
                    )}

                    {/* Critical Spares */}
                    {item.criticalSparesOnboard.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                          Critical Spares Required Onboard
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.criticalSparesOnboard.map((spare, i) => (
                            <div
                              key={i}
                              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>{spare}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attached Photos / Schematics */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-sky-400" /> Attached Photos, Nameplates & Schematics
                        </h4>
                        <button
                          type="button"
                          onClick={() => onEditEquipment(item)}
                          className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Manage Photos
                        </button>
                      </div>

                      {item.photos.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No images or drawings attached yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {item.photos.map((photo) => (
                            <div
                              key={photo.id}
                              onClick={() => onSelectPhoto(photo)}
                              className="group relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-video cursor-pointer hover:border-amber-400 transition"
                            >
                              <img
                                src={photo.dataUrl}
                                alt={photo.caption}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                                <p className="text-[10px] text-white font-medium truncate">{photo.caption}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Linked Troubleshooting History */}
                    {linkedLogs.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-amber-500" /> Past Breakdown Logs for this Machinery (
                          {linkedLogs.length})
                        </h4>
                        <div className="space-y-2">
                          {linkedLogs.map((log) => (
                            <div
                              key={log.id}
                              className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {log.symptomOrAlarm}
                                </span>
                                <span className="text-[10px] text-slate-400">{log.dateOfIncident}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400">
                                <strong className="text-amber-600 dark:text-amber-400">Fix:</strong> {log.actionTakenAndFix}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technical Vault Management Footer */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEditEquipment(item)}
                          className="px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Edit Full Technical & Regulatory Specs</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateReading(item)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Log Verification Reading</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Entry</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Machinery Record?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action will remove the technical vault record.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <p className="font-bold">{itemToDelete.equipmentName} ({itemToDelete.maker} {itemToDelete.model})</p>
              <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80">
                Regulatory Code: {itemToDelete.statutoryRequirement.regulationCode} • Area: {itemToDelete.area}
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete this technical vault entry? The deletion will be logged in the vessel change log audit trail.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteEquipment(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
