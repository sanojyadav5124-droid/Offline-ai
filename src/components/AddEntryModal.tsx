import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Camera,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Wrench,
  Sparkles,
  Sliders,
  Trash2,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import {
  EquipmentKnowledgeItem,
  TroubleshootingEntry,
  MaritimeDepartment,
  StatutoryRequirement,
  CurrentReading,
  PhotoAttachment,
} from "../types";
import { compressImageFile } from "../utils/storage";

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEquipment: (item: EquipmentKnowledgeItem) => void;
  onSaveTroubleshooting: (entry: TroubleshootingEntry) => void;
  existingEquipmentList: EquipmentKnowledgeItem[];
  initialPrefillName?: string;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({
  isOpen,
  onClose,
  onSaveEquipment,
  onSaveTroubleshooting,
  existingEquipmentList,
  initialPrefillName,
}) => {
  if (!isOpen) return null;

  const [entryMode, setEntryMode] = useState<"equipment" | "troubleshooting">("troubleshooting");

  // Common Fields
  const [department, setDepartment] = useState<MaritimeDepartment>("Engine");
  const [area, setArea] = useState("Engine Room Lower Platform");
  const [equipmentName, setEquipmentName] = useState(initialPrefillName || "");
  const [maker, setMaker] = useState("");
  const [model, setModel] = useState("");
  const [installedLocation, setInstalledLocation] = useState("");

  // Statutory Law (Pre-filled Amber Section)
  const [regCode, setRegCode] = useState("SOLAS II-1 Reg 41");
  const [govBody, setGovBody] = useState<StatutoryRequirement["governingBody"]>("IMO SOLAS");
  const [statLimit, setStatLimit] = useState("LO Press > 2.8 bar / Temp < 85°C");
  const [statSummary, setStatSummary] = useState(
    "Standard IMO classification requirement for continuous power generation with single-engine redundancy."
  );
  const [testInterval, setTestInterval] = useState<StatutoryRequirement["testInterval"]>("Monthly");
  const [tolerance, setTolerance] = useState("Emergency trip within ±5% tolerance");

  // Current Reading (Live Emerald Section)
  const [measuredValue, setMeasuredValue] = useState("4.2 bar");
  const [testedDate, setTestedDate] = useState(new Date().toISOString().split("T")[0]);
  const [testedByRank, setTestedByRank] = useState("2nd Engineer");
  const [status, setStatus] = useState<CurrentReading["status"]>("Compliant");
  const [readingNotes, setReadingNotes] = useState("Nominal operating test completed with zero alarm triggers.");

  // Troubleshooting Fields
  const [symptomOrAlarm, setSymptomOrAlarm] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [actionTakenAndFix, setActionTakenAndFix] = useState("");
  const [sparesUsed, setSparesUsed] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [severity, setSeverity] = useState<TroubleshootingEntry["severity"]>("Operational Warning");
  const [tagsInput, setTagsInput] = useState("Engine, Maintenance, Spares");

  // Photos
  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Auto-population handler when choosing or typing equipment
  const handleAutoPopulateFromExisting = (selectedName: string) => {
    setEquipmentName(selectedName);
    const found = existingEquipmentList.find(
      (eq) => eq.equipmentName.toLowerCase() === selectedName.toLowerCase()
    );

    if (found) {
      setDepartment(found.department);
      setArea(found.area);
      setMaker(found.maker);
      setModel(found.model);
      setInstalledLocation(found.installedLocation || "");
      setRegCode(found.statutoryRequirement.regulationCode);
      setGovBody(found.statutoryRequirement.governingBody);
      setStatLimit(found.statutoryRequirement.statutoryLimitValue);
      setStatSummary(found.statutoryRequirement.requirementSummary);
      setTestInterval(found.statutoryRequirement.testInterval);
      setTolerance(found.statutoryRequirement.standardTolerance);

      // Pre-fill reading
      setMeasuredValue(found.currentReading.measuredValue);
      setStatus(found.currentReading.status);

      // Pre-fill tags
      setTagsInput(`${found.department}, ${found.maker}, ${found.model}`);
    }
  };

  useEffect(() => {
    if (initialPrefillName) {
      handleAutoPopulateFromExisting(initialPrefillName);
    }
  }, [initialPrefillName]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setPhotoUploading(true);
    try {
      const newPhotos: PhotoAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await compressImageFile(file);
        newPhotos.push({
          id: `photo-${Date.now()}-${i}`,
          fileName: file.name,
          fileSizeKb: Math.round(dataUrl.length / 1024),
          dataUrl,
          caption: file.name.replace(/\.[^/.]+$/, ""),
          uploadedAt: new Date().toISOString().split("T")[0],
          tag: "Inspection",
        });
      }
      setPhotos((prev) => [...prev, ...newPhotos]);
    } catch (err) {
      console.error("Photo upload compression error:", err);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!equipmentName.trim()) {
      alert("Please provide the Equipment / System Name");
      return;
    }

    if (entryMode === "equipment") {
      const newEq: EquipmentKnowledgeItem = {
        id: `eq-${Date.now()}`,
        department,
        area,
        equipmentName,
        maker: maker || "Marine Standard",
        model: model || "Standard Model",
        installedLocation,
        statutoryRequirement: {
          id: `stat-${Date.now()}`,
          regulationCode: regCode,
          governingBody: govBody,
          requirementSummary: statSummary,
          statutoryLimitValue: statLimit,
          testInterval,
          standardTolerance: tolerance,
        },
        currentReading: {
          measuredValue,
          unit: "",
          lastTestedDate: testedDate,
          testedByRank,
          status,
          notes: readingNotes,
        },
        makerDesignSpecs: [
          { label: "Nominal Operating Band", nominalValue: statLimit, alarmLimit: "Deviation Alert" },
        ],
        quickNotes: readingNotes,
        criticalSparesOnboard: sparesUsed ? [sparesUsed] : [],
        photos,
        updatedAt: new Date().toISOString(),
      };
      onSaveEquipment(newEq);
    } else {
      if (!symptomOrAlarm.trim()) {
        alert("Please describe the Symptom or Alarm observed");
        return;
      }
      const newLog: TroubleshootingEntry = {
        id: `tr-${Date.now()}`,
        equipmentName,
        department,
        area,
        dateOfIncident: testedDate,
        symptomOrAlarm,
        rootCause: rootCause || "Under Investigation / Pending Root Analysis",
        actionTakenAndFix: actionTakenAndFix || "Inspected and restored to normal operation.",
        sparesUsed: sparesUsed || "None recorded",
        seafarerRank: testedByRank,
        lessonsLearned,
        severity,
        photos,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      };
      onSaveTroubleshooting(newLog);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative max-w-3xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Log Maritime Reference & Experience</h3>
              <p className="text-xs text-slate-400">Auto-populates known parameters for instant onboard entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entry Mode Toggle Tabs */}
        <div className="p-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEntryMode("troubleshooting")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              entryMode === "troubleshooting"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>1. Breakdown Experience & Fix Log</span>
          </button>

          <button
            type="button"
            onClick={() => setEntryMode("equipment")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              entryMode === "equipment"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>2. Machinery Specs & Statutory Rule</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Quick Auto-populate selector */}
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-bold">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Auto-populate from Known Machinery / Area:</span>
            </div>
            <select
              onChange={(e) => {
                if (e.target.value) handleAutoPopulateFromExisting(e.target.value);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-sky-400/40 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="">-- Choose known vessel equipment --</option>
              {existingEquipmentList.map((eq) => (
                <option key={eq.id} value={eq.equipmentName}>
                  {eq.equipmentName} ({eq.area})
                </option>
              ))}
            </select>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Equipment / System Name *
              </label>
              <input
                type="text"
                required
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
                placeholder="e.g. Auxiliary Diesel Generator #2 (Yanmar 6EY18ALW)"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as MaritimeDepartment)}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Engine">Engine Room</option>
                <option value="Deck">Deck & Bridge</option>
                <option value="Electrical">Electrical / ETO</option>
                <option value="Safety_ISM">Safety / ISM / MLC</option>
                <option value="Cargo">Cargo Operations</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Area / Location</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Steering Gear Flat Frame 12"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Maker / Brand</label>
              <input
                type="text"
                value={maker}
                onChange={(e) => setMaker(e.target.value)}
                placeholder="e.g. Yanmar / Alfa Laval"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Model / Serial</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. 6EY18ALW"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Dynamic Sections Based on Mode */}
          {entryMode === "troubleshooting" ? (
            /* Troubleshooting Incident Fields */
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Observed Symptom / Alarm Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={symptomOrAlarm}
                    onChange={(e) => setSymptomOrAlarm(e.target.value)}
                    placeholder="e.g. Alarm 104: Low L.O. Pressure at 650 RPM"
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as TroubleshootingEntry["severity"])}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Emergency / Critical">Emergency / Critical</option>
                    <option value="Operational Warning">Operational Warning</option>
                    <option value="Routine Defect">Routine Defect</option>
                    <option value="Handover Note">Handover Note</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Root Cause Identified
                </label>
                <textarea
                  rows={2}
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="Explain why this breakdown occurred (e.g. clogged pilot orifice, sticky injector needle, contaminated lube oil)..."
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Action Taken & Fix Procedure (Step-by-Step)
                </label>
                <textarea
                  rows={3}
                  value={actionTakenAndFix}
                  onChange={(e) => setActionTakenAndFix(e.target.value)}
                  placeholder="1. Isolated suction line&#10;2. Dismantled filter chamber&#10;3. Cleaned with solvent and renewed sealing O-ring..."
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Spares & Consumables Used
                  </label>
                  <input
                    type="text"
                    value={sparesUsed}
                    onChange={(e) => setSparesUsed(e.target.value)}
                    placeholder="e.g. 1x Injector Assembly P/N 129900, 2x Copper Washers"
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Key Lessons / Handover Advice
                  </label>
                  <input
                    type="text"
                    value={lessonsLearned}
                    onChange={(e) => setLessonsLearned(e.target.value)}
                    placeholder="e.g. Test injector pressure every 1,500 running hours in SECA fuel."
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Statutory & Maker Specs Dual Section */
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              {/* Pre-filled Amber Section: Law / Code Requirements */}
              <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Statutory Law Requirement (Amber Official Section)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-amber-900 dark:text-amber-300 mb-1">
                      Regulation Code
                    </label>
                    <input
                      type="text"
                      value={regCode}
                      onChange={(e) => setRegCode(e.target.value)}
                      placeholder="e.g. SOLAS II-1 Reg 43"
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-400/40 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-amber-900 dark:text-amber-300 mb-1">
                      Governing Body
                    </label>
                    <select
                      value={govBody}
                      onChange={(e) => setGovBody(e.target.value as any)}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-400/40 text-slate-900 dark:text-white"
                    >
                      <option value="IMO SOLAS">IMO SOLAS</option>
                      <option value="IMO MARPOL">IMO MARPOL</option>
                      <option value="STCW">STCW 2010</option>
                      <option value="Class / IACS">Class / IACS</option>
                      <option value="MLC 2006">MLC 2006</option>
                      <option value="Maker Standard">Maker Standard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-amber-900 dark:text-amber-300 mb-1">
                      Required Statutory Limit
                    </label>
                    <input
                      type="text"
                      value={statLimit}
                      onChange={(e) => setStatLimit(e.target.value)}
                      placeholder="e.g. ≤ 15.0 PPM or ≤ 45 seconds"
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-400/40 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-amber-900 dark:text-amber-300 mb-1">
                    Requirement Summary & Tolerances
                  </label>
                  <input
                    type="text"
                    value={statSummary}
                    onChange={(e) => setStatSummary(e.target.value)}
                    placeholder="Summary of statutory rule..."
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-400/40 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Live Emerald Section: Current Onboard Reading */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Current Onboard Vessel Record (Emerald Live Section)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                      Measured Value / Test Result
                    </label>
                    <input
                      type="text"
                      value={measuredValue}
                      onChange={(e) => setMeasuredValue(e.target.value)}
                      placeholder="e.g. 2.4 PPM or 18.2 sec"
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-400/40 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as CurrentReading["status"])}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-400/40 text-slate-900 dark:text-white"
                    >
                      <option value="Compliant">Compliant</option>
                      <option value="Caution">Caution / Trending High</option>
                      <option value="Non-Compliant">Non-Compliant</option>
                      <option value="Pending Test">Pending Test</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                      Tested By (Rank)
                    </label>
                    <input
                      type="text"
                      value={testedByRank}
                      onChange={(e) => setTestedByRank(e.target.value)}
                      placeholder="e.g. 2nd Engineer / Chief Officer"
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-400/40 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                    Inspection Notes / Conditions
                  </label>
                  <input
                    type="text"
                    value={readingNotes}
                    onChange={(e) => setReadingNotes(e.target.value)}
                    placeholder="e.g. Clean water flushing tested; tripped cleanly at 15.2 ppm."
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-400/40 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Photo & Drawing Attachments Section */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-sky-400" />
                <span>Attach Small Photos / Nameplates / Wiring Schematics</span>
              </label>
              <span className="text-[11px] text-slate-400">Compressed for fast offline storage</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400 cursor-pointer flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold transition">
                <Upload className="w-4 h-4" />
                <span>{photoUploading ? "Compressing..." : "Choose / Drop Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={photoUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Photos Preview Strip */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-video"
                  >
                    <img src={photo.dataUrl} alt={photo.caption} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-90 hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-[10px] text-white truncate">
                      {photo.fileName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Save Entry to Local Vault</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
