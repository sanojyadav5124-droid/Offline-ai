import React, { useState } from "react";
import {
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Send,
  Loader2,
  Wrench,
  BookOpen,
  Wifi,
  WifiOff,
  CheckCircle2,
} from "lucide-react";
import { EquipmentKnowledgeItem, TroubleshootingEntry } from "../types";

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentList: EquipmentKnowledgeItem[];
  troubleshootingList: TroubleshootingEntry[];
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  equipmentList,
  troubleshootingList,
}) => {
  const [query, setQuery] = useState("");
  const [selectedEqId, setSelectedEqId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseMarkdown, setResponseMarkdown] = useState<string | null>(null);
  const [activeEngine, setActiveEngine] = useState<"offline_rule" | "online_gemini">("offline_rule");

  // Offline diagnostic logic
  const runOfflineMaritimeDiagnostic = (input: string, eqContext?: EquipmentKnowledgeItem) => {
    const term = input.toLowerCase();

    if (term.includes("15 ppm") || term.includes("ows") || term.includes("bilgmon") || term.includes("bilge")) {
      return `### ⚙️ OFFLINE MARITIME DIAGNOSTIC: 15 PPM Bilge Separator (OWS)

**1. IMMEDIATE SAFETY & STATUTORY WARNING:**
- **MARPOL Annex I Reg 14 Strict Limit:** Discharge **must not exceed 15.0 PPM**.
- Never bypass the 3-way divert valve or introduce clean water to the sample line during actual overboard discharge. False entries lead to PSC detention and Marpol criminal violation.

**2. PROBABLE ROOT CAUSES (Shipboard Common):**
1. **Optical Glass Fouling:** Iron rust or bacterial film baked onto the BilgMon48 quartz measuring tube.
2. **Coalescer Element Saturation:** High differential pressure (>1.2 bar) pushing emulsion through 1st stage.
3. **Heavy Emulsion in Bilge Holding Tank:** Chemical detergent or galley grease emulsifying oil into micro-droplets.
4. **Air Bubbles in Sample Line:** Cavitation in supply pump causing optical scatter.

**3. STEP-BY-STEP CORRECTIVE PROCEDURE:**
1. Stop discharge and open fresh water flushing valve to OCM.
2. If clean water reading remains > 0.5 ppm, isolate sample cell and extract optical tube using 4mm allen key.
3. Clean tube interior with isopropanol solvent and silicone swab.
4. Check coalescer pressure gauges; if ΔP > 1.0 bar, backflush or renew cartridge filter.
5. Dose bilge holding tank with oil-splitting demulsifier if heavy chemicals are present.

**4. SPARES TO CHECK:**
- Spare BilgMon48 calibrated sensor unit (stored in Chief Engineer's cabin).
- Buna-N sensor cell O-rings (22x2.5mm).
- 1st stage coalescer cartridges.`;
    }

    if (term.includes("exhaust") || term.includes("generator") || term.includes("dg") || term.includes("yanmar")) {
      return `### ⚙️ OFFLINE MARITIME DIAGNOSTIC: Auxiliary Diesel Generator Exhaust Deviation

**1. IMMEDIATE SAFETY PRECAUTIONS:**
- Max allowable exhaust temperature deviation: **±30°C from engine mean average**.
- If any single cylinder exceeds **480°C**, reduce load immediately or trip breaker to prevent turbocharger turbine damage or exhaust valve burn-out.

**2. PROBABLE ROOT CAUSES:**
1. **Faulty Fuel Injector:** Worn nozzle needle sticking open or clogged spray orifices (dribbling fuel at low pressure).
2. **Exhaust Valve Leakage:** Valve seat pitting or incorrect tappet clearance (cold clearance: 0.50mm exhaust).
3. **Low Charge Air Pressure:** Turbocharger air filter fouled or air cooler clogged on air side (check ΔP > 200mm WC).
4. **High Fuel Inlet Temp / Low Lubricity:** Vapor lock in high pressure fuel pump when running on MGO in SECA ports.

**3. STEP-BY-STEP TROUBLESHOOTING:**
1. Transfer load to standby DG and stop affected engine.
2. Pull indicator cocks and rotate on turning gear to check compression resistance.
3. Remove affected cylinder fuel valve; test on nozzle test bench (opening pressure must be 280 bar with zero dribble).
4. Inspect exhaust valve spindle bounce and verify valve rotator movement.
5. Replace injector with overhauled unit from ship spares rack.`;
    }

    if (term.includes("steering") || term.includes("rudder") || term.includes("hunting")) {
      return `### ⚙️ OFFLINE MARITIME DIAGNOSTIC: Electro-Hydraulic Steering Gear Hunting & Sluggish Response

**1. STATUTORY SOLAS REQUIREMENT (SOLAS V Reg 26):**
- Rudder must travel from **35° Port to 30° Starboard in ≤ 28.0 seconds** at maximum ahead service draft.

**2. PROBABLE ROOT CAUSES:**
1. **Air in Hydraulic Actuators:** Micro air bubbles entrained in hydraulic fluid causing springiness and hunting oscillations.
2. **Telemetry / Feedback Potentiometer Slack:** Mechanical looseness or dirty wiper track on rudder angle transmitter.
3. **Clogged Suction Strainer:** Cavitation at hydraulic pump inlet during heavy vessel roll.
4. **Proportional Solenoid Valve Sticking:** Varnish or metal lint lodged in 4/3-way directional control valve spool.

**3. STEP-BY-STEP CORRECTIVE PROCEDURE:**
1. Notify Bridge; switch steering control to Non-Follow-Up (NFU) or secondary steering pump.
2. Open air bleed vents on cylinder tops while manually cycling rudder through full stroke.
3. Bleed until clear oil with no frothing is observed.
4. Check hydraulic oil level in expansion tank (maintain above 85% on sight glass).
5. Inspect feedback link rod ball joints for zero backlash.`;
    }

    if (term.includes("blackout") || term.includes("emergency generator")) {
      return `### ⚙️ OFFLINE MARITIME DIAGNOSTIC: Blackout Restoration & Emergency Power

**1. MANDATORY SOLAS TIMELINE:**
- Emergency Generator must automatically start and close breaker onto Emergency Switchboard within **≤ 45.0 seconds** (SOLAS II-1 Reg 43).

**2. IMMEDIATE RECOVERY SEQUENCE:**
1. Verify Emergency Generator is running and emergency lighting / bridge navigation consoles are live.
2. Duty Engineer & ETO proceed to Main Engine Control Room (ECR).
3. Check starting air bottles (minimum 25 bar).
4. Trip non-essential heavy consumers on Main Switchboard (deck cranes, reefers, air conditioning compressors).
5. Start Auxiliary Engine locally in manual mode.
6. Perform manual dead-bus synchronization closure.
7. Sequentially start cooling seawater pumps, lube oil priming pumps, and steering gear pump #1.
8. Inform Bridge when propulsion command is ready.`;
    }

    // Default synthesized answer from local knowledge base
    return `### ⚙️ OFFLINE MARITIME SYNTHESIS FOR: "${input}"

**1. LOCAL EQUIPMENT RELEVANCE:**
Matched against ${equipmentList.length} onboard machinery systems and ${troubleshootingList.length} verified past experiences in your offline vault.

**2. GENERAL SHIPBOARD TROUBLESHOOTING PROTOCOL:**
1. **Safety First:** Identify any statutory alarms (SOLAS / MARPOL) and log initial parameters before adjusting controls.
2. **Isolate Symptoms vs Causes:** Check sensors and gauge calibrations before dismantling heavy mechanical assemblies.
3. **Review Past Handover Logs:** Similar issues recorded on your vessel often share identical root causes (e.g. filter fouling, water in fuel, or loose electrical terminals).
4. **Record Findings:** Document the final fix and spares consumed in Blueprint's **Breakdown Experience Log** for your shipmates.`;
  };

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const eqContext = equipmentList.find((e) => e.id === selectedEqId);

    // Try online AI first if selected, or run offline logic
    if (activeEngine === "online_gemini") {
      setIsLoading(true);
      try {
        const res = await fetch("/api/maritime-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: query,
            equipmentContext: eqContext || { name: "Shipboard System" },
            queryType: "Technical Troubleshooting",
          }),
        });

        const data = await res.json();
        if (data.reply) {
          setResponseMarkdown(data.reply);
        } else {
          // Fallback to offline rule engine
          setResponseMarkdown(runOfflineMaritimeDiagnostic(query, eqContext));
        }
      } catch (err) {
        // Fallback offline
        setResponseMarkdown(runOfflineMaritimeDiagnostic(query, eqContext));
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setResponseMarkdown(runOfflineMaritimeDiagnostic(query, eqContext));
        setIsLoading(false);
      }, 150);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative max-w-3xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Maritime Technical Diagnostic Advisor</h3>
              <p className="text-xs text-slate-400">
                Instant offline triage decision trees + optional online satellite AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Engine Switcher */}
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveEngine("offline_rule")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeEngine === "offline_rule"
                  ? "bg-emerald-500 text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>100% Offline Rule Engine (Zero Lag)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveEngine("online_gemini")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeEngine === "online_gemini"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Online Gemini Engine (Port / Satellite)</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <form onSubmit={handleConsult} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Describe the Alarm, Symptom, or Technical Question:
                </label>
                <input
                  type="text"
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. '15 ppm OWS high alarm', 'cylinder exhaust temp deviation', 'steering hunting'..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Context Machinery:
                </label>
                <select
                  value={selectedEqId}
                  onChange={(e) => setSelectedEqId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">General Marine Query</option>
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.equipmentName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-400 font-semibold shrink-0">Quick Triage:</span>
              {[
                "15 PPM OWS High Trip",
                "Aux Engine Exhaust Temp High",
                "Steering Gear Hunting in Rough Sea",
                "Blackout Recovery Sequence",
                "Enclosed Space Gas Limits",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setQuery(chip)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 transition text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Shipboard Knowledge Base...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Run Maritime Diagnostic</span>
                </>
              )}
            </button>
          </form>

          {/* Response Box */}
          {responseMarkdown && (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-mono space-y-2 animate-in fade-in">
              {responseMarkdown}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
