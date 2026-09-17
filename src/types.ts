export type MaritimeDepartment =
  | "Engine"
  | "Deck"
  | "Electrical"
  | "Safety_ISM"
  | "Cargo";

export type WatchMode = "day" | "engine" | "bridge_night";

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
}

export interface MaritimeQueryResponse {
  immediateSafety: string[];
  probableCauses: string[];
  stepByStepChecks: string[];
  statutoryRules: string[];
  recommendedSpares: string[];
}
