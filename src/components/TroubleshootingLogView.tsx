import React, { useState } from "react";
import {
  Wrench,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Camera,
  Tag,
  BookOpen,
  Filter,
  User,
  ShieldAlert,
  ChevronRight,
  Printer,
} from "lucide-react";
import { TroubleshootingEntry, MaritimeDepartment, PhotoAttachment, WatchMode } from "../types";

interface TroubleshootingLogViewProps {
  logs: TroubleshootingEntry[];
  selectedDepartment: MaritimeDepartment | "All";
  setSelectedDepartment: (dept: MaritimeDepartment | "All") => void;
  onOpenAddModal: (prefillEquipmentName?: string) => void;
  onSelectPhoto: (photo: PhotoAttachment) => void;
  watchMode: WatchMode;
  targetLogId?: string | null;
}

export const TroubleshootingLogView: React.FC<TroubleshootingLogViewProps> = ({
  logs,
  selectedDepartment,
  setSelectedDepartment,
  onOpenAddModal,
  onSelectPhoto,
  watchMode,
  targetLogId,
}) => {
  const [search, setSearch] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [targetPrintLog, setTargetPrintLog] = useState<TroubleshootingEntry | null>(null);

  const severities = ["All", "Emergency / Critical", "Operational Warning", "Routine Defect", "Handover Note"];

  const handlePrintLog = (log: TroubleshootingEntry) => {
    setTargetPrintLog(log);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesDept = selectedDepartment === "All" || log.department === selectedDepartment;
    const matchesSeverity = selectedSeverity === "All" || log.severity === selectedSeverity;
    const matchesSearch =
      search.trim() === "" ||
      log.symptomOrAlarm.toLowerCase().includes(search.toLowerCase()) ||
      log.rootCause.toLowerCase().includes(search.toLowerCase()) ||
      log.actionTakenAndFix.toLowerCase().includes(search.toLowerCase()) ||
      log.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      log.area.toLowerCase().includes(search.toLowerCase()) ||
      log.sparesUsed.toLowerCase().includes(search.toLowerCase()) ||
      log.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    return matchesDept && matchesSeverity && matchesSearch;
  });

  const isNight = watchMode === "bridge_night";

  return (
    <div>
      {/* Screen Interactive Feed (Hidden during print) */}
      <div className="space-y-6 animate-in fade-in duration-200 print:hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Wrench className="w-6 h-6 text-emerald-500" />
              <span>Breakdown Experiences & Solutions Log</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Capture onboard tribal troubleshooting knowledge before sign-off so experience is never lost at sea.
            </p>
          </div>

          <button
            onClick={() => onOpenAddModal()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-sm shadow-sm transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log New Experience</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Severity Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
            {severities.map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedSeverity === sev
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-xs"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symptoms, alarms, parts, tags..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Logs Feed */}
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500">
              <Wrench className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm">No troubleshooting experiences match your search.</p>
              <p className="text-xs text-slate-400 mt-1">Clear your search or log a new breakdown event.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                id={`tr-${log.id}`}
                className={`rounded-xl border transition shadow-xs overflow-hidden ${
                  isNight
                    ? "bg-stone-900/90 border-red-950 text-red-200"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/60"
                }`}
              >
                {/* Card Header */}
                <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          log.severity === "Emergency / Critical"
                            ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                            : log.severity === "Operational Warning"
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {log.severity}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {log.department} • 📍 {log.area}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {log.symptomOrAlarm}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Machinery: <strong className="text-slate-700 dark:text-slate-200">{log.equipmentName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 block">
                        {log.dateOfIncident}
                      </span>
                      {log.hoursLostOrDowntime && (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                          Downtime: {log.hoursLostOrDowntime}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePrintLog(log)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
                      title="Print official incident report sheet"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Print Report</span>
                    </button>
                  </div>
                </div>

                {/* Body: Root Cause, Solution, Spares & Lessons */}
                <div className="p-4 sm:p-5 space-y-4 text-xs">
                  {/* Root cause and solution grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Root cause */}
                    <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                        <AlertTriangle className="w-3.5 h-3.5" /> Identified Root Cause
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {log.rootCause}
                      </p>
                    </div>

                    {/* Solution & Action taken */}
                    <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Action Taken & Corrective Procedure
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                        {log.actionTakenAndFix}
                      </p>
                    </div>
                  </div>

                  {/* Spares Used & Lessons Learned */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {log.sparesUsed && (
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          📦 Spares & Consumables Consumed:
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">{log.sparesUsed}</p>
                      </div>
                    )}

                    {log.lessonsLearned && (
                      <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20">
                        <span className="font-bold text-sky-800 dark:text-sky-400 block mb-1">
                          💡 Key Takeaway & Preventative Advice:
                        </span>
                        <p className="text-sky-950 dark:text-sky-200">{log.lessonsLearned}</p>
                      </div>
                    )}
                  </div>

                  {/* Attached Photos */}
                  {log.photos && log.photos.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-sky-400" /> Incident Photos & Damaged Parts
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {log.photos.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => onSelectPhoto(p)}
                            className="group relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-video cursor-pointer hover:border-emerald-400 transition"
                          >
                            <img
                              src={p.dataUrl}
                              alt={p.caption}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex items-end p-1.5">
                              <span className="text-[10px] text-white truncate">{p.caption}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Tagging & Rank */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-slate-500">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Logged By: <strong className="text-slate-700 dark:text-slate-300">{log.seafarerRank}</strong></span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {log.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DEDICATED PRINT-ONLY SINGLE INCIDENT REPORT */}
      {targetPrintLog && (
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
                  ANCHOR AI • TECHNICAL BREAKDOWN & INCIDENT REPORT
                </div>
                <h1 className="text-xl font-black text-black uppercase tracking-tight">
                  MACHINERY BREAKDOWN & ROOT CAUSE DOSSIER
                </h1>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  Vessel: <span className="font-bold underline">{localStorage.getItem("anchor_ai_vessel_name") || "M/V PACIFIC VOYAGER"}</span> • Machinery: <span className="font-bold">{targetPrintLog.equipmentName}</span> • Area: <span className="font-bold">{targetPrintLog.area}</span>
                </div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="inline-block border border-black font-bold uppercase px-2 py-0.5 text-[10px] bg-slate-100">
                {targetPrintLog.severity}
              </div>
              <div className="text-[11px] font-bold text-slate-900 mt-1">
                Date: {targetPrintLog.dateOfIncident}
              </div>
              {targetPrintLog.hoursLostOrDowntime && (
                <div className="text-[10px] text-slate-700">
                  Downtime: {targetPrintLog.hoursLostOrDowntime}
                </div>
              )}
            </div>
          </div>

          {/* Alarm / Symptom */}
          <div className="border border-slate-400 bg-slate-50 p-3 rounded mb-4 print-avoid-break">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Symptom / Alarm Triggered:
            </div>
            <div className="text-base font-black text-black">{targetPrintLog.symptomOrAlarm}</div>
            <div className="text-xs text-slate-700 mt-1">Department: <strong>{targetPrintLog.department}</strong> • Reported By: <strong>{targetPrintLog.seafarerRank}</strong></div>
          </div>

          {/* Root Cause & Corrective Action */}
          <div className="grid grid-cols-2 gap-4 mb-4 print-avoid-break">
            <div className="border border-slate-400 p-3 rounded">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Identified Root Cause:
              </div>
              <p className="text-xs text-slate-900 leading-relaxed font-medium">
                {targetPrintLog.rootCause}
              </p>
            </div>

            <div className="border border-slate-400 p-3 rounded bg-slate-50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Action Taken & Corrective Procedure:
              </div>
              <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-line font-medium">
                {targetPrintLog.actionTakenAndFix}
              </p>
            </div>
          </div>

          {/* Spares & Lessons */}
          <div className="grid grid-cols-2 gap-4 mb-4 print-avoid-break">
            <div className="border border-slate-400 p-3 rounded">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Spares Consumed / Fitted:
              </div>
              <p className="text-xs text-slate-800">
                {targetPrintLog.sparesUsed || "No permanent spares consumed / Adjustments only"}
              </p>
            </div>

            <div className="border border-slate-400 p-3 rounded">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Preventative Lessons & Takeaway:
              </div>
              <p className="text-xs text-slate-800">
                {targetPrintLog.lessonsLearned || "Standard preventative maintenance schedule maintained."}
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="border border-black rounded p-3 mt-6 print-avoid-break">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-2">
              Superintendent & Chief Engineer Technical Endorsement
            </div>
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div className="border-t border-black pt-1">
                <div className="font-bold text-black">Duty Officer / Logging Engineer ({targetPrintLog.seafarerRank})</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Signature: ______________________</div>
                <div className="text-[10px] text-slate-600">Date: ____/____/2026</div>
              </div>
              <div className="border-t border-black pt-1">
                <div className="font-bold text-black">Chief Engineer / Master Verification</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Signature: ______________________</div>
                <div className="text-[10px] text-slate-600">Date: ____/____/2026</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
