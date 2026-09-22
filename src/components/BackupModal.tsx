import React, { useState } from "react";
import {
  X,
  HardDriveDownload,
  Upload,
  Download,
  Printer,
  CheckCircle2,
  FileJson,
  ShieldCheck,
  AlertTriangle,
  Layers,
} from "lucide-react";
import {
  exportMaritimeVaultJSON,
  importMaritimeVaultJSON,
} from "../utils/storage";

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  vesselName: string;
  onDataReloaded: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  vesselName,
  onDataReloaded,
}) => {
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleExport = () => {
    const jsonStr = exportMaritimeVaultJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `anchor_ai_maritime_vault_${vesselName.replace(/\s+/g, "_")}_${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importMaritimeVaultJSON(content);
      setImportStatus(res);
      if (res.success) {
        onDataReloaded();
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 font-black">
              <HardDriveDownload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">USB Drive Backup & Handover Sync</h3>
              <p className="text-xs text-slate-400">Export & share tribal knowledge across ship computers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Export Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                <FileJson className="w-4 h-4 text-cyan-500" />
                <span>Save Vault to USB Drive (.JSON)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold">
                Single File Portable
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Downloads all machinery specs, statutory records, incident fixes, and photos into a single standalone file. Safe to save to personal USB sticks before signing off.
            </p>
            <button
              onClick={handleExport}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup File</span>
            </button>
          </div>

          {/* Import Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>Import & Merge from Shipmate&apos;s USB</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                Merge Non-Destructive
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Load and merge records created by other officers/engineers without overwriting your existing entries.
            </p>

            <label className="w-full py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Select Backup File to Merge (.json)</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            {importStatus && (
              <div
                className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  importStatus.success
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                }`}
              >
                {importStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>

          {/* Printable Handover Sheet */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                Printable Handover & Inspection Sheet
              </h4>
              <p className="text-slate-500 text-[11px]">Format entire vault for physical paper binder printout.</p>
            </div>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Handover</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
