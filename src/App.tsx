import React, { useState, useEffect } from "react";
import {
  EquipmentKnowledgeItem,
  TroubleshootingEntry,
  EmergencyChecklist,
  MaritimeDepartment,
  WatchMode,
  PhotoAttachment,
} from "./types";
import {
  loadEquipmentItems,
  saveEquipmentItems,
  loadTroubleshootingLogs,
  saveTroubleshootingLogs,
  loadEmergencyChecklists,
  saveEmergencyChecklists,
} from "./utils/storage";
import { Sidebar, ActiveTab } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { EquipmentKnowledgeView } from "./components/EquipmentKnowledgeView";
import { TroubleshootingLogView } from "./components/TroubleshootingLogView";
import { StatutoryComplianceView } from "./components/StatutoryComplianceView";
import { EmergencyChecklistsView } from "./components/EmergencyChecklistsView";
import { AddEntryModal } from "./components/AddEntryModal";
import { UpdateReadingModal } from "./components/UpdateReadingModal";
import { AIAdvisorModal } from "./components/AIAdvisorModal";
import { PhotoViewerModal } from "./components/PhotoViewerModal";
import { BackupModal } from "./components/BackupModal";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [selectedDepartment, setSelectedDepartment] = useState<MaritimeDepartment | "All">("All");
  const [watchMode, setWatchMode] = useState<WatchMode>(() => {
    return (localStorage.getItem("blueprint_maritime_watch_mode") as WatchMode) || "day";
  });
  const [vesselName, setVesselName] = useState<string>(() => {
    return localStorage.getItem("blueprint_maritime_vessel_name") || "M/V PACIFIC HORIZON";
  });

  const [equipmentList, setEquipmentList] = useState<EquipmentKnowledgeItem[]>(loadEquipmentItems);
  const [troubleshootingList, setTroubleshootingList] = useState<TroubleshootingEntry[]>(loadTroubleshootingLogs);
  const [checklists, setChecklists] = useState<EmergencyChecklist[]>(loadEmergencyChecklists);

  const [searchQuery, setSearchQuery] = useState("");
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalPrefillName, setAddModalPrefillName] = useState<string | undefined>(undefined);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoAttachment | null>(null);
  const [editingEquipmentForReading, setEditingEquipmentForReading] = useState<EquipmentKnowledgeItem | null>(null);
  const [targetItemId, setTargetItemId] = useState<string | null>(null);

  // Persist vessel name and watch mode
  useEffect(() => {
    localStorage.setItem("blueprint_maritime_vessel_name", vesselName);
  }, [vesselName]);

  useEffect(() => {
    localStorage.setItem("blueprint_maritime_watch_mode", watchMode);
  }, [watchMode]);

  // Handlers for equipment
  const handleSaveEquipment = (newItem: EquipmentKnowledgeItem) => {
    const updated = [newItem, ...equipmentList.filter((e) => e.id !== newItem.id)];
    setEquipmentList(updated);
    saveEquipmentItems(updated);
  };

  const handleUpdateReading = (updated: EquipmentKnowledgeItem) => {
    const updatedList = equipmentList.map((e) => (e.id === updated.id ? updated : e));
    setEquipmentList(updatedList);
    saveEquipmentItems(updatedList);
  };

  // Handlers for troubleshooting
  const handleSaveTroubleshooting = (newLog: TroubleshootingEntry) => {
    const updated = [newLog, ...troubleshootingList.filter((t) => t.id !== newLog.id)];
    setTroubleshootingList(updated);
    saveTroubleshootingLogs(updated);
  };

  // Checklists step toggle
  const handleToggleChecklistStep = (checklistId: string, stepId: string) => {
    const updated = checklists.map((chk) => {
      if (chk.id !== checklistId) return chk;
      return {
        ...chk,
        steps: chk.steps.map((st) => (st.id === stepId ? { ...st, isChecked: !st.isChecked } : st)),
      };
    });
    setChecklists(updated);
    saveEmergencyChecklists(updated);
  };

  const handleResetChecklist = (checklistId: string) => {
    const updated = checklists.map((chk) => {
      if (chk.id !== checklistId) return chk;
      return {
        ...chk,
        steps: chk.steps.map((st) => ({ ...st, isChecked: false })),
      };
    });
    setChecklists(updated);
    saveEmergencyChecklists(updated);
  };

  const handleReloadData = () => {
    setEquipmentList(loadEquipmentItems());
    setTroubleshootingList(loadTroubleshootingLogs());
    setChecklists(loadEmergencyChecklists());
  };

  const handleOpenAddWithPrefill = (name?: string) => {
    setAddModalPrefillName(name);
    setIsAddModalOpen(true);
  };

  const handleSelectItemFromSearch = (type: "equipment" | "troubleshooting", id: string) => {
    setTargetItemId(id);
    if (type === "equipment") {
      setActiveTab("equipment");
    } else {
      setActiveTab("troubleshooting");
    }
  };

  // Dynamic root watch mode theme wrapper
  const getThemeClass = () => {
    if (watchMode === "bridge_night") return "bg-stone-950 text-red-300 min-h-screen";
    if (watchMode === "engine") return "bg-slate-950 text-slate-100 min-h-screen";
    return "bg-slate-50 text-slate-900 min-h-screen";
  };

  return (
    <div className={getThemeClass()}>
      <div className="flex min-h-screen">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === "ai_advisor") {
              setIsAiModalOpen(true);
            } else if (tab === "backup") {
              setIsBackupModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          watchMode={watchMode}
          setWatchMode={setWatchMode}
          vesselName={vesselName}
          setVesselName={setVesselName}
          onOpenAddModal={() => handleOpenAddWithPrefill()}
          isOpenMobile={isOpenMobile}
          setIsOpenMobile={setIsOpenMobile}
          equipmentCount={equipmentList.length}
          troubleshootingCount={troubleshootingList.length}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Sticky Header */}
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenAddModal={() => handleOpenAddWithPrefill()}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
            setIsOpenMobile={setIsOpenMobile}
            watchMode={watchMode}
            equipmentList={equipmentList}
            troubleshootingList={troubleshootingList}
            onSelectItem={handleSelectItemFromSearch}
          />

          {/* Main Area Views */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === "dashboard" && (
              <DashboardView
                equipment={equipmentList}
                troubleshooting={troubleshootingList}
                checklists={checklists}
                setActiveTab={setActiveTab}
                setSelectedDepartment={setSelectedDepartment}
                onOpenAddModal={() => handleOpenAddWithPrefill()}
                onOpenAiModal={() => setIsAiModalOpen(true)}
                onSelectPhoto={(p) => setSelectedPhoto(p)}
                onSelectEquipment={(id) => {
                  setTargetItemId(id);
                  setActiveTab("equipment");
                }}
                onSelectTroubleshooting={(id) => {
                  setTargetItemId(id);
                  setActiveTab("troubleshooting");
                }}
                watchMode={watchMode}
              />
            )}

            {activeTab === "equipment" && (
              <EquipmentKnowledgeView
                equipmentList={equipmentList}
                troubleshootingList={troubleshootingList}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                onOpenAddModal={handleOpenAddWithPrefill}
                onSelectPhoto={(p) => setSelectedPhoto(p)}
                onUpdateReading={(eq) => setEditingEquipmentForReading(eq)}
                watchMode={watchMode}
                targetEquipmentId={targetItemId}
              />
            )}

            {activeTab === "troubleshooting" && (
              <TroubleshootingLogView
                logs={troubleshootingList}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                onOpenAddModal={handleOpenAddWithPrefill}
                onSelectPhoto={(p) => setSelectedPhoto(p)}
                watchMode={watchMode}
                targetLogId={targetItemId}
              />
            )}

            {activeTab === "statutory" && (
              <StatutoryComplianceView
                equipmentList={equipmentList}
                onUpdateReading={(eq) => setEditingEquipmentForReading(eq)}
                watchMode={watchMode}
              />
            )}

            {activeTab === "checklists" && (
              <EmergencyChecklistsView
                checklists={checklists}
                onToggleStep={handleToggleChecklistStep}
                onResetChecklist={handleResetChecklist}
                watchMode={watchMode}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalPrefillName(undefined);
        }}
        onSaveEquipment={handleSaveEquipment}
        onSaveTroubleshooting={handleSaveTroubleshooting}
        existingEquipmentList={equipmentList}
        initialPrefillName={addModalPrefillName}
      />

      <UpdateReadingModal
        equipment={editingEquipmentForReading}
        onClose={() => setEditingEquipmentForReading(null)}
        onSave={handleUpdateReading}
      />

      <AIAdvisorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        equipmentList={equipmentList}
        troubleshootingList={troubleshootingList}
      />

      <PhotoViewerModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        vesselName={vesselName}
        onDataReloaded={handleReloadData}
      />
    </div>
  );
}
