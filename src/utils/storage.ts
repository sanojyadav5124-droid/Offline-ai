import { EquipmentKnowledgeItem, TroubleshootingEntry, EmergencyChecklist } from "../types";
import { PRESET_EQUIPMENT_ITEMS, PRESET_TROUBLESHOOTING_LOGS, PRESET_EMERGENCY_CHECKLISTS } from "../data/maritimePresets";

const STORAGE_KEYS = {
  EQUIPMENT: "blueprint_maritime_equipment_v1",
  TROUBLESHOOTING: "blueprint_maritime_troubleshooting_v1",
  CHECKLISTS: "blueprint_maritime_checklists_v1",
  VESSEL_NAME: "blueprint_maritime_vessel_name",
  USER_RANK: "blueprint_maritime_user_rank",
  WATCH_MODE: "blueprint_maritime_watch_mode",
};

// Safe Local Storage retrieval with fallback
export function loadEquipmentItems(): EquipmentKnowledgeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
    if (!raw) {
      saveEquipmentItems(PRESET_EQUIPMENT_ITEMS);
      return PRESET_EQUIPMENT_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : PRESET_EQUIPMENT_ITEMS;
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

// Compress image to small dataUrl (max 1000px, 0.7 quality) to keep offline storage light
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
    appName: "Blueprint Maritime Vault",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    vesselName: localStorage.getItem(STORAGE_KEYS.VESSEL_NAME) || "M/V PACIFIC HORIZON",
    equipment: loadEquipmentItems(),
    troubleshooting: loadTroubleshootingLogs(),
    checklists: loadEmergencyChecklists(),
  };
  return JSON.stringify(payload, null, 2);
}

// Import & Merge Vault JSON from shipmate or USB drive
export function importMaritimeVaultJSON(jsonString: string): { success: boolean; message: string; count: number } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.equipment && !data.troubleshooting) {
      return { success: false, message: "Invalid Blueprint Maritime backup format.", count: 0 };
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

    return { success: true, message: "Maritime Vault successfully synchronized!", count: addedCount };
  } catch (err: any) {
    return { success: false, message: `Import failed: ${err.message}`, count: 0 };
  }
}
