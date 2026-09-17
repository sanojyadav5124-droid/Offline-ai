import React, { useState } from "react";
import {
  History,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  ArrowRightLeft,
  Filter,
  Search,
  Calendar,
  User,
  ShieldCheck,
  Download,
  Flame,
  Layers,
} from "lucide-react";
import { ChangeLogEntry, MaritimeDepartment } from "../types";

interface ChangeLogViewProps {
  logs: ChangeLogEntry[];
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
}

const ACTION_CONFIG: Record<
  ChangeLogEntry["action"],
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  CREATE: {
    label: "Created",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: <PlusCircle className="w-3.5 h-3.5" />,
  },
  UPDATE: {
    label: "Updated",
    bg: "bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30",
    text: "text-sky-600 dark:text-sky-400",
    icon: <Edit className="w-3.5 h-3.5" />,
  },
  DELETE: {
    label: "Deleted",
    bg: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
    text: "text-rose-600 dark:text-rose-400",
    icon: <Trash2 className="w-3.5 h-3.5" />,
  },
  TEST_LOGGED: {
    label: "Test Logged",
    bg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  NOTE_CONVERTED: {
    label: "Converted",
    bg: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
    text: "text-purple-600 dark:text-purple-400",
    icon: <ArrowRightLeft className="w-3.5 h-3.5" />,
  },
};

export const ChangeLogView: React.FC<ChangeLogViewProps> = ({
  logs,
  selectedDepartment,
  onDepartmentChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("All");
  const [entityFilter, setEntityFilter] = useState<string>("All");

  const filteredLogs = logs.filter((log) => {
    const matchDept = selectedDepartment === "All" || log.department === selectedDepartment;
    const matchAction = actionFilter === "All" || log.action === actionFilter;
    const matchEntity = entityFilter === "All" || log.entityType === entityFilter;
    const matchSearch =
      searchQuery === "" ||
      log.entityTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.authorRank.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase());

    return matchDept && matchAction && matchEntity && matchSearch;
  });

  const exportChangeLogText = () => {
    const lines = filteredLogs.map((l) => {
      return `[${new Date(l.timestamp).toISOString()}] [${l.action}] [${l.department}] [${l.entityType}] ${l.entityTitle} - By: ${l.authorRank} - Summary: ${l.summary}`;
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ANCHOR_AI_Audit_Trail_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-blue-600/10 via-indigo-500/5 to-transparent border border-blue-500/20 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0 shadow-xs">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Vessel Knowledge Base Change Log & Audit Trail
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full">
                {logs.length} Recorded Events
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Every addition, modification, deletion, statutory test reading, and scratchpad promotion is automatically timestamped and attributed by officer rank for class inspection and ISM SMS audit compliance.
            </p>
          </div>
        </div>

        <button
          onClick={exportChangeLogText}
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          Export Audit Trail (.txt)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail, titles, ranks, changes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Engine">Engine</option>
              <option value="Deck">Deck</option>
              <option value="Electrical">Electrical</option>
              <option value="Safety_ISM">Safety / ISM</option>
              <option value="Cargo">Cargo</option>
            </select>
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Actions</option>
            <option value="CREATE">Created</option>
            <option value="UPDATE">Updated</option>
            <option value="DELETE">Deleted</option>
            <option value="TEST_LOGGED">Test Logged</option>
            <option value="NOTE_CONVERTED">Converted</option>
          </select>

          {/* Entity Filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Modules</option>
            <option value="Equipment Machinery">Equipment</option>
            <option value="Troubleshooting Incident">Incidents</option>
            <option value="Emergency Scenario Card">Emergency Cards</option>
            <option value="Statutory Rule">Statutory Rules</option>
            <option value="Quick Scratchpad">Scratchpad</option>
          </select>
        </div>
      </div>

      {/* Audit Log Timeline Table */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Change Log Entries Match</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your filters or search query.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((log) => {
              const act = ACTION_CONFIG[log.action] || ACTION_CONFIG.UPDATE;
              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Action Icon Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${act.bg}`}
                    >
                      {act.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${act.bg}`}
                        >
                          {act.label}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {log.department}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          • {log.entityType}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {log.entityTitle}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                        {log.summary}
                      </p>
                    </div>
                  </div>

                  {/* Metadata: Date & Rank */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-[11px] text-slate-500 dark:text-slate-400 gap-1 pl-12 sm:pl-0">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(log.timestamp).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{log.authorRank}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
