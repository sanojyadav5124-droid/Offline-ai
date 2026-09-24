export type MaritimeDepartment =
  | "Engine"
  | "Deck"
  | "Electrical"
  | "Safety_ISM"
  | "Cargo";

export type WatchMode = "day" | "engine" | "bridge_night";

export interface SeafarerProfile {
  rank: string; // e.g. "Chief Engineer", "2nd Engineer", "Chief Officer", "ETO"
  name?: string; // e.g. "S. K. Yadav", "Capt. A. Smith"
  seafarerId?: string; // CDC / Discharge Book or Crew ID
  department?: MaritimeDepartment;
  watchSchedule?: string; // e.g. "0400-0800 & 1600-2000"
}

export interface MaritimeRankDefinition {
  value: string;
  label: string;
  department: MaritimeDepartment;
  code: string;
  description: string;
}

export const MARITIME_RANKS: {
  category: string;
  department: MaritimeDepartment;
  ranks: MaritimeRankDefinition[];
}[] = [
  {
    category: "Command & Deck Department (Navigational Bridge)",
    department: "Deck",
    ranks: [
      { value: "Master / Captain", label: "Master / Captain (Capt.)", department: "Deck", code: "MST", description: "Commanding Officer, Safe Navigation & Overall Ship Operations" },
      { value: "Chief Officer", label: "Chief Officer / Chief Mate (C/O)", department: "Deck", code: "CO", description: "Cargo Operations, Stability, Deck Maintenance & Safety" },
      { value: "2nd Officer", label: "2nd Officer / Nav Officer (2/O)", department: "Deck", code: "2O", description: "Navigational Passage Planning, Charts & Bridge Equipment" },
      { value: "3rd Officer", label: "3rd Officer / Safety Officer (3/O)", department: "Deck", code: "3O", description: "Bridge Watchkeeping, LSA/FFA Maintenance & Inspections" },
      { value: "Bosun / Deck Foreman", label: "Bosun / Deck Foreman", department: "Deck", code: "BSN", description: "Deck Ratings Supervisor, Mooring Gear & Rigging" },
      { value: "Able Seaman (AB)", label: "Able Seaman (AB)", department: "Deck", code: "AB", description: "Helmsman, Lookout, Mooring Operations & Deck Maintenance" },
      { value: "Ordinary Seaman (OS)", label: "Ordinary Seaman (OS)", department: "Deck", code: "OS", description: "General Deck Duties, Rust Removal & Chipping" },
      { value: "Deck Cadet", label: "Deck Cadet / Trainee", department: "Deck", code: "DC", description: "Trainee Navigating Officer under supervision" },
    ],
  },
  {
    category: "Engine Department Officers & Crew",
    department: "Engine",
    ranks: [
      { value: "Chief Engineer", label: "Chief Engineer (C/E)", department: "Engine", code: "CE", description: "Technical Head of Department & Machinery Systems" },
      { value: "2nd Engineer", label: "2nd Engineer (2/E)", department: "Engine", code: "2E", description: "First Assistant Engineer, Main Engine & Plant Management" },
      { value: "3rd Engineer", label: "3rd Engineer (3/E)", department: "Engine", code: "3E", description: "Auxiliary Engines, Boilers, Purifiers & Fuel Systems" },
      { value: "4th Engineer", label: "4th Engineer (4/E)", department: "Engine", code: "4E", description: "Pumps, Compressors, Sewage, Bunkering & Bilge Separator" },
      { value: "Engine Fitter / Turner", label: "Engine Fitter / Turner", department: "Engine", code: "FIT", description: "Machining, Lathe Fabrication, Pipefitting & Overhauls" },
      { value: "Motorman / Oiler", label: "Motorman / Oiler", department: "Engine", code: "MM", description: "Watchkeeping Rounds, Lubrication & Engine Room Housekeeping" },
      { value: "Engine Cadet", label: "Engine Cadet / Trainee", department: "Engine", code: "EC", description: "Trainee Engineer Officer under supervision" },
    ],
  },
  {
    category: "Electrical & Technical",
    department: "Electrical",
    ranks: [
      { value: "Electro-Technical Officer (ETO)", label: "Electro-Technical Officer (ETO)", department: "Electrical", code: "ETO", description: "High Voltage, Automation, PLC, Radio/Radar & Nav Instruments" },
      { value: "Electrician", label: "Marine Electrician / Assistant", department: "Electrical", code: "ELEC", description: "Motors, Starters, Lighting & Power Distribution Systems" },
    ],
  },
  {
    category: "Safety, Cargo & Specialized",
    department: "Safety_ISM",
    ranks: [
      { value: "Safety Officer", label: "Ship Safety Officer", department: "Safety_ISM", code: "SO", description: "SMS Compliance, Risk Assessments & Safety Committee" },
      { value: "Cargo Engineer", label: "Cargo / Gas Engineer", department: "Cargo", code: "CGO", description: "Cargo Pumps, Reliquefaction, Compressors & Inert Gas" },
      { value: "Ship Security Officer (SSO)", label: "Ship Security Officer (SSO)", department: "Safety_ISM", code: "SSO", description: "ISPS Code Compliance & Anti-Piracy / Security Management" },
    ],
  },
];

export const ALL_MARITIME_RANKS = MARITIME_RANKS.flatMap((g) => g.ranks);

export interface StatutoryRequirement {
  id: string;
  regulationCode: string; // e.g., "MARPOL Annex I Reg 14" or "SOLAS II-1 Reg 43"
  governingBody: "IMO SOLAS" | "IMO MARPOL" | "STCW" | "MLC 2006" | "Class / IACS" | "Maker Standard";
  requirementSummary: string;
  statutoryLimitValue: string; // e.g. "≤ 15.0 PPM" or "≤ 45 sec auto-transfer"
  statutoryUnit?: string;
  testInterval: "Daily" | "Weekly" | "Monthly" | "3-Monthly" | "Annual" | "Prior Departure" | "Continuous";
  standardTolerance: string;
}

export interface CurrentReading {
  measuredValue: string;
  unit: string;
  lastTestedDate: string;
  testedByRank: string; // e.g. "2nd Engineer", "Chief Officer", "ETO"
  status: "Compliant" | "Caution" | "Non-Compliant" | "Pending Test";
  notes?: string;
}

export interface PhotoAttachment {
  id: string;
  fileName: string;
  fileSizeKb: number;
  dataUrl: string;
  caption: string;
  uploadedAt: string;
  tag?: "Nameplate" | "Damaged Part" | "Wiring Schematic" | "Indicator Card" | "Clearance Gauge" | "Inspection";
}

export interface EquipmentKnowledgeItem {
  id: string;
  department: MaritimeDepartment;
  area: string; // e.g. "Aux Engine Room (Port)", "Steering Gear Flat", "Bridge Center Console", "Cargo Compressor Room"
  equipmentName: string; // e.g. "Auxiliary Generator #2 (Yanmar 6EY18ALW)"
  maker: string; // e.g. "Yanmar"
  model: string; // e.g. "6EY18ALW"
  serialNo?: string;
  installedLocation: string;
  statutoryRequirement: StatutoryRequirement;
  currentReading: CurrentReading;
  makerDesignSpecs: {
    label: string;
    nominalValue: string;
    alarmLimit: string;
  }[];
  quickNotes: string;
  criticalSparesOnboard: string[];
  photos: PhotoAttachment[];
  updatedAt: string;
}

export interface TroubleshootingEntry {
  id: string;
  equipmentId?: string;
  equipmentName: string;
  department: MaritimeDepartment;
  area: string;
  dateOfIncident: string;
  symptomOrAlarm: string; // e.g. "Alarm 104: Low L.O. Pressure at 650 RPM"
  rootCause: string;
  actionTakenAndFix: string;
  sparesUsed: string;
  seafarerRank: string; // e.g. "2nd Engineer"
  hoursLostOrDowntime?: string;
  photos: PhotoAttachment[];
  lessonsLearned: string;
  severity: "Emergency / Critical" | "Operational Warning" | "Routine Defect" | "Handover Note";
  tags: string[];
}

export interface EmergencyChecklist {
  id: string;
  department: MaritimeDepartment;
  title: string;
  solasOrSmReference: string;
  description: string;
  criticalTimeWindow: string; // e.g. "< 3 minutes"
  steps: {
    id: string;
    stepNumber: number;
    actionText: string;
    mandatoryRule?: string;
    isChecked: boolean;
    assignedRole: string; // e.g. "Officer of the Watch", "Duty Engineer", "Master"
  }[];
  isCustom?: boolean;
  createdAt?: string;
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  department: MaritimeDepartment;
  authorRank: string;
  priority: "Routine" | "Urgent" | "Critical Safety";
  colorTag: "amber" | "emerald" | "sky" | "rose" | "indigo";
  createdAt: string;
  isResolved: boolean;
  relatedEquipment?: string;
}

export interface ChangeLogEntry {
  id: string;
  timestamp: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "TEST_LOGGED" | "NOTE_CONVERTED";
  entityType:
    | "Equipment Machinery"
    | "Troubleshooting Incident"
    | "Emergency Scenario Card"
    | "Statutory Rule"
    | "Quick Scratchpad"
    | "Officer Profile";
  entityId?: string;
  entityTitle: string;
  department: MaritimeDepartment;
  authorRank: string;
  summary: string;
  details?: string;
}

export interface MaritimeQueryResponse {
  immediateSafety: string[];
  probableCauses: string[];
  stepByStepChecks: string[];
  statutoryRules: string[];
  recommendedSpares: string[];
}

export interface SimulationTelemetryItem {
  label: string;
  value: string;
  unit?: string;
  status: "normal" | "warning" | "danger";
}

export interface SimulationOption {
  id: string;
  actionText: string;
  isCorrect: boolean;
  scoreDelta: number;
  feedback: string;
  consequenceNarrative: string;
  statutoryCitation?: string;
}

export interface SimulationStage {
  id: string;
  stageIndex: number;
  stageTitle: string;
  scenarioUpdate: string;
  telemetryUpdates?: SimulationTelemetryItem[];
  questionOrActionPrompt: string;
  options: SimulationOption[];
}

export interface SimulationScenario {
  id: string;
  title: string;
  code: string;
  category: "Engine Room" | "Cargo & Tanker" | "Bridge & Navigation" | "SOLAS Safety & Life Saving" | "Electrical & Blackout";
  department: MaritimeDepartment;
  statutoryRef: string;
  timeLimitSeconds: number;
  difficulty: "Standard" | "Intermediate" | "High Stakes";
  systemEquipment: string;
  initialCondition: {
    vesselSituation: string;
    alarmMessage: string;
    initialNarrative: string;
    telemetry: SimulationTelemetryItem[];
  };
  stages: SimulationStage[];
  debriefingNotes: {
    keyTakeaway: string;
    solasMarpolMandate: string;
    vettingChecklistQuestion: string;
    recommendedDrillFrequency: string;
  };
}

export interface CompletedDrillRecord {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  category: string;
  department: MaritimeDepartment;
  completedAt: string;
  officerRank: string;
  officerName?: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  durationSeconds: number;
  timeLimitSeconds: number;
  mistakesCount: number;
  statutoryRef: string;
  remarks: string;
}

