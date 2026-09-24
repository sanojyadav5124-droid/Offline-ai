import { EquipmentKnowledgeItem, TroubleshootingEntry, EmergencyChecklist, QuickNote, ChangeLogEntry, SeafarerProfile, CompletedDrillRecord } from "../types";
import {
  PRESET_EQUIPMENT_ITEMS,
  PRESET_TROUBLESHOOTING_LOGS,
  PRESET_EMERGENCY_CHECKLISTS,
  PRESET_QUICK_NOTES,
  PRESET_CHANGE_LOGS,
} from "../data/maritimePresets";

const STORAGE_KEYS = {
  EQUIPMENT: "anchor_ai_equipment_v2",
  TROUBLESHOOTING: "anchor_ai_troubleshooting_v2",
  CHECKLISTS: "anchor_ai_checklists_v2",
  QUICK_NOTES: "anchor_ai_quick_notes_v2",
  CHANGE_LOGS: "anchor_ai_change_logs_v2",
  VESSEL_NAME: "anchor_ai_vessel_name",
  USER_RANK: "anchor_ai_user_rank",
  USER_PROFILE: "anchor_ai_user_profile_v2",
  WATCH_MODE: "anchor_ai_watch_mode",
  COMPLETED_DRILLS: "anchor_ai_completed_drills_v2",
};

export function loadUserProfile(): SeafarerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    const legacyRank = localStorage.getItem(STORAGE_KEYS.USER_RANK);
    if (!raw) {
      const defaultProfile: SeafarerProfile = {
        rank: legacyRank || "Master / Captain",
        name: "Capt. S. K. Yadav",
        seafarerId: "CDC-MST-99120",
        department: "Deck",
        watchSchedule: "Command & Overall Navigation Safety",
      };
      saveUserProfile(defaultProfile);
      return defaultProfile;
    }
    const parsed: SeafarerProfile = JSON.parse(raw);
    if (legacyRank && legacyRank !== parsed.rank) {
      parsed.rank = legacyRank;
    }
    return parsed;
  } catch (err) {
    console.error("Error loading user profile:", err);
    return {
      rank: localStorage.getItem(STORAGE_KEYS.USER_RANK) || "Master / Captain",
      name: "Capt. S. K. Yadav",
      seafarerId: "CDC-MST-99120",
      department: "Deck",
      watchSchedule: "Command & Overall Navigation Safety",
    };
  }
}

export function saveUserProfile(profile: SeafarerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    if (profile.rank) {
      localStorage.setItem(STORAGE_KEYS.USER_RANK, profile.rank);
    }
  } catch (err) {
    console.error("Error saving user profile:", err);
  }
}

// Safe Local Storage retrieval with fallback and auto-sync of statutory matrix
export function loadEquipmentItems(): EquipmentKnowledgeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
    if (!raw) {
      saveEquipmentItems(PRESET_EQUIPMENT_ITEMS);
      return PRESET_EQUIPMENT_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all 25 statutory equipment presets are merged into the vault while retaining custom user items
      const existingMap = new Map(parsed.map((item: EquipmentKnowledgeItem) => [item.id, item]));
      let needsSave = false;
      const merged = [...parsed];

      for (const preset of PRESET_EQUIPMENT_ITEMS) {
        if (!existingMap.has(preset.id)) {
          merged.push(preset);
          needsSave = true;
        } else {
          // Update preset statutory details to ensure latest convention alignment
          const idx = merged.findIndex((m) => m.id === preset.id);
          if (idx !== -1 && merged[idx].statutoryRequirement.regulationCode !== preset.statutoryRequirement.regulationCode) {
            merged[idx] = { ...preset, currentReading: merged[idx].currentReading || preset.currentReading };
            needsSave = true;
          }
        }
      }

      if (needsSave) {
        saveEquipmentItems(merged);
      }
      return merged;
    }
    saveEquipmentItems(PRESET_EQUIPMENT_ITEMS);
    return PRESET_EQUIPMENT_ITEMS;
  } catch (err) {
    console.error("Error loading equipment from storage:", err);
    return PRESET_EQUIPMENT_ITEMS;
  }
}

export function saveEquipmentItems(items: EquipmentKnowledgeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(items));
  } catch (err) {
    console.error("Error saving equipment to storage:", err);
  }
}

export function loadTroubleshootingLogs(): TroubleshootingEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TROUBLESHOOTING);
    if (!raw) {
      saveTroubleshootingLogs(PRESET_TROUBLESHOOTING_LOGS);
      return PRESET_TROUBLESHOOTING_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : PRESET_TROUBLESHOOTING_LOGS;
  } catch (err) {
    console.error("Error loading troubleshooting logs:", err);
    return PRESET_TROUBLESHOOTING_LOGS;
  }
}

export function saveTroubleshootingLogs(logs: TroubleshootingEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TROUBLESHOOTING, JSON.stringify(logs));
  } catch (err) {
    console.error("Error saving troubleshooting logs:", err);
  }
}

export function loadEmergencyChecklists(): EmergencyChecklist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
    if (!raw) {
      saveEmergencyChecklists(PRESET_EMERGENCY_CHECKLISTS);
      return PRESET_EMERGENCY_CHECKLISTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : PRESET_EMERGENCY_CHECKLISTS;
  } catch (err) {
    console.error("Error loading checklists:", err);
    return PRESET_EMERGENCY_CHECKLISTS;
  }
}

export function saveEmergencyChecklists(checklists: EmergencyChecklist[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));
  } catch (err) {
    console.error("Error saving checklists:", err);
  }
}

export function loadQuickNotes(): QuickNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUICK_NOTES);
    if (!raw) {
      saveQuickNotes(PRESET_QUICK_NOTES);
      return PRESET_QUICK_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : PRESET_QUICK_NOTES;
  } catch (err) {
    console.error("Error loading quick notes:", err);
    return PRESET_QUICK_NOTES;
  }
}

export function saveQuickNotes(notes: QuickNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUICK_NOTES, JSON.stringify(notes));
  } catch (err) {
    console.error("Error saving quick notes:", err);
  }
}

export function loadChangeLogs(): ChangeLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHANGE_LOGS);
    if (!raw) {
      saveChangeLogs(PRESET_CHANGE_LOGS);
      return PRESET_CHANGE_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : PRESET_CHANGE_LOGS;
  } catch (err) {
    console.error("Error loading change logs:", err);
    return PRESET_CHANGE_LOGS;
  }
}

export function saveChangeLogs(logs: ChangeLogEntry[]): void {
  try {
    // Keep max 300 logs to prevent bloat
    const trimmed = logs.slice(0, 300);
    localStorage.setItem(STORAGE_KEYS.CHANGE_LOGS, JSON.stringify(trimmed));
  } catch (err) {
    console.error("Error saving change logs:", err);
  }
}

export function logAuditEntry(entry: Omit<ChangeLogEntry, "id" | "timestamp">): ChangeLogEntry {
  const currentLogs = loadChangeLogs();
  const newEntry: ChangeLogEntry = {
    id: `cl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  const updated = [newEntry, ...currentLogs];
  saveChangeLogs(updated);
  return newEntry;
}

// Compress image to small dataUrl (max 1024px, 0.72 quality) to keep offline storage light
export function compressImageFile(file: File, maxDimension = 1024, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(readerEvent.target?.result as string);
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to process image"));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// Export Full Maritime Knowledge Vault as a single USB-ready JSON file
export function exportMaritimeVaultJSON(): string {
  const payload = {
    appName: "ANCHOR AI Maritime Vault",
    version: "2.0",
    exportedAt: new Date().toISOString(),
    vesselName: localStorage.getItem(STORAGE_KEYS.VESSEL_NAME) || "M/V PACIFIC HORIZON",
    equipment: loadEquipmentItems(),
    troubleshooting: loadTroubleshootingLogs(),
    checklists: loadEmergencyChecklists(),
    quickNotes: loadQuickNotes(),
    changeLogs: loadChangeLogs(),
  };
  return JSON.stringify(payload, null, 2);
}

// Import & Merge Vault JSON from shipmate or USB drive
export function importMaritimeVaultJSON(jsonString: string): { success: boolean; message: string; count: number } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.equipment && !data.troubleshooting && !data.checklists && !data.quickNotes) {
      return { success: false, message: "Invalid ANCHOR AI Maritime backup format.", count: 0 };
    }

    let addedCount = 0;

    if (Array.isArray(data.equipment)) {
      const current = loadEquipmentItems();
      const existingIds = new Set(current.map((i) => i.id));
      const newItems = data.equipment.filter((item: EquipmentKnowledgeItem) => !existingIds.has(item.id));
      saveEquipmentItems([...current, ...newItems]);
      addedCount += newItems.length;
    }

    if (Array.isArray(data.troubleshooting)) {
      const currentLogs = loadTroubleshootingLogs();
      const existingIds = new Set(currentLogs.map((l) => l.id));
      const newLogs = data.troubleshooting.filter((log: TroubleshootingEntry) => !existingIds.has(log.id));
      saveTroubleshootingLogs([...currentLogs, ...newLogs]);
      addedCount += newLogs.length;
    }

    if (Array.isArray(data.checklists)) {
      const currentChecklists = loadEmergencyChecklists();
      const existingIds = new Set(currentChecklists.map((c) => c.id));
      const newChecklists = data.checklists.filter((chk: EmergencyChecklist) => !existingIds.has(chk.id));
      saveEmergencyChecklists([...currentChecklists, ...newChecklists]);
      addedCount += newChecklists.length;
    }

    if (Array.isArray(data.quickNotes)) {
      const currentNotes = loadQuickNotes();
      const existingIds = new Set(currentNotes.map((n) => n.id));
      const newNotes = data.quickNotes.filter((n: QuickNote) => !existingIds.has(n.id));
      saveQuickNotes([...currentNotes, ...newNotes]);
      addedCount += newNotes.length;
    }

    logAuditEntry({
      action: "CREATE",
      entityType: "Equipment Machinery",
      entityTitle: `Imported Backup Package (${addedCount} new records)`,
      department: "Engine",
      authorRank: "System Sync",
      summary: `Restored/Merged ${addedCount} records from USB Backup file.`,
    });

    return { success: true, message: "ANCHOR AI Maritime Vault successfully synchronized!", count: addedCount };
  } catch (err: any) {
    return { success: false, message: `Import failed: ${err.message}`, count: 0 };
  }
}

export function loadCompletedDrills(): CompletedDrillRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_DRILLS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error loading completed drills:", err);
    return [];
  }
}

export function saveCompletedDrills(drills: CompletedDrillRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_DRILLS, JSON.stringify(drills));
  } catch (err) {
    console.error("Error saving completed drills:", err);
  }
}

