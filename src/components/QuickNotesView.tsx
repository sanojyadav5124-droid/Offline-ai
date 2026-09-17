import React, { useState } from "react";
import {
  StickyNote,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Share2,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  AlertCircle,
  Tag,
  Flame,
  CheckSquare,
  Square,
  Edit3,
} from "lucide-react";
import { QuickNote, MaritimeDepartment } from "../types";

interface QuickNotesViewProps {
  notes: QuickNote[];
  onAddNote: (note: QuickNote) => void;
  onUpdateNote: (note: QuickNote) => void;
  onDeleteNote: (id: string) => void;
  onConvertToLog: (note: QuickNote) => void;
  userRank: string;
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
}

const DEPARTMENTS: { value: MaritimeDepartment; label: string }[] = [
  { value: "Engine", label: "Engine" },
  { value: "Deck", label: "Deck" },
  { value: "Electrical", label: "Electrical" },
  { value: "Safety_ISM", label: "Safety / ISM" },
  { value: "Cargo", label: "Cargo" },
];

const COLOR_MAP: Record<QuickNote["colorTag"], { bg: string; border: string; badge: string; text: string }> = {
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/10",
    border: "border-amber-400/40 dark:border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    text: "text-amber-600 dark:text-amber-400",
  },
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/10",
    border: "border-emerald-400/40 dark:border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  sky: {
    bg: "bg-sky-500/10 dark:bg-sky-500/10",
    border: "border-sky-400/40 dark:border-sky-500/30",
    badge: "bg-sky-500/20 text-sky-700 dark:text-sky-300",
    text: "text-sky-600 dark:text-sky-400",
  },
  rose: {
    bg: "bg-rose-500/10 dark:bg-rose-500/10",
    border: "border-rose-400/40 dark:border-rose-500/30",
    badge: "bg-rose-500/20 text-rose-700 dark:text-rose-300",
    text: "text-rose-600 dark:text-rose-400",
  },
  indigo: {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/10",
    border: "border-indigo-400/40 dark:border-indigo-500/30",
    badge: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
    text: "text-indigo-600 dark:text-indigo-400",
  },
};

export const QuickNotesView: React.FC<QuickNotesViewProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onConvertToLog,
  userRank,
  selectedDepartment,
  onDepartmentChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved">("active");

  // Fast Quick Add State
  const [quickTitle, setQuickTitle] = useState("");
  const [quickContent, setQuickContent] = useState("");
  const [quickDept, setQuickDept] = useState<MaritimeDepartment>("Engine");
  const [quickPriority, setQuickPriority] = useState<QuickNote["priority"]>("Routine");
  const [quickColor, setQuickColor] = useState<QuickNote["colorTag"]>("amber");
  const [quickEquipment, setQuickEquipment] = useState("");
  const [showFullQuickForm, setShowFullQuickForm] = useState(false);

  // Edit Note Modal / Inline State
  const [editingNote, setEditingNote] = useState<QuickNote | null>(null);

  const handleCreateFastNote = (e: React.FormEvent) => {
    e.preventDefault();
    const contentTrimmed = quickContent.trim();
    const titleTrimmed = quickTitle.trim();

    if (!contentTrimmed && !titleTrimmed) return;

    const newNote: QuickNote = {
      id: `qn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: titleTrimmed || (contentTrimmed.slice(0, 40) + (contentTrimmed.length > 40 ? "..." : "")),
      content: contentTrimmed || titleTrimmed,
      department: quickDept,
      authorRank: userRank || "Watch Officer",
      priority: quickPriority,
      colorTag: quickColor,
      createdAt: new Date().toISOString(),
      isResolved: false,
      relatedEquipment: quickEquipment.trim() || undefined,
    };

    onAddNote(newNote);
    setQuickTitle("");
    setQuickContent("");
    setQuickEquipment("");
    setShowFullQuickForm(false);
  };

  const handleToggleResolved = (note: QuickNote) => {
    onUpdateNote({
      ...note,
      isResolved: !note.isResolved,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    if (!editingNote.title.trim() && !editingNote.content.trim()) return;

    onUpdateNote({
      ...editingNote,
      title: editingNote.title.trim() || "Quick Note",
      content: editingNote.content.trim() || "No content provided.",
    });
    setEditingNote(null);
  };

  // Filtered Notes
  const filteredNotes = notes.filter((n) => {
    const matchDept = selectedDepartment === "All" || n.department === selectedDepartment;
    const matchStatus =
      statusFilter === "all" ? true : statusFilter === "active" ? !n.isResolved : n.isResolved;
    const matchPriority = priorityFilter === "All" || n.priority === priorityFilter;
    const matchSearch =
      searchQuery === "" ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.relatedEquipment && n.relatedEquipment.toLowerCase().includes(searchQuery.toLowerCase())) ||
      n.authorRank.toLowerCase().includes(searchQuery.toLowerCase());

    return matchDept && matchStatus && matchPriority && matchSearch;
  });

  const activeCount = notes.filter((n) => !n.isResolved).length;
  const resolvedCount = notes.filter((n) => n.isResolved).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0 shadow-xs">
            <StickyNote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Watch Scratchpad & Sticky Notes
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-full">
                {activeCount} Pending Handover
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Jot down immediate observations, alarms, spare requests, or handover items during your watch. When you have time, convert them directly into structured machinery entries or troubleshooting logs with 1-click.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 w-full md:w-auto bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "active"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("resolved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "resolved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Resolved ({resolvedCount})
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "all"
                ? "bg-slate-800 dark:bg-slate-700 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({notes.length})
          </button>
        </div>
      </div>

      {/* Rapid Sticky Note Creator Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Rapid Scratchpad Entry (On-Watch Quick Post)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Author: <strong className="text-slate-700 dark:text-slate-300">{userRank}</strong>
          </span>
        </div>

        <form onSubmit={handleCreateFastNote} className="p-4 sm:p-5 space-y-3.5">
          <div>
            <input
              type="text"
              placeholder="Note title or quick headline (e.g. FW Gen vacuum 78%, OWS 3-way test due)..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:font-normal"
            />
          </div>

          <div>
            <textarea
              rows={showFullQuickForm ? 3 : 2}
              placeholder="Type observations, numbers, part numbers, or handover points here (e.g. Clean ejector nozzle next morning, check fuel pressure drop across strainer)..."
              value={quickContent}
              onChange={(e) => setQuickContent(e.target.value)}
              onFocus={() => setShowFullQuickForm(true)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {showFullQuickForm && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 animate-in fade-in duration-150">
              {/* Department */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Department
                </label>
                <select
                  value={quickDept}
                  onChange={(e) => setQuickDept(e.target.value as MaritimeDepartment)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-amber-500"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Priority
                </label>
                <select
                  value={quickPriority}
                  onChange={(e) => setQuickPriority(e.target.value as QuickNote["priority"])}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Routine">Routine Handover</option>
                  <option value="Urgent">Urgent Attention</option>
                  <option value="Critical Safety">Critical Safety</option>
                </select>
              </div>

              {/* Equipment Link */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Related Machinery (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DG #2, OWS, Steering"
                  value={quickEquipment}
                  onChange={(e) => setQuickEquipment(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Color Tag */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tag Color
                </label>
                <div className="flex items-center gap-2 pt-0.5">
                  {(["amber", "emerald", "sky", "rose", "indigo"] as QuickNote["colorTag"][]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setQuickColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        c === "amber"
                          ? "bg-amber-400"
                          : c === "emerald"
                          ? "bg-emerald-400"
                          : c === "sky"
                          ? "bg-sky-400"
                          : c === "rose"
                          ? "bg-rose-400"
                          : "bg-indigo-400"
                      } ${quickColor === c ? "border-slate-900 dark:border-white scale-110 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowFullQuickForm(!showFullQuickForm)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              {showFullQuickForm ? "Fewer options" : "+ Add priority, machinery tag & color"}
            </button>
            <button
              type="submit"
              disabled={!quickTitle.trim() && !quickContent.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Pin Sticky Note
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes, machinery tags, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
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
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-amber-500"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-amber-500"
          >
            <option value="All">All Priorities</option>
            <option value="Routine">Routine</option>
            <option value="Urgent">Urgent</option>
            <option value="Critical Safety">Critical Safety</option>
          </select>
        </div>
      </div>

      {/* Sticky Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <StickyNote className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Scratchpad Notes Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || priorityFilter !== "All" || selectedDepartment !== "All"
              ? "Try adjusting your filters or search terms."
              : "Use the quick input above to post your first watch note or handover memo."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const style = COLOR_MAP[note.colorTag] || COLOR_MAP.amber;
            return (
              <div
                key={note.id}
                className={`relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md ${
                  style.bg
                } ${style.border} ${
                  note.isResolved ? "opacity-60 saturate-50" : ""
                }`}
              >
                {/* Top Bar of Sticky */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
                        {note.department}
                      </span>
                      {note.priority === "Critical Safety" && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/20 text-red-700 dark:text-red-300 flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          Critical
                        </span>
                      )}
                      {note.priority === "Urgent" && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          Urgent
                        </span>
                      )}
                    </div>

                    {/* Checkbox Toggle */}
                    <button
                      onClick={() => handleToggleResolved(note)}
                      className="text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                      title={note.isResolved ? "Mark Active" : "Mark Resolved"}
                    >
                      {note.isResolved ? (
                        <CheckSquare className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                      )}
                    </button>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug ${
                      note.isResolved ? "line-through text-slate-500" : ""
                    }`}
                  >
                    {note.title}
                  </h3>

                  {/* Content */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mb-3 font-normal">
                    {note.content}
                  </p>

                  {/* Related Equipment Tag */}
                  {note.relatedEquipment && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/70 dark:bg-slate-800/80 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-3 border border-slate-200/60 dark:border-slate-700/60">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{note.relatedEquipment}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Footer of Sticky Card */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(note.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>• {note.authorRank}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Convert to Full Incident Button */}
                    <button
                      type="button"
                      onClick={() => onConvertToLog(note)}
                      className="p-1.5 text-amber-700 dark:text-amber-300 hover:bg-white/60 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                      title="Convert this scratchpad note into full Breakdown/Troubleshooting Log"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Convert to Log</span>
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => setEditingNote(note)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-500" />
              Edit Scratchpad Note
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Content / Details
                </label>
                <textarea
                  rows={4}
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Department
                  </label>
                  <select
                    value={editingNote.department}
                    onChange={(e) =>
                      setEditingNote({ ...editingNote, department: e.target.value as MaritimeDepartment })
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={editingNote.priority}
                    onChange={(e) =>
                      setEditingNote({ ...editingNote, priority: e.target.value as QuickNote["priority"] })
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical Safety">Critical Safety</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tag Color
                </label>
                <div className="flex items-center gap-2">
                  {(["amber", "emerald", "sky", "rose", "indigo"] as QuickNote["colorTag"][]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditingNote({ ...editingNote, colorTag: c })}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        c === "amber"
                          ? "bg-amber-400"
                          : c === "emerald"
                          ? "bg-emerald-400"
                          : c === "sky"
                          ? "bg-sky-400"
                          : c === "rose"
                          ? "bg-rose-400"
                          : "bg-indigo-400"
                      } ${editingNote.colorTag === c ? "border-slate-900 dark:border-white scale-110" : "border-transparent opacity-70"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
