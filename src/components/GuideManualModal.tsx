import React, { useState } from "react";
import {
  X,
  BookOpen,
  HelpCircle,
  FileText,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Compass,
  Zap,
  HardDriveDownload,
  Eye,
  Ship,
  Sparkles,
  StickyNote,
  History,
  AlertOctagon,
  Download,
  Info,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  LifeBuoy,
  Sliders,
  Gauge,
  Award,
} from "lucide-react";
import { WatchMode } from "../types";

interface GuideManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchMode: WatchMode;
}

export const GuideManualModal: React.FC<GuideManualModalProps> = ({
  isOpen,
  onClose,
  watchMode,
}) => {
  const [activeSection, setActiveSection] = useState<"guide" | "manual" | "troubleshooting" | "disclaimer">("guide");
  const [activeTabSubnav, setActiveTabSubnav] = useState<string>("dashboard");

  if (!isOpen) return null;

  const isNight = watchMode === "bridge_night";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 md:p-6 animate-in fade-in duration-150 overflow-y-auto">
      <div
        className={`relative max-w-5xl w-full rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh] border ${
          isNight
            ? "bg-stone-950 border-red-950 text-red-200"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
        }`}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-950 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  ANCHOR AI — Guide & Instruction Manual
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% Offline Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Shipboard Technical Knowledge Vault, SOLAS/MARPOL Matrix & Operating SOPs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close manual"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Section Nav Tabs */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveSection("guide")}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === "guide"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. Operational Guide & Background</span>
          </button>

          <button
            onClick={() => setActiveSection("manual")}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === "manual"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>2. Instruction Manual & Workflows</span>
          </button>

          <button
            onClick={() => setActiveSection("troubleshooting")}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === "troubleshooting"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>3. Errors & Troubleshooting</span>
          </button>

          <button
            onClick={() => setActiveSection("disclaimer")}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSection === "disclaimer"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>4. Maritime Legal Disclaimer</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm leading-relaxed">
          {/* SECTION 1: GUIDE */}
          {activeSection === "guide" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Ship className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>About ANCHOR AI — Built by Seafarers for Seafarers</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-950/80 dark:text-amber-100/90">
                  <strong>ANCHOR AI</strong> is an offline-first shipboard technical knowledge vault, regulatory compliance comparator, and rapid diagnostic assistant designed to operate in low-bandwidth, deep-sea, and emergency environments without dependence on internet connectivity or external servers.
                </p>
                <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  <span>Author: SKYadav</span>
                  <span>Architecture: 100% Client-Side Local Storage & PWA</span>
                </div>
              </div>

              {/* Background of App */}
              <div className="space-y-2">
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-500" />
                  <span>1.1 Background & Genesis of the App</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                  Modern merchant vessels carry hundreds of complex mechanical, electrical, automation, and safety systems. During ocean voyages, merchant officers operate with limited or zero satellite bandwidth. Critical maker design limits, troubleshooting experiences, and statutory inspection parameters are often scattered across voluminous paper binders, manufacturer manuals, or lost between crew changeovers.
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                  ANCHOR AI was built to solve this challenge by creating an instant, zero-latency digital companion that runs completely offline inside your browser or as an installed progressive web app (PWA) on shipboard laptops, bridge tablets, or engine room consoles.
                </p>
              </div>

              {/* Purpose It Serves */}
              <div className="space-y-3">
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>1.2 Core Purpose & Mission</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Statutory Compliance Matrix</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Side-by-side comparison of official statutory thresholds (SOLAS, MARPOL, STCW, Class) against live vessel inspection readings for PSC and Class survey readiness.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-500" />
                      <span>Verified Breakdown Experience</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Preserve engineering tribal knowledge across sign-on/sign-off crews: document exact symptoms, root causes, emergency temporary fixes, permanent overhauls, and spare parts.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                      <span>Emergency Action Cards</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Interactive critical scenario checklists (Blackout, Steering Loss, OWS Trip, Scavenge Fire, Enclosed Space Rescue) with time windows and SOLAS references.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-yellow-500" />
                      <span>Watch Handover Scratchpad</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Rapid memo pinning for watchkeepers during rounds, with 1-click conversion into permanent technical incident records for seamless handover.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5 md:col-span-2">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Single-Failure & Emergency Drill Simulation Engine</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Interactive real-time emergency training engine with live telemetry HUD, countdown escalation timers, and procedural decision trees covering Blackouts, IGS spikes, Steering failures, Enclosed space rescues, and SIRE 2.0 vetting audit debriefs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Constraints and Assumptions */}
              <div className="space-y-3">
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-500" />
                  <span>1.3 Constraints & Engineering Assumptions</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span><strong>100% Offline-Centric Local Storage:</strong> All machinery records, logs, checklists, and notes are saved strictly in the browser's persistent client-side storage. No telemetry or vessel data leaves your local device unless you explicitly export a JSON backup.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span><strong>Zero-Bandwidth Environment:</strong> The app is built with pre-cached rule-based diagnostic algorithms. When connected to satellite or port Wi-Fi, the online engine can provide supplementary analysis, but offline mode remains 100% functional without degradation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span><strong>STCW Professional Standard:</strong> It is assumed that users are certified maritime officers (Engine, Deck, ETO) possessing foundational maritime engineering and navigational training.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span><strong>Data Portability via USB:</strong> Since there is no centralized database server, handovers between crew laptops are facilitated via the <strong>USB Backup & Sync</strong> module (Export/Import JSON).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span><strong>Non-Class Survey Replacement:</strong> This application is a personal aid and technical reference tool; it does not replace official Safety Management System (SMS) procedures, Flag State logbooks, or Class Society approved automation systems.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 2: INSTRUCTION MANUAL */}
          {activeSection === "manual" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Tab Selector for Manual */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Select a Module to View Step-by-Step Instructions:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "dashboard", label: "Dashboard & Triage" },
                    { id: "simulation", label: "⚡ Drill & Failure Simulator" },
                    { id: "notes", label: "Watch Scratchpad" },
                    { id: "equipment", label: "Machinery Specs" },
                    { id: "troubleshooting", label: "Breakdown Fixes" },
                    { id: "statutory", label: "Statutory Matrix" },
                    { id: "checklists", label: "Emergency Cards" },
                    { id: "changelog", label: "Audit Trail" },
                    { id: "backup", label: "USB Backup & Handover" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTabSubnav(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        activeTabSubnav === t.id
                          ? "bg-amber-500 text-slate-950 shadow-xs"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subnav Content */}
              {activeTabSubnav === "dashboard" && (
                <div className="space-y-3">
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-500" />
                    <span>Dashboard & Moment-of-Need Triage Overview</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    The central command hub for instant situation awareness, quick alarm search, department filtering, and active watch memos.
                  </p>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">1. Global Moment-of-Need Search Bar (Top Header & Center Triage):</strong>
                      Type any keyword, alarm code (e.g. <em>"15 PPM"</em>, <em>"exhaust temp"</em>, <em>"steering hunting"</em>), SOLAS rule, or maker name. The dropdown instantly displays matched machinery and proven breakdown fixes.
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">2. Department Filter Chips:</strong>
                      Click on <em>Engine Room</em>, <em>Deck & Bridge</em>, <em>Electrical / ETO</em>, <em>Safety / ISM</em>, or <em>Cargo</em> to narrow down all widgets, cards, and notes to your specific duty department.
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">3. Fast Scratchpad Input:</strong>
                      Quickly type an observation (e.g., <em>"Boiler burner nozzle fouled during port stay"</em>) and press <strong>Pin Memo</strong>. It pins immediately to the active watch board.
                    </div>
                  </div>
                </div>
              )}

              {activeTabSubnav === "simulation" && (
                <div className="space-y-4">
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Single-Failure & Emergency Drill Simulation Engine</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    An interactive training and scenario simulation workspace designed for merchant officers to practice split-second decision making during catastrophic machinery failures, blackouts, cargo overpressures, and life-saving drills under SOLAS, MARPOL, FSS Code, and OCIMF SIRE 2.0 standards.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                      <strong className="text-slate-900 dark:text-white flex items-center gap-1.5 font-bold">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                        <span>1. Statutory Scenario Catalog:</span>
                      </strong>
                      <p>
                        Choose from a library of pre-configured scenarios spanning all shipboard departments: <em>Dead-bus blackout in TSS</em>, <em>IGS delivery O2 spike during crude discharge</em>, <em>Main engine scavenge fire slowdown</em>, <em>Steering gear hydraulic loss</em>, <em>Pump room enclosed space rescue</em>, and <em>Totally enclosed lifeboat air exhaustion</em>.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                      <strong className="text-slate-900 dark:text-white flex items-center gap-1.5 font-bold">
                        <Sliders className="w-3.5 h-3.5 text-amber-500" />
                        <span>2. Vault Equipment Single-Failure Injector:</span>
                      </strong>
                      <p>
                        Select any of the 25 statutory equipment items from your vault (or click <strong>"Inject Random Failure"</strong>) to immediately simulate sudden sensor drift, alarm trips, or mechanical breakdown against maker nominal design limits.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                      <strong className="text-slate-900 dark:text-white flex items-center gap-1.5 font-bold">
                        <Gauge className="w-3.5 h-3.5 text-sky-500" />
                        <span>3. Live Dynamic Telemetry HUD:</span>
                      </strong>
                      <p>
                        Real-time gauges show live values (O2 %, voltage, exhaust temp, rudder angles, ppm). When you make decisions, telemetry responds dynamically (e.g. O2 falls after FD damper lubrication, or temperature cools after steam smothering).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                      <strong className="text-slate-900 dark:text-white flex items-center gap-1.5 font-bold">
                        <Award className="w-3.5 h-3.5 text-emerald-500" />
                        <span>4. SIRE 2.0 Debriefing & Drill Ledger:</span>
                      </strong>
                      <p>
                        Upon drill completion, a comprehensive debriefing report is generated with your score, duration, procedural mistakes count, SOLAS citations, and exact OCIMF SIRE 2.0 vetting questions. Completed drills are logged in the persistent vessel audit trail with 1-click print support.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300">
                    <strong>Watchkeeping Safety Note:</strong> Never bypass safety cutouts during active sea voyages. Use this simulator regularly during calm passages or port stays to maintain sharp emergency instincts across all ranks from Cadet to Master and Chief Engineer.
                  </div>
                </div>
              )}

              {activeTabSubnav === "notes" && (
                <div className="space-y-3">
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-yellow-500" />
                    <span>Watch Scratchpad & Handover Notes Workflow</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    Designed for high-tempo watchkeeping rounds where typing a full technical report is not immediately practical.
                  </p>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">Creating & Categorizing Notes:</strong>
                      Click <strong>+ New Watch Note</strong>. Assign a title, priority (Urgent, Normal, Low), Department, and color code (Amber, Emerald, Rose, Blue, Purple).
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">1-Click Convert to Technical Incident Log:</strong>
                      When an observation requires permanent documentation, click the <strong>⚡ Convert to Incident Log</strong> button. It marks the memo as resolved and opens the full breakdown logging modal with pre-filled details.
                    </div>
                  </div>
                </div>
              )}

              {activeTabSubnav === "equipment" && (
                <div className="space-y-3">
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-500" />
                    <span>Machinery Specs & Technical Vault Workflow</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    Maintains the vessel's technical specifications, nominal design limits vs alarm limits, critical spares, and photo drawings.
                  </p>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">Adding New Machinery:</strong>
                      Click <strong>+ Add Equipment</strong> in the header or sidebar. Fill in the equipment name, maker, model, location, and technical parameters (nominal vs alarm limits).
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">Photo Attachments & Technical Drawings:</strong>
                      Upload terminal diagrams, manual schematics, or nameplate photos directly. Click any thumbnail to expand it in the high-contrast photo viewer.
                    </div>
                  </div>
                </div>
              )}

              {activeTabSubnav === "troubleshooting" && (
                <div className="space-y-3">
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-500" />
                    <span>Breakdown Experience & Troubleshooting Logbook</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    Structured record-keeping for machinery failures, alarms, root causes, and permanent engineering resolutions.
                  </p>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">Logging an Incident:</strong>
                      Click <strong>+ New Entry &gt; Breakdown Fix Log</strong>. Document the initial alarm/symptom, root cause analysis, temporary emergency actions taken, and the final permanent fix.
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">Spares Consumed & Safety Precautions:</strong>
                      Record safety lockouts (LOTO), permits required, spare part part-numbers used, and man-hours logged for maintenance accounting.
                    </div>
                  </div>
                </div>
              )}

              {activeTabSubnav === "statutory" && (
                <div className="space-y-3">
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Statutory Law Matrix & Test Logging</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    Side-by-side verification of mandatory maritime regulations vs live vessel test readings.
                  </p>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">Logging a New Test:</strong>
                      Click <strong>Log New Test</strong> on any equipment card. Enter the measured value (e.g. <em>"1.2 PPM"</em>, <em>"22.4 sec"</em>), test date, and compliance status (Compliant, Attention Required, Non-Compliant).
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">Adding Custom Statutory Rules:</strong>
                      Click <strong>+ Add Statutory Rule</strong> to register flag-state specific, Class-mandated, or company SMS rules with custom tolerance limits.
                    </div>
                  </div>
                </div>
              )}

              {activeTabSubnav === "checklists" && (
                <div className="space-y-3">
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-rose-500" />
                    <span>Emergency Action Cards & Drills Execution</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    Interactive contingency plans with critical time windows for high-stress shipboard emergencies.
                  </p>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">Executing a Scenario:</strong>
                      Click on any card (e.g. <em>Blackout Restoration</em>). Check off steps sequentially. The live progress bar updates in real time.
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">Authoring Custom Drills:</strong>
                      Click <strong>+ Create Scenario Card</strong> to create ship-specific checklists (e.g., Bow Thruster Hydraulic Leak, Cargo Reefer Failure) complete with SOLAS/SMS reference numbers.
                    </div>
                  </div>
                </div>
              )}

              {activeTabSubnav === "changelog" && (
                <div className="space-y-3">
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-500" />
                    <span>Audit Trail & Change Log Verification</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    Provides an immutable-style log of all user activities for internal audits, superintendent inspections, and PSC verification.
                  </p>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs">
                    Every create, update, delete, test log, and note conversion is automatically recorded with exact timestamp, author rank, department, and summary.
                  </div>
                </div>
              )}

              {activeTabSubnav === "backup" && (
                <div className="space-y-3">
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <HardDriveDownload className="w-4 h-4 text-cyan-500" />
                    <span>USB Backup, Sync & Crew Handover Workflow</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">
                    Ensures complete data redundancy and easy transfer between sign-on and sign-off officers.
                  </p>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">1. Exporting Backup (Before Sign-Off):</strong>
                      Navigate to <strong>USB Backup & Sync</strong>. Click <strong>Export Full JSON Backup</strong>. Save the file to your vessel USB drive.
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">2. Restoring Backup (On New Device / Sign-On):</strong>
                      Select the exported `.json` file and click <strong>Restore Backup</strong>. The full knowledge base, past logs, and test matrix are restored in seconds.
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                      <strong className="text-slate-900 dark:text-white block mb-1">3. Print Vessel Technical Dossier:</strong>
                      Click <strong>Print Vessel Dossier</strong> to generate a formatted printable report for physical handover folders or surveyor reviews.
                    </div>
                  </div>
                </div>
              )}

              {/* General Admin / User Restrictions */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Admin & User Operation Guidelines</span>
                </h5>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                  <li><strong>Browser Independence:</strong> Data is isolated per browser profile. If you use Chrome on the ship's office PC, your logs remain in that Chrome profile.</li>
                  <li><strong>Handover Requirement:</strong> Always perform a JSON export to the official vessel USB drive at the end of each watch cycle or sign-off.</li>
                  <li><strong>Rank Attribution:</strong> Select your active rank in the top header selector to ensure all logged entries are accurately stamped.</li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 3: ERRORS & TROUBLESHOOTING */}
          {activeSection === "troubleshooting" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-rose-500" />
                <span>Common User Errors, Causes & Quick Resolutions</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Issue 1: "My logged data disappeared after restarting the browser or cleaning history"</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Probable Cause:</strong> Browser privacy settings or an aggressive disk-cleaning utility cleared the browser's `localStorage` and IndexedDB cache.
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                    <strong>Solution:</strong> Open <em>USB Backup & Sync</em>, click <em>Restore Backup</em>, and select your latest exported `.json` vessel file. To prevent data loss, always make weekly USB backups.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Issue 2: "AI Advisor is taking too long or failing when at deep sea"</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Probable Cause:</strong> Satellite connection (FBB/VSAT) has high packet loss or zero internet access while set to <em>Online Gemini Engine</em>.
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                    <strong>Solution:</strong> In the AI Advisor modal, switch the top toggle to <strong>100% Offline Rule Engine (Zero Lag)</strong>. This utilizes the local offline diagnostic knowledge base with zero internet latency.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Issue 3: "Photo attachment upload fails or slows down log saving"</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Probable Cause:</strong> Digital camera or smartphone photo file size is too large (&gt;15MB uncompressed RAW/HEIC).
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                    <strong>Solution:</strong> Use compressed standard JPEG/PNG images under 3MB to optimize storage performance and keep USB backups lightweight.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Issue 4: "Add to Home Screen / Install PWA prompt does not appear"</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Probable Cause:</strong> The app is already running in standalone mode, or you are using iOS Safari which blocks automated installation prompts.
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                    <strong>Solution:</strong> On Chromium/Android/Edge, click the <em>Install ANCHOR AI</em> button on the Dashboard. On iPhone/iPad Safari, tap the <em>Share icon (square with arrow)</em> and tap <em>Add to Home Screen</em>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: MARITIME DISCLAIMER */}
          {activeSection === "disclaimer" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-amber-900 dark:text-amber-200">
                      Official Maritime Disclaimer & Terms of Use
                    </h4>
                    <p className="text-xs text-amber-800/80 dark:text-amber-300/80 font-semibold">
                      Important legal and operational advisory for personnel at sea
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/20 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed space-y-4 font-medium">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">For Reference Only</h5>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                      This app is for personal use and general reference only. It is not a substitute for official maritime resources.
                    </p>
                  </div>

                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3 space-y-2">
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">Data Accuracy & Verification</h5>
                    <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span><strong className="text-slate-900 dark:text-white">No Warranties:</strong> Data is provided &quot;as is.&quot; It may be incomplete, outdated, or contain errors.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span><strong className="text-slate-900 dark:text-white">Mandatory Check:</strong> Always verify data against official publications, company manuals, and statutory regulations before making navigational or operational decisions.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span><strong className="text-slate-900 dark:text-white">Seamanship:</strong> Never substitute this app for professional judgment and standard safe seamanship.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3 space-y-2">
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">Limitation of Liability</h5>
                    <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span><strong className="text-slate-900 dark:text-white">No Liability:</strong> The developer accepts no legal liability (direct or indirect) for any loss, damage, injury, or mishap resulting from the use of this app.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span><strong className="text-slate-900 dark:text-white">User Risk:</strong> You use this application entirely at your own risk.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2 pb-2">
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">Permitted Use & Feedback</h5>
                    <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span><strong className="text-slate-900 dark:text-white">Usage:</strong> Feel free to use and copy this app to make your workflow at sea smoother.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span><strong className="text-slate-900 dark:text-white">Feedback:</strong> Please send your improvements and suggestions via email - <a href="mailto:sanojyadav14@gmail.com" className="text-sky-600 dark:text-sky-400 hover:underline font-mono font-semibold">sanojyadav14@gmail.com</a></span>
                      </li>
                    </ul>
                  </div>

                  <p className="font-bold text-amber-600 dark:text-amber-400 italic pt-3 border-t border-slate-200 dark:border-slate-800 text-center font-serif text-sm">
                    &ldquo;May you always have smooth seas, following winds, and enough water under your keel.&rdquo;
                  </p>
                </div>

                {/* Author & Offline Meta */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                  <div>
                    <span>Made by : </span>
                    <span className="text-slate-900 dark:text-white font-black">SKYadav</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Fully offline</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <span>Made by : <strong className="text-slate-900 dark:text-white">SKYadav</strong></span>
            <span className="mx-2">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Fully offline</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection("disclaimer")}
              className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 font-medium transition cursor-pointer"
            >
              View Disclaimer
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xs transition cursor-pointer"
            >
              Close Manual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
