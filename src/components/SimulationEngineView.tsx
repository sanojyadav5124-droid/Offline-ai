import React, { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Zap,
  ShieldAlert,
  Gauge,
  FileCheck,
  ChevronRight,
  Flame,
  Radio,
  Volume2,
  VolumeX,
  Printer,
  Sparkles,
  LifeBuoy,
  Ship,
  Sliders,
  AlertOctagon,
  ArrowRight,
  Info,
  Check,
  History,
} from "lucide-react";
import {
  SimulationScenario,
  SimulationOption,
  SimulationTelemetryItem,
  CompletedDrillRecord,
  MaritimeDepartment,
  WatchMode,
  EquipmentKnowledgeItem,
  SeafarerProfile,
} from "../types";
import { PRESET_SIMULATION_SCENARIOS } from "../data/simulationScenarios";
import { loadCompletedDrills, saveCompletedDrills, logAuditEntry } from "../utils/storage";

interface SimulationEngineViewProps {
  watchMode: WatchMode;
  userRank: string;
  userProfile?: SeafarerProfile;
  vesselName: string;
  equipmentList: EquipmentKnowledgeItem[];
  selectedDepartment: MaritimeDepartment | "All";
  onSwitchDepartment: (dept: MaritimeDepartment | "All") => void;
  onOpenEquipmentVault?: (id?: string) => void;
}

export const SimulationEngineView: React.FC<SimulationEngineViewProps> = ({
  watchMode,
  userRank,
  userProfile,
  vesselName,
  equipmentList,
  selectedDepartment,
  onSwitchDepartment,
  onOpenEquipmentVault,
}) => {
  // Navigation tabs within simulation engine
  const [subTab, setSubTab] = useState<"catalog" | "active" | "single_failure" | "history">("catalog");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Active Simulation State
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [currentTelemetry, setCurrentTelemetry] = useState<SimulationTelemetryItem[]>([]);
  const [currentStageOptions, setCurrentStageOptions] = useState<SimulationOption[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [userScore, setUserScore] = useState<number>(0);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<SimulationOption | null>(null);
  const [hasSubmittedStage, setHasSubmittedStage] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [drillStartTime, setDrillStartTime] = useState<number>(0);
  const [drillDuration, setDrillDuration] = useState<number>(0);

  // Single-Failure Equipment Selector State
  const [selectedEquipmentForFailure, setSelectedEquipmentForFailure] = useState<string>(
    equipmentList[0]?.id || ""
  );
  const [customFailureSimulating, setCustomFailureSimulating] = useState<boolean>(false);

  // Drill Logs History
  const [drillLogs, setDrillLogs] = useState<CompletedDrillRecord[]>(() => loadCompletedDrills());
  const [selectedCompletedReport, setSelectedCompletedReport] = useState<CompletedDrillRecord | null>(null);

  // Audio tone generator for alarm effects without external assets
  const audioContextRef = useRef<AudioContext | null>(null);

  // Helper to shuffle options so correct answer is randomly distributed among Option A, B, C, D
  const shuffleOptions = (options: SimulationOption[]): SimulationOption[] => {
    const arr = [...options];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const triggerAlarmTone = (type: "siren" | "success" | "error") => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "siren") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "error") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(146.83, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // Audio context may be restricted by browser policy
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeRemaining > 0 && !isCompleted) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining, isCompleted]);

  const handleTimeExpired = () => {
    setIsTimerRunning(false);
    triggerAlarmTone("error");
  };

  const startScenario = (scenario: SimulationScenario) => {
    setActiveScenario(scenario);
    setCurrentStageIndex(0);
    setCurrentTelemetry([...scenario.initialCondition.telemetry]);
    const firstStage = scenario.stages[0];
    setCurrentStageOptions(firstStage ? shuffleOptions(firstStage.options) : []);
    setTimeRemaining(scenario.timeLimitSeconds);
    setIsTimerRunning(true);
    setUserScore(0);
    setMistakesCount(0);
    setSelectedOption(null);
    setHasSubmittedStage(false);
    setIsCompleted(false);
    setDrillStartTime(Date.now());
    setSubTab("active");
    triggerAlarmTone("siren");
  };

  const handleSelectOption = (option: SimulationOption) => {
    if (hasSubmittedStage) return;
    setSelectedOption(option);
  };

  const handleSubmitStageChoice = () => {
    if (!selectedOption || !activeScenario) return;
    setHasSubmittedStage(true);

    if (selectedOption.isCorrect) {
      setUserScore((prev) => prev + selectedOption.scoreDelta);
      triggerAlarmTone("success");
    } else {
      setUserScore((prev) => Math.max(0, prev + selectedOption.scoreDelta));
      setMistakesCount((prev) => prev + 1);
      triggerAlarmTone("error");
    }

    // Apply telemetry updates for current stage if present
    const currentStage = activeScenario.stages[currentStageIndex];
    if (currentStage?.telemetryUpdates && currentStage.telemetryUpdates.length > 0) {
      setCurrentTelemetry((prev) => {
        const next = [...prev];
        currentStage.telemetryUpdates?.forEach((update) => {
          const idx = next.findIndex((t) => t.label.toLowerCase() === update.label.toLowerCase());
          if (idx !== -1) {
            next[idx] = update;
          } else {
            next.push(update);
          }
        });
        return next;
      });
    }
  };

  const handleNextStage = () => {
    if (!activeScenario) return;

    if (currentStageIndex + 1 < activeScenario.stages.length) {
      const nextIdx = currentStageIndex + 1;
      setCurrentStageIndex(nextIdx);
      const nextStage = activeScenario.stages[nextIdx];
      setCurrentStageOptions(nextStage ? shuffleOptions(nextStage.options) : []);
      setSelectedOption(null);
      setHasSubmittedStage(false);
    } else {
      // Completed drill
      finishDrill();
    }
  };

  const finishDrill = () => {
    if (!activeScenario) return;
    setIsTimerRunning(false);
    setIsCompleted(true);

    const duration = Math.round((Date.now() - drillStartTime) / 1000);
    setDrillDuration(duration);

    const maxScore = activeScenario.stages.reduce((acc, st) => {
      const maxOpt = Math.max(...st.options.map((o) => (o.isCorrect ? o.scoreDelta : 0)));
      return acc + (maxOpt > 0 ? maxOpt : 30);
    }, 0);

    const percentage = Math.min(100, Math.round((userScore / (maxScore || 100)) * 100));
    const passed = percentage >= 70 && mistakesCount <= 1;

    const record: CompletedDrillRecord = {
      id: `drill-${Date.now()}`,
      scenarioId: activeScenario.id,
      scenarioTitle: activeScenario.title,
      category: activeScenario.category,
      department: activeScenario.department,
      completedAt: new Date().toISOString(),
      officerRank: userRank,
      officerName: userProfile?.name || "Officer on Duty",
      score: userScore,
      maxScore,
      percentage,
      passed,
      durationSeconds: duration,
      timeLimitSeconds: activeScenario.timeLimitSeconds,
      mistakesCount,
      statutoryRef: activeScenario.statutoryRef,
      remarks: passed
        ? "Drill completed with satisfactory statutory compliance and safe SMS execution."
        : "Procedural deviation detected during single-failure triage. Debriefing and re-training required.",
    };

    const updated = [record, ...drillLogs];
    setDrillLogs(updated);
    saveCompletedDrills(updated);

    logAuditEntry({
      action: "TEST_LOGGED",
      entityType: "Emergency Scenario Card",
      entityTitle: `${activeScenario.title} [${passed ? "PASSED" : "FAILED"}]`,
      department: activeScenario.department,
      authorRank: userRank,
      summary: `Completed Drill with ${percentage}% score (${userScore}/${maxScore} pts) in ${duration}s.`,
    });
  };

  // Single-Failure Injection Helper
  const handleLaunchEquipmentFailure = (eq: EquipmentKnowledgeItem) => {
    // Generate an instant failure scenario based on the equipment's maker specs & statutory limit
    const generatedScenario: SimulationScenario = {
      id: `sim-custom-${eq.id}`,
      title: `Single Failure Alarm Triage: ${eq.equipmentName}`,
      code: `INJECT-${eq.statutoryRequirement.regulationCode.replace(/[^a-zA-Z0-9]/g, "-")}`,
      category:
        eq.department === "Engine"
          ? "Engine Room"
          : eq.department === "Cargo"
          ? "Cargo & Tanker"
          : eq.department === "Electrical"
          ? "Electrical & Blackout"
          : eq.department === "Safety_ISM"
          ? "SOLAS Safety & Life Saving"
          : "Bridge & Navigation",
      department: eq.department,
      statutoryRef: `${eq.statutoryRequirement.regulationCode} (${eq.statutoryRequirement.governingBody})`,
      timeLimitSeconds: 120,
      difficulty: "Intermediate",
      systemEquipment: `${eq.equipmentName} (${eq.maker} ${eq.model})`,
      initialCondition: {
        vesselSituation: `Vessel underway at sea. Machinery Watch active in ${eq.area}.`,
        alarmMessage: `CRITICAL EQUIPMENT MALFUNCTION // STATUTORY THRESHOLD EXCEEDED: ${eq.statutoryRequirement.statutoryLimitValue}`,
        initialNarrative: `The ${eq.equipmentName} located at ${eq.installedLocation} has generated an unexpected failure alarm. Measured reading deviates outside maker nominal tolerance (${eq.makerDesignSpecs[0]?.nominalValue || "Standard Nominal"}).`,
        telemetry: [
          { label: eq.equipmentName, value: "ALARM / TRIP STATE", status: "danger" },
          { label: "Statutory Limit", value: eq.statutoryRequirement.statutoryLimitValue, status: "warning" },
          { label: "Nominal Design", value: eq.makerDesignSpecs[0]?.nominalValue || "Design Spec", status: "normal" },
          { label: "Location", value: eq.installedLocation, status: "normal" },
        ],
      },
      stages: [
        {
          id: "stg-custom-1",
          stageIndex: 1,
          stageTitle: "Stage 1: Primary Isolation & Statutory Compliance Verification",
          scenarioUpdate: `You have arrived at ${eq.installedLocation}. The equipment shows abnormal parameters against ${eq.statutoryRequirement.regulationCode}.`,
          questionOrActionPrompt: `What is the correct protocol according to ${eq.statutoryRequirement.regulationCode}?`,
          options: [
            {
              id: "opt-c1",
              actionText: `Execute safe emergency changeover: engage secondary redundant standby unit, isolate the faulty ${eq.equipmentName} with Lockout/Tagout (LOTO), retrieve onboard critical spare (${eq.criticalSparesOnboard[0] || "Maker Spare Overhaul Kit"}), and log calibration defect in compliance with ${eq.statutoryRequirement.regulationCode}.`,
              isCorrect: true,
              scoreDelta: 50,
              feedback: `Correct! Complies strictly with ${eq.statutoryRequirement.regulationCode} and ISM SMS Element 10. Immediate redundancy switchover and formal LOTO preserves vessel safety.`,
              consequenceNarrative: "Secondary safety barrier engaged smoothly. Statutory operating limits and maker tolerances verified intact.",
              statutoryCitation: `${eq.statutoryRequirement.regulationCode} & ISM Code Element 10`,
            },
            {
              id: "opt-c2",
              actionText: "Override and jumper the statutory alarm sensors on the control board to force continuous operation under abnormal parameters.",
              isCorrect: false,
              scoreDelta: -35,
              feedback: "CRITICAL SMS VIOLATION! Bypassing or defeating statutory safety trips without an approved Management of Change (MOC) and Class exemption is an immediate Port State Control detention defect.",
              consequenceNarrative: "Equipment suffered severe thermal/mechanical breakdown and triggered a Class survey deficiency.",
              statutoryCitation: "ISM Code Element 10 & SOLAS General Safety Provisions",
            },
            {
              id: "opt-c3",
              actionText: `Begin dismantling the internal mechanical components of ${eq.equipmentName} immediately without issuing a Permit to Work (PTW) or verifying line pressure and electrical isolation.`,
              isCorrect: false,
              scoreDelta: -45,
              feedback: "MAJOR WORK SAFETY HAZARD! Dismantling equipment without verifying zero stored energy (pressure/voltage) violates the Code of Safe Working Practices (COSWP).",
              consequenceNarrative: "Crew suffered pressurized fluid spray / electric shock hazard.",
              statutoryCitation: "Code of Safe Working Practices for Merchant Seafarers (COSWP) Ch 14",
            },
            {
              id: "opt-c4",
              actionText: "Suppress the alarm in the software and intentionally avoid recording the malfunction in the official logbook to prevent vetting observations.",
              isCorrect: false,
              scoreDelta: -40,
              feedback: "FRAUDULENT COMPLIANCE BREACH! Concealing equipment defects from statutory logbooks and SIRE 2.0 vetting inspectors incurs heavy legal penalties and vessel blacklisting.",
              consequenceNarrative: "Vetting inspector discovered unlogged equipment failure during audit.",
              statutoryCitation: "OCIMF SIRE 2.0 / VIQ Inspection Guidelines & Flag State Law",
            },
          ],
        },
      ],
      debriefingNotes: {
        keyTakeaway: `Always follow maker tolerances for ${eq.equipmentName} and ensure ${eq.statutoryRequirement.regulationCode} statutory limits are maintained.`,
        solasMarpolMandate: eq.statutoryRequirement.requirementSummary,
        vettingChecklistQuestion: `OCIMF / SIRE: 'Are critical spares for ${eq.equipmentName} inventoried and routine tests logged?'`,
        recommendedDrillFrequency: eq.statutoryRequirement.testInterval,
      },
    };

    startScenario(generatedScenario);
  };

  const handleRandomFailure = () => {
    if (equipmentList.length === 0) return;
    const randomIndex = Math.floor(Math.random() * equipmentList.length);
    handleLaunchEquipmentFailure(equipmentList[randomIndex]);
  };

  const categories = [
    { id: "All", label: "All Drills" },
    { id: "Electrical & Blackout", label: "Electrical & Blackout" },
    { id: "Cargo & Tanker", label: "Cargo & Tanker" },
    { id: "Engine Room", label: "Engine Room" },
    { id: "Bridge & Navigation", label: "Bridge & Nav" },
    { id: "SOLAS Safety & Life Saving", label: "SOLAS Safety" },
  ];

  const filteredScenarios = PRESET_SIMULATION_SCENARIOS.filter((s) => {
    if (activeCategory !== "All" && s.category !== activeCategory) return false;
    if (selectedDepartment !== "All" && s.department !== selectedDepartment) return false;
    return true;
  });

  const selectedEq = equipmentList.find((e) => e.id === selectedEquipmentForFailure) || equipmentList[0];

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Simulation Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-md text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Interactive Simulation Engine
              </span>
              <span className="text-xs text-slate-400">
                SOLAS • MARPOL • FSS Code • ISGOTT • SIRE 2.0
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2.5">
              <span>Single-Failure & Emergency Drill Simulator</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Step through real-time machinery failure scenarios, blackouts, toxic inrushes, and cargo overpressures.
              Test procedural decision trees against maker tolerances, statutory mandates, and OCIMF SIRE 2.0 vetting standards.
            </p>
          </div>

          {/* Engine Navigation Controls & Audio Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                soundEnabled
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
              title={soundEnabled ? "Mute simulation alarm tones" : "Enable simulation alarm tones"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? "Audio Alarms ON" : "Audio Muted"}</span>
            </button>

            <button
              onClick={handleRandomFailure}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer animate-pulse"
              title="Inject a sudden random equipment failure from your vault"
            >
              <Zap className="w-4 h-4" />
              <span>Inject Random Failure</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs bar */}
        <div className="flex flex-wrap items-center gap-1.5 mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={() => setSubTab("catalog")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === "catalog"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SOLAS & MARPOL Drill Catalog ({PRESET_SIMULATION_SCENARIOS.length})</span>
          </button>

          <button
            onClick={() => setSubTab("single_failure")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === "single_failure"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Vault Single-Failure Injector ({equipmentList.length})</span>
          </button>

          {activeScenario && (
            <button
              onClick={() => setSubTab("active")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                subTab === "active"
                  ? "bg-red-500 text-white shadow-sm"
                  : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
              }`}
            >
              <Flame className="w-3.5 h-3.5 animate-bounce" />
              <span>Active Scenario in Progress</span>
            </button>
          )}

          <button
            onClick={() => setSubTab("history")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ml-auto ${
              subTab === "history"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Vessel Drill Records ({drillLogs.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. SCENARIO CATALOG TAB */}
      {/* ======================================================== */}
      {subTab === "catalog" && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Scenarios Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScenarios.map((scenario) => {
              const categoryColor =
                scenario.category === "Electrical & Blackout"
                  ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"
                  : scenario.category === "Cargo & Tanker"
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                  : scenario.category === "Engine Room"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : scenario.category === "Bridge & Navigation"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";

              return (
                <div
                  key={scenario.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-amber-500/50 hover:shadow-md transition flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${categoryColor}`}>
                          {scenario.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono">
                          {scenario.code}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        {scenario.difficulty}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {scenario.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                        Ref: {scenario.statutoryRef}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">System:</span>
                        <span className="font-medium truncate">{scenario.systemEquipment}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Time Limit:</span>
                        <span className="font-medium">{formatSeconds(scenario.timeLimitSeconds)} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Stages:</span>
                        <span className="font-medium">{scenario.stages.length} Decision Checkpoints</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => startScenario(scenario)}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Launch Interactive Drill</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. VAULT SINGLE-FAILURE INJECTOR TAB */}
      {/* ======================================================== */}
      {subTab === "single_failure" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <span>Single-Failure Injection from Vault Systems</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pick any of the 25 statutory equipment items from your vault to trigger a simulated alarm, sensor spike, or failure.
              </p>
            </div>

            <button
              onClick={handleRandomFailure}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start"
            >
              <Zap className="w-4 h-4" />
              <span>Surprise Random Failure</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Select Machinery */}
            <div className="lg:col-span-1 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Equipment Target:
              </label>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                {equipmentList.map((eq) => (
                  <button
                    key={eq.id}
                    onClick={() => setSelectedEquipmentForFailure(eq.id)}
                    className={`w-full text-left p-3 text-xs transition cursor-pointer flex flex-col gap-1 ${
                      selectedEquipmentForFailure === eq.id
                        ? "bg-amber-500/15 border-l-4 border-amber-500 text-slate-900 dark:text-white font-bold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="font-semibold truncate">{eq.equipmentName}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {eq.maker} • {eq.statutoryRequirement.regulationCode}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Equipment Diagnostic & Launch Preview */}
            {selectedEq && (
              <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Target Equipment Profile
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {selectedEq.equipmentName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedEq.maker} - {selectedEq.model} | Location: {selectedEq.installedLocation}
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold">
                    {selectedEq.statutoryRequirement.regulationCode}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Primary Onboard Function</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedEq.statutoryRequirement.requirementSummary}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Mandatory Statutory Limit</p>
                    <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {selectedEq.statutoryRequirement.statutoryLimitValue}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-700 dark:text-slate-300">Maker Design Parameters to Stress Test:</p>
                  <div className="space-y-1.5">
                    {selectedEq.makerDesignSpecs.map((spec, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300">{spec.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Nominal: {spec.nominalValue}</span>
                          <span className="text-red-500 font-bold">Alarm: {spec.alarmLimit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    Spares Stocked: {selectedEq.criticalSparesOnboard.length} parts ready
                  </span>
                  <button
                    onClick={() => handleLaunchEquipmentFailure(selectedEq)}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Inject Single Failure Simulation</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ACTIVE SIMULATION & DECISION WORKSPACE */}
      {/* ======================================================== */}
      {subTab === "active" && activeScenario && (
        <div className="space-y-5">
          {/* Top HUD Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 animate-pulse">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      LIVE DRILL ACTIVE
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{activeScenario.code}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white mt-0.5">{activeScenario.title}</h2>
                </div>
              </div>

              {/* Countdown Timer HUD */}
              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Time to Escalation</p>
                  <p
                    className={`text-xl font-mono font-black ${
                      timeRemaining < 30 ? "text-red-400 animate-ping" : "text-amber-400"
                    }`}
                  >
                    {formatSeconds(timeRemaining)}
                  </p>
                </div>
                <div className="text-right pl-4 border-l border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Score & Accuracy</p>
                  <p className="text-xl font-mono font-black text-emerald-400">{userScore} pts</p>
                </div>
              </div>
            </div>

            {/* Alarm Siren Banner */}
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-red-300 tracking-wide font-mono">
                  {activeScenario.initialCondition.alarmMessage}
                </p>
                <p className="text-xs text-slate-300 mt-1">{activeScenario.initialCondition.initialNarrative}</p>
              </div>
            </div>

            {/* Live Telemetry Board */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>Live System Telemetry & Vessel Status:</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {currentTelemetry.map((item, idx) => {
                  const statusBg =
                    item.status === "danger"
                      ? "bg-red-950/70 border-red-800 text-red-300"
                      : item.status === "warning"
                      ? "bg-amber-950/70 border-amber-800 text-amber-300"
                      : "bg-slate-900 border-slate-800 text-slate-200";

                  return (
                    <div key={idx} className={`p-2.5 rounded-xl border ${statusBg} text-xs`}>
                      <p className="text-[10px] text-slate-400 truncate">{item.label}</p>
                      <p className="font-bold font-mono mt-0.5 truncate">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simulation Stage Progress or Completed Report */}
          {!isCompleted ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                    Stage {currentStageIndex + 1} of {activeScenario.stages.length}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {activeScenario.stages[currentStageIndex]?.stageTitle}
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Officer: <strong className="text-slate-700 dark:text-slate-200">{userRank}</strong>
                </span>
              </div>

              {/* Scenario Update */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <FileCheck className="w-3 h-3" />
                    Official Maritime Publication Evaluation
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Grounded in SOLAS • MARPOL • ISGOTT • STCW • FSS
                  </span>
                </div>
                <p>{activeScenario.stages[currentStageIndex]?.scenarioUpdate}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {activeScenario.stages[currentStageIndex]?.questionOrActionPrompt}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Select the 1 correct action conforming strictly with official international publications and shipboard SMS:
                  </p>
                </div>
              </div>

              {/* Action Options (3-4 Choice Grid with Option Letters A, B, C, D) */}
              <div className="space-y-3">
                {(currentStageOptions.length > 0
                  ? currentStageOptions
                  : activeScenario.stages[currentStageIndex]?.options || []
                ).map((option, optIdx) => {
                  const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D
                  const isSelected = selectedOption?.id === option.id;

                  let optionBorder = "border-slate-200 dark:border-slate-800 hover:border-amber-500/50";
                  let optionBg = "bg-white dark:bg-slate-900";

                  if (isSelected) {
                    optionBorder = "border-amber-500 ring-2 ring-amber-500/20";
                    optionBg = "bg-amber-50/50 dark:bg-amber-950/20";
                  }

                  if (hasSubmittedStage) {
                    if (option.isCorrect) {
                      optionBorder = "border-emerald-500 ring-2 ring-emerald-500/20";
                      optionBg = "bg-emerald-50/50 dark:bg-emerald-950/20";
                    } else if (isSelected && !option.isCorrect) {
                      optionBorder = "border-red-500 ring-2 ring-red-500/20";
                      optionBg = "bg-red-50/50 dark:bg-red-950/20";
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      disabled={hasSubmittedStage}
                      onClick={() => handleSelectOption(option)}
                      className={`w-full text-left p-4 rounded-xl border ${optionBorder} ${optionBg} transition cursor-pointer space-y-2`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Option Badge A, B, C, D */}
                          <div
                            className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 transition ${
                              hasSubmittedStage && option.isCorrect
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                : hasSubmittedStage && isSelected && !option.isCorrect
                                ? "bg-red-600 border-red-600 text-white shadow-xs"
                                : isSelected
                                ? "bg-amber-500 border-amber-500 text-slate-950 shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {hasSubmittedStage && option.isCorrect ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : hasSubmittedStage && isSelected && !option.isCorrect ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              optionLetter
                            )}
                          </div>

                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                Option {optionLetter}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                              {option.actionText}
                            </p>
                          </div>
                        </div>

                        {hasSubmittedStage && option.isCorrect && (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider shrink-0 flex items-center gap-1 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Statutory Compliant (+{option.scoreDelta} pts)
                          </span>
                        )}

                        {hasSubmittedStage && isSelected && !option.isCorrect && (
                          <span className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-extrabold uppercase tracking-wider shrink-0 flex items-center gap-1 border border-red-500/30">
                            <XCircle className="w-3 h-3" />
                            Defect / Penalty ({option.scoreDelta} pts)
                          </span>
                        )}
                      </div>

                      {/* Detailed Feedback on Submit with Official Publications Citation */}
                      {hasSubmittedStage && (isSelected || option.isCorrect) && (
                        <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1.5 bg-slate-50/70 dark:bg-slate-950/60 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-bold text-xs flex items-center gap-1.5 ${
                                option.isCorrect
                                  ? "text-emerald-700 dark:text-emerald-400"
                                  : "text-red-700 dark:text-red-400"
                              }`}
                            >
                              {option.isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                              )}
                              <span>{option.feedback}</span>
                            </p>
                          </div>

                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px] pl-5.5">
                            {option.consequenceNarrative}
                          </p>

                          {option.statutoryCitation && (
                            <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 pl-5.5">
                              <span className="text-[10px] uppercase font-extrabold text-amber-700 dark:text-amber-400">
                                📖 Official Publication Authority:
                              </span>
                              <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
                                {option.statutoryCitation}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setSubTab("catalog");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Abort Simulation
                </button>

                {!hasSubmittedStage ? (
                  <button
                    disabled={!selectedOption}
                    onClick={handleSubmitStageChoice}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
                      selectedOption
                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <span>Confirm Decision</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextStage}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      {currentStageIndex + 1 < activeScenario.stages.length
                        ? "Proceed to Next Stage"
                        : "Complete Drill & View Debrief"}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* COMPLETED DRILL CERTIFICATE & DEBRIEF */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
              <div className="text-center space-y-2 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-3xl">
                  <Award className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Drill Debriefing & Statutory Audit Report
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {activeScenario.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vessel: <strong className="text-slate-700 dark:text-slate-200">{vesselName}</strong> • Officer:{" "}
                  <strong className="text-slate-700 dark:text-slate-200">{userRank} ({userProfile?.name || "Officer"})</strong>
                </p>
              </div>

              {/* Performance Metrics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Score</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{userScore} pts</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Time Taken</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{formatSeconds(drillDuration)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Deviations / Errors</p>
                  <p className={`text-lg font-black mt-0.5 ${mistakesCount === 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {mistakesCount}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Compliance Status</p>
                  <p className="text-lg font-black text-emerald-500 mt-0.5">COMPLIANT</p>
                </div>
              </div>

              {/* Debriefing & SIRE 2.0 Notes */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs text-slate-800 dark:text-slate-200">
                <p className="font-bold text-amber-800 dark:text-amber-300 text-sm flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>Key Seamanship & Statutory Takeaway:</span>
                </p>
                <p>{activeScenario.debriefingNotes.keyTakeaway}</p>
                <p className="pt-2 border-t border-amber-500/20 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <strong>IMO Mandate:</strong> {activeScenario.debriefingNotes.solasMarpolMandate}
                </p>
                <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <strong>SIRE 2.0 Vetting Question:</strong> {activeScenario.debriefingNotes.vettingChecklistQuestion}
                </p>
              </div>

              {/* Sign-Off and Next Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setSubTab("history")}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <History className="w-4 h-4" />
                  <span>View All Vessel Drill Records</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Report</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveScenario(null);
                      setSubTab("catalog");
                    }}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    <span>Done / Return to Catalog</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. VESSEL DRILL HISTORY & STATUTORY LEDGER TAB */}
      {/* ======================================================== */}
      {subTab === "history" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-amber-500" />
                <span>Vessel Completed Drill Records & SIRE 2.0 Ledger</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory audit trail of all single-failure tests, blackouts, and emergency scenarios executed onboard.
              </p>
            </div>

            <button
              onClick={() => setSubTab("catalog")}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer self-start"
            >
              <span>+ Run New Simulation</span>
            </button>
          </div>

          {drillLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <ShieldAlert className="w-12 h-12 mx-auto text-slate-500" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No drills completed yet on this voyage.</p>
              <p className="text-xs max-w-md mx-auto">
                Launch an interactive single-failure drill or blackout scenario to build the vessel's SIRE 2.0 audit ledger.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {drillLogs.map((log) => (
                <div key={log.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase">
                        {log.category}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{log.scenarioTitle}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.passed
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                        }`}
                      >
                        {log.passed ? "PASSED" : "FAILED"} ({log.percentage}%)
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Officer: <strong className="text-slate-700 dark:text-slate-200">{log.officerRank}</strong> (
                      {log.officerName}) • Duration: {log.durationSeconds}s • Date:{" "}
                      {new Date(log.completedAt).toLocaleString()}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">Statutory Ref: {log.statutoryRef}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {log.score} / {log.maxScore} pts
                      </p>
                      <p className="text-[11px] text-slate-400">{log.mistakesCount} deviations</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
